var root = this;

// Wrap a function to throw an error if it is called more than once.
module.exports = function(input) {
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

