const includeMap = new Map()
const handleError = require('../handleError')
const {REPEAT_INCLUDE, UNKNOWN_INCLUDE} = require('../errors')

const _processIncludes = ({source, path, name, extension, size, type, noThrow}) => {
    const regex = /(?<indent>.*)#include\s*(?<include>\w+)/
    const newSource = []

    source.forEach(line => {
        if (regex.test(line)) {
            const {groups: {include, indent}} = regex.exec(line)
            if (!includeMap.has(include)) {
                handleError({noThrow, ln: '-', path, error: UNKNOWN_INCLUDE, msg: `Include not found for ${include}`})
                return newSource.push(line)
            }
            let includeCode = includeMap.get(include)
            if (includeCode.some(line=>line.includes('#include'))) {
                includeCode = _processIncludes({source: includeCode, path, name, extension, size, type, noThrow})
            }
            return includeCode.forEach(line => newSource.push(`${indent}${line}`))
        }
        return newSource.push(line)
    })
    return newSource
}

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
        return _processIncludes({source, path, name, extension, size, type, noThrow})
    },
}