const fs = require('fs-extra')
const path = require('path')
const dirTree = require('directory-tree')
const {replaceTabs, choices, validateSyntax, processOperands} = require('./processors')
const {parseIncludes, processIncludes} = require('./processors/include')

const preprocessors = [parseIncludes, processIncludes]

const processors = [
    {matcher: /lp.*/, handler: replaceTabs},
    {matcher: /lp.*/, handler: choices},
    {matcher: /lpscene/, handler: processOperands},
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
    preprocessors.forEach((handler) => handler({source: sourceText, path: srcPath, name, extension, size, type, noThrow: false}))
    // const processedText = processors.reduce((source, {matcher, handler}) => matcher.test(extension) ? handler(source, srcPath, extension) : source, sourceText)
    // postprocessors.forEach(({matcher, handler}) => matcher.test(extension) && handler(processedText, srcPath, extension))
    //
    // return writeFile(buildPath, modulesDirectory, srcPath, processedText)
}

const handleDirectory = async (buildPath, sourcePath, {path, name, children, size, type}) => {
    return children.map(child => {
        if (child.type === 'file') return handleFile(buildPath, sourcePath, child)
        else if (child.type === 'directory') return handleDirectory(buildPath, sourcePath, child)
        else throw new Error(`Unknown Type! Type: ${child.type}`)
    })
}


const buildPhaseOne = async (tree, noThrow) => {
    try {
        tree.children = await Promise.all(tree.children.map(async child => {
            if (child.type === 'file') {
                child.source = (await fs.readFile(child.path, 'utf-8')).split(/[\r\n]+/g)
                child.source = replaceTabs({...child, noThrow})
                parseIncludes({...child})
                return child
            } else if (child.type === 'directory') {
                return buildPhaseOne(child)
            } else throw new Error(`Unknown Type! Type: ${child.type}`)
        }))
    } catch (e) {
        console.error(e)
    }
    return tree
}
const buildPhaseTwo = async (tree, noThrow) => {
    try {
        tree.children = await Promise.all(tree.children.map(async child => {
            if (child.type === 'file') {
                child.source = processIncludes({...child, noThrow})
                child.source = processOperands(child.source, child.path, child.extension, noThrow)
                return child
            } else if (child.type === 'directory') {
                return buildPhaseTwo(child)
            } else throw new Error(`Unknown Type! Type: ${child.type}`)
        }))
    } catch (e) {
        console.error(e)
    }
    return tree
}
// const buildPhaseThree = async (tree, noThrow) => {
//     // TODO Templates
//     // try {
//     //     tree.children = await Promise.all(tree.children.map(async child => {
//     //         if (child.type === 'file') {
//     //             child.source = processIncludes({...child, noThrow})
//     //             return child
//     //         }
//     //         else if (child.type === 'directory') {
//     //             return buildPhaseTwo(child)
//     //         }
//     //         else throw new Error(`Unknown Type! Type: ${child.type}`)
//     //     }))
//     // } catch (e) {
//     //     console.error(e)
//     // }
//     return tree
// }
const buildPhaseFour = async (tree, noThrow) => {
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
const buildPhaseFinal = async ({tree, buildPath, sourcePath, options = {}, noThrow}) => {
    const {lineBreak = '\n'} = options
    // console.log('buildPhaseFinal', tree)
    try {
        tree.children = await Promise.all(tree.children.map(async child => {
            if (child.type === 'file') {

                // child.source = validateSyntax({...child, noThrow})
                const outPath = `${buildPath}${child.path.replace(sourcePath, '')}`
                // console.log(`buildPath:${buildPath}  modulesDirectory:${modulesDirectory}  sourcePath:${sourcePath}  outPath:${outPath}`)
                if (child.extension === '.lpinclude') {
                    return console.log(`Writing: ${outPath} -- Skipped!`)
                }
                console.log(`Writing: ${outPath}`)
                fs.outputFile(outPath, child.source.join(lineBreak))
                return child
            } else if (child.type === 'directory') {
                // console.log('directory buildPhaseFinal', JSON.stringify(child,null,2))
                return buildPhaseFinal({tree: child, buildPath, sourcePath, noThrow})
            } else throw new Error(`Unknown Type! Type: ${child.type}`)
        }))
    } catch (e) {
        console.error(e)
    }
    return tree
}
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
    // try {
    //     const tree = dirTree(sourcePath)
    //     console.log(`tree:`, tree)
    //     await fs.emptydir(buildPath)
    //     await handleDirectory(buildPath, sourcePath, tree)
    // } catch (e) {
    //     console.error(`BUILD FAILED!`)
    //     console.error(e)
    // }
}

module.exports = build
