#!/usr/bin/env node

const PACKAGE = require('../package.json')
const yargs = require('yargs/yargs')
const {hideBin} = require('yargs/helpers')
const path = require('path')
const logger = require('./Logger')({level: 'warning'})
const build = require('./build')
const watcher = require('./watcher')

const resolvePath = (pathString) => path.resolve(process.cwd(), pathString)

const getBuildOptions = (yargs) => {
    yargs
        .positional('sourcePath', {describe: 'source path', type: 'string'})
        .positional('buildPath', {describe: 'build path', type: 'string'})
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
        .option('patch', {
            alias: 'p',
            describe: 'path to patch file',
            type: 'string'
        })
}

yargs(hideBin(process.argv))
    .command(
        'build <sourcePath> <buildPath>', 'Builds all files in source path and outputs them to the build path.',
        getBuildOptions,
        ({buildPath, sourcePath, experimentalBoolean, experimentalSyntax, unFatalErrors: noThrow, log, patch}) => {
            const buildOptions = {
                buildPath: resolvePath(buildPath),
                sourcePath: resolvePath(sourcePath),
                experimentalBoolean,
                experimentalSyntax,
                noThrow,
                log,
                patch: resolvePath(patch)
            }
            build(buildOptions).catch(console.error)
        })
    .command('watch <sourcePath> <buildPath>', 'Syntax is the same as build, but will automatically watch for changes to your input file and rebuild them dynamically.',
        getBuildOptions,
        ({buildPath, sourcePath, experimentalBoolean, experimentalSyntax, unFatalErrors: noThrow, log, patch}) => {
        const buildOptions = {
            buildPath: resolvePath(buildPath),
            sourcePath: resolvePath(sourcePath),
            experimentalBoolean,
            experimentalSyntax,
            noThrow,
            log,
            patch: resolvePath(patch)
        }
            watcher({buildOptions})
        })
    .command('check <sourcePath> <buildPath>', 'Syntax is the same as build, but will only output the paths.',
        getBuildOptions,
        ({sourcePath, buildPath, experimentalBoolean, experimentalSyntax, unFatalErrors: noThrow, log, patch}) => {
            console.log(`buildPath: ${resolvePath(buildPath)}`)
            console.log(`sourcePath: ${resolvePath(sourcePath)}`)
            console.log(`experimentalBoolean: ${experimentalBoolean}`)
            console.log(`experimentalSyntax: ${experimentalSyntax}`)
            console.log(`patch: ${resolvePath(patch)}`)
        })
    .command('version', `Reports what version of LP Builder you are using.`, (argv) => console.log(`version ${PACKAGE.version}`))
    .demandCommand()
    .help('h')
    .alias('h', 'help')
    .argv
