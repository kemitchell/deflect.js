var root = this;

// Catch errors and pass them as arguments to the next callback.
module.exports = function(input) {
  return function() {
    try {
      input.apply(root, arguments);
    } catch (error) {
      var argumentsArray = Array.prototype.slice.call(arguments);
      // TODO: Consider checking argumentsArray[0] for an error.
      var callback = argumentsArray[argumentsArray.length - 1];
      callback.call(root, error);
    }
  };
};

