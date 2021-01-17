const handleError = require('../handleError')
const {LANGUAGE_FILE_MISSING_TYPE, LANGUAGE_REPEAT_STRING} = require('../errors')

const languageStrings = new Map()
const languages = new Set()

const addLanguage = (data) => {
    Object.keys(data).forEach(lang=>{
        if (lang === 'default') return
        languages.add(lang)
    })
}

const processLanguageFile = ({source, path, name, extension, size, type, noThrow = true}) => {
    if (extension !== '.lplang') return source
    const data = JSON.parse(source)
    if (data['@type'] !== 'language') handleError({noThrow, ln: '-', path, level: 'warn', error: LANGUAGE_FILE_MISSING_TYPE, msg: `LANGUAGE_FILE_MISSING_TYPE`})
    Object.entries(data).forEach(([key, value])=>{
        if (key.includes('@')) return
        if (languageStrings.has(key)) return handleError({noThrow, ln: '-', path, level: 'warn', error: LANGUAGE_REPEAT_STRING, msg: `Language repeat string with key ${key}.`})
        addLanguage(value)
        // if (!languages.has(key)) languages.add(key)
        languageStrings.set(key, value)
    })
    return source
}
const generateTranslations = ({source, path, name, extension, size, type, noThrow}) => {
    if (extension !== '.lpscene') return {}

    const translated = {}
    languages.forEach(lang=>translated[lang] = [])

    const writeLine = (line, key) => {
        if (key) console.log('writeLine', line, key)
        let translatedLine = line
        if (key && !languageStrings.has(key)) {
            handleError({noThrow, ln: '-', path, level: 'warn', error: LANGUAGE_REPEAT_STRING, msg: `Language repeat string with key ${key}.`})
            key = undefined
        }

        languages.forEach(lang=>{
            let translation
            if (key) {
                translation = languageStrings.get(key)[lang]
                if (!translation) {
                    handleError({noThrow, ln: '-', path, level: 'warn', error: LANGUAGE_REPEAT_STRING, msg: `Language repeat string with key ${key}.`})
                    const defaultLang = languageStrings.get(key).default
                    if (!defaultLang) handleError({noThrow, ln: '-', path, level: 'warn', error: LANGUAGE_REPEAT_STRING, msg: `Language repeat string with key ${key}.`})
                    if (defaultLang) translation = languageStrings.get(key)[defaultLang]
                }
            }
            if (translation) translatedLine = translatedLine.replace(key, translation)
            try {
                translated[lang].push(translatedLine)
            } catch (e) {
                console.error(`name: ${name}  lang: ${lang}  translated: ${translatedLine} key: ${key}`, e)

                // console.error('languages', languages)
                throw e
            }

        })
    }

    const regex = /@{(?<key>.+)}/
    source.forEach((line, i) => {
        const ln = i + 1
        if (regex.test(line)) {
            const {groups: {key}} = regex.exec(line)
            writeLine(line, key)
        } else {
            writeLine(line)
        }
    })
    return translated
}
module.exports = {
    generateTranslations,
    processLanguageFile,
}