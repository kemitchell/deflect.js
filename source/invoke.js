var trapErrors = require('./trap-errors');
var callOnce = require('./call-once');

var root = this;

// Call a handler function with a callback that invokes a provided
// function, or the next function from the stack.
var invoke = module.exports = function(
  error,
  environment,
  responseObject,
  functions,
  incomingMessage,
  serverResponse
) {
    var nextFunction = trapErrors(functions[0]);
    var remainingFunctions = functions.slice(1);

    var callback = callOnce(
      function(newError, newEnvironment, newResponse, newFunction) {
        if (arguments.length < 1) {
          invoke(
            error,
            environment,
            responseObject,
            remainingFunctions,
            incomingMessage,
            serverResponse
          );
        } else {
          if (newFunction) {
            if (Array.isArray(newFunction)) {
              remainingFunctions = newFunction
                .concat(remainingFunctions);
            } else {
              remainingFunctions.unshift(newFunction);
            }
          }
          invoke(
            newError,
            newEnvironment,
            newResponse,
            remainingFunctions,
            incomingMessage,
            serverResponse
          );
        }
      }
    );

    nextFunction.call(
      root,
      error,
      environment,
      incomingMessage,
      responseObject,
      callback
    );
  };
