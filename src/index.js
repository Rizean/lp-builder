const PACKAGE = require('../package.json')
const yargs = require('yargs/yargs')
const {hideBin} = require('yargs/helpers')
const path = require('path')
const logger = require('./Logger')({level: 'warning'})
const build = require('./build')

const resolveOutPath = (buildPath) => path.resolve(process.cwd(), buildPath)
const resolveInPath = (sourcePath) => path.resolve(process.cwd(), sourcePath)

yargs(hideBin(process.argv))
    .command('build <buildPath> <sourcePath>', 'Builds all files in source path and outputs them to the build path.', (yargs) => {
        yargs
            .positional('buildPath', {describe: 'build path', type: 'string'})
            .positional('sourcePath', {describe: 'source path', type: 'string'})
    }, ({buildPath, sourcePath}) => {
        build(resolveInPath(buildPath), resolveOutPath(sourcePath)).catch(console.error)
    })
    .command('watch <buildPath> <sourcePath>', 'Syntax is the same as build, but will automatically watch for changes to your input file and rebuild them dynamically.', (yargs) => {
        yargs
            .positional('buildPath', {describe: 'build path', type: 'string'})
            .positional('sourcePath', {describe: 'source path', type: 'string'})
    }, ({buildPath, sourcePath}) => {
        logger.warn('todo: watch', buildPath, sourcePath)
    })
    .command('check <buildPath> <sourcePath>', 'Syntax is the same as build, but will only output the paths.', (yargs) => {
        yargs
            .positional('buildPath', {describe: 'build path', type: 'string'})
            .positional('sourcePath', {describe: 'source path', type: 'string'})
    }, ({sourcePath, buildPath}) => {
        console.log(`buildPath: ${resolveOutPath(buildPath)}`)
        console.log(`sourcePath: ${resolveInPath(sourcePath)}`)
    })
    .command('version', `Reports what version of LP Builder you are using.`, (argv) => console.log(`version ${PACKAGE.version}`))
    .demandCommand()
    .help('h')
    .alias('h', 'help')
    .argv
