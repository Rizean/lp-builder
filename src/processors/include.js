const includeMap = new Map()
const handleError = require('../handleError')
const {REPEAT_INCLUDE, UNKNOWN_INCLUDE} = require('../errors')

module.exports = {
    parseIncludes: ({source, path, name, extension, size, type, noThrow = true}) => {
        if (extension !== '.lpinclude') return source
        const [key] = name.split('.')
        if (includeMap.has(key)) {
            handleError({noThrow, ln: '-', path, level: 'warn', error: REPEAT_INCLUDE, msg: `Ignoring include file ith same name.`})
            return source
        }
        includeMap.set(key, source)
        return source
    },
    processIncludes: ({source, path, name, extension, size, type, noThrow = true}) => {
        if (extension !== '.lpscene') return source
        const regex = /(?<indent>.*)#include\s*(?<include>\w+)/
        return source.map(line => {
            if (regex.test(line)) {
                const {groups: {include, indent}} = regex.exec(line)
                if (!includeMap.has(include)) {
                    handleError({noThrow, ln: '-', path, error: UNKNOWN_INCLUDE, msg: `Ignoring include file ith same name.`})
                    return line
                }
                return includeMap.get(include).map(line => `${indent}${line}`).join('\r\n')
            }
            return line
        })
    }
}