var once = require('./call-once');

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
    var callback;
    var argumentsArray = toArray(arguments);

    if (remainingFunctions.length === 0) {
      callback = once(function() {});
    } else {
      callback = once(function() {
        var next = deflect.apply(root, remainingFunctions);
        next.apply(root, arguments);
      });
    }

    nextFunction.apply(root, argumentsArray.concat(callback));
  };
};
