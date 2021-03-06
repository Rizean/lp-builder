const {validateSyntax, checkIfElseEndif} = require('./processors')
const processErrors = require('./processErrors')
const {generateTranslations} = require('./language')
const logger = require('../Logger')()

const buildPhaseFour = async ({tree, experimentalBoolean, experimentalSyntax, noThrow, warnOnIndentError}) => {
    logger.info('BUILD: Phase Four')
    try {
        tree.children = await Promise.all(tree.children.map(async child => {
            if (child.type === 'file') {
                // child.source = validateSyntax({...child, noThrow})
                validateSyntax(child, {noThrow, warnOnIndentError})
                processErrors(child, {noThrow, warnOnIndentError})
                // child.source = checkIfElseEndif({...child, noThrow})
                child.translations = generateTranslations({...child, noThrow})
                return child
            } else if (child.type === 'directory') {
                return buildPhaseFour({tree: child, experimentalBoolean, experimentalSyntax, noThrow})
            } else throw new Error(`Unknown Type! Type: ${child.type}`)
        }))
    } catch (e) {
        logger.error(e)
    }
    return tree
}
module.exports = buildPhaseFour