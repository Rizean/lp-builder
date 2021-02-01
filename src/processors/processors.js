const logger = require('../Logger')()
const checks = require('../tools/checks')
const {getIndent, getDialog, getNonDialog, countChar, countExpression, isTriggerConditions} = require('./tools')
// const {booleanOperands} = require('./advanceChecks')
const handleError = require('../handleError')
const {
    INVALID_PAIR, INVALID_DIALOGUE, INVALID_OPERAND, MISSING_SCENE_END,
    INVALID_INDENT, MISSING_CHOICE_LINE_BREAK, INVALID_IF_ELSE_ENDIF, BLOCK_SCOPE_ERROR, UNKNOWN_SYNTAX
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

// const validateSyntax = ({source, path, name, extension, size, type, noThrow = true, warnOnIndentError = false}) => {
const validateSyntax = (child, options) => {
    const {source, path, name, extension, size, type} = child
    const {noThrow = true, warnOnIndentError = false} = options
    if (['.lptalk', '.lpdesc', '.lpworld', '.lpaddon', '.lpcharacter', '.lpmod', '.lpstat', '.lpaction', '.lpquest'].includes(extension)) return source
    if (!extension.includes('.lp') || extension === '.txt' || extension === '.md' || extension === '.lplang') return source
    logger.info(`Validating Syntax: `, path)
    const isAI = extension === '.lpai'
    let hasSceneStart = false
    let hasSceneEnd = false
    let sourceIndent = undefined
    let expectedIndent = 0

    let context = {
        isValid: true,
        type: 'root',
        scopes: [],
        depth: 0,
        indent: -1,
        currentScope: undefined
    }
    context.currentScope = context

    source.forEach((line, i) => {
        const ln = i + 1
        if (isAI && ln <= 5) return
        const indent = getIndent(line)
        const isEmptyLine = line.trim() === ''
        if (isEmptyLine) return

        if (checks.expressionType(line) === 'unknown') {
            handleError({child, noThrow, ln, path, level: 'warn', error: UNKNOWN_SYNTAX, msg: `${line.trim()}`})
        }

        if (context.indent === -1 && indent > 0) context.indent = indent

        if (!sourceIndent && indent > 0) {
            sourceIndent = indent
            expectedIndent = indent
        }
        if (warnOnIndentError && indent !== expectedIndent) {
            const firstPhrase = line.trim().split(' ')[0].toLowerCase()
            if (!['random', 'endrandom', 'while', 'endwhile', 'if', 'elseif', 'else', 'endif'].includes(firstPhrase)) {
                handleError({child, noThrow, ln, path, level: 'warn', error: INVALID_INDENT, msg: `Invalid indent. Expected: ${expectedIndent}  Found: ${indent}  SourceIndent: ${sourceIndent}`})
            }
        }

        const handleNewScope = ({context, type, ln}) => {
            if (!context.isValid) return
            if (context.currentScope.type === 'random' && type !== 'random') {
                context.isValid = false
                return handleError({child, noThrow, ln, path, error: BLOCK_SCOPE_ERROR, msg: `Cannot nest "if" inside random scope!`})
            }
            const newScope = {type: type, start: ln, stop: -1, indent: indent + context.indent, scopes: [], parent: context.currentScope, depth: context.currentScope.depth + 1}
            context.currentScope.scopes.push(newScope)
            context.currentScope = newScope
        }
        const handleCloseScope = ({type, ln, context}) => {
            if (!context.isValid) return
            context.isValid = false
            const _handleError = (expected) => handleError({child, noThrow, processor: 'validateSyntax', ln, path, error: BLOCK_SCOPE_ERROR, msg: `Expected ${expected} but found ${type} for If starting on line: ${context.currentScope.start}`})
            if (context.currentScope.type === 'if' && type !== 'endif') _handleError('EndIf')
            else if (context.currentScope.type === 'while' && type !== 'endwhile') _handleError('EndWhile')
            else if (context.currentScope.type === 'random' && type !== 'endrandom') _handleError('EndRandom')
            else if (context.currentScope.type === 'root') handleError({noThrow, processor: 'validateSyntax', ln, path, error: BLOCK_SCOPE_ERROR, msg: `Unexpected ${type}`})
            else {
                context.isValid = true
                context.currentScope.stop = ln
                context.currentScope = context.currentScope.parent
            }
        }
        const src = getNonDialog(line).trim().toLowerCase()
        if (src === 'scenestart()') {
            hasSceneStart = true
        } else if (src.startsWith('sceneend()')) {
            hasSceneEnd = true
        } else if (src.startsWith('random')) {
            handleNewScope({context, type: 'random', ln})
        } else if (src.startsWith('endrandom')) {
            handleCloseScope({type: 'endrandom', ln, context})
        } else if (src.startsWith('while')) {
            handleNewScope({context, type: 'while', ln})
        } else if (src.startsWith('endwhile')) {
            handleCloseScope({type: 'endwhile', ln, context})
        } else if (src.startsWith('if')) {
            handleNewScope({context, type: 'if', ln})
        } else if (src.startsWith('endif')) {
            handleCloseScope({type: 'endif', ln, context})
        } else if (src.startsWith('elseif')) {
            if (context.currentScope.type !== 'if') {
                context.isValid = false
                handleError({child, noThrow, processor: 'validateSyntax', ln, path, error: BLOCK_SCOPE_ERROR, msg: `Unexpected ElseIf!`})
            }
        } else if (src.startsWith('else')) {
            if (context.currentScope.type !== 'if') {
                context.isValid = false
                handleError({child, noThrow, processor: 'validateSyntax', ln, path, error: BLOCK_SCOPE_ERROR, msg: `Unexpected ElseIf!`})
            }
        }

        if (line.includes('"')) checkDialogue({line, path, ln, noThrow})
        checkSyntaxPair({noThrow, line, path, ln, left: "[", right: "]"})
        checkSyntaxPair({noThrow, line, path, ln, left: "(", right: ")"})
    })

    if (extension === '.lpscene' && hasSceneStart && !hasSceneEnd) handleError({child, noThrow, path, error: MISSING_SCENE_END, msg: `Missing SceneEnd()`})
    if (context.isValid && context.currentScope !== context) handleError({child, processor: 'validateSyntax', error: BLOCK_SCOPE_ERROR, msg: `EOF and unclosed ${context.currentScope.type} starting on line ${context.currentScope.start} detected!`})
    const cleanContext = ({type, start, stop, indent, scopes, parent, depth, currentScope}) => {
        scopes = scopes.map(scope => cleanContext(scope))
        return {type, start, stop, indent, scopes, depth}
    }
    child.context = cleanContext(context)
    child.source = source
    // return source
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
        if (ln < 6) return
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
        } else if (line.trim() !== '' && indent !== expectedIndent && ifBlocks.length > 0) {
            if (regexElseIf.test(code)) return
            if (regexElse.test(code)) return
            handleError({noThrow, processor: 'checkIfElseEndifV2', ln, level: 'warn', path, error: INVALID_IF_ELSE_ENDIF, msg: `Expected ${expectedIndent} indent but found ${indent}. code: ${code}`})
        }
    })
    ifBlocks.forEach(({indent, type, ln}) => {
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
