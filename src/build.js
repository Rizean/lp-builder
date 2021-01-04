const fs = require('fs-extra')
const path = require('path')
const dirTree = require('directory-tree')
const {replaceTabs, choices, validateSyntax} = require('./processors')

const preprocessors = [
    {matcher: /lp.*/, handler: replaceTabs},
    {matcher: /lp.*/, handler: choices},
]
const postprocessors = [
    {matcher: /lp.*/, handler: validateSyntax},
]
const writeFile = async (buildPath, modulesDirectory, sourcePath, source) => {
    const outPath = `${buildPath}${sourcePath.replace(modulesDirectory, '')}`
    // console.log(`buildPath:${buildPath}  modulesDirectory:${modulesDirectory}  sourcePath:${sourcePath}  outPath:${outPath}`)
    console.log(`Writing: ${outPath}`)
    return fs.outputFile(outPath, source)
}

const handleFile = async (buildPath, modulesDirectory, {path: srcPath, name, extension, size, type}) => {
    srcPath = path.normalize(srcPath)
    console.log(`Processing file: ${name}`)
    // todo going with await for now, likely async would be fine
    const sourceText = await fs.readFile(srcPath, 'utf-8')
    // multistage not sure if this makes sense - thinking is preprocessors/processors may fix issues that the postprocessors would throw an error on
    // postprocessors are most concerned with validating
    const processedText = preprocessors.reduce((source, {matcher, handler})=> matcher.test(extension) ? handler(source, srcPath, extension) : source, sourceText)
    postprocessors.forEach(({matcher, handler})=> matcher.test(extension) && handler(processedText, srcPath, extension))

    return writeFile(buildPath, modulesDirectory, srcPath, processedText)
}

const handleDirectory = async (buildPath, sourcePath, {path, name, children, size, type}) => {
    return children.map(child=>{
        if (child.type === 'file') return handleFile(buildPath, sourcePath, child)
        else if (child.type === 'directory') return handleDirectory(buildPath, sourcePath, child)
        else throw new Error(`Unknown Type! Type: ${child.type}`)
    })
}

const build = async (buildPath, sourcePath) => {
    const tree = dirTree(sourcePath)
    await fs.emptydir(buildPath)
    await handleDirectory(buildPath, sourcePath, tree)
}

module.exports = build
