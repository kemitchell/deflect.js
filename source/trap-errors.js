var root = this;

// Catch any error and pass is as first argument to the next callback.
module.exports = function(input) {
  return function() {
    try {
      input.apply(root, arguments);
    } catch (error) {
      arguments[arguments.length - 1].call(root, error);
    }
  };
};
