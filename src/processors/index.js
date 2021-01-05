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

const getIndent = (str) => str.length - str.trimLeft().length
const getDialog = (str) => {
    const strRegex = /.*(".*")/
    const [, dialog] = strRegex.exec(str)
    return dialog
}
const getNonDialog = (str) => {
    const dialog = getDialog(str.trimRight())
    return str.replace(dialog, '')
}
const countChar = (str, char) => (str.match(new RegExp(char, 'g')) || []).length

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

const processOperands = (str, ln) => {
    const code = getNonDialog(str)
    let modified = code
    OPERANDS.forEach(({syntax, regex, expect, replace})=>{
        const _modified = modified.replace(regex, replace)
        if (modified.length !== code.length) {
            console.warn(`LINE: ${ln} - INVALID_OPERAND - REPAIRED - expected ${syntax}`)
            modified = _modified
        }
    })
    return str.replace(code, modified)
}

const validateSyntax = (src, sourcePath, extension) => {
    let hasSceneStart = false
    let hasSceneEnd = false
    let inRandomBlock = false
    let randomIndent = 0

    const lines = src.split('\n')
    lines.forEach((line, i) => {
        const ln = i + 1
        const indent = getIndent(line)
        if (inRandomBlock && indent !== randomIndent) console.warn(`${sourcePath} has invalid Random indent on line: ${ln}`)

        if (line.trim().toLowerCase() === 'scenestart()') {
            if (hasSceneStart) throw new Error(`${sourcePath} has multiple SceneStart()! Second detected on line: ${ln}`)
            hasSceneStart = true
        } else if (line.trim().toLowerCase() === 'sceneend()') {
            if (hasSceneEnd) throw new Error(`${sourcePath} has multiple SceneEnd()! Second detected on line: ${ln}`)
            hasSceneEnd = true
        } else if (line.trim().toLowerCase() === 'random') {
            if (inRandomBlock) throw new Error(`${sourcePath} has Random block inside Random block! Second Random detected on line: ${ln}`)
            inRandomBlock = true
            randomIndent = getIndent(line)
        }
        if (line.includes('"')) checkDialogue(line)
        checkSyntaxPair({line, ln, left: "[", right: "]"})
        checkSyntaxPair({line, ln, left: "(", right: ")"})
    })

    if (extension === 'lpscene' && !hasSceneStart) throw new Error(`${sourcePath} is missing SceneStart()!`)
    if (extension === 'lpscene' && !hasSceneEnd) throw new Error(`${sourcePath} is missing SceneEnd()!`)
    // if (extension === 'lpscene' && inRandomBlock) throw new Error(`${sourcePath} has unterminated Random block!`)
    if (inRandomBlock) throw new Error(`${sourcePath} has unterminated Random block!`)
    return src
}

const choices = (src, sourcePath) => {
    const lines = src.split('\n')
    const out = []
    const choiceRegex = /\s*\d+::/
    let inChoiceBlock = false
    lines.forEach((line, i) => {
        if (choiceRegex.test(line)) {
            inChoiceBlock = true
            out.push(line)
        } else if (inChoiceBlock) {
            if (line.trim() > '') {
                out.push('')
                console.warn(`WARNING: Missing 'CHOICE' line break in ${sourcePath} on line ${i + 1}.`)
            }
            out.push(line)
            inChoiceBlock = false
        } else {
            out.push(line)
        }
    })
    return out.join('\n')
}


module.exports = {
    replaceTabs: (src, spaces = '    ') => src.replace(/\t/g, spaces),
    choices,
    validateSyntax,
    processOperands
}
