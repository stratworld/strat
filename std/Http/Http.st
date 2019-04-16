source Http {
  include "Birth"
  include "Extern"
  include "SUBSTRATE"

  Birth -> SUBSTRATE.httpConnection
  Extern -> SUBSTRATE.httpReception
  match (any):any -> "./httpMatcher.js"
}