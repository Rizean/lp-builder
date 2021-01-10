const fs = require('fs-extra')
const path = require('path')
const logger = require('../Logger')()
const LINEBREAK = '\r\n'

const {replaceTabs, choices, validateSyntax, processOperands} = require('./processors.js')
const {parseIncludes, processIncludes} = require('./include')
const {hashString} = require('./tools')

const buildPhaseOne = async ({tree, experimentalBoolean, experimentalSyntax, noThrow}) => {
    logger.info('BUILD: Phase One')
    try {
        tree.children = await Promise.all(tree.children.map(async child => {
            if (child.type === 'file') {
                // TODO Line split may not work on MAC but all files should be in \r\n as that is what LifePlay requires
                child.source = (await fs.readFile(child.path, 'utf-8')).split(/\r?\n/g)
                child.source = replaceTabs({...child, noThrow})
                child.sourceHash = hashString(child.source.join(LINEBREAK))
                parseIncludes({...child})
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