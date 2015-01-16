/* jshint mocha: true */
var supertest = require('supertest');

var deflect = require('..');

describe('HTTP Server', function() {
  before(function() {
    var serveRoute = function(route, body) {
      return function(error, request, response, next) {
        if (error || request.url !== route) {
          next(error, request, response);
        } else {
          var object = { message: body };
          next(error, request, { status: 200, body: object });
        }
      };
    };

    this.app = supertest(function(incomingMessage, serverResponse) {
      deflect(
        serveRoute('/a', 'A!'),
        serveRoute('/b', 'B!'),
        function(error, request, response, next) {
          if (response) {
            if (!response.headers) {
              response.headers = {};
            }
            response.headers['Content-Type'] = 'application/json';
            response.body = JSON.stringify(response.body);
          }
          next(error, request, response);
        },
        function(error, request, response, next) {
          if (error) {
            next(null, request, { status: 500 });
          } else if (!response) {
            next(error, request, { status: 404 });
          } else {
            next(error, request, response);
          }
        },
        function(error, request, response, next) {
          serverResponse.writeHead(response.status, response.headers);
          serverResponse.end(response.body);
          next();
        }
      )(null, incomingMessage, null, function() {});
    });
  });

  it('serves /a', function(done) {
    this.app.get('/a')
      .expect(200)
      .expect('{"message":"A!"}')
      .end(done);
  });

  it('serves /b', function(done) {
    this.app.get('/b')
      .expect(200)
      .expect('{"message":"B!"}')
      .end(done);
  });

  it('responds 404 for missing resources', function(done) {
    this.app.get('/nonexistent')
     .expect(404)
     .end(done);
  });
});
