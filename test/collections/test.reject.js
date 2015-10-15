/* global it */
'use strict';

var domain = require('domain');

var assert = require('power-assert');
var parallel = require('mocha.parallel');

var async = global.async || require('../../');
var delay = require('../config').delay;
var util = require('../util');

function rejectIterator(order) {

  return function(num, callback) {

    var self = this;

    setTimeout(function() {

      if (self && self.round) {
        num = self.round(num);
      }
      order.push(num);
      callback(null, num % 2);
    }, num * delay);
  };
}

function rejectIteratorWithKey(order) {

  return function(num, key, callback) {

    var self = this;

    setTimeout(function() {

      if (self && self.round) {
        num = self.round(num);
      }
      order.push([num, key]);
      callback(null, num % 2);
    }, num * delay);
  };
}

parallel('#reject', function() {

  it('should execute iterator by collection of array', function(done) {

    var order = [];
    var collection = [1, 3, 2, 4];
    async.reject(collection, rejectIterator(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 2);
      assert.deepEqual(res, [2, 4]);
      assert.deepEqual(order, [1, 2, 3, 4]);
      done();
    });
  });

  it('should execute iterator by collection of array with passing index', function(done) {

    var order = [];
    var collection = [1, 3, 2, 4];
    async.reject(collection, rejectIteratorWithKey(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 2);
      assert.deepEqual(res, [2, 4]);
      assert.deepEqual(order, [
        [1, 0],
        [2, 2],
        [3, 1],
        [4, 3]
      ]);
      done();
    });
  });

  it('should execute iterator by collection of object', function(done) {

    var order = [];
    var collection = {
      a: 4,
      b: 3,
      c: 2
    };
    async.reject(collection, rejectIterator(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 2);
      assert.deepEqual(res, [4, 2]);
      assert.deepEqual(order, [2, 3, 4]);
      done();
    });
  });

  it('should execute iterator by collection of object with passing key', function(done) {

    var order = [];
    var collection = {
      a: 4,
      b: 3,
      c: 2
    };
    async.reject(collection, rejectIteratorWithKey(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 2);
      assert.deepEqual(res, [4, 2]);
      assert.deepEqual(order, [
        [2, 'c'],
        [3, 'b'],
        [4, 'a']
      ]);
      done();
    });
  });

  it('should execute iterator by collection of Map', function(done) {

    var order = [];
    var collection = new util.Map();
    collection.set('a', 4);
    collection.set('b', 3);
    collection.set('c', 2);
    async.reject(collection, rejectIterator(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 2);
      assert.deepEqual(res, [4, 2]);
      assert.deepEqual(order, [2, 3, 4]);
      done();
    });
  });

  it('should execute iterator by collection of Map with passing key', function(done) {

    var order = [];
    var collection = new util.Map();
    collection.set('a', 4);
    collection.set('b', 3);
    collection.set('c', 2);
    async.reject(collection, rejectIteratorWithKey(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 2);
      assert.deepEqual(res, [4, 2]);
      assert.deepEqual(order, [
        [2, 'c'],
        [3, 'b'],
        [4, 'a']
      ]);
      done();
    });
  });

  it('should execute iterator without binding', function(done) {

    var order = [];
    var collection = {
      a: 1.1,
      b: 3.5,
      c: 2.6
    };

    async.reject(collection, rejectIterator(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 0);
      assert.deepEqual(res, []);
      assert.deepEqual(order, [1.1, 2.6, 3.5]);
      done();
    }, Math);
  });

  it('should throw error if double callback', function(done) {

    var errorCallCount = 0;
    setTimeout(function() {
      assert.strictEqual(errorCallCount, 3);
      done();
    }, delay);

    domain.create()
      .on('error', util.errorChecker)
      .on('error', function() {
        errorCallCount++;
      })
      .run(function() {
        var collection = [1, 2, 3];
        var iterator = function(num, callback) {
          process.nextTick(callback);
          process.nextTick(callback);
        };
        async.reject(collection, iterator);
      });
  });

  it('should not throw error of double callback', function(done) {

    var collection = [
      'dir1',
      'dir2',
      'file1',
      'file2'
    ];
    var iterator = function(name, callback) {
      var result = name.charAt(0) === 'd';
      callback(null, result);
    };
    var called = false;
    async.reject(collection, iterator, function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(called, false);
      called = true;
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 2);
      assert.deepEqual(res, ['file1', 'file2']);
      setImmediate(done);
    });
  });

  it('should return response immediately if array is empty', function(done) {

    var order = [];
    var array = [];
    async.reject(array, rejectIterator(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 0);
      assert.deepEqual(res, []);
      assert.deepEqual(order, []);
      done();
    });
  });

  it('should return response immediately if object is empty', function(done) {

    var order = [];
    var object = {};
    async.reject(object, rejectIterator(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 0);
      assert.deepEqual(res, []);
      assert.deepEqual(order, []);
      done();
    });
  });

  it('should return response immediately if collection is function', function(done) {

    var order = [];
    async.reject(function() {}, rejectIterator(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 0);
      assert.deepEqual(res, []);
      assert.deepEqual(order, []);
      done();
    });
  });

  it('should return response immediately if collection is undefined', function(done) {

    var order = [];
    async.reject(undefined, rejectIterator(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 0);
      assert.deepEqual(res, []);
      assert.deepEqual(order, []);
      done();
    });
  });

  it('should return response immediately if collection is null', function(done) {

    var order = [];
    async.reject(null, rejectIterator(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 0);
      assert.deepEqual(res, []);
      assert.deepEqual(order, []);
      done();
    });
  });
});

describe.skip('#rejectSeries', function() {

  it('should execute iterator to series by collection of array', function(done) {

    var order = [];
    var collection = [1, 3, 2, 4];
    async.rejectSeries(collection, rejectIterator(order), function(res) {
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 2);
      assert.deepEqual(res, [2, 4]);
      assert.deepEqual(order, [1, 3, 2, 4]);
      done();
    });
  });

  it('should execute iterator to series by collection of array with passing index', function(done) {

    var order = [];
    var collection = [1, 3, 2, 4];
    async.rejectSeries(collection, rejectIteratorWithKey(order), function(res) {
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 2);
      assert.deepEqual(res, [2, 4]);
      assert.deepEqual(order, [
        [1, 0],
        [3, 1],
        [2, 2],
        [4, 3]
      ]);
      done();
    });
  });

  it('should execute iterator to series by collection of array and get 2rd callback argument', function(done) {

    var order = [];
    var collection = [1, 3, 2, 4];
    async.rejectSeries(collection, rejectIteratorWithError(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 2);
      assert.deepEqual(res, [2, 4]);
      assert.deepEqual(order, [1, 3, 2, 4]);
      done();
    });
  });

  it('should execute iterator to series by collection of array with passing index and get 2rd callback argument', function(done) {

    var order = [];
    var collection = [1, 3, 2, 4];
    async.rejectSeries(collection, rejectIteratorWithKeyAndError(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 2);
      assert.deepEqual(res, [2, 4]);
      assert.deepEqual(order, [
        [1, 0],
        [3, 1],
        [2, 2],
        [4, 3]
      ]);
      done();
    });
  });

  it('should execute iterator to series by collection of object', function(done) {

    var order = [];
    var collection = {
      a: 4,
      b: 3,
      c: 2
    };
    async.rejectSeries(collection, rejectIterator(order), function(res) {
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 2);
      assert.deepEqual(res, [4, 2]);
      assert.deepEqual(order, [4, 3, 2]);
      done();
    });
  });

  it('should execute iterator to series by collection of object with passing key', function(done) {

    var order = [];
    var collection = {
      a: 1,
      b: 3,
      c: 2
    };
    async.rejectSeries(collection, rejectIteratorWithKey(order), function(res) {
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 1);
      assert.deepEqual(res, [2]);
      assert.deepEqual(order, [
        [1, 'a'],
        [3, 'b'],
        [2, 'c']
      ]);
      done();
    });
  });

  it('should execute iterator to series by collection of object and get 2rd callback argument', function(done) {

    var order = [];
    var collection = {
      a: 1,
      b: 3,
      c: 2
    };
    async.rejectSeries(collection, rejectIteratorWithError(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 1);
      assert.deepEqual(res, [2]);
      assert.deepEqual(order, [1, 3, 2]);
      done();
    });
  });

  it('should execute iterator to series by collection of object with passing key and get 2rd callback argument', function(done) {

    var order = [];
    var collection = {
      a: 1,
      b: 3,
      c: 2
    };
    async.rejectSeries(collection, rejectIteratorWithKeyAndError(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 1);
      assert.deepEqual(res, [2]);
      assert.deepEqual(order, [
        [1, 'a'],
        [3, 'b'],
        [2, 'c']
      ]);
      done();
    });
  });

  it('should execute iterator to series by collection of Map', function(done) {

    var order = [];
    var collection = new util.Map();
    collection.set('a', 1);
    collection.set('b', 3);
    collection.set('c', 2);
    async.rejectSeries(collection, rejectIterator(order), function(res) {
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 1);
      assert.deepEqual(res, [2]);
      assert.deepEqual(order, [1, 3, 2]);
      done();
    });
  });

  it('should execute iterator to series by collection of Map with passing key', function(done) {

    var order = [];
    var collection = new util.Map();
    collection.set('a', 1);
    collection.set('b', 3);
    collection.set('c', 2);
    async.rejectSeries(collection, rejectIteratorWithKey(order), function(res) {
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 1);
      assert.deepEqual(res, [2]);
      assert.deepEqual(order, [
        [1, 'a'],
        [3, 'b'],
        [2, 'c']
      ]);
      done();
    });
  });

  it('should execute iterator to series by collection of Map and get 2rd callback argument', function(done) {

    var order = [];
    var collection = new util.Map();
    collection.set('a', 1);
    collection.set('b', 3);
    collection.set('c', 2);
    async.rejectSeries(collection, rejectIteratorWithError(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 1);
      assert.deepEqual(res, [2]);
      assert.deepEqual(order, [1, 3, 2]);
      done();
    });
  });

  it('should execute iterator to series by collection of Map with passing key and get 2rd callback argument', function(done) {

    var order = [];
    var collection = new util.Map();
    collection.set('a', 1);
    collection.set('b', 3);
    collection.set('c', 2);
    async.rejectSeries(collection, rejectIteratorWithKeyAndError(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 1);
      assert.deepEqual(res, [2]);
      assert.deepEqual(order, [
        [1, 'a'],
        [3, 'b'],
        [2, 'c']
      ]);
      done();
    });
  });

  it('should execute iterator to series with binding', function(done) {

    var order = [];
    var collection = {
      a: 1.1,
      b: 3.5,
      c: 2.6
    };

    async.rejectSeries(collection, rejectIterator(order), function(res) {
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 0);
      assert.deepEqual(res, []);
      assert.deepEqual(order, [1.1, 3.5, 2.6]);
      done();
    }, Math);
  });

  it('should execute on asynchronous', function(done) {

    var sync = true;
    var collection = {
      a: 1,
      b: 3,
      c: 2
    };
    var iterator = function(n, callback) {
      callback(false);
    };
    async.rejectSeries(collection, iterator, function(res) {
      assert.strictEqual(sync, false);
      assert.deepEqual(res, [1, 3, 2]);
      done();
    });
    sync = false;
  });

  it('should execute on asynchronous and get 2rd callback argument', function(done) {

    var sync = true;
    var collection = {
      a: 1,
      b: 3,
      c: 2
    };
    var iterator = function(n, callback) {
      callback(null, false);
    };
    async.rejectSeries(collection, iterator, function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(sync, false);
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.deepEqual(res, [1, 3, 2]);
      done();
    });
    sync = false;
  });

  it('should throw error if double callback', function(done) {

    var errorCallCount = 0;
    setTimeout(function() {
      assert.strictEqual(errorCallCount, 3);
      done();
    }, delay);

    domain.create()
      .on('error', util.errorChecker)
      .on('error', function() {
        errorCallCount++;
      })
      .run(function() {
        var collection = [1, 2, 3];
        var iterator = function(num, callback) {
          process.nextTick(callback);
          process.nextTick(callback);
        };
        async.rejectSeries(collection, iterator);
      });
  });

  it('should return response immediately if array is empty', function(done) {

    var order = [];
    var array = [];
    async.rejectSeries(array, rejectIterator(order), function(res) {
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 0);
      assert.deepEqual(res, []);
      assert.deepEqual(order, []);
      done();
    });
  });

  it('should return response immediately if object is empty', function(done) {

    var order = [];
    var object = {};
    async.rejectSeries(object, rejectIterator(order), function(res) {
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 0);
      assert.deepEqual(res, []);
      assert.deepEqual(order, []);
      done();
    });
  });

  it('should return response immediately if collection is function', function(done) {

    var order = [];
    async.rejectSeries(function() {}, rejectIterator(order), function(res) {
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 0);
      assert.deepEqual(res, []);
      assert.deepEqual(order, []);
      done();
    });
  });

  it('should return response immediately if collection is undefined', function(done) {

    var order = [];
    async.rejectSeries(undefined, rejectIterator(order), function(res) {
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 0);
      assert.deepEqual(res, []);
      assert.deepEqual(order, []);
      done();
    });
  });

  it('should return response immediately if collection is null', function(done) {

    var order = [];
    async.rejectSeries(null, rejectIterator(order), function(res) {
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 0);
      assert.deepEqual(res, []);
      assert.deepEqual(order, []);
      done();
    });
  });
});

describe.skip('#rejectLimit', function() {

  it('should execute iterator in limited by collection of array', function(done) {

    var order = [];
    var collection = [1, 5, 3, 2, 4];

    async.rejectLimit(collection, 2, rejectIterator(order), function(res) {
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 2);
      assert.deepEqual(res, [2, 4]);
      assert.deepEqual(order, [1, 3, 5, 2, 4]);
      done();
    });
  });

  it('should execute iterator in limited by collection of array with passing index', function(done) {

    var order = [];
    var collection = [1, 5, 3, 2, 4];

    async.rejectLimit(collection, 2, rejectIteratorWithKey(order), function(res) {
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 2);
      assert.deepEqual(res, [2, 4]);
      assert.deepEqual(order, [
        [1, 0],
        [3, 2],
        [5, 1],
        [2, 3],
        [4, 4]
      ]);
      done();
    });
  });

  it('should execute iterator in limited by collection of array and get 2rd callback argument', function(done) {

    var order = [];
    var collection = [1, 5, 3, 2, 4];

    async.rejectLimit(collection, 2, rejectIteratorWithError(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 2);
      assert.deepEqual(res, [2, 4]);
      assert.deepEqual(order, [1, 3, 5, 2, 4]);
      done();
    });
  });

  it('should execute iterator in limited by collection of array with passing index and get 2rd callback argument', function(done) {

    var order = [];
    var collection = [1, 5, 3, 2, 4];

    async.rejectLimit(collection, 2, rejectIteratorWithKeyAndError(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 2);
      assert.deepEqual(res, [2, 4]);
      assert.deepEqual(order, [
        [1, 0],
        [3, 2],
        [5, 1],
        [2, 3],
        [4, 4]
      ]);
      done();
    });
  });

  it('should execute iterator in limited by collection of object', function(done) {

    var order = [];
    var collection = {
      a: 1,
      b: 5,
      c: 3,
      d: 2,
      e: 4
    };
    async.rejectLimit(collection, 2, rejectIterator(order), function(res) {
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 2);
      assert.deepEqual(res, [2, 4]);
      assert.deepEqual(order, [1, 3, 5, 2, 4]);
      done();
    });
  });

  it('should execute iterator in limited by collection of object with passing key', function(done) {

    var order = [];
    var collection = {
      a: 1,
      b: 5,
      c: 3,
      d: 2,
      e: 4
    };
    async.rejectLimit(collection, 2, rejectIteratorWithKey(order), function(res) {
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 2);
      assert.deepEqual(res, [2, 4]);
      assert.deepEqual(order, [
        [1, 'a'],
        [3, 'c'],
        [5, 'b'],
        [2, 'd'],
        [4, 'e']
      ]);
      done();
    });
  });

  it('should execute iterator in limited by collection of object and get 2rd callback argument', function(done) {

    var order = [];
    var collection = {
      a: 1,
      b: 5,
      c: 3,
      d: 2,
      e: 4
    };
    async.rejectLimit(collection, 2, rejectIteratorWithError(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 2);
      assert.deepEqual(res, [2, 4]);
      assert.deepEqual(order, [1, 3, 5, 2, 4]);
      done();
    });
  });

  it('should execute iterator in limited by collection of object with passing index and get 2rd callback argument', function(done) {

    var order = [];
    var collection = {
      a: 1,
      b: 5,
      c: 3,
      d: 2,
      e: 4
    };
    async.rejectLimit(collection, 2, rejectIteratorWithKeyAndError(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 2);
      assert.deepEqual(res, [2, 4]);
      assert.deepEqual(order, [
        [1, 'a'],
        [3, 'c'],
        [5, 'b'],
        [2, 'd'],
        [4, 'e']
      ]);
      done();
    });
  });

  it('should execute iterator in limited by collection of Map', function(done) {

    var order = [];
    var collection = new util.Map();
    collection.set('a', 1);
    collection.set('b', 5);
    collection.set('c', 3);
    collection.set('d', 2);
    collection.set('e', 4);
    async.rejectLimit(collection, 2, rejectIterator(order), function(res) {
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 2);
      assert.deepEqual(res, [2, 4]);
      assert.deepEqual(order, [1, 3, 5, 2, 4]);
      done();
    });
  });

  it('should execute iterator in limited by collection of Map with passing key', function(done) {

    var order = [];
    var collection = new util.Map();
    collection.set('a', 1);
    collection.set('b', 5);
    collection.set('c', 3);
    collection.set('d', 2);
    collection.set('e', 4);
    async.rejectLimit(collection, 2, rejectIteratorWithKey(order), function(res) {
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 2);
      assert.deepEqual(res, [2, 4]);
      assert.deepEqual(order, [
        [1, 'a'],
        [3, 'c'],
        [5, 'b'],
        [2, 'd'],
        [4, 'e']
      ]);
      done();
    });
  });

  it('should execute iterator in limited by collection of Map and get 2rd callback argument', function(done) {

    var order = [];
    var collection = new util.Map();
    collection.set('a', 1);
    collection.set('b', 5);
    collection.set('c', 3);
    collection.set('d', 2);
    collection.set('e', 4);
    async.rejectLimit(collection, 2, rejectIteratorWithError(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 2);
      assert.deepEqual(res, [2, 4]);
      assert.deepEqual(order, [1, 3, 5, 2, 4]);
      done();
    });
  });

  it('should execute iterator in limited by collection of Map with passing index and get 2rd callback argument', function(done) {

    var order = [];
    var collection = new util.Map();
    collection.set('a', 1);
    collection.set('b', 5);
    collection.set('c', 3);
    collection.set('d', 2);
    collection.set('e', 4);
    async.rejectLimit(collection, 2, rejectIteratorWithKeyAndError(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 2);
      assert.deepEqual(res, [2, 4]);
      assert.deepEqual(order, [
        [1, 'a'],
        [3, 'c'],
        [5, 'b'],
        [2, 'd'],
        [4, 'e']
      ]);
      done();
    });
  });

  it('should execute iterator in limited without binding', function(done) {

    var order = [];
    var collection = {
      a: 1.1,
      b: 3.5,
      c: 2.7
    };
    async.rejectLimit(collection, 2, rejectIterator(order), function(res) {
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 0);
      assert.deepEqual(res, []);
      assert.deepEqual(order, [1.1, 3.5, 2.7]);
      done();
    }, Math);
  });

  it('should execute like parallel if limit is Infinity', function(done) {

    var order = [];
    var collection = [1, 3, 4, 2, 3, 1];

    async.rejectLimit(collection, Infinity, rejectIterator(order), function(res) {
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 2);
      assert.deepEqual(res, [4, 2]);
      assert.deepEqual(order, [1, 1, 2, 3, 3, 4]);
      done();
    });
  });

  it('should execute on asynchronous', function(done) {

    var sync = true;
    var collection = [1, 3, 4, 2, 3, 1];
    var iterator = function(n, callback) {
      callback(n % 2);
    };
    async.rejectLimit(collection, 2, iterator, function(res) {
      assert.strictEqual(sync, false);
      assert.deepEqual(res, [4, 2]);
      done();
    });
    sync = false;
  });

  it('should execute on asynchronous and get 2rd callback argument', function(done) {

    var sync = true;
    var collection = [1, 3, 4, 2, 3, 1];
    var iterator = function(n, callback) {
      callback(null, n % 2);
    };
    async.rejectLimit(collection, 2, iterator, function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(sync, false);
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.deepEqual(res, [4, 2]);
      done();
    });
    sync = false;
  });

  it('should return response immediately if array is empty', function(done) {

    var order = [];
    var array = [];
    async.rejectLimit(array, 2, rejectIterator(order), function(res) {
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 0);
      assert.deepEqual(res, []);
      assert.deepEqual(order, []);
      done();
    });
  });

  it('should return response immediately if object is empty', function(done) {

    var order = [];
    var object = {};
    async.rejectLimit(object, 2, rejectIterator(order), function(res) {
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 0);
      assert.deepEqual(res, []);
      assert.deepEqual(order, []);
      done();
    });
  });

  it('should return response immediately if collection is function', function(done) {

    var order = [];
    async.rejectLimit(function() {}, 2, rejectIterator(order), function(res) {
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 0);
      assert.deepEqual(res, []);
      assert.deepEqual(order, []);
      done();
    });
  });

  it('should return response immediately if collection is undefined', function(done) {

    var order = [];
    async.rejectLimit(undefined, 2, rejectIterator(order), function(res) {
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 0);
      assert.deepEqual(res, []);
      assert.deepEqual(order, []);
      done();
    });
  });

  it('should return response immediately if limit is zero', function(done) {

    var order = [];
    var collection = [1, 3, 2];
    async.rejectLimit(collection, 0, rejectIterator(order), function(res) {
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 0);
      assert.deepEqual(res, []);
      assert.deepEqual(order, []);
      done();
    });
  });

  it('should return response immediately if limit is undefined', function(done) {

    var order = [];
    var collection = [1, 3, 2];
    async.rejectLimit(collection, undefined, rejectIterator(order), function(res) {
      assert.strictEqual(Object.prototype.toString.call(res), '[object Array]');
      assert.strictEqual(res.length, 0);
      assert.deepEqual(res, []);
      assert.deepEqual(order, []);
      done();
    });
  });

  it('should throw error if double callback', function(done) {

    var errorCallCount = 0;
    setTimeout(function() {
      assert.strictEqual(errorCallCount, 3);
      done();
    }, delay);

    domain.create()
      .on('error', util.errorChecker)
      .on('error', function() {
        errorCallCount++;
      })
      .run(function() {
        var collection = [1, 2, 3];
        var iterator = function(num, callback) {
          process.nextTick(callback);
          process.nextTick(callback);
        };
        async.rejectLimit(collection, 2, iterator);
      });
  });

});
