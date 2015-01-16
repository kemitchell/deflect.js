/* jshint mocha: true */
var supertest = require('supertest');
var expect = require('chai').expect;

var deflect = require('..');

describe('Deflect', function() {
  it('exports only a function', function() {
    expect(deflect).to.be.a('function');
    expect(Object.keys(deflect)).to.be.empty();
  });

  describe('http.Server', function() {
    before(function() {
      this.app = supertest(function(incomingMessage, serverResponse) {
        deflect(
          function(error, request, response, next) {
            next(error, request, response);
          },
          function(error, request, response, next) {
            if (error || request.url !== '/a') {
              next(error, request, response);
            } else {
              next(error, request, {
                status: 200,
                headers: { 'Content-Type': 'text/plain' },
                body: 'A!'
              });
            }
          },
          function(error, request, response, next) {
            if (error || request.url !== '/b') {
              next(error, request, response);
            } else {
              next(error, request, {
                status: 200,
                headers: { 'Content-Type': 'text/plain' },
                body: 'B!'
              });
            }
          },
          function(error, request, response, next) {
            if (error && !response) {
              next(null, request, { status: 500 });
            } else {
              next(error, request, response);
            }
          },
          function(error, request, response) {
            if (error) {
              serverResponse.writeHead(500, {});
              serverResponse.end();
            } else {
              serverResponse.writeHead(
                response.status || 200,
                response.headers || {}
              );
              var body = response.body;
              if (
                body && body.pipe && typeof body.pipe === 'function'
              ) {
                body.pipe(serverResponse);
              } else {
                serverResponse.end(response.body);
              }
            }
          }
        )(null, incomingMessage, null);
      });
    });

    it('serves /a', function(done) {
      this.app.get('/a')
        .expect(200)
        .expect('A!')
        .end(done);
    });

    it('serves /b', function(done) {
      this.app.get('/b')
        .expect(200)
        .expect('B!')
        .end(done);
    });
  });
});
