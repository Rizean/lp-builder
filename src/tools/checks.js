const {getIndent, getDialog, getNonDialog, countChar, checkModified} = require('../processors/tools')

/*
A line can only be one of the following
1. Trigger - WHAT, WHERE, WHEN, WHO, OTHER
2. Logic - If/ElseIf/Else/Endif, While/EndWhile, Random/EndRandom - Followed by
3. Choice - Followed by String
4. Dialog which is a Logic String
5. Expression (pipe | separates examples) - scene = 20 | Dating:attractiontoplayer -= 20 | loseDating() | Player.show()
6. Speech is really a type of Expression ie Player(Happy):: "<Actor.name>, dinner is ready! Come down!" or Actor:: "<Player.Dad_or_Mom>, I'm ... busy. You go ahead and eat."
7. Comment
Any line can have a comment on the end
 */
const LPC = require('../lpConstants')
const validAssignmentOperators = ['=', '+=', '-=', '*=', '/=', '=>']

const checks = {
    isIfExpression: (str) => ['if', 'elseif', 'else', 'endif'].includes(str.trim().split(' ')[0].toLowerCase()),
    isWhile: (str) => ['while', 'endwhile'].includes(str.trim().split(' ')[0].toLowerCase()),
    isRandom: (str) => ['random', 'endrandom'].includes(str.trim().split(' ')[0].toLowerCase()),
    isChoice: (str) => /\d+::/.test(str.trim().split(' ')[0].toLowerCase()),
    isDialog: (str) => str.trim().startsWith('"'),
    isTrigger: (str) => ['WHAT:', 'WHERE:', 'WHEN:', 'WHO:', 'OTHER:'].includes(str.trim().split(' ')[0]),
    isValidDialog: (str) => str.trim().startsWith('"') && str.trim().endsWith('"') && str.replace(/[^"]/g, '').length === 2,
    isSpeech: (str) => /^\w+(?:\(\))?::/.test(str.trim()) || /^\w+(\w+)::/.test(str.trim()),
    isMoodSpeech: (str) => /^\w+\(\w+\)::/.test(str.trim()) || /^\w+(\w+)::/.test(str.trim()),
    // isValidSpeech: (str) => ,
    isComment: (str) => str.trim().startsWith('//'),
    isStringAssignment: (str) => /^(\w[\w\d]*)\s*=\s*"(.*)"$/.test(str.trim()),
    // todo isValueAssignment matches things it should not
    isValueAssignment: (str) => /^(\w[\w\d]*)\s*([=+\-*/>]{1,2})/.test(str.trim()),
    isObjectPropertyAssignment: (str) => /^(\w[\w\d]*)\.(\w[\w\d]*)\s*([=+\-*/>]{1,2})/.test(str.trim()),
    isEmpty: (str) => str.trim() === '',
    isFunction: (str) => LPC.L_FUNCTIONS.includes(str.trim().split(' ')[0].split('(')[0].toLowerCase()),
    // todo this likely matches object.function with invalid params
    isObjectFunction: (str) => /^\w[\w\d]*\.\w[\w\d]*\([\w\d_,.\s-/()]*\)/.test(str.trim()),
    isObjectProperty: (str) => /^\w[\w\d]*:\w[\w\d]*/.test(str.trim()),
    isInclude: (str) => str.trim().startsWith('#'),
    expressionType: (str) => {
        str = str.split('//')[0].trim()
        if (checks.isIfExpression(str)) return 'if'
        if (checks.isWhile(str)) return 'while'
        if (checks.isRandom(str)) return 'random'
        if (checks.isChoice(str)) return 'choice'
        if (checks.isDialog(str)) return 'dialog'
        if (checks.isTrigger(str)) return 'trigger'
        if (checks.isSpeech(str)) return 'speech'
        if (checks.isMoodSpeech(str)) return 'moodSpeech'
        if (checks.isComment(str)) return 'comment'
        if (checks.isStringAssignment(str)) return 'stringAssignment'
        if (checks.isValueAssignment(str)) return 'valueAssignment'
        if (checks.isObjectPropertyAssignment(str)) return 'objectPropertyAssignment'
        if (checks.isEmpty(str)) return 'empty'
        if (checks.isFunction(str)) return 'function'
        if (checks.isObjectFunction(str)) return 'object.function'
        if (checks.isObjectProperty(str)) return 'object:property'
        if (checks.isInclude(str)) return 'include'
        return 'unknown'
    }
}
module.exports = checks