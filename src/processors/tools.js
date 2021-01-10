const crypto = require('crypto')


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
const countExpression = (str, regex) => (str.match(regex) || []).length

const checkModified = (orig, modified) => orig.replace(/\s/g, '').length !== modified.replace(/\s/g, '').length

const isTriggerConditions = (code) => {
    const triggerConditions = ['WHAT:', 'WHERE:', 'WHEN:', 'WHO:', 'OTHER:']
    // going with trim for now to handle leading spaces which I think is still valid
    // todo leading spaces on triggers might be an error?
    return triggerConditions.some(trigger=>code.trim().startsWith(trigger))
}

const hashString = (str) => crypto.createHash('md5').update(str).digest("hex")

module.exports = {
    getIndent,
    getDialog,
    getNonDialog,
    countChar,
    checkModified,
    countExpression,
    isTriggerConditions,
    hashString,
}