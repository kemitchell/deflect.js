var applyResponse = require('./apply-response');
var invoke = require('./invoke');

// Create a a request handler for `http.Server` from stacks of
// `function(error, environment, request, response, next) {}`.
module.exports = function(functions) {
  if (!Array.isArray(functions)) {
    functions = [ functions ];
  }

  return function(incomingMessage, serverResponse) {
    functions.push(
      function(error, environment, incomingMessage, responseObject) {
        if (responseObject) {
          // Send the response.
          applyResponse(responseObject, serverResponse);
        } else {
          // Respond 404.
          applyResponse({ status: 404 }, serverResponse);
        }
      }
    );

    invoke(
      null,
      null,
      null,
      functions,
      incomingMessage,
      serverResponse
    );
  };
};
