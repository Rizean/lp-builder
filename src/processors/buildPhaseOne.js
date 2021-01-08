const fs = require('fs-extra')
const path = require('path')
const logger = require('../Logger')()

const {replaceTabs, choices, validateSyntax, processOperands} = require('./processors.js')
const {parseIncludes, processIncludes} = require('./include')

const buildPhaseOne = async (tree, noThrow) => {
    logger.info('BUILD: Phase One')
    try {
        tree.children = await Promise.all(tree.children.map(async child => {
            if (child.type === 'file') {
                child.source = (await fs.readFile(child.path, 'utf-8')).split(/[\r\n]+/g)
                child.source = replaceTabs({...child, noThrow})
                parseIncludes({...child})
                return child
            } else if (child.type === 'directory') {
                return buildPhaseOne(child)
            } else throw new Error(`Unknown Type! Type: ${child.type}`)
        }))
    } catch (e) {
        logger.error(e)
    }
    return tree
}

module.exports = buildPhaseOne