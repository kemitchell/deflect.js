/* jshint mocha: true */
var expect = require('chai').expect;

var deflect = require('..');

describe('Error handling', function() {
  it('traps thrown errors', function(done) {
    var message = 'Thrown, not passed';
    deflect(
      function() {
        throw new Error(message);
      },
      function(error, next) {
        expect(error.message).to.equal(message);
        next();
        done();
      }
    )();
  });

  it('passes argument errors', function(done) {
    var message = 'Passed, not thrown';
    deflect(
      function(next) {
        next({ message: message });
      },
      function(error, next) {
        expect(error.message).to.equal(message);
        next();
        done();
      }
    )();
  });
});
