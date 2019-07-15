service test {
  include "Extern"

  Extern ->
    foo ():any -> "foobar"
}
