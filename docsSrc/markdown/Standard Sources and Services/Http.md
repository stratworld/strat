# HTTP

__Note__ Http is mostly implemented but does not support some use cases that will be required by many users, notably cookies and custom headers.  The long term goal for Http is to fall somewhere between where it is now and "full" Http requests and responses like those from the Node Http library.


Http is a standard event source that allows your system to be called via Http servers.

## Http patterns

Patterns must have a method and path property.  They both have custom matching functions.

### method

Method must be a string and supports a sort of sum type notation--a list of method string separated by '|' denoting 'or' in the list. Examples:

  - "get|post" means "a get or post method"
  - "get" means "just a get method"

Comparisons against the actual Http request's method are case insensitive.  The values "any" and "\*" will match any method.

### path

Path matching can optionally match against parameters and populate a params map on the request object like in Express.js.  Examples:


  - "/"
  - "/\*/foo" means "any path that terminates in /foo"
  - "foo.html"
  - "/foo/:argument1/bar" will populate a map {argument1: "the value"} on the request
  - "/:arg1/:arg2/bar"


## Error Patterns

If the Http source can't find a match or catches an error it will emit error events which can be caught and responded to in user code.  This allows the user to provide custom error responses.  Examples:

```st
service Custom404 {
  include "Http"

  Http { method: "*", path: '/something' } -> "Hello from something"
  Http { status: 404 } -> "./custom404.html"
  Http { status: 500 } -> "./custom500.html"
}
```

Only statuses 404 and 500 are supported at the moment.

## Request and Response Objects

Http will pass an event to its function of the form:

```js
{
  method: "the http method",
  path: "the original path (...com/this/path/1 -> '/this/path/1')",
  body: { /* the deserialized body or undefined */ },
  params: { /*a map with keys and values based on the path match*/ }
}
```

Whatever response from the function is interpreted as the body of the response object, and ContentType headers are inferred based on the file extension of the function's artifact, with a few nuances:

  - If the artifact is a .js file
    - and a resource, the content type is "application/javascript"
    - or has a signature, the content type is "application/json"
  - If an error occurred, the content type is "text/plain"
  - If the function was a string literal, the content type is "text/plain"

TODO: allow for more control in headers and cookies
