// const VALID_OPERANDS = [
//     {syntax: '+=', stat: false},
//     {syntax: '-=', stat: false},
//     {syntax: '*=', stat: false},
//     {syntax: '/=', stat: false},
//     {syntax: '=', stat: false},
//     {syntax: '=>', stat: true},
//     {syntax: '*', stat: false},
//     {syntax: '/', stat: false},
//     {syntax: '+', stat: false},
//     {syntax: '&&', stat: false},
//     {syntax: '||', stat: false},
//     {syntax: '!', stat: false},
//     {syntax: ';', stat: false},
// ]
const OPERANDS = [
    {syntax: '&&', regex: /(&+)/g, expect: 2, replace: '&&'},
    {syntax: '||', regex: /(\|+)/g, expect: 2, replace: '||'},
]
const handleError = (msg, noThrow) => {
    if (noThrow) return console.error(msg)
    throw new Error(msg)
}
const getIndent = (str) => str.length - str.trimLeft().length
const getDialog = (str) => {
    const strRegex = /.*(".*")/
    if (!strRegex.test(str)) return ''
    const [, dialog] = strRegex.exec(str)
    return dialog
}
const getNonDialog = (str) => {
    const dialog = getDialog(str.trimRight())
    return str.replace(dialog, '')
}
const countChar = (str, char) => (str.match(new RegExp(`\\${char}`, 'g')) || []).length

const checkSyntaxPair = ({line, ln, left, right}) => {
    const countRight = countChar(line, right)
    const countLeft = countChar(line, left)
    if (countRight === countLeft) return true
    throw new Error(`LINE: ${ln} - INVALID_SYNTAX_PAIR - found left(${left}) ${countLeft} and right(${right}) ${countRight}`)
}

const checkDialogue = (line, ln) => {
    const count = countChar('"')
    if (count === 0) return true
    if (count !== 2) throw new Error(`LINE: ${ln} - INVALID_DIALOGUE - expected two double quotation marks but found ${count}`)
    // if (line.includes('"')) {
    checkSyntaxPair({line: getDialog(line), ln, left: "<", right: ">"})
    // }
}

const processOperands = (source, srcPath, extension) => {
    return source.map((line, i) => {
        const ln = i + 1
        // const dialog = getDialog(line)
        const code = getNonDialog(line)

        let modified = code
        OPERANDS.forEach(({syntax, regex, expect, replace}) => {
            const _modified = modified.replace(regex, replace)
            if (_modified.length !== modified.length) {
                console.warn(`FILE: ${srcPath} LINE: ${ln} - INVALID_OPERAND - REPAIRED - expected ${syntax}`)
                modified = _modified
            }
        })
        return line.replace(code, modified)
    })
}
// {source, path, name, extension, size, type, noThrow = true}
// const validateSyntax = ({src, sourcePath, extension, noThrow = true}) => {
const validateSyntax = ({source, path, name, extension, size, type, noThrow = true}) => {
    console.log(`Validating Syntax: `, path)
    let hasSceneStart = false
    let hasSceneEnd = false
    let inRandomBlock = false
    let randomIndent = 0

    // const lines = src.split('\n')
    source.forEach((line, i) => {
        const ln = i + 1
        const indent = getIndent(line)
        //if (inRandomBlock && indent < (randomIndent + 2)) console.warn(`${sourcePath} has invalid Random indent on line: ${ln}`)

        if (line.trim().toLowerCase() === 'scenestart()') {
            if (hasSceneStart) handleError(`${path} has multiple SceneStart()! Second detected on line: ${ln}`)
            hasSceneStart = true
        } else if (line.trim().toLowerCase() === 'sceneend()') {
            if (hasSceneEnd) handleError(`${path} has multiple SceneEnd()! Second detected on line: ${ln}`)
            hasSceneEnd = true
        } else if (line.trim().toLowerCase() === 'random') {
            if (inRandomBlock) handleError(`${path} has Random block inside Random block! Second Random detected on line: ${ln}`)
            inRandomBlock = true
            randomIndent = getIndent(line)
        } else if (line.trim().toLowerCase() === 'endrandom') {
            inRandomBlock = false
        } else if (inRandomBlock && indent < (randomIndent + 2)) {
            console.warn(`${path} has invalid Random indent on line: ${ln}`)
        }
        if (line.includes('"')) checkDialogue(line)
        checkSyntaxPair({line, ln, left: "[", right: "]"})
        checkSyntaxPair({line, ln, left: "(", right: ")"})
    })

    if (extension === '.lpscene' && !hasSceneStart) handleError(`${path} is missing SceneStart()!`, noThrow)
    if (extension === '.lpscene' && !hasSceneEnd) handleError(`${path} is missing SceneEnd()!`, noThrow)
    if (inRandomBlock) handleError(`${path} has unterminated Random block!`, noThrow)
    return source
}

// const choices = (src, sourcePath) => {
// {source, path, name, extension, size, type, noThrow = true}
const choices = ({source, path, name, extension, size, type, noThrow = true}) => {
    const out = []
    const choiceRegex = /\s*\d+::/
    let inChoiceBlock = false
    source.forEach((line, i) => {
        const ln = i + 1
        if (choiceRegex.test(line)) {
            inChoiceBlock = true
            out.push(line)
        } else if (inChoiceBlock) {
            if (line.trim() > '') {
                out.push('')
                console.warn(`WARNING: Missing 'CHOICE' line break in ${path} on line ${ln}.`)
            }
            out.push(line)
            inChoiceBlock = false
        } else {
            out.push(line)
        }
    })
    return out
}

const replaceTabs = ({source, path, name, extension, size, type, noThrow = true, options = {} }) => {
    const {indent = '    '} = options
    return source.map(line=>line.replace(/\t/g, indent))
}

module.exports = {
    // replaceTabs: (src, spaces = '    ') => src.replace(/\t/g, spaces),
    replaceTabs,
    choices,
    validateSyntax,
    processOperands
}
