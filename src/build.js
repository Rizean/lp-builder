const fs = require('fs-extra')
const dirTree = require('directory-tree')
const logger = require('./Logger')()
const buildPhaseOne = require('./processors/buildPhaseOne')
const buildPhaseTwo = require('./processors/buildPhaseTwo')
const buildPhaseThree = require('./processors/buildPhaseThree')
const buildPhaseFour = require('./processors/buildPhaseFour')
const buildPhaseFinal = require('./processors/buildPhaseFinal')

const build = async (buildPath, sourcePath, noThrow) => {
    logger.notice(`Building source: ${sourcePath}  destination: ${buildPath}`)

    try {
        let tree = dirTree(sourcePath)
        tree = await buildPhaseOne(tree)
        tree = await buildPhaseTwo(tree)
        tree = await buildPhaseFour(tree)
        if (true){
            const outPath = `${buildPath}/debug.json`
            fs.outputFile(outPath, JSON.stringify(tree,null,2))
        }
        await buildPhaseFinal({tree, buildPath, sourcePath, noThrow})

    } catch (e) {
        logger.error(`BUILD FAILED!`)
        logger.error(e)
    }
}

module.exports = build
