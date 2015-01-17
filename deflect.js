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
          throw new Error('Callback was already called.');
        } else {
          called = true;
          input.apply(root, arguments);
        }
      };
    };

    // Deflect Function
    // ------------------

    // Convert an argument-list stack of functions of the form ...
    //
    //     function(error, ..., next) {
    //       next(error, ...);
    //     }
    //
    // ... into a function of the form ...
    //
    //     function(error, ...) {
    //       // No need to call a callback
    //     }
    //
    // ... that executes the functions in stack order, passing each
    // function's results to the next function in the stack.
    var deflect = function() {
      var functionStack = toArray(arguments);
      var nextFunction = functionStack[0];
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
          var functionStack;

          // If the callback is called with no arguments, pass the
          // same list of arguments to the next function.
          if(callbackArguments.length === 0) {
            callbackArguments = invocationArguments;
          }

          // If the first argument a function passes to its callback
          // is a function, rather than an error, that function is
          // unshifted onto the front of the stack, so it will be
          // executed next. This deviation from traditional continuation
          // passing style allows functions in the stack to modify the
          // content of the stack dynamically.
          if (typeof callbackArguments[0] === 'function') {
            var insertedFunction = callbackArguments.shift();
            functionStack = [ insertedFunction ]
              .concat(remainingFunctions);
          } else {
            functionStack = remainingFunctions;
          }

          // If there are still any functions on the stack, the
          // callback for the next function should continue to invoke
          // them. `deflect` the rest of the function stack, then
          // invoke the resulting stack function with the arguments
          // the callback received, plus the final callback in the
          // last position.
          if (functionStack.length > 0) {
            deflect
              .apply(root, functionStack)
              .apply(root, callbackArguments.concat(finalCallback));

          // If there aren't any functions left on the stack, call the
          // final callback passed when the stack function was called.
          } else {
            finalCallback
              .apply(root, callbackArguments);
          }
        });

        // ### Invocation

        // Invoke the function at the top of the stack, trapping
        // errors and providing the created callback function.
        try {
          nextFunction
            .apply(root, invocationArguments.concat(nextCallback));
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
