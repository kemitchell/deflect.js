/* jshint node: true, mocha: true */
var expect = require('chai').expect;

var deflect = require('..');

var concat = function(value) {
  return function(err, list, next) {
    next(err, list.concat(value));
  };
};

describe('Deflect', function() {
  it('exports only a function', function() {
    expect(deflect).to.be.a('function');
    expect(Object.keys(deflect)).to.be.empty();
  });

  it('creates functions that take callbacks', function() {
    expect(deflect([function() {}]))
      .to.throw(Error, 'No callback provided');
  });

  it('passes final values to callback', function(done) {
    var string = 'some text';

    deflect([
      function(error, next) {
        next(null, string);
      },
      function(error, value, next) {
        next();
      },
      function(error, value, next) {
        expect(value).to.eql(string);
        next();
      }
    ])(null, done);
  });

  it('throws when a callback is called more than once', function(done) {
    expect(function() {
      deflect([function(next) {
        next();
        next();
      }])(done);
    })
      .to.throw(Error, 'Callback called multiple times');
  });

  describe('next([function(){}])', function() {
    it('unshifts a function onto the stack', function(done) {
      deflect([
        function(error, list, next) {
          next([concat('A'), concat('B')], error, list);
        },
        function(error, list, next) {
          expect(list).to.eql(['A', 'B']);
          next();
        }
      ])(null, [], done);
    });

    it('recycles previous arguments', function(done) {
      deflect([
        function(error, next) {
          next(error, []);
        },
        function(error, list, next) {
          next([concat('A'), concat('B')]);
        },
        function(error, list, next) {
          expect(list).to.eql(['A', 'B']);
          next();
        }
      ])(null, done);
    });

    it('does not permanently mutate the stack function', function(done) {
      var stack = deflect([
        function(error, list, next) {
          next([concat('A'), concat('B')]);
        },
        function(error, list, next) {
          expect(list).to.eql(['A', 'B']);
          next();
        }
      ]);

      stack(null, [], function() {
        stack(null, [], done);
      });
    });

    it('works just before the final callback', function(done) {
      deflect([
        function(error, list, next) {
          next([concat('A'), concat('B')]);
        }
      ])(null, [], function(error, list) {
        expect(list).to.eql(['A', 'B']);
        done();
      });
    });

    it('resumes with the next function on the stack', function(done) {
      deflect([
        function(error, list, next) {
          next([concat('A'), concat('B')]);
        },
        concat('C'),
        function(error, list, next) {
          next(error, list.concat('D'));
        },
        function(error, list, next) {
          expect(list).to.eql(['A', 'B', 'C', 'D']);
          next();
        }
      ])(null, [], done);
    });
  });

  describe('next(function(){})', function() {
    it('unshifts a function onto the stack', function(done) {
      deflect([
        function(error, list, next) {
          next(concat('A'), error, list);
        },
        function(error, list, next) {
          expect(list).to.eql(['A']);
          next();
        }
      ])(null, [], done);
    });

    it('recycles previous arguments', function(done) {
      deflect([
        function(error, next) {
          next(error, []);
        },
        function(error, list, next) {
          next(concat('A'));
        },
        function(error, list, next) {
          expect(list).to.eql(['A']);
          next();
        }
      ])(null, done);
    });

    it('does not permanently mutate the stack function', function(done) {
      var stack = deflect([
        function(error, list, next) {
          next(concat('A'));
        },
        function(error, list, next) {
          expect(list).to.eql(['A']);
          next();
        }
      ]);

      stack(null, [], function() {
        stack(null, [], done);
      });
    });

    it('works just before the final callback', function(done) {
      deflect([
        function(error, list, next) {
          next(concat('A'));
        }
      ])(null, [], function(error, list) {
        expect(list).to.eql(['A']);
        done();
      });
    });

    it('resumes with the next function on the stack', function(done) {
      deflect([
        function(error, list, next) {
          next(concat('A'));
        },
        concat('B'),
        function(error, list, next) {
          next(error, list.concat('C'));
        },
        function(error, list, next) {
          expect(list).to.eql(['A', 'B', 'C']);
          next();
        }
      ])(null, [], done);
    });
  });

  describe('next(function(){}, ...)', function() {
    it('unshifts a function onto the stack', function(done) {
      deflect([
        function(error, list, next) {
          next(concat('B'), error, list.concat('A'));
        },
        function(error, list, next) {
          expect(list).to.eql(['A', 'B']);
          next();
        }
      ])(null, [], done);
    });

    it('does not permanently mutate the stack function', function(done) {
      var stack = deflect([
        function(error, list, next) {
          next(concat('B'), error, list.concat('A'));
        },
        function(error, list, next) {
          expect(list).to.eql(['A', 'B']);
          next();
        }
      ]);

      stack(null, [], function() {
        stack(null, [], done);
      });
    });

    it('works just before the final callback', function(done) {
      deflect([
        function(error, list, next) {
          next(concat('A'), error, list);
        }
      ])(null, [], function(error, list) {
        expect(list).to.eql(['A']);
        done();
      });
    });

    it('resumes with the next function on the stack', function(done) {
      deflect([
        function(error, list, next) {
          next(concat('B'), error, list.concat('A'));
        },
        function(error, list, next) {
          next(error, list.concat('C'));
        },
        function(error, list, next) {
          expect(list).to.eql(['A', 'B', 'C']);
          next();
        }
      ])(null, [], done);
    });
  });

  describe('next([function(){}], ...)', function() {
    it('unshifts multiple functions onto the stack', function(done) {
      deflect([
        function(error, list, next) {
          next([concat('B'), concat('C')], error, list.concat('A'));
        },
        function(error, list, next) {
          expect(list).to.eql(['A', 'B', 'C']);
          next();
        }
      ])(null, [], done);
    });

    it('does not permanently mutate the stack function', function(done) {
      var stack = deflect([
        function(error, list, next) {
          next([concat('B'), concat('C')], error, list.concat('A'));
        },
        function(error, list, next) {
          expect(list).to.eql(['A', 'B', 'C']);
          next();
        }
      ]);

      stack(null, [], function() {
        stack(null, [], done);
      });
    });

    it('works just before the final callback', function(done) {
      deflect([
        function(error, list, next) {
          next([concat('A'), concat('B')], error, list);
        }
      ])(null, [], function(error, list) {
        expect(list).to.eql(['A', 'B']);
        done();
      });
    });

    it('resumes with the next function on the stack', function(done) {
      deflect([
        function(error, list, next) {
          next([concat('B'), concat('C')], error, list.concat('A'));
        },
        function(error, list, next) {
          next(error, list.concat('D'));
        },
        function(error, list, next) {
          expect(list).to.eql(['A', 'B', 'C', 'D']);
          next();
        }
      ])(null, [], done);
    });
  });

  describe('next()', function() {
    it('recycles arguments for the next function', function(done) {
      var value = 'arbitrary';

      deflect([
        function(error, x, next) {
          next();
        },
        function(error, x, next) {
          expect(x).to.equal(value);
          next();
        }
      ])(null, value, done);
    });
  });

  describe('Error Handling', function() {
    it('traps thrown errors', function(done) {
      var message = 'Thrown, not passed';

      deflect([
        function() {
          throw new Error(message);
        },
        function(error, next) {
          expect(error.message).to.equal(message);
          next(null);
        }
      ])(done);
    });

    it('traps other errors', function(done) {
      var passThrough = function(error, next) {
        next();
      };

      deflect([
        passThrough,
        function(error, next) {
          next(null, notDefined); /* jshint ignore: line */
        },
        passThrough
      ])(null, function(error) {
        expect(error).to.be.an.instanceof(ReferenceError);
        done();
      });
    });

    it('passes argument errors', function(done) {
      var message = 'Passed, not thrown';

      deflect([
        function(next) {
          next({message: message});
        },
        function(error, next) {
          expect(error.message).to.equal(message);
          next(null);
        }
      ])(done);
    });
  });
});
