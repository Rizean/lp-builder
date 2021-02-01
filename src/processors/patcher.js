const {PATCHING_FILE} = require('../errors')
const handleError = require('../handleError')

// module.exports = ({source, path, name, extension, size, type, noThrow = true, patchCommands}) => {
module.exports = (child, {noThrow = true, patchCommands}) => {
    const {source, path, name, extension, size, type} = child
    const patches = new Map()
    patchCommands.forEach(({file, command, params, line: pln}) => {
        if (path.includes(file)) patches.set(pln, {command, params})
    })

    if (patches.size === 0) return //source
    child.patched = true

    const patchedSource = []
    source.forEach((line, i) => {
        const ln = i + 1
        if (!patches.has(ln)) return patchedSource.push(line)
        const {command, params} = patches.get(ln)
        if (command === 'replace') {
            // handleError({noThrow, ln, processor: 'patcher', path, level: 'warning', error: PATCHING_FILE, msg: `Running patch command: ${command}`})
            const newLine = `${line.replace(params.value, params.replacer)} \/\/ patcher replaced {${params.value}} with {${params.replacer}}`
            return patchedSource.push(newLine)
        }
        if (command === 'insert') {
            // handleError({noThrow, ln, processor: 'patcher', path, level: 'warning', error: PATCHING_FILE, msg: `Running patch command: ${command}`})
            patchedSource.push(`${params.value} \/\/ patcher inserted`)
            return patchedSource.push(line)
        }
        if (command === 'remove') {
            // handleError({noThrow, ln, processor: 'patcher', path, level: 'warning', error: PATCHING_FILE, msg: `Running patch command: ${command}`})
            const newLine = `\/\/ ${line.replace(params.value, params.replacer)} \/\/ patcher removed`
            return patchedSource.push(newLine)
        }
        return patchedSource.push(line)
    })
    child.source = patchedSource
    // return patchedSource
}
