/* jshint mocha: true */
var callOnce = require('../source/call-once');
var expect = require('chai').expect;

describe('callOnce', function() {
  describe('wrapped functions', function() {
    beforeEach(function() {
      this.wrappedFunction = callOnce(function() {});
    });

    it('can be called once', function() {
      expect(this.wrappedFunction).to.not.throw(Error);
    });

    it('throw an Error when called more than once', function() {
      expect(this.wrappedFunction).to.not.throw(Error);
      expect(this.wrappedFunction).to.throw(Error);
      expect(this.wrappedFunction).to.throw(Error);
    });
  });
});
