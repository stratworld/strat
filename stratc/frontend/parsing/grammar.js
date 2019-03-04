/*
file
  (service|source)

service
  "service" IDENTIFIER '{' (component|include)* '}'

source
  "source" IDENTIFIER block

include
  "include" (STRING|IDENTIFIER)

component
  (dispatch|function)

function
  functionName STRING

dispatch
  events functionName? STRING
  events IDENTIFIER "." IDENTIFIER  

events
  event+ "->"

event
  IDENTIFIER block

functionName
  "public"? IDENTIFIER signature? "->"

signature
  "(" shape? ")" ":" shape

block
  "{" kvp* "}"

kvp
  IDENTIFIER ":" (STRING|NUMBER)

shape
  IDENTIFIER

-Lexical grammar-
STRING: "this is a \" string"
NUMBER: /^[0-9]+(\.[0-9]*)?$/g
IDENTIFIER: /^[a-zA-Z_]+$/g
*/
module.exports = function (Statements) {
  return Statements;
}
