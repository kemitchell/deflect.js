/* jshint mocha: true */
var semver = require('semver');
require('chai').should();

var metadata = require('../package.json');

describe('Module version', function() {
  it('is a valid semantic version', function() {
    semver.valid(metadata.version)
      .should.not.equal(null);
  });
});
