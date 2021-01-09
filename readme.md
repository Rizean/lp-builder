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
  * -l --log - write build to log file
  * -ufe --unFatalErrors - errors are not fatal
  * -xb --experimentalBoolean - experimental boolean operand repair
  * -xs --experimentalSyntax - very experimental syntax repair

## Todo
1. Todo check for common issues like (2)) or && & or )] or (\r\n or Endif)\r\n or < 50]\r\n or (() or Player.hide)\r\n