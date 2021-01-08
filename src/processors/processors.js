const logger = require('../Logger')()
const handleError = require('../handleError')
const {
    INVALID_PAIR, INVALID_DIALOGUE, INVALID_OPERAND, MISSING_SCENE_START, MULTIPLE_SCENE_START, MISSING_SCENE_END, MULTIPLE_SCENE_END, NESTED_RANDOM,
    INVALID_RANDOM_INDENT, MISSING_RANDOM_END, MISSING_CHOICE_LINE_BREAK
} = require('../errors')

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
    if (!strRegex.test(str)) return ''
    const [, dialog] = strRegex.exec(str)
    return dialog
}
const getNonDialog = (str) => {
    const dialog = getDialog(str.trimRight())
    return str.replace(dialog, '').split('//')[0]
}
const countChar = (str, char) => (str.match(new RegExp(`\\${char}`, 'g')) || []).length

const checkSyntaxPair = ({line, path, ln, left, right, noThrow}) => {
    const countRight = countChar(line, right)
    const countLeft = countChar(line, left)
    if (countRight === countLeft) return true
    handleError({noThrow, ln, path, error: INVALID_PAIR, msg: `Found left(${left}) ${countLeft} and right(${right}) ${countRight}`})
}

const checkDialogue = ({line, path, ln = '-', noThrow}) => {
    const count = countChar('"')
    if (count === 0) return true
    if (count !== 2) handleError({noThrow, ln, path, error: INVALID_DIALOGUE, msg: `Expected two double quotation marks but found ${count}`})
    checkSyntaxPair({line: getDialog(line), ln, path, noThrow, left: "<", right: ">"})
}

const processOperands = (source, path, extension, noThrow) => {
    if (!extension.includes('.lp') || extension === '.lpcharacter' || extension === '.lpmod' || extension === '.lpquest' || extension === '.txt'  || extension === '.md') return source
    return source.map((line, i) => {
        const ln = i + 1
        // const dialog = getDialog(line)
        const code = getNonDialog(line)

        let modified = code
        OPERANDS.forEach(({syntax, regex, expect, replace}) => {
            const _modified = modified.replace(regex, replace)
            if (_modified.length !== modified.length) {
                handleError({noThrow, path, ln, level: 'warn', error: INVALID_OPERAND, msg: `Repaired invalid operand: ${syntax}`})
                modified = _modified
            }
        })
        return line.replace(code, modified)
    })
}

const validateSyntax = ({source, path, name, extension, size, type, noThrow = true}) => {
    // if (!extension.includes('.lp') || extension === '.lpcharacter' || extension === '.lpmod' || extension === '.lpquest' || extension === '.txt'  || extension === '.md') return source
    if (!extension.includes('.lp') || extension === '.txt'  || extension === '.md') return source
    logger.info(`Validating Syntax: `, path)
    let hasSceneStart = false
    let hasSceneEnd = false
    let inRandomBlock = false
    let randomIndent = 0

    source.forEach((line, i) => {
        const ln = i + 1
        const indent = getIndent(line)
        //if (inRandomBlock && indent < (randomIndent + 2)) logger.warn(`${sourcePath} has invalid Random indent on line: ${ln}`)

        if (line.trim().toLowerCase() === 'scenestart()') {
            // if (hasSceneStart) handleError({noThrow, ln, path, error: MULTIPLE_SCENE_START, msg: `Multiple SceneStart()`})
            hasSceneStart = true
        }
        else if (line.trim().toLowerCase() === 'sceneend()') {
            // if (hasSceneEnd) handleError({noThrow, ln, path, error: MULTIPLE_SCENE_END, msg: `Multiple SceneEnd()`})
            hasSceneEnd = true
        }
        else if (line.trim().toLowerCase() === 'random') {
            if (inRandomBlock) handleError({noThrow, ln, path, error: NESTED_RANDOM, msg: `Nested Random`})
            inRandomBlock = true
            randomIndent = getIndent(line)
        } else if (line.trim().toLowerCase() === 'endrandom') {
            inRandomBlock = false
        } else if (inRandomBlock && indent < (randomIndent + 2)) {
            handleError({noThrow, level: 'info', ln, path, error: INVALID_RANDOM_INDENT, msg: `Invalid Random indent`})
        }
        if (line.includes('"')) checkDialogue({line, path, ln, noThrow})
        checkSyntaxPair({noThrow, line, path, ln, left: "[", right: "]"})
        checkSyntaxPair({noThrow, line, path, ln, left: "(", right: ")"})
    })

    //if (extension === '.lpscene' && !hasSceneStart) handleError({noThrow, path, error: MISSING_SCENE_START, msg: `Missing SceneStart()`})
    if (extension === '.lpscene' && hasSceneStart && !hasSceneEnd) handleError({noThrow, path, error: MISSING_SCENE_END, msg: `Missing SceneEnd()`})
    if (inRandomBlock) handleError({noThrow, path, error: MISSING_RANDOM_END, msg: `Missing EndRandom`})
    return source
}

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
                handleError({noThrow, path, ln, level: 'warn', error: MISSING_CHOICE_LINE_BREAK, msg: `Missing Choice Line Break.`})
            }
            out.push(line)
            inChoiceBlock = false
        } else {
            out.push(line)
        }
    })
    return out
}

const replaceTabs = ({source, path, name, extension, size, type, noThrow = true, options = {}}) => {
    const {indent = '    '} = options
    return source.map(line => line.replace(/\t/g, indent))
}

module.exports = {
    replaceTabs,
    choices,
    validateSyntax,
    processOperands
}
