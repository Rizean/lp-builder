const fs = require('fs-extra')
const logger = require('../Logger')()

const buildPhaseFinal = async ({tree, buildPath, sourcePath, options = {}, noThrow}) => {
    logger.info('BUILD: Phase Final')
    const {lineBreak = '\r\n'} = options
    try {
        tree.children = await Promise.all(tree.children.map(async child => {
            if (child.type === 'file') {

                const outPath = `${buildPath}${child.path.replace(sourcePath, '')}`
                if (child.extension === '.lpinclude') return logger.notice(`Writing: ${outPath} -- Skipped!`)
                logger.info(`Writing: ${outPath}`)
                fs.outputFile(outPath, child.source.join(lineBreak))
                return child
            } else if (child.type === 'directory') {
                return buildPhaseFinal({tree: child, buildPath, sourcePath, noThrow})
            } else throw new Error(`Unknown Type! Type: ${child.type}`)
        }))
    } catch (e) {
        logger.error(e)
    }
    return tree
}
module.exports = buildPhaseFinal