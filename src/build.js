const fs = require('fs-extra')
const dirTree = require('directory-tree')
const buildPhaseOne = require('./processors/buildPhaseOne')
const buildPhaseTwo = require('./processors/buildPhaseTwo')
const buildPhaseThree = require('./processors/buildPhaseThree')
const buildPhaseFour = require('./processors/buildPhaseFour')
const buildPhaseFinal = require('./processors/buildPhaseFinal')

const build = async (buildPath, sourcePath, noThrow) => {
    console.log(`Building source: ${sourcePath}  destination: ${buildPath}`)

    try {
        let tree = dirTree(sourcePath)
        tree = await buildPhaseOne(tree)
        // console.log('post buildPhaseOne', JSON.stringify(tree,null,2))
        tree = await buildPhaseTwo(tree)
        // console.log('post buildPhaseTwo', JSON.stringify(tree,null,2))
        // tree = await buildPhaseThree(tree)
        tree = await buildPhaseFour(tree)
        // console.log('post buildPhaseFour', JSON.stringify(tree,null,2))
        if (true){
            const outPath = `${buildPath}/debug.json`
            fs.outputFile(outPath, JSON.stringify(tree,null,2))
        }
        await buildPhaseFinal({tree, buildPath, sourcePath, noThrow})
        // console.log(`tree:`, JSON.stringify(tree, null, 2))

    } catch (e) {
        console.error(`BUILD FAILED!`)
        console.error(e)
    }
}

module.exports = build
