/* jshint mocha: true */
var semver = require('semver');
var expect = require('chai').expect;

var npm = require('../package.json');
var bower = require('../bower.json');

describe('Module', function() {
  it('version is a valid semantic version', function() {
    expect(semver.valid(npm.version))
      .to.not.equal(null);
  });

  [
    'author',
    'description',
    'homepage',
    'keywords',
    'license',
    'main',
    'name',
    'repository',
    'version'
  ].forEach(function(key) {
    it(key + ' is the same for npm and Bower', function() {
      expect(npm[key])
        .to.eql(bower[key]);
    });
  });
});
