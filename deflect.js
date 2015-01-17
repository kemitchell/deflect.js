// deflect.js
// ----------
// Dynamic stacks of error-first continuation passing functions

(function(root) {
  var factory = function() {
    // Utility Functions
    // -----------------

    // Convert `arguments` to an array.
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

    // Deflect Function
    // ------------------

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
          var nextFunctions;

          // If the callback is called with no arguments, pass the
          // same list of arguments to the next function.
          if(callbackArguments.length === 0) {
            callbackArguments = invocationArguments;
          }

          // If the callback is called with a function as its first
          // argument, rather than an error, a new stack is created
          // with that function at the font, so it will be called next.
          if (typeof callbackArguments[0] === 'function') {
            var insertedFunction = callbackArguments.shift();
            nextFunctions = [ insertedFunction ]
              .concat(remainingFunctions);
          // If the callback is called with an array of functions as
          // its first argument, a new stack is created with the new
          // functions at the font, so they will be called next.
          } else if (Array.isArray(callbackArguments[0])) {
            var insertedFunctions = callbackArguments.shift();
            nextFunctions = insertedFunctions
              .concat(remainingFunctions);
          } else {
            nextFunctions = remainingFunctions;
          }

          // If there are still any functions on the stack, the callback
          // for the next function should continue to invoke them.
          // `deflect` the tail of the function stack, then invoke the
          // resulting stack function with the arguments the callback
          // received, plus the final callback in the last position.
          if (nextFunctions.length > 0) {
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
        // and providing the created callback function.
        try {
          currentFunction.apply(
            root, invocationArguments.concat(nextCallback)
          );
        } catch(e) {
          invocationArguments[0] = e;
          nextCallback.apply(root, invocationArguments);
        }
      };
    };

    // Exports `deflect`.
    return deflect;
  };

  // Universal Module Definition
  // ---------------------------

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
