const checks = require('./checks')

let checkVal = '    SceneEnd()'
let result = checks.expressionType(checkVal)
if (result !== 'function') {
    console.error(`Expected: "function" got "${result}" checks.expressionType(${checkVal}) !== 'function'`)
}

checkVal = '    Actor3.setMorphValue(Genesis8Female__PBMPregnant, 0.5)'
result = checks.expressionType(checkVal)
if (result !== 'object.function') {
    console.error(`Expected: "function" got "${result}" checks.expressionType(${checkVal}) !== 'function'`)
}

const stringAssignmentRegex = /^(\w[\w\d])\s*=\s*"(.*)"$/
const valueAssignmentRegex = /^(\w[\w\d])\s*([=+\-*/>]{1,2})\s*([\w\d._]*)$/
const str = 'pt=az'
if (stringAssignmentRegex.test(str)) return true
const match = valueAssignmentRegex.test(str)
console.log(match)