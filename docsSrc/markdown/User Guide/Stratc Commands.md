## stratc Command Reference

  - {.st file}
    - compiles the file and builds a .sa file
    - EX: $ stratc ./HelloWorld.st

  - [--{svs implementation}] {.sa file}
    - reads the .sa file and runs it on the specified SVS implementation
      - if no svs is supplied, stratc checks for an svs.json and uses
        the value for "substrate" provided there.
      - if no svs.json is supplied, the local svs is used
    - valid svs implementations: [aws, local]
    - EX: $ stratc --aws ./HelloWorld.sa
    - EX: $ stratc ./HelloWorld.sa

  - -v or --version
    - prints the version of stratc