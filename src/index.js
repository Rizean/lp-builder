const PACKAGE = require('../package.json')
const yargs = require('yargs/yargs')
const {hideBin} = require('yargs/helpers')
const path = require('path')
const logger = require('./Logger')({level: 'warning'})
const build = require('./build')

const resolveOutPath = (buildPath) => path.resolve(process.cwd(), buildPath)
const resolveInPath = (sourcePath) => path.resolve(process.cwd(), sourcePath)

const buildOptions = (yargs) => {
    yargs
        .positional('buildPath', {describe: 'build path', type: 'string'})
        .positional('sourcePath', {describe: 'source path', type: 'string'})
        .option('experimentalBoolean', {
            alias: 'xb',
            describe: 'experimental boolean operand repair',
            type: 'boolean'
        })
        .option('experimentalSyntax', {
            alias: 'xs',
            describe: 'very experimental syntax repair',
            type: 'boolean'
        })
        .option('unFatalErrors', {
            alias: 'ufe',
            describe: 'errors are not fatal',
            type: 'boolean'
        })
        .option('log', {
            alias: 'l',
            describe: 'write build to log file',
            type: 'boolean'
        })
}

yargs(hideBin(process.argv))
    .command(
        'build <buildPath> <sourcePath>', 'Builds all files in source path and outputs them to the build path.',
        buildOptions,
        ({buildPath, sourcePath, experimentalBoolean, experimentalSyntax, unFatalErrors: noThrow, log}) => {
            build(resolveInPath(buildPath), resolveOutPath(sourcePath), {experimentalBoolean, experimentalSyntax, noThrow, log}).catch(console.error)
        })
    .command('watch <buildPath> <sourcePath>', 'Syntax is the same as build, but will automatically watch for changes to your input file and rebuild them dynamically.',
        buildOptions,
        ({buildPath, sourcePath, experimentalBoolean, experimentalSyntax, unFatalErrors: noThrow, log}) => {
            logger.warn('todo: watch', buildPath, sourcePath, {experimentalBoolean, experimentalSyntax, noThrow, log})
        })
    .command('check <buildPath> <sourcePath>', 'Syntax is the same as build, but will only output the paths.',
        buildOptions,
        ({sourcePath, buildPath, experimentalBoolean, experimentalSyntax, unFatalErrors: noThrow, log}) => {
            console.log(`buildPath: ${resolveOutPath(buildPath)}`)
            console.log(`sourcePath: ${resolveInPath(sourcePath)}`)
            console.log(`experimentalBoolean: ${experimentalBoolean}`)
            console.log(`experimentalSyntax: ${experimentalSyntax}`)
        })
    .command('version', `Reports what version of LP Builder you are using.`, (argv) => console.log(`version ${PACKAGE.version}`))
    .demandCommand()
    .help('h')
    .alias('h', 'help')
    .argv
