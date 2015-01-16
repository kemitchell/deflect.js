/* jshint mocha: true */
var callOnce = require('../source/call-once');
var expect = require('chai').expect;

describe('callOnce', function() {
  beforeEach(function() {
    this.wrappedFunction = callOnce(function() {});
  });

  it('permits functionst to be called once', function() {
    expect(this.wrappedFunction).to.not.throw(Error);
  });

  it('throws an Error on subsequent calls', function() {
    expect(this.wrappedFunction).to.not.throw(Error);
    expect(this.wrappedFunction).to.throw(Error);
    expect(this.wrappedFunction).to.throw(Error);
  });
});
