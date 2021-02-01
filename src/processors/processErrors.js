const processErrors = (child, options) => {
    if (child.errors) {
        child.source.push('')
        child.source.push('//********** ERRORS **********//')
        child.errors.forEach(error => child.source.push(`// ${error}`))
    }
}
module.exports = processErrors