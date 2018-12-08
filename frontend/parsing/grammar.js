module.exports = function (Statements) {
  return {
    /*

    file ->
      declaration

    */
    file: Statements.file,
    /*

    declaration ->
      service
      source

    */
    declaration: Statements.declaration,
    /*

    service ->
      "service" IDENTIFIER '{' (component|kvp|include)* '}'

    */
    service: Statements.service,
    /*

    source ->
      "source" IDENTIFIER block

    */
    source: Statements.source,
    /*

    component ->
      (eventDispatch)? function

    */
    component: Statements.component,
    /*

    include ->
      "include" STRING

    */
    include: Statements.include,
    /*

    function ->
      shape IDENTIFIER '(' (shape)? ')' block

    */
    function: Statements.function,
    /*

    eventDispatch ->
      IDENTIFIER block "->"

    */
    eventDispatch: Statements.eventDispatch,
    /*

    block ->
      "{" (kvp)* "}"

    */
    block: Statements.block,
    /*

    kvp ->
      IDENTIFIER ':' (STRING|NUMBER)

    */
    kvp: Statements.kvp,
    /*

    shape ->
      IDENTIFIER

    */
    shape: Statements.shape
  }
  /*
    STRING: "this is a \" string"
    NUMBER: /^[0-9]+(\.[0-9]*)?$/g
    IDENTIFIER: /^[a-zA-Z_]+$/g
  */
};
