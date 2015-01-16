/* jshint mocha: true */
var semver = require('semver');
require('chai').should();

var metadata = require('../package.json');

describe('Module', function() {
  it('version is a valid semantic version', function() {
    semver.valid(metadata.version)
      .should.not.equal(null);
  });
});
