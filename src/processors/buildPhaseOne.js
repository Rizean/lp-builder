const fs = require('fs-extra')
const path = require('path')
const logger = require('../Logger')()
const LINEBREAK = '\r\n'

const {replaceTabs} = require('./processors.js')
const {parse} = require('./simpleParser.js')
const {parseIncludes} = require('./include')
const {processLanguageFile} = require('./language')
const {hashString} = require('./tools')

const buildPhaseOne = async ({tree, experimentalBoolean, experimentalSyntax, noThrow}) => {
    logger.info('BUILD: Phase One')
    try {
        tree.children = await Promise.all(tree.children.map(async child => {
            if (child.type === 'file') {
                // TODO Line split may not work on MAC but all files should be in \r\n as that is what LifePlay requires
                const source = await fs.readFile(child.path, 'utf-8')
                child.source = child.extension === '.lplang' ? source : (source).split(/\r?\n/g)
                child.source = replaceTabs({...child, noThrow})
                child.sourceHash = hashString(Array.isArray(child.source) ? child.source.join(LINEBREAK) : child.source)
                child.parsed = parse({...child, noThrow})
                parseIncludes({...child})
                processLanguageFile({...child})
                return child
            } else if (child.type === 'directory') {
                return buildPhaseOne({tree: child, experimentalBoolean, experimentalSyntax, noThrow})
            } else throw new Error(`Unknown Type! Type: ${child.type}`)
        }))
    } catch (e) {
        logger.error(e)
    }
    return tree
}

module.exports = buildPhaseOne