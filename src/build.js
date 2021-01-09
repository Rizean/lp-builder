const fs = require('fs-extra')
const dirTree = require('directory-tree')
const logger = require('./Logger')()
const buildPhaseOne = require('./processors/buildPhaseOne')
const buildPhaseTwo = require('./processors/buildPhaseTwo')
// const buildPhaseThree = require('./processors/buildPhaseThree')
const buildPhaseFour = require('./processors/buildPhaseFour')
const buildPhaseFinal = require('./processors/buildPhaseFinal')

const build = async (buildPath, sourcePath, options = {experimentalBoolean: false, experimentalSyntax: false, noThrow: false, log: false, patch}) => {
    logger.notice(`Building source: ${sourcePath}  destination: ${buildPath} patch: ${options.patch}`)
    let patchCommands = []
    if (options.patch) patchCommands = require(options.patch)

    try {
        let tree = dirTree(sourcePath)
        tree = await buildPhaseOne({tree, ...options, patchCommands})
        tree = await buildPhaseTwo({tree, ...options, patchCommands})
        tree = await buildPhaseFour({tree, ...options, patchCommands})
        tree = await buildPhaseFinal({tree, ...options, buildPath, sourcePath})
        const outPath = `${buildPath}/build.json`
        fs.outputFile(outPath, JSON.stringify(tree, null, 2))

    } catch (e) {
        logger.error(`BUILD FAILED!`)
        logger.error(e)
    }
}

module.exports = build
