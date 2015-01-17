/* jshint node: true, mocha: true */
var fs = require('fs');

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

  var firstSourceLines = fs.readFileSync(npm.main)
    .toString()
    .split('\n')
    .slice(0, 2);

  it('version appears in the source file', function() {
    var header = npm.name + '.js ' + npm.version;
    expect(firstSourceLines[0]).to.contain(header);
  });

  it('homepage appears in the source file', function() {
    expect(firstSourceLines[1]).to.contain(npm.homepage);
  });
});
