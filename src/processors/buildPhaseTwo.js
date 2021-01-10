const {parseIncludes, processIncludes} = require('./include')
const {replaceTabs, choices, validateSyntax, processOperands} = require('./processors')
const {booleanOperands, syntax} = require('./advanceChecks')
const processPatches = require('./patcher')
const logger = require('../Logger')()

const buildPhaseTwo = async ({tree, experimentalBoolean, experimentalSyntax, noThrow, patchCommands}) => {
    logger.info('BUILD: Phase Two')
    try {
        tree.children = await Promise.all(tree.children.map(async child => {
            if (child.type === 'file') {
                child.source = processPatches({...child, noThrow, patchCommands})
                child.source = processIncludes({...child, noThrow})
                if (!experimentalBoolean) child.source = processOperands(child.source, child.path, child.extension, noThrow)
                if (experimentalBoolean) child.source = booleanOperands({...child, noThrow})
                if (experimentalSyntax) child.source = syntax({...child, noThrow})
                return child
            } else if (child.type === 'directory') {
                return buildPhaseTwo({tree: child, experimentalBoolean, experimentalSyntax, noThrow, patchCommands})
            } else throw new Error(`Unknown Type! Type: ${child.type}`)
        }))
    } catch (e) {
        logger.error(e)
    }
    return tree
}

module.exports = buildPhaseTwo