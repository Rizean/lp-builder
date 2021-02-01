const logger = require('./Logger')()

const handleError = ({ln = '-', processor = '-', path, error, msg, level = 'error', child}) => {
    path = path || child?.path
    let message = `PROCESSOR: ${processor}  FILE: ${path}  LINE: ${ln}  ${level.toUpperCase()}: ${error} - ${msg}`
    if (child) {
        child.errors = child.errors || []
        child.errors.push(message)
    }
    return logger[level](message)
}

module.exports = handleError