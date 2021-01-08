const {replaceTabs, choices, validateSyntax, processOperands} = require('./processors')
const logger = require('../Logger')()

const buildPhaseFour = async (tree, noThrow) => {
    logger.info('BUILD: Phase Four')
    try {
        tree.children = await Promise.all(tree.children.map(async child => {
            if (child.type === 'file') {
                child.source = validateSyntax({...child, noThrow})
                return child
            } else if (child.type === 'directory') {
                return buildPhaseFour(child)
            } else throw new Error(`Unknown Type! Type: ${child.type}`)
        }))
    } catch (e) {
        console.error(e)
    }
    return tree
}
module.exports = buildPhaseFour