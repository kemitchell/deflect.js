/* jshint mocha: true */
require('chai').should();

var invoke = require('../source/invoke');

describe('invoke', function() {
  it('deflects to functions passed via callback', function(done) {
    var middleFunction = function(error, env, request, response, next) {
      env.list.push('middle');
      next(null, env);
    };

    var passThrough = function(error, env, request, response, next) {
      // No effect on `env`
      next();
    };

    invoke(
      null, // error
      { list: [] }, // env
      null, // response
      [
        function(error, env, request, response, next) {
          env.list.push('first');
          next(null, env, null, [ middleFunction ]);
        },
        function(error, env, request, response, next) {
          env.list.push('last');
          next(null, env, null, passThrough);
        },
        function(error, env) {
          env.list.length.should.equal(3);
          done();
        }
      ],
      null, // serverRequest
      null // serverResponse
    );
  });

  it('error handling example', function(done) {
    invoke(
      null, null, null,
      [
        function() {
          throw new Error('blah!');
        },
        // Explicit no-op
        function(error, env, request, response, next) {
          next(error, env, response);
        },
        // Implicit no-op
        function(error, env, request, response, next) {
          next();
        },
        function(error, env, request, response, next) {
          next(null, env, error ? { status: 500 } : response);
        }, function(error, env, request, response) {
          response.status.should.equal(500);
          done();
        }
      ],
      null, null
    );
  });
});
