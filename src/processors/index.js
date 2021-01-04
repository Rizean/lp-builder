const choices = (src, sourcePath) => {
    const lines = src.split('\n')
    const out = []
    const choiceRegex = /\s*\d+::/
    let inChoiceBlock = false
    lines.forEach((line, i)=>{
        if (choiceRegex.test(line)) {
            inChoiceBlock = true
            out.push(line)
        } else if (inChoiceBlock) {
            if (line.trim() > '') {
                out.push('')
                console.warn(`WARNING: Missing 'CHOICE' line break in ${sourcePath} on line ${i + 1}.`)
            }
            out.push(line)
            inChoiceBlock = false
        } else {
            out.push(line)
        }
    })
    return out.join('\n')
}

module.exports = {
    replaceTabs: (src, spaces = '    ') => src.replace(/\t/g, spaces),
    choices,
}
