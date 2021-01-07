const includeMap = new Map()

module.exports = {
    parseIncludes: ({source, path, name, extension, size, type, noThrow = true}) => {
        if (extension !== '.lpinclude') return source
        const [key] = name.split('.')
        if (includeMap.has(key)) {
            console.warn(`FILE: ${path} - REPEAT_INCLUDE - Ignoring repeated include.`)
            return source
        }
        includeMap.set(key, source)
        return source
    },
    processIncludes: ({source, path, name, extension, size, type, noThrow = true}) => {
        if (extension !== '.lpscene') return source
        const regex = /(?<indent>.*)#include\s*(?<include>\w+)/
        return source.map(line=>{
            if (regex.test(line)) {
                const {groups: {include, indent}} = regex.exec(line)
                if (!includeMap.has(include)) {
                    console.error(`FILE: ${path} - UNKNOWN_INCLUDE - #include: ${include} - skipping!`)
                    return line
                }
                return includeMap.get(include).map(line=>`${indent}${line}`).join('\n')
            }
            return line
        })
    }
}