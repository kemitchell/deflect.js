(function(root) {
  var MODULE_NAME = 'deflect';

  var factory = function() {
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

    var deflect = function() {
      var functionStack = toArray(arguments);
      var nextFunction = functionStack[0];
      var remainingFunctions = functionStack.slice(1);

      return function() {
        var argumentsArray = toArray(arguments);
        var done = argumentsArray.pop();
        if (typeof done !== 'function') {
          throw new Error('No callback provided');
        }
        var callback;

        if (remainingFunctions.length === 0) {
          callback = once(done);
        } else {
          callback = once(function() {
            var passedBack = toArray(arguments);
            if (typeof passedBack[0] === 'function') {
              remainingFunctions.unshift(passedBack.shift());
            }
            deflect
              .apply(root, remainingFunctions)
              .apply(root, passedBack.concat(done));
          });
        }

        trapErrors(nextFunction)
          .apply(root, argumentsArray.concat(callback));
      };
    };

    return deflect;
  };

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
