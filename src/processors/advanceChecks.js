const logger = require('../Logger')()
const handleError = require('../handleError')
const {getIndent, getDialog, getNonDialog, countChar, checkModified} = require('./tools')
const {REPEAT_INCLUDE, UNKNOWN_INCLUDE} = require('../errors')
const {INVALID_PAIR, INVALID_OPERAND, EXPERIMENTAL_PARENTHESIS, EXPERIMENTAL_BRACKET} = require('../errors')

const BOOLEAN_OPERANDS = [
    {syntax: '&&', regex: /(&+\s*&*)/g, expect: 2, replace: '&& '},
    {syntax: '||', regex: /(\|+\s*\|*)/g, expect: 2, replace: '|| '},
]

// checks for &+\s*&+ or |+\s*|+
const booleanOperands = ({source, path, name, extension, size, type, noThrow = true}) => {
    if (!extension.includes('.lp') || extension === '.lpcharacter' || extension === '.lpmod' || extension === '.lpquest' || extension === '.txt' || extension === '.md') return source
    return source.map((line, i) => {
        const ln = i + 1
        // const dialog = getDialog(line)
        const code = getNonDialog(line)

        let modified = code
        BOOLEAN_OPERANDS.forEach(({syntax, regex, expect, replace}) => {
            const _modified = modified.replace(regex, replace)
            // if (_modified.length !== modified.length) {
            if (checkModified(modified, _modified)) {
                handleError({noThrow, path, ln, level: 'warn', error: INVALID_OPERAND, msg: `Repaired invalid operand: ${syntax}`})
                modified = _modified
            }
        })
        return line.replace(code, modified)
    })
}

const syntax = ({source, path, name, extension, size, type, noThrow = true}) => {
    if (!extension.includes('.lp') || extension === '.lpcharacter' || extension === '.lpmod' || extension === '.lpquest' || extension === '.txt' || extension === '.md') return source
    return source.map((line, i) => {
        const ln = i + 1
        const code = getNonDialog(line)
        const original = code
        let modified = line
        const checkSymbols = (code) => {
            return {
                leftParenthesis: countChar(code, '('),
                rightParenthesis: countChar(code, ')'),
                leftBracket: countChar(code, '['),
                rightBracket: countChar(code, ']'),
            }
        }
        let symbols = checkSymbols(code)

        if (symbols.leftParenthesis - symbols.rightParenthesis === 1) {
            if (code.endsWith('(')) {
                modified = line.replace(code, code + ')')
                symbols.rightParenthesis++
                handleError({noThrow, ln, path, level: 'warning', error: EXPERIMENTAL_PARENTHESIS, msg: `Left > Right - code: ${code}  original: ${original}  modified: ${modified}`})
            }
        }

        if (symbols.leftBracket - symbols.rightBracket === 1) {
            if (code.endsWith('[')) {
                symbols.rightBracket++
                modified = line.replace(code, code + ']')
                handleError({noThrow, ln, path, level: 'warning', error: EXPERIMENTAL_BRACKET, msg: `Left > Right - code: ${code}  original: ${original}  modified: ${modified}`})
            }
        }

        if (symbols.leftBracket === 0 && symbols.rightBracket === 1 && code.endsWith(']')) {
            symbols.rightBracket--
            modified = line.replace(code, code.slice(0,-1))
            handleError({noThrow, ln, path, level: 'warning', error: EXPERIMENTAL_BRACKET, msg: `Dropping dangling ] - code: ${code}  original: ${original}  modified: ${modified}`})
        }

        // handle Object.function)
        if (symbols.leftParenthesis === 0 && symbols.rightParenthesis === 1 && /\w+\.\w+\)/.test(code)) {
            symbols.leftParenthesis++
            modified = line.replace(code, `${code.slice(0,-1)}()`)
            handleError({noThrow, ln, path, level: 'warning', error: EXPERIMENTAL_PARENTHESIS, msg: `Fixing Object.function() with missing ( - code: ${code}  original: ${original}  modified: ${modified}`})
        }

        // handle Object.function(()
        if (symbols.leftParenthesis === 2 && symbols.rightParenthesis === 1 && /\w+\.\w+\(\(\)/.test(code)) {
            symbols.leftParenthesis--
            modified = line.replace(code, `${code.slice(0,-3)}()`)
            handleError({noThrow, ln, path, level: 'warning', error: EXPERIMENTAL_PARENTHESIS, msg: `Fixing Object.function(() with extra ( - code: ${code}  original: ${original}  modified: ${modified}`})
        }

        // handle Object.function([\d\w]*))
        if (symbols.leftParenthesis === 1 && symbols.rightParenthesis === 2 && /\w+\.\w+\([\d\w]*\)\)/.test(code)) {
            symbols.rightParenthesis--
            modified = line.replace(code, `${code.slice(0,-1)}`)
            handleError({noThrow, ln, path, level: 'warning', error: EXPERIMENTAL_PARENTHESIS, msg: `Fixing Object.function([\\d\\w]*)) with extra ) - code: ${code}  original: ${original}  modified: ${modified}`})
        }

        // handle Player([\d\w]*))::
        if (symbols.leftParenthesis === 1 && symbols.rightParenthesis === 2 && /\w+\([\d\w]*\)\)::/.test(code)) {
            symbols.rightParenthesis--
            modified = line.replace(code, `${code.trimRight().slice(0,-3)}:: `)
            handleError({noThrow, ln, path, level: 'warning', error: EXPERIMENTAL_PARENTHESIS, msg: `Fixing Object.function([\\d\\w]*)):: with extra ) - code: ${code}  original: ${original}  modified: ${modified}`})
        }

        // handle edge case - )]
        if (symbols.rightParenthesis > symbols.leftParenthesis) {
            modified = `${line.replace(/\)]/g, ']')}`
            symbols = checkSymbols(modified)
            handleError({noThrow, ln, path, level: 'warning', error: EXPERIMENTAL_PARENTHESIS, msg: `Fixing edge case )] - code: ${code}  original: ${original}  modified: ${modified}`})
        }

        // handle edge case - Endif)
        if (symbols.rightParenthesis - symbols.leftParenthesis === 1 && line.includes('Endif)')) {
            modified = line.replace('Endif)', 'Endif')
            symbols = checkSymbols(modified)
            handleError({noThrow, ln, path, level: 'warning', error: EXPERIMENTAL_PARENTHESIS, msg: `Fixing edge case Endif) - code: ${code}  original: ${original}  modified: ${modified}`})
        }

        return modified
    })
}

module.exports = {
    booleanOperands,
    syntax,
}