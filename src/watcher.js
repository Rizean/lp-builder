const chokidar = require('chokidar')
const build = require('./build')

const IGNORED = /(^|[\/\\])\../
const logger = require('./Logger')({level: 'warning'})

let handle = undefined
let countStart = 5
let count = 5

const countDown = (buildOptions) => {
    // if (handle) logger.notice('Change detected restarting build timer.')
    clearInterval(handle)
    count = countStart
    handle = setInterval(() => {
        logger.notice(`Building in ${count--}`)
        if (count === 0) {
            clearInterval(handle)
            handle = undefined
            logger.notice('Starting build...')
            build(buildOptions).catch(logger.error)
        }
    }, 1000)
}

const onChangeHandler = ({buildOptions, error, event, path, stats}) => {
    if (error) return logger.error(`Watcher error: ${error}`)
    // if (event === 'addDir') logger.notice(`Directory ${path} has been added`)
    // if (event === 'unlinkDir') logger.notice(`Directory ${path} has been added`)
    // if (event === 'unlinkDir') logger.notice(`Directory ${path} has been added`)
    if (event === 'change') {
        if (stats) logger.notice(`File ${path} changed size to ${stats.size}`)
        else logger.notice(`File ${path} changed`)
    }
    if (event === 'ready') {
        logger.notice('Initial scan complete. Running initial build. Ready for changes')
        clearInterval(handle)
        return build(buildOptions)
            .then(() => logger.notice('Initial build complete. Ready for changes'))
            .catch(logger.error)
    } else {
        countDown(buildOptions)
    }

}

const watcher = ({buildOptions, ignored = IGNORED, legacyWatch = false, pollingInterval = 1000, delay = 5000}) => {
    countStart = delay / 1000
    const watchOptions = {
        ignorePermissionErrors: true,
        ignored: ignored,
        persistent: true,
        usePolling: legacyWatch,
        interval: pollingInterval,
    }

    // Initialize watcher.
    const watcher = chokidar.watch(buildOptions.sourcePath, watchOptions)

    // More possible events.
    watcher
        .on('addDir', path => onChangeHandler({event: 'addDir', path, buildOptions}))
        .on('unlinkDir', path => onChangeHandler({event: 'unlinkDir', path, buildOptions}))
        .on('error', error => onChangeHandler({event: 'change', error, buildOptions}))
        .on('ready', () => onChangeHandler({event: 'ready', buildOptions}))
        .on('change', (path, stats) => onChangeHandler({event: 'change', path, stats, buildOptions}))
    // .on('raw', (event, path, details) => { // internal
    //     logger.notice('Raw event info:', event, path, details);
    // })
}

module.exports = watcher