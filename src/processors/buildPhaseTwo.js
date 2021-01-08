const {parseIncludes, processIncludes} = require('./include')
const {replaceTabs, choices, validateSyntax, processOperands} = require('./processors')
const logger = require('../Logger')()

const buildPhaseTwo = async (tree, noThrow) => {
    logger.info('BUILD: Phase Two')
    try {
        tree.children = await Promise.all(tree.children.map(async child => {
            if (child.type === 'file') {
                child.source = processIncludes({...child, noThrow})
                child.source = processOperands(child.source, child.path, child.extension, noThrow)
                return child
            } else if (child.type === 'directory') {
                return buildPhaseTwo(child)
            } else throw new Error(`Unknown Type! Type: ${child.type}`)
        }))
    } catch (e) {
        console.error(e)
    }
    return tree
}

module.exports = buildPhaseTwo