const getIndent = (str) => str.length - str.trimLeft().length
const getDialog = (str) => {
    const strRegex = /.*(".*")/
    if (!strRegex.test(str)) return ''
    const [, dialog] = strRegex.exec(str)
    return dialog
}
const getNonDialog = (str) => {
    const dialog = getDialog(str.trimRight())
    return str.replace(dialog, '').split('//')[0]
}
const countChar = (str, char) => (str.match(new RegExp(`\\${char}`, 'g')) || []).length

const checkModified = (orig, modified) => orig.replace(/\s/g, '').length !== modified.replace(/\s/g, '').length

module.exports = {
    getIndent,
    getDialog,
    getNonDialog,
    countChar,
    checkModified,
}