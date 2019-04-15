source Http {
  include "Birth"
  include "Extern"
  include "SUBSTRATE"

  Birth -> SUBSTRATE.httpConnection
  Extern -> SUBSTRATE.httpReception
  emit (any):any -> "./stdEmitter.js"
  match (any):any -> "./httpMatcher.js"

  //config is going to live inside SUBSTRATE
  //config (any):any -> "json"
}