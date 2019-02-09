# Installing litc

1. Install [NodeJS and NPM](https://nodejs.org/) (node version > 9)

2. Install litc using NPM:

  ```bash
  npm install -g litc
  ```


## Exhaustive Command Reference

You'll need three commands to use litc:

  - build {.lit file}
    - compiles the file and builds a .sys file
    - EX: $ lit build ./HelloWorld.lit

  - deploy {.sys file}
    - reads the .sys file and creates running infrastructure
    - EX: $ lit build ./HelloWorld.sys

  - -v or --version
    - prints the version of litc
