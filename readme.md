# LP Builder
## Setup for building LP Builder
1. yarn install

## Build
### Windows
1. yarn build:win 
### Linux
1. yarn build:linux
### MAC
1. yarn build:mac

## Use
### Core
1. Build: `lpBuilder build <buildPath> <sourcePath>`
2. Check Paths: `lpBuilder check <buildPath> <sourcePath>`
3. TODO: Watch: `lpBuilder watch <buildPath> <sourcePath>`

### Options
#### Flags
  * `-l` `--log` - write build to log file
  * `-ufe` `--unFatalErrors` - errors are not fatal
  * `-xb` `--experimentalBoolean` - experimental boolean operand repair
  * `-xs` `--experimentalSyntax` - very experimental syntax repair
  * `-p <patchFile.js>` `--patch <patchFile.js>` - very experimental syntax repair

#### Patch File Format and Commands
There is an included patch file in the data directory `patches20200109.js` that addresses most current issues as of 2020/01/09

```javascript
// A Patch file is a valid js files that exports an Array
// Each element of the array has four properties
// file - string to match aginst files names
// command - replace, insert, remove - see commands below
// params - see commands below
// line - the line number to run the patch command on
// commands:
// * remove - removes the line - params: {} empty object
// * insert - inserts a string at the line before the current string - params: {value: 'value to insert'}
// * replace - performs a SIMPLE replace on the exist string at the given line before the current string - params: {value: 'the value to replace', replacer: 'the replacement value'}

// Example
module.exports = [
    {file: 'sb_PimpYourGirl\\Scenes\\sexwork\\instaglam\\instaglam_companion.lpscene', command: 'replace', params: {value: 'Endif', replacer: ''}, line: 241},

    {file: 'sb_TheNewGoodbye\\Scenes\\companion\\goodbye_companion.lpscene', command: 'insert', params: {value: 'EndIf'}, line: 3531},

    {file: 'vin_Incest\\Scenes\\catches_incest.lpscene', command: 'remove', params: {}, line: 60},
    {file: 'vin_Incest\\Scenes\\catches_incest.lpscene', command: 'remove', params: {}, line: 61},
    {file: 'vin_Incest\\Scenes\\catches_incest.lpscene', command: 'remove', params: {}, line: 62},
]
```
