const fs = require('fs-extra')
const logger = require('../Logger')()
const LINEBREAK = '\r\n'
const {hashString} = require('./tools')

const buildPhaseFinal = async ({tree, buildPath, sourcePath, options = {}, noThrow, translations}) => {
    logger.info('BUILD: Phase Final')

    try {
        tree.children = await Promise.all(tree.children.map(async child => {
            if (child.type === 'file') {

                const outPath = `${buildPath}${child.path.replace(sourcePath, '')}`
                if (child.extension === '.lpinclude') return logger.info(`Writing: ${outPath} -- Skipped!`)
                if (child.extension === '.lplang') return logger.info(`Writing: ${outPath} -- Skipped!`)
                logger.info(`Writing: ${outPath}`)
                const data = child.source.join(LINEBREAK)
                child.buildHash = hashString(data)
                // try {
                fs.outputFile(outPath, data)
                // } catch (e) {
                //     if (e) {
                //         logger.error(`Failed to write file! source: ${child.path}  target: ${outPath}`)
                //     }
                // }
                if (translations) {
                    Object.entries(child.translations).forEach(([lang, source]) => {
                        const outPath = `${buildPath}\\${lang}${child.path.replace(sourcePath, '')}`
                        const data = child.translations[lang].join(LINEBREAK)
                        fs.outputFile(outPath, data)
                    })
                }

                return child
            } else if (child.type === 'directory') {
                return buildPhaseFinal({tree: child, buildPath, sourcePath, noThrow, translations})
            } else throw new Error(`Unknown Type! Type: ${child.type}`)
        }))
    } catch (e) {
        logger.error(e)
    }
    return tree
}
module.exports = buildPhaseFinal