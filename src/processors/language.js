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