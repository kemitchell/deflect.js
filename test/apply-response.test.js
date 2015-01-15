/* jshint mocha: true */
var applyResponse = require('../source/apply-response');
var sinon = require('sinon');

describe('applyResponse', function() {
  it('uses HTTP status code 200 by default', function() {
    var object = { pipe: function() {} };
    var response = {
      writeHead: sinon.mock().once().withArgs(200),
      end: function() {}
    };
    applyResponse(object, response);
  });

  it('no additional headers by default', function() {
    var object = { pipe: function() {} };
    var response = {
      writeHead: sinon.mock().once().withArgs(sinon.match.any, {}),
      end: function() {}
    };
    applyResponse(object, response);
  });

  it('writes string body values', function() {
    var string = 'string body content';
    var response = {
      writeHead: function() {},
      end: sinon.mock().once().withArgs(string)
    };
    applyResponse({ body: string }, response);
  });

  it('pipes readable stream body objects', function() {
    var stream = { pipe: sinon.mock().once() };
    var response = { writeHead: function() {} };
    applyResponse({ body: stream }, response);
  });
});
