var once = require('./call-once');
var trapErrors = require('./trap-errors');

var root = this;
var slice = Array.prototype.slice;

var toArray = function(args) {
  return slice.call(args);
};

var deflect = module.exports = function() {
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
        deflect.apply(root, remainingFunctions)
          .apply(root, toArray(arguments).concat(done));
      });
    }

    trapErrors(nextFunction)
      .apply(root, argumentsArray.concat(callback));
  };
};
