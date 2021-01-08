const logger = require('../Logger')()

const buildPhaseThree = async (tree, noThrow) => {
    logger.info('BUILD: Phase Three')
    // TODO Templates
    // try {
    //     tree.children = await Promise.all(tree.children.map(async child => {
    //         if (child.type === 'file') {
    //             child.source = processIncludes({...child, noThrow})
    //             return child
    //         }
    //         else if (child.type === 'directory') {
    //             return buildPhaseTwo(child)
    //         }
    //         else throw new Error(`Unknown Type! Type: ${child.type}`)
    //     }))
    // } catch (e) {
    //     logger.error(e)
    // }
    return tree
}
module.exports = buildPhaseThree