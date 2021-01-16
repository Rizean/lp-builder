// const handleError = require('../handleError')
// const {REPEAT_INCLUDE, UNKNOWN_INCLUDE} = require('../errors')
const {getIndent, getDialog, getNonDialog} = require('./tools')

const parser = ({source, path, name, extension, size, type, noThrow}) => {
    const parsed = []
    const processLine = (line) => {
        // a line consist of three parts: indent code dialog
        parsed.push({indent: getIndent(line), code: getNonDialog(line).trim(), dialog: getDialog(line)})
    }
    source.forEach(processLine)
    return parsed
}

module.exports = {
    parse: ({source, path, name, extension, size, type, noThrow = true}) => {
        if (extension !== '.lpscene') return []
        return parser({source, path, name, extension, size, type, noThrow})
    },
}