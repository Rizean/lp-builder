# LP Builder (LPB)
## Install
* `npm install -g lp-builder@latest`
* `yarn global add lp-builder@latest`

## LP Mod Extensions
### Includes - .lpinclude
An "include" is a chunk of code defined in a .lpinclude file. These files can be located anywhere inside the Modules folder. 
In build phase one LPB first reads in all files in the directory tree and stores this in a source tree.
During phase one stores all lpinclude files in a map for phase two.
In build phase two LPB rescans the source tree replacing `#include includeName` in each source file with the appropriate .lpinclude file at the same indent level.

### Templates
#### Global Templates - .lptemplate
Global templates are stored in `.lptemplate` files which can be stored anywhere inside the Modules folder. Each `.lptemplate` file can store ore or more template key/value pairs.
A "global template" is a single line of source with the following format:
```text
key = value
willpower = [energy / 100 * intelligence] - [intoxication / 4]
testLogic = If A = B
```
In any `.lpscene` you can reference a template like so `${key}` for example
```text
WHAT: none
WHERE: none
WHEN: 0 - 24
WHO: none
OTHER: none

    SceneStart()
    willpower = ${willpower}
    SceneEnd()
```
Would be transformed into
```text
WHAT: none
WHERE: none
WHEN: 0 - 24
WHO: none
OTHER: none

    SceneStart()
    willpower = [energy / 100 * intelligence] - [intoxication / 4]
    SceneEnd()
```
#### Local Templates - TODO

### Multi Language Support - TODO

## Building LPB
### Setup for building LP Builder
1. yarn install
### Windows
1. yarn build:win 
### Linux
1. yarn build:linux
### MAC
1. yarn build:mac

## Use
### Core
1. Build: `lpbuilder build <sourcePath> <buildPath>`
2. Watch: `lpbuilder watch <sourcePath> <buildPath>`
3. Check Paths: `lpbuilder check <sourcePath> <buildPath>`

Common use case: `lpbuilder watch D:\projects\my_lifeplay_project\src\Modules\my_module D:\other\LifePlay\LifePlay\Content\Modules\my_module --ufe`

### Options
#### Flags
  * `--l` `--log` - write build to log file
  * `--ufe` `--unFatalErrors` - errors are not fatal
  * `--xb` `--experimentalBoolean` - experimental boolean operand repair
  * `--xs` `--experimentalSyntax` - very experimental syntax repair
  * `--p <patchFile.js>` `--patch <patchFile.js>` - very experimental syntax repair

#### (DEPRECIATED) Patch File Format and Commands
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

## Notes
* Know Bugs: The watch command works well but has issues on .lpinclude file changes. These appear to be false positives and will be fixed in future improvements to how the watch system works.
* I'm not sure there is any value in the `Patch File` system. This is why I have marked it as depreciated. I am going to leave it in for now but in the future I may remove it.
