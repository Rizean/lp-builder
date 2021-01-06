const chokidar = require('chokidar')
const build = require('./build')
const log = console.log.bind(console)
const IGNORED = /(^|[\/\\])\../

let handle = undefined
let countStart = 5
let count = 5

const countDown = ({buildPath, sourcePath}) => {
    if (handle) log('Change detected restarting build timer.')
    clearInterval(handle)
    count = countStart
    handle = setInterval(() => {
        log(`Building in ${count--}`)
        if (count === 0) {
            clearInterval(handle)
            handle = undefined
            log('Starting build...')
            build(buildPath, sourcePath).catch(console.error)
        }
    })
}

const onChangeHandler = ({buildPath, sourcePath, error, event, path, stats}) => {
    if (error) return log(`Watcher error: ${error}`)
    if (event === 'addDir') log(`Directory ${path} has been added`)
    if (event === 'unlinkDir') log(`Directory ${path} has been added`)
    if (event === 'unlinkDir') log(`Directory ${path} has been added`)
    if (event === 'change') {
        if (stats) log(`File ${path} changed size to ${stats.size}`)
        else log(`File ${path} changed`)
    }
    if (event === 'ready') {
        log('Initial scan complete. Running initial build. Ready for changes')
        return build(buildPath, sourcePath)
            .then(() => log('Initial build complete. Ready for changes'))
            .catch(console.error)
    }
    countDown({buildPath, sourcePath})
}

const watcher = ({buildPath, sourcePath, ignored = IGNORED, legacyWatch = false, pollingInterval = 1000, delay = 5000}) => {
    countStart = delay / 1000
    const watchOptions = {
        ignorePermissionErrors: true,
        ignored: ignored,
        persistent: true,
        usePolling: legacyWatch,
        interval: pollingInterval,
    }

    // Initialize watcher.
    const watcher = chokidar.watch(sourcePath, watchOptions)

    // More possible events.
    watcher
        .on('addDir', path => onChangeHandler({event: 'addDir', path, buildPath, sourcePath}))
        .on('unlinkDir', path => onChangeHandler({event: 'unlinkDir', path, buildPath, sourcePath}))
        .on('error', error => onChangeHandler({event: 'change', error, buildPath, sourcePath}))
        .on('ready', () => onChangeHandler({event: 'ready', buildPath, sourcePath}))
        .on('change', (path, stats) => onChangeHandler({event: 'change', path, stats, buildPath, sourcePath}))
    // .on('raw', (event, path, details) => { // internal
    //     log('Raw event info:', event, path, details);
    // })
}

module.exports = watcher