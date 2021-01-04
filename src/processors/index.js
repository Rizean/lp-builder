const choices = (src) => {
    const lines = src.split('\n')
    const out = []
    const choiceRegex = /\s*\d+::/
    let inChoiceBlock = false
    lines.forEach(line=>{
        if (choiceRegex.test(line)) {
            inChoiceBlock = true
            out.push(line)
        } else if (inChoiceBlock) {
            if (line.trim() > '') out.push('')
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
