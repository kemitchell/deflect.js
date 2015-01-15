/* jshint mocha: true */
var trapErrors = require('../source/trap-errors');
var expect = require('chai').expect;

describe('trapErrors', function() {
  describe('wrapped functions', function() {
    it('pass thrown errors to their callbacks', function(done) {
      var callback = function(error) {
        expect(error).be.an.instanceof(Error);
        done();
      };
      trapErrors(function() {
        throw new Error();
      })(callback);
    });
  });
});
