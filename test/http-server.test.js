/* jshint node: true, mocha: true */
var supertest = require('supertest');

var deflect = require('..');

// Fake remote database asynchronous get function
var getValueAsync = (function() {
  var DATA = {
    a: { message: 'A!' },
    b: { message: 'B!' }
  };

  return function(key, callback) {
    process.nextTick(function() {
      callback(null, DATA[key]);
    });
  };
})();

describe('HTTP Server Example', function() {
  before(function() {
    var handlerStack = deflect(
      // If the request is for `/resource/...`, fetch the resource from
      // our fake data store and serve it.
      (function() {
        var prefixedBy = function(string, prefix) {
          var prefixLength = prefix.length;
          return string.substring(0, prefixLength) === prefix &&
            string.length > prefixLength;
        };

        return function(error, request, response, next) {
          var url = request.url;
          if (error || !prefixedBy(url, '/resource/')) {
            next();
          } else {
            var key = url.substring(url.lastIndexOf('/') + 1);
            getValueAsync(key, function(dbError, value) {
              if (dbError) {
                next(dbError, request, null);
              } else {
                next(null, request, value);
              }
            });
          }
        };
      })(),

      // If `response` is a JavaScript object, transform it into an
      // object describing status code, headers, and response body.
      function(error, request, response, next) {
        if (response && !response.status) {
          next(error, request, {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response)
          });
        } else {
          next();
        }
      },

      // Backstop handler
      function(error, request, response, next) {
        // If there's an error that hasn't been handled, respond 500.
        if (error) {
          next(null, request, { status: 500 });
        // If there's no error but no response, either, respond 404.
        } else if (!response) {
          next(error, request, { status: 404 });
        // Otherwise, pass through.
        } else {
          next();
        }
      }
    );

    this.app = supertest(function(incomingMessage, serverResponse) {
      handlerStack(
        null, // no error to start
        { url: incomingMessage.url, method: incomingMessage.method },
        null, // no response object to start
        // Write our response to the `http.serverResponse` object.
        function(error, request, response) {
          serverResponse.writeHead(response.status, response.headers);
          serverResponse.end(response.body);
        }
      );
    });
  });

  it('serves /a', function(done) {
    this.app.get('/resource/a')
      .expect(200)
      .expect('Content-Type', 'application/json')
      .expect('{"message":"A!"}')
      .end(done);
  });

  it('serves /b', function(done) {
    this.app.get('/resource/b')
      .expect(200)
      .expect('Content-Type', 'application/json')
      .expect('{"message":"B!"}')
      .end(done);
  });

  it('responds 404 for missing resource', function(done) {
    this.app.get('/nonexistent')
     .expect(404)
     .end(done);
  });
});
