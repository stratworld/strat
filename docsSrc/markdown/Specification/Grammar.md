# Strat Grammar

Hopefully, this yet-another-home-rolled-EBNF is understandable; '\*', '+', and '?' are interpreted as they would be in Javascript regular expressions.

```
file
  (service|source)*

service
  "service" IDENTIFIER body

source
  "async"? "source" IDENTIFIER body

body
  "{" (component|include)* "}"

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
  IDENTIFIER signature? "->"

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
```

# Lexical Grammar (as regular expressions)

```
STRING: Javascript-like strings, with only "
NUMBER: /^[0-9]+(\.[0-9]*)?$/g
IDENTIFIER: /^[a-zA-Z_]+[a-zA-Z_#0-9]*$/g
```

# Keywords

```
service
source
include
public
async
true
false
null
```
