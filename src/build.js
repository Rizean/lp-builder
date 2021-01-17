const fs = require('fs-extra')
const dirTree = require('directory-tree')
const logger = require('./Logger')()
const buildPhaseOne = require('./processors/buildPhaseOne')
const buildPhaseTwo = require('./processors/buildPhaseTwo')
// const buildPhaseThree = require('./processors/buildPhaseThree')
const buildPhaseFour = require('./processors/buildPhaseFour')
const buildPhaseFinal = require('./processors/buildPhaseFinal')

const build = async ({buildPath, sourcePath, experimentalBoolean = false, experimentalSyntax = false, noThrow = false, log = false, patch, translations}) => {
    logger.notice(`Building source: ${sourcePath}  destination: ${buildPath} patch: ${patch}`)
    let patchCommands = []
    if (patch) patchCommands = require(patch)

    try {
        let tree = dirTree(sourcePath)
        tree = await buildPhaseOne({tree, experimentalBoolean, experimentalSyntax, noThrow, log, patchCommands})
        tree = await buildPhaseTwo({tree, experimentalBoolean, experimentalSyntax, noThrow, log, patchCommands})
        tree = await buildPhaseFour({tree, experimentalBoolean, experimentalSyntax, noThrow, log, patchCommands})
        tree = await buildPhaseFinal({tree, buildPath, sourcePath, experimentalBoolean, experimentalSyntax, noThrow, log, patchCommands, translations})
        const outPath = `${buildPath}/build.json`
        fs.outputFile(outPath, JSON.stringify(tree, null, 2))

    } catch (e) {
        logger.error(`BUILD FAILED!`)
        logger.error(e)
    }
}

module.exports = build
