const logger = require('../Logger')()
const {getIndent, getDialog, getNonDialog, countChar, countExpression, isTriggerConditions} = require('./tools')
const {booleanOperands} = require('./advanceChecks')
const handleError = require('../handleError')
const {
    INVALID_PAIR, INVALID_DIALOGUE, INVALID_OPERAND, MISSING_SCENE_START, MULTIPLE_SCENE_START, MISSING_SCENE_END, MULTIPLE_SCENE_END, NESTED_RANDOM,
    INVALID_RANDOM_INDENT, MISSING_RANDOM_END, MISSING_CHOICE_LINE_BREAK, INVALID_IF_ELSE_ENDIF
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


const checkSyntaxPair = ({line, path, ln, left, right, noThrow}) => {
    const code = getNonDialog(line)
    const countRight = countChar(code, right)
    const countLeft = countChar(code, left)
    if (countRight === countLeft) return true
    handleError({noThrow, ln, path, error: INVALID_PAIR, msg: `Found left--> ${left}:${countLeft} and right--> ${right}:${countRight}  line: -->${line}<--`})
}

const checkDialogue = ({line, path, ln = '-', noThrow}) => {
    const count = countChar('"')
    if (count === 0) return true
    if (count !== 2) handleError({noThrow, ln, path, error: INVALID_DIALOGUE, msg: `Expected two double quotation marks but found ${count}`})
    checkSyntaxPair({line: getDialog(line), ln, path, noThrow, left: "<", right: ">"})
}

const processOperands = (source, path, extension, noThrow) => {
    if (!extension.includes('.lp') || extension === '.lpcharacter' || extension === '.lpmod' || extension === '.lpquest' || extension === '.txt' || extension === '.md') return source
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
    if (!extension.includes('.lp') || extension === '.txt' || extension === '.md' || extension === '.lplang') return source
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
        } else if (line.trim().toLowerCase() === 'sceneend()') {
            // if (hasSceneEnd) handleError({noThrow, ln, path, error: MULTIPLE_SCENE_END, msg: `Multiple SceneEnd()`})
            hasSceneEnd = true
        } else if (line.trim().toLowerCase() === 'random') {
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
    if (Array.isArray(source)) return source.map(line => line.replace(/\t/g, indent))
    return source.replace(/\t/g, indent)
}

const checkIfElseEndif = ({source, path, name, extension, size, type, noThrow = true}) => {
    const skipExtensions = ['.lpcharacter', '.lpaddon', '.lpmod', '.lpquest', '.txt', '.md', '.lpstat']
    if (!extension.includes('.lpscene')) return source

    const checkIfElseEndIf = (code, counts = {if: 0, elseIf: 0, else: 0, endIf: 0}) => {
        if (!code) return counts
        const temp = {
            if: countExpression(code, /(?:\b|^)if\b/ig),
            elseIf: countExpression(code, /(?:\b|^)elseIf\b/ig),
            else: countExpression(code, /(?:\b|^)else\s*$/ig),
            endIf: countExpression(code, /(?:\b|^)endIf\s*$/ig),
        }
        counts.if += temp.if
        counts.elseIf += temp.elseIf
        counts.else += temp.else
        counts.endIf += temp.endIf
        return counts
    }
    // init our counts to zero by calling checkIfElseEndIf() without params feeding that into the initial reduce value
    // let counts = checkIfElseEndIf()
    let counts = source.reduce((counts, line) => {
        if (isTriggerConditions(line)) return counts
        return checkIfElseEndIf(getNonDialog(line), counts)
    }, checkIfElseEndIf())

    if (counts.if !== counts.endIf) {
        handleError({
            noThrow,
            processor: 'checkIfElseEndif',
            ln: '-',
            level: 'error',
            path,
            error: INVALID_IF_ELSE_ENDIF,
            msg: `If and EndIf counts do not match! If count: ${counts.if}  EndIf count: ${counts.endIf}`
        })
    } else if ((counts.elseIf > 0 || counts.else > 0) && counts.if === 0) {
        handleError({
            noThrow,
            processor: 'checkIfElseEndif',
            ln: '-',
            level: 'error',
            path,
            error: INVALID_IF_ELSE_ENDIF,
            msg: `Else or ElseIf detected but missing If and EndIf.`
        })
    }
    return source
}
const checkIfElseEndifV2 = ({source, path, name, extension, size, type, noThrow = true}) => {
    const skipExtensions = ['.lpcharacter', '.lpaddon', '.lpmod', '.lpquest', '.txt', '.md', '.lpstat']
    if (!extension.includes('.lpscene')) return source

    const ifBlocks = []

    const regexIf = /(?:\b|^)if\b/i
    const regexElseIf = /(?:\b|^)elseif\b/i
    const regexElse = /(?:\b|^)else\s*$/i
    const regexEndIf = /(?:\b|^)endIf\s*$/i


    let depth = 0
    let expectedIndent = 4
    source.forEach((line, i) => {
        const ln = i + 1
        const indent = getIndent(line)
        const code = getNonDialog(line)

        if (regexIf.test(code)) {
            ifBlocks.push({indent, type: 'if', ln})
            expectedIndent = indent + 4
            depth++
        } else if (regexEndIf.test(code)) {
            const data = ifBlocks.pop()
            if (!data) {
                handleError({noThrow, processor: 'checkIfElseEndifV2', ln, level: 'error', path, error: INVALID_IF_ELSE_ENDIF, msg: `Unexpected EndIf!`})
            } else if (data.indent !== indent) {
                handleError({noThrow, processor: 'checkIfElseEndifV2', ln, level: 'error', path, error: INVALID_IF_ELSE_ENDIF, msg: `If/EndIf indent miss match!`})
            }
            expectedIndent = indent
        }
        else if (line.trim() !== '' && indent !== expectedIndent && ifBlocks.length > 0) {
            if (regexElseIf.test(code)) return
            if (regexElse.test(code)) return
            handleError({noThrow, processor: 'checkIfElseEndifV2', ln, level: 'warn', path, error: INVALID_IF_ELSE_ENDIF, msg: `Expected ${expectedIndent} indent but found ${indent}. code: ${code}`})
        }
    })
    ifBlocks.forEach(({indent, type, ln})=>{
        handleError({noThrow, processor: 'checkIfElseEndifV2', ln, level: 'error', path, error: INVALID_IF_ELSE_ENDIF, msg: `Unclosed ${type} on line: ${ln}!`})
    })

    return source
}

module.exports = {
    replaceTabs,
    choices,
    validateSyntax,
    processOperands,
    checkIfElseEndif,
    checkIfElseEndifV2
}
