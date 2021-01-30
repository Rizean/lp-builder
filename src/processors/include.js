const includeMap = new Map()
const globalTemplateMap = new Map()
const handleError = require('../handleError')
const {REPEAT_INCLUDE, UNKNOWN_INCLUDE, REPEAT_GLOBAL_TEMPLATE, UNKNOWN_GLOBAL_TEMPLATE} = require('../errors')

const _processIncludes = ({source, path, name, extension, size, type, noThrow}) => {
    const regex = /(?<indent>.*)#include\s*(?<include>\w+)/
    const newSource = []

    source.forEach((line, i) => {
        const ln = i + 1
        if (regex.test(line) && line.trim().startsWith('#')) {
            const {groups: {include, indent}} = regex.exec(line)
            if (!includeMap.has(include)) {
                handleError({noThrow, ln, path, error: UNKNOWN_INCLUDE, msg: `Include not found for ${include}`})
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

const processTemplates = ({source, path, name, extension, size, type, noThrow}) => {
    const regex = /\${(?<key>.+)}/
    const newSource = []

    source.forEach((line, i) => {
        const ln = i + 1
        if (regex.test(line)) {
            const {groups: {key}} = regex.exec(line)
            if (!globalTemplateMap.has(key)) {
                handleError({noThrow, ln, path, error: UNKNOWN_GLOBAL_TEMPLATE, msg: `Template not found for ${key}`})
                return newSource.push(line)
            }
            return newSource.push(line.replace(`\${${key}}`, globalTemplateMap.get(key)))
        }
        return newSource.push(line)
    })
    return newSource
}

const parseGlobalTemplates = ({source, path, name, extension, size, type, noThrow = true}) => {
    if (extension !== '.lptemplate') return source

    const processLine = (line, i) => {
        const ln = i + 1
        const regex = /(?<key>.*?)\s*=\s*(?<value>.*)/
        const {groups: {key, value}} = regex.exec(line)
        if (globalTemplateMap.has(key)) return handleError({noThrow, ln, path, level: 'warn', error: REPEAT_GLOBAL_TEMPLATE, msg: `Ignoring repeated global template ${key}.`})
        globalTemplateMap.set(key, value)
    }
    source.forEach(processLine)
    return source
}

module.exports = {
    parseIncludes: ({source, path, name, extension, size, type, noThrow = true}) => {
        if (extension === '.lptemplate') return parseGlobalTemplates({source, path, name, extension, size, type, noThrow})
        if (extension !== '.lpinclude') return source
        const [key] = name.split('.')
        if (includeMap.has(key)) {
            handleError({noThrow, ln: '-', path, level: 'warn', error: REPEAT_INCLUDE, msg: `Ignoring include file with same name.`})
            return source
        }
        includeMap.set(key, source)
        return source
    },
    processIncludes: ({source, path, name, extension, size, type, noThrow = true}) => {
        if (extension !== '.lpscene') return source
        let tempSource = _processIncludes({source, path, name, extension, size, type, noThrow})
        return processTemplates({source: tempSource, path, name, extension, size, type, noThrow})
    },
}