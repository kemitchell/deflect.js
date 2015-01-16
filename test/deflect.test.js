/* jshint node: true, mocha: true */
var expect = require('chai').expect;

var deflect = require('..');

describe('Deflect', function() {
  it('exports only a function', function() {
    expect(deflect).to.be.a('function');
    expect(Object.keys(deflect)).to.be.empty();
  });

  it('creates functions that take callbacks', function() {
    expect(deflect(function() {})).to.throw(Error);
  });

  it('throws when a callback is called more than once', function(done) {
    expect(function() {
      deflect(function(next) {
        next();
        next();
      })(done);
    }).to.throw(Error);
  });

  describe('next(function(){}, ...)', function() {
    it('unshifts a function onto the stack', function(done) {
      var concatB = function(err, list, next) {
        next(err, list.concat('B'));
      };

      deflect(
        function(error, list, next) {
          // Deflect
          next(concatB, error, list.concat('A'));
        },
        function(error, list, next) {
          expect(list).to.eql([ 'A', 'B' ]);
          next(error, list);
        }
      )(null, [], done);
    });

    it('resumes with the next function on the stack', function(done) {
      var concatB = function(err, list, next) {
        next(err, list.concat('B'));
      };

      deflect(
        function(error, list, next) {
          next(concatB, error, list.concat('A'));
        },
        // Invoked after the deflection
        function(error, list, next) {
          next(error, list.concat('C'));
        },
        function(error, list, next) {
          expect(list).to.eql([ 'A', 'B', 'C' ]);
          next(error, list);
        }
      )(null, [], done);
    });
  });

  describe('Error Handling', function() {
    it('traps thrown errors', function(done) {
      var message = 'Thrown, not passed';
      deflect(
        function() {
          throw new Error(message);
        },
        function(error, next) {
          expect(error.message).to.equal(message);
          next();
        }
      )(done);
    });

    it('passes argument errors', function(done) {
      var message = 'Passed, not thrown';
      deflect(
        function(next) {
          next({ message: message });
        },
        function(error, next) {
          expect(error.message).to.equal(message);
          next();
        }
      )(done);
    });
  });
});
