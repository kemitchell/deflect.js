/* jshint mocha: true */
var supertest = require('supertest');
require('chai').should();

var deflect = require('..');

describe('deflect', function() {
  it('exports only a function', function() {
    deflect.should.be.a('function');
    Object.keys(deflect).should.be.empty();
  });

  it('responds 404 by default', function(done) {
    supertest(deflect()).get('/').expect(404).end(done);
  });

  it('serves responses', function(done) {
    var body = 'response body';
    var app = supertest(deflect([
      function(error, environment, request, response, next) {
        next(null, environment, { body: body });
      }
    ]));
    app.get('/').expect(body).end(done);
  });

  describe('routing example', function() {
    before(function() {
      this.app = supertest(deflect([
        function(error, environment, request, response, next) {
          if (request.url === '/a') {
            next(error, environment, { body: 'A!' });
          } else {
            next();
          }
        },
        function(error, environment, request, response, next) {
          if (request.url === '/b') {
            next(error, environment, { body: 'B!' });
          } else {
            next();
          }
        }
      ]));
    });

    it('serves /a', function(done) {
      this.app.get('/a').expect(200).expect('A!').end(done);
    });

    it('serves /b', function(done) {
      this.app.get('/b').expect(200).expect('B!').end(done);
    });
  });
});
