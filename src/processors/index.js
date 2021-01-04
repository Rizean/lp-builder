const getIndent = (str) => str.length - str.trimLeft().length

const validateSyntax = (src, sourcePath, extension) => {
    let hasSceneStart = false
    let hasSceneEnd = false
    let inRandomBlock = false
    let randomIndent = 0

    const lines = src.split('\n')
    lines.forEach((line, i)=>{
        const ln = i + 1
        const indent = getIndent(line)
        if (inRandomBlock && indent !== randomIndent) console.warn(`${sourcePath} has invalid Random indent on line: ${ln}`)

        if (line.trim().toLowerCase() === 'scenestart()') {
            if (hasSceneStart) throw new Error(`${sourcePath} has multiple SceneStart()! Second detected on line: ${ln}`)
            hasSceneStart = true
        } else if (line.trim().toLowerCase() === 'sceneend()') {
            if (hasSceneEnd) throw new Error(`${sourcePath} has multiple SceneEnd()! Second detected on line: ${ln}`)
            hasSceneEnd = true
        } else if (line.trim().toLowerCase() === 'random') {
            if (inRandomBlock) throw new Error(`${sourcePath} has Random block inside Random block! Second Random detected on line: ${ln}`)
            inRandomBlock = true
            randomIndent = getIndent(line)
        }
    })

    if (extension === 'lpscene' && !hasSceneStart) throw new Error(`${sourcePath} is missing SceneStart()!`)
    if (extension === 'lpscene' && !hasSceneEnd) throw new Error(`${sourcePath} is missing SceneEnd()!`)
    // if (extension === 'lpscene' && inRandomBlock) throw new Error(`${sourcePath} has unterminated Random block!`)
    if (inRandomBlock) throw new Error(`${sourcePath} has unterminated Random block!`)
    return src
}

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
    validateSyntax,
}
