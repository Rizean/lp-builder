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
  * `--p <patchFile.js>` `--patch <patchFile.js>` - experimental syntax repair
  * `--t` `--translations` - experimental language translation generation

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


## Build Phases
Anything with (experimental) is not executed unless a command line flag is passed.

### Build
1. Load base directory tree
2. buildPhaseOne
3. buildPhaseTwo
4. buildPhaseThree
5. buildPhaseFour
6. buildPhaseFinal

### Phase 1 - Parsing
1. Read in each file - read in each file to child.source
2. Convert source into an array unless Language File
3. Replace Tabs - Replace tabs with spaces
4. Hash Source - Not used for anything right now but may be used in the watcher down the road
5. Parse Source Files - This is the new wip parser for giving better error messages 
6. Parse Includes
    * Stores `.lptemplate` in the globalTemplateMap
    * Stores `.lpinclude` in the includeMap
7. processLanguageFile  - stores language data in the maps languageStrings and languages

### Phase 2 - Processing
1. Process Patches (depreciated) - Reads in a patch file and processes each patch command on a given source file
2. Process Includes
    1. Checks each scene for #include <name of lpinclude file> and replaces the line with the source for the lpinclude
    2. Repeats step 1 until no #include remain or no replace is found. This is to support nesting includes.
    3. Checks each scene for template syntax `${templateKey}` and replaces it with the template value
3. Process Operands - Check operands && and || looking for cases where only one or 3+ appears and replaces the values with 2 of the operand.
4. Boolean Operands - Appears to be the same process as Process Operands
5. Check If/Else/Endif V2 - An improved version of If/Else/Endif than occurs in the syntax checker that provides a better indication of what line number the missing syntax could be on.
6. Check Syntax
    * Check Parenthesis/Bracket - checks for matching syntax pairs ie `()[]` via count opens/closes.
    * Repair Parenthesis/Bracket - these repairs could be incorrect thus do no ignore these warnings.
        * Adds `)` when lines ends with `(` ie `someCommand(`
        * Adds `]` when lines ends with `[`
        * Drops `]` when lines ends with `]` and the `[` counts is 1 less than the `]` count
        * Adds `(` when lines ends with `)` ie `Object.function)` 
        * Drops `(` when lines ends with `(()` ie `Object.function(()`
        * Drops `)` when lines ends with `())` ie `Object.function())`
        * Drops `)` when lines ends with `())::` ie `Player())::`
        * Drops `)` when lines ends with `)]` and the `)` counts is 1 more than the `(` count
        * Drops `)` when lines ends with `Endif)`

### Phase 3 - Templates - Planned templates like handle bars ie https://handlebarsjs.com/

### Phase 4 - Translations
1. Validate Syntax - Original syntax checking should be moved to Phase 2
    * Checks for `sceneend()` if `scenestart()` is found
    * Checks for `endrandom` if `random` is found
    * Checks indent level of source between `random` and `endrandom`
    * Check Dialogue - checks that dialog ends with `"` and has the correct count of two
    * Check Syntax Pair (depreciated) - does a simple count check on `()[]`
    * Check Choices Syntax - broken
    * Check Math and Logic syntax - Todo
    
2. Check IfElseEndif (depreciated) - Original If/Endif checks.
3. Generate Translations (experimental) - Final step before writing to disk.
    * Scans all source for language syntax `@{lanugaeKey}` generates a source for each language.
    * Uses default key when a specific language key is not found.

### Phase Final - Write
* Write Files to Disk