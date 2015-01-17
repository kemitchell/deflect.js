// # deflect.js 0.0.4
// https://github.com/kemitchell/deflect.js

(function(root) {
  // Factory to create the exported function
  var factory = function() {
    // ## Utility Functions

    // Convert `arguments` to an array in a readable way.
    var toArray = (function() {
      var slice = Array.prototype.slice;
      return function(args) {
        return slice.call(args);
      };
    })();

    // Wrap a function so that it throws an error if it is called more
    // than once.
    var once = function(input) {
      var called = false;
      return function() {
        if (called) {
          throw new Error('Callback called multiple times');
        } else {
          called = true;
          input.apply(root, arguments);
        }
      };
    };

    // ## Exported Function

    // Convert an array of functions of the form ...
    //
    //     [
    //       function(error, ..., next) {
    //         next(error, ...);
    //       },
    //       ...
    //     ]
    //
    // ... into a function of the form ...
    //
    //     function(error, ...) {
    //       // No need to call a callback
    //     }
    //
    // ... that executes the functions in stack order, passing each
    // function's results to the next function in the stack.
    var deflect = function(functionStack) {
      var currentFunction = functionStack[0];
      var remainingFunctions = functionStack.slice(1);

      // ### Stack Function

      // Return a function invokes the stack of functions.
      return function() {
        var invocationArguments = toArray(arguments);
        var finalCallback = invocationArguments.pop();
        if (typeof finalCallback !== 'function') {
          throw new Error('No callback provided');
        }

        // #### Callback

        // Construct the callback function that will be passed to the
        // function at the top of the stack.
        var nextCallback = once(function() {
          var callbackArguments = toArray(arguments);
          var firstArgument = callbackArguments[0];
          var firstIsAFunction = false;
          var nextFunctions;

          // If the callback is called with no arguments, pass the
          // same list of arguments to the next function.
          if(callbackArguments.length === 0) {
            callbackArguments = invocationArguments;
          }

          // If the callback is called with a function or an array of
          // functions as its first argument, rather than an error, a
          // new stack is created with the passed function or functions
          // at the font, to be called next.
          if (
            (firstIsAFunction = typeof firstArgument === 'function') ||
            Array.isArray(firstArgument)
          ) {
            var insertedFunctions = firstIsAFunction ?
              [ callbackArguments.shift() ] : callbackArguments.shift();
            nextFunctions = insertedFunctions
              .concat(remainingFunctions);
          } else {
            nextFunctions = remainingFunctions;
          }

          // If there are still functions on the stack, the callback for
          // the next function should continue invoking them.
          if (nextFunctions.length > 0) {
            // `deflect` the tail of the function stack, then call the
            // resulting stack function, passing the arguments the
            // callback received, plus the final callback.
            deflect
              .call(root, nextFunctions)
              .apply(root, callbackArguments.concat(finalCallback));

          // If there aren't any functions left on the stack, call the
          // final callback passed when the stack function was called.
          } else {
            finalCallback
              .apply(root, callbackArguments);
          }
        });

        // ### Invocation

        // Invoke the function at the top of the stack, catching errors
        // and passing the created callback function.
        try {
          currentFunction.apply(
            root, invocationArguments.concat(nextCallback)
          );
        } catch(error) {
          invocationArguments[0] = error;
          nextCallback.apply(root, invocationArguments);
        }
      };
    };

    // Export `deflect`.
    return deflect;
  };

  // ## Universal Module Definition

  var MODULE_NAME = 'deflect';

  /* globals define, module */
  /* istanbul ignore next */
  if (typeof define === 'function' && define.amd) {
    define(MODULE_NAME, [], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory.call(this);
  } else {
    this[MODULE_NAME] = factory.call(this);
  }
})(this);
