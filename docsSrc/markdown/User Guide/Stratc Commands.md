## stratc Command Reference

  - {.st file}
    - compiles the file and builds a .saf file
    - EX: $ stratc ./HelloWorld.st

  - {.sa file}
    - reads the .sa file and creates running infrastructure
    - EX: $ stratc ./HelloWorld.sa

  - -v or --version
    - prints the version of stratc

  - --{svs implementation} {.sa file}
    - reads the .sa file and runs it on the specified SVS implementation
    - valid svs implementations: [aws, local]
    - EX: $ stratc --aws ./HelloWorld.sa
