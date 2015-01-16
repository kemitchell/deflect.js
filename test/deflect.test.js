/* jshint mocha: true */
var expect = require('chai').expect;

var deflect = require('..');

describe('Deflect', function() {
  it('exports only a function', function() {
    expect(deflect).to.be.a('function');
    expect(Object.keys(deflect)).to.be.empty();
  });
});
