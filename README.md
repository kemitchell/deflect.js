deflect.js
==========

[![npm version](https://img.shields.io/npm/v/deflect.svg)](https://www.npmjs.com/package/deflect)
[![Bower version](https://img.shields.io/bower/v/deflect.svg)](http://bower.io/search/?q=deflect)
[![build status](https://img.shields.io/travis/kemitchell/deflect.js.svg)](http://travis-ci.org/kemitchell/deflect.js)

Dynamically stack error-first continuation passing functions

For example:

```javascript
var stackFunction = deflect([
  // Each function in the stack takes an optional error and a callback.
  function(error, next) {
    datastore.get('some key', next);
  },
  // The previous function will pass two arguments.
  function(error, value, next) {
    if (error) {
      // Push another function onto the top of the stack and invoke it.
      next(function(error, next) {
        next(null, { status: 404 });
      }, error);
    } else {
      next(null, { status: 200, body: value });
    }
  },
  function(error, response, next) {
    if (!response) {
      next(null, { status: 500 });
    }
  }
]);

stackFunction(null, function(error, response) {
  // ...
});
```

For a more in-depth usage example, see [the HTTP server in the test suite](./test/http-server.test.js).

Comments to the source are [Docco](http://jashkenas.github.io/docco/)-compatible. To generate an annotated source listing for browsing:

```bash
npm --global install docco
docco --output docs deflect.js
```
