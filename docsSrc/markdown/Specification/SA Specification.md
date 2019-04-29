# System Artifact (.sa) File Format Specification

todo

.sa files are zip files, so you can open them up and poke around.  There's a hosts.json file that tells the substrate what to build and a folder with a single file for every artifact.  Here's an example hosts.json:

```json
{
  "foo": {
    "containers": {
      "Another": true,
      "Other": true,
      "foo": true
    },
    "inScope": {
      "foo": true,
      "Other": true,
      "Another": true
    },
    "artifacts": [{
      "name": "Strat.majordomo",
      "absolutePath": "/home/faux/strat/scl/std/majordomo.bundle.js",
      "media": ".js"
    }, {
      "name": "foo.blah",
      "isResource": false,
      "absolutePath": "/home/faux/strat/test/foo.js",
      "media": ".js"
    }, {
      "name": "foo.bleh",
      "isResource": true,
      "absolutePath": false,
      "media": ".txt"
    }, {
      "name": "foo.anonymous#38ba6680",
      "isResource": true,
      "absolutePath": "/home/faux/strat/test/foo.js",
      "media": ".js"
    }, {
      "name": "foo.anonymous#7fab74b6",
      "isResource": true,
      "absolutePath": "/home/faux/strat/test/custom404.html",
      "media": ".html"
    }, {
      "name": "foo.reflect",
      "isResource": false,
      "absolutePath": "/home/faux/strat/test/stub.js",
      "media": ".js"
    }, {
      "name": "Other.baz",
      "isResource": true,
      "absolutePath": false,
      "media": ".txt"
    }, {
      "name": "Other.reflect",
      "isResource": false,
      "absolutePath": "/home/faux/strat/test/stub.js",
      "media": ".js"
    }, {
      "name": "Another.proxy",
      "isResource": false,
      "absolutePath": "/home/faux/strat/test/proxy.js",
      "media": ".js"
    }, {
      "name": "Another.reflect",
      "isResource": false,
      "absolutePath": "/home/faux/strat/test/stub.js",
      "media": ".js"
    }, {
      "name": "foo.majordomoConfig",
      "absolutePath": false,
      "media": ".js"
    }]
  },
  "Http": {
    "containers": {
      "Http": true
    },
    "inScope": {
      "Http": true,
      "foo": true
    },
    "artifacts": [{
      "name": "Strat.majordomo",
      "absolutePath": "/home/faux/strat/scl/std/majordomo.bundle.js",
      "media": ".js"
    }, {
      "name": "Http.match",
      "isResource": false,
      "absolutePath": "/home/faux/strat/scl/std/httpMatcher.bundle.js",
      "media": ".js"
    }, {
      "name": "Http.emit",
      "isResource": false,
      "absolutePath": "/home/faux/strat/scl/std/Http/httpEmitter.js",
      "media": ".js"
    }, {
      "name": "Http.$SUBSTRATE-httpConnection",
      "isResource": false,
      "absolutePath": "/home/faux/strat/scl/std/SUBSTRATE/blank.js",
      "media": ".js"
    }, {
      "name": "Http.$SUBSTRATE-httpReception",
      "isResource": false,
      "absolutePath": "/home/faux/strat/scl/std/SUBSTRATE/blank.js",
      "media": ".js"
    }, {
      "name": "Http.reflect",
      "isResource": false,
      "absolutePath": "/home/faux/strat/test/stub.js",
      "media": ".js"
    }, {
      "name": "foo.reflect",
      "isResource": false,
      "absolutePath": "/home/faux/strat/test/stub.js",
      "media": ".js"
    }, {
      "name": "Http.majordomoConfig",
      "absolutePath": false,
      "media": ".js"
    }]
  }
}
```

Each host has 3 properties:

  - containers
    tells the substrate which sources/services are included in this host
  - inScope
    tells the substrate what sources/services are in scope for this host (and thus what is reasonable for a host to want to talk to)
  - artifacts
    a list of artifacts that should be available on this host

An artifact has 4 properties:
  - name
    the name, as well as the directory in which the artifact's data is contained in the .sa file
  - absolutePath
    the filepath the artifact is from, or false if its generated
  - isResource
    a flag to tell the substrate if the file should be executed based on its media type or if it's contents represent the result of execution( if its a static file)
  - media
    the file extension of the original artifact, which should tell the substrate how to invoke it (and it also informs the Http source how to set ContentType headers)
