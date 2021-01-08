const logger = require('./Logger')()

const handleError = ({ln, path, error, msg, level = 'error', noThrow}) => {
    let message = `FILE: ${path}  LINE: ${ln}  ${level.toUpperCase()}: ${error} - ${msg}`
    if (noThrow || level === 'warn') return logger[level](message)
    throw new Error(message)
}

module.exports = handleError