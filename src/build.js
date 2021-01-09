const fs = require('fs-extra')
const dirTree = require('directory-tree')
const logger = require('./Logger')()
const buildPhaseOne = require('./processors/buildPhaseOne')
const buildPhaseTwo = require('./processors/buildPhaseTwo')
const buildPhaseThree = require('./processors/buildPhaseThree')
const buildPhaseFour = require('./processors/buildPhaseFour')
const buildPhaseFinal = require('./processors/buildPhaseFinal')

const build = async (buildPath, sourcePath, options = {experimentalBoolean: false, experimentalSyntax: false, noThrow: false, log: false}) => {
    logger.notice(`Building source: ${sourcePath}  destination: ${buildPath}`)

    try {
        let tree = dirTree(sourcePath)
        tree = await buildPhaseOne({tree, ...options})
        tree = await buildPhaseTwo({tree, ...options})
        tree = await buildPhaseFour({tree, ...options})
        if (options.log){
            const outPath = `${buildPath}/debug.json`
            fs.outputFile(outPath, JSON.stringify(tree,null,2))
        }
        await buildPhaseFinal({tree, ...options, buildPath, sourcePath})

    } catch (e) {
        logger.error(`BUILD FAILED!`)
        logger.error(e)
    }
}

module.exports = build
