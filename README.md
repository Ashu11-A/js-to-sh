<div align="center">

# Transpiler Js to Sh

![license-info](https://img.shields.io/github/license/Ashu11-A/AST-Shell?style=for-the-badge&colorA=302D41&colorB=f9e2af&logoColor=f9e2af)
![stars-infoa](https://img.shields.io/github/stars/Ashu11-A/AST-Shell?colorA=302D41&colorB=f9e2af&style=for-the-badge)
![Last-Comitt](https://img.shields.io/github/last-commit/Ashu11-A/AST-Shell?style=for-the-badge&colorA=302D41&colorB=b4befe)

![Comitts Year](https://img.shields.io/github/commit-activity/y/Ashu11-A/AST-Shell?style=for-the-badge&colorA=302D41&colorB=f9e2af&logoColor=f9e2af&authorFilter=Ashu11-A&label=COMMIT+ACTIVITY)
![reposize-info](https://img.shields.io/github/languages/code-size/Ashu11-A/AST-Shell?style=for-the-badge&colorA=302D41&colorB=90dceb)

</div>

<div align="left">

## 🤨 | What's that?

This project uses ATS (abstract syntax tree) to format the javascript for shellscript syntax, but errors can happen, don't expect it to always work, for example, classes are converted to functions for their operation, but more complex things have not yet been implemented and may not work, if you want to help open a pull request!

</div>

## 🤷‍♂️ | Why did you do that?

With a deficit in generating high-performance, easy-to-maintain shell scripts, I decided to create this project.
Of course, it's still in development and, for the time being, it's just a big improvisation, but I hope I don't leave any bugs behind!

## 📥 | Installation

Installing this package is as easy as using it. Just run:

```sh
npm i -g js-to-sh
# OR
npm i js-to-sh
```

## 🔎 | How to use

### 📟 | Terminal:

```sh
js-to-sh -f src/test.ts -o test.sh
# OR
npx tjss -f src/test.ts -o test.sh
```

#### 📄 | Help
```
Usage: tjss [options]

  Options:

   -D --debug  Activates debug mode.
   -d --dir    Directory for fetching and transpiling .js files
   -f --file   File to be transpiled.
   -o --output Output directory or file to save the transpiled files.
```

### 👨‍💻 | Code:
```ts
// build.ts - Esm
import { Transpiler } from 'js-to-sh'

const AST = await new Transpiler({ path: 'src/test.js' }).loader()
const code = Transpiler.parser(AST)

console.log(code)
```

```ts
// build.js - Communjs
const { Transpiler } = require('js-to-sh'); // <-- yes, you need that here ”;”

(async () => {
    const ast = await (new Transpiler({ path: 'src/test.js', cwd: process.cwd() })).loader()
    const code = Transpiler.parser(ast)

    console.log(code)
})()
```

## 🌎 | Global variables

These global variables are associated with static functions, which are imported during the build process of the file. You should use these functions if you need to leverage shellscript behaviors.

```ts
// To use these functions in JavaScript, without the conversion, for backward compatibility (work in JavaScript and ShellScript), you should use:

// Communjs
require('js-to-sh/loader')

// Esm
import 'js-to-sh/loader'
```

```ts
// Checks if a specific command exists in the operating system where the script is running.
isCommand(command)

// Checks if the provided path is a directory.
isDir(path)

// Validates that the given input is empty.
isEmpty(content)

// Validates that the specified file has execute permissions.
isExecutable(filePath)

// Checks if the provided path points to a file.
isFile(filePath)

// Validates that the input is a number.
isNumber(number)

// Checks if the provided path has read permissions.
isReadable(path)

// Validates that the specified path has write permissions.
isWritable(path)
```

## 💡 | Example

Input:
```js
// src/test.js
function some (num1, num2) {
  return num1 + num2
}

function string (str1, str2) {
  return `${str1} ${str2}`
}

const result = some(1, 2)

console.log(string('test', 'test'))
console.log(result)

const func = (str) => console.log(str)
const func2 = (str) => {
  console.log(str)
  console.log(str)
}

func('ArrowFunctionExpression')
func2('ArrowFunctionExpression')
```

Output:
```sh
#!/bin/bash

function some() {
  local num1=$1
  local num2=$2
  echo "$(( "$num1" + "$num2" ))"
}

function string() {
  local str1=$1
  local str2=$2
  echo ""$str1" "$str2""
}

result=$(some 1 2)
echo "$(string test test)"
echo "$result"

function func () {
  local str=$1
  echo "$str"
}

function func2 () {
  local str=$1
  echo "$str"
  echo "$str"
}

func "ArrowFunctionExpression"
func2 "ArrowFunctionExpression"
```
