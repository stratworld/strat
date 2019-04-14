/*
file
  (service|source)*

service
  "service" IDENTIFIER body

source
  (async)? "source" IDENTIFIER body

body
  '{' (component|include)* '}'

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
  IDENTIFIER pattern?

functionName
  "public"? IDENTIFIER signature? "->"

signature
  "(" shape? ")" ":" shape

pattern
  "{" kvp* "}"
  "[" shape "]"
  STRING
  NUMBER
  TRUE
  FALSE
  NULL

kvp
  IDENTIFIER ":" pattern

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
