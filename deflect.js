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

    // Wrap a function to throw if called more than once.
    var once = function(input) {
      var called = false;
      return function() {
        if (called) {
          throw new Error('Callback was already called.');
        } else {
          called = true;
          input.apply(root, arguments);
        }
      };
    };

    // Catch any error and pass as first argument to the callback.
    var trapErrors = function(input) {
      return function() {
        try {
          input.apply(root, arguments);
        } catch (error) {
          arguments[arguments.length - 1].call(root, error);
        }
      };
    };

    // Exported Function
    // -----------------

    // Convert a list of functions of the form
    //
    //     function(error, ..., next) {
    //       next(error, ...);
    //     }
    //
    // into a "stack function" of similar form that executes the
    // functions in the stack in order, passing each function's error
    // and callback arguments (`...`) to the next, or, alternatively,
    // "deflecting" execution to a provided function before popping the
    // remaining functions in the stack.
    var deflect = function() {
      var functionStack = toArray(arguments);
      var nextFunction = functionStack[0];
      var remainingFunctions = functionStack.slice(1);

      return function() {
        var invocationArguments = toArray(arguments);
        var finalCallback = invocationArguments.pop();
        if (typeof finalCallback !== 'function') {
          throw new Error('No callback provided');
        }
        var nextCallback;

        // This is the last function on the stack, so its callback
        // should call the final callback provided when the stack
        // function was called.
        if (remainingFunctions.length === 0) {
          nextCallback = once(function() {
            var callbackArguments = toArray(arguments);

            // If the callback is called with no arguments, pass the
            // same list of arguments to the next function.
            if(callbackArguments.length === 0) {
              callbackArguments = invocationArguments;
            }

            finalCallback.apply(root, callbackArguments);
          });

        // There are still functions on the stack, so the callback
        // for the next function should continue to invoke them.
        } else {
          nextCallback = once(function() {
            var callbackArguments = toArray(arguments);

            // If the callback is called with no arguments, pass the
            // same list of arguments to the next function.
            if(callbackArguments.length === 0) {
              callbackArguments = invocationArguments;

            // If the first argument a function passes to its callback
            // is a function, rather than an error, that function is
            // unshifted onto the front of the stack, so it will be
            // executed next.
            } else if (typeof callbackArguments[0] === 'function') {
              var deflectedFunction = callbackArguments.shift();
              remainingFunctions.unshift(deflectedFunction);
            }

            // `deflect` the rest of the function stack, then invoke
            // the new stack function with the arguments the callback
            // received, plus the final callback in the last position.
            deflect
              .apply(root, remainingFunctions)
              .apply(root, callbackArguments.concat(finalCallback));
          });
        }

        // Invoke the function at the top of the stack, trapping errors
        // and providing the created callback function.
        trapErrors(nextFunction)
          .apply(root, invocationArguments.concat(nextCallback));
      };
    };

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
