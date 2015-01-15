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
    supertest(deflect())
      .get('/')
      .expect(404)
      .end(done);
  });

  it('serves responses', function(done) {
    var body = 'response body';
    var app = deflect([ function(err, env, request, response, next) {
      next(null, env, { body: body });
    } ]);
    supertest(app)
      .get('/')
      .expect(body)
      .end(done);
  });
});
