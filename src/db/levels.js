//  MakerLevels Server
//
//  Copyright © 2015 Angelo Di Paolo. All rights reserved.
//

var assert = require('assert')
var LEVEL_COLLECTION_NAME = "levels"

module.exports = function LevelModel(params) {
  if (!(this instanceof LevelModel)) {
    return new LevelModel(arguments);
  }

  this.mongo = params.mongo

  // MARK: Insert Levels
  this.connectAndInsertLevel = connectAndInsertLevel
  this.insertLevel = insertLevel

  // MARK: Updating Levels
  this.connectAndUpdateLevel = connectAndUpdateLevel
  this.updateLevel = updateLevel

  // MARK: Finding Levels
  this.connectAndFindLevels = connectAndFindLevels
  this.connectAndFindAllLevels = connectAndFindAllLevels
  this.findLevels = findLevels

  // MARK: Deleting Levels
  this.connectAndDeleteLevel = connectAndDeleteLevel;
  this.deleteLevel = deleteLevel;

  return this
}

// MARK: - Insert Levels

var connectAndInsertLevel = function (level, cb) {
  
  this.mongo.connect(function (err, db) {
    assert.equal(null, err);
    console.log("Connected to server");

    insertLevel(level, db, function (err, result) {
      db.close();
      cb(err, result)
    });
  });
}


var insertLevel = function (level, db, cb) {

  var collection = db.collection(LEVEL_COLLECTION_NAME);

  collection.insert([level], function (err, result) {
    assert.equal(err, null);
    console.log("Inserted level into the level collection");
    console.log(level);

    cb(err, result);
  });
}

// MARK: - Updating Levels

var connectAndUpdateLevel = function (query, level, cb) {
  this.mongo.connect(function (err, db) {
    assert.equal(null, err);
    console.log("Connected to server");

    updateLevel(query, level, db, function (err, docs) {
      db.close();
      cb(err, docs)
    });
  });
}

var updateLevel = function (query, level, db, cb) {
  var collection = db.collection(LEVEL_COLLECTION_NAME);
  
  collection.updateOne(query, {$set: level}, function (err, result) {
    assert.equal(err, null);
    console.log("Updated level");
    cb(err, result);
  });  
}

// MARK: - Find Levels

var connectAndFindLevels = function (query, cb) {
    this.mongo.connect(function (err, db) {
      assert.equal(null, err);
      console.log("Connected to server");

      findLevels(query, db, function (err, docs) {
        db.close();
        cb(err, docs)
      });
    });
  }

var connectAndFindAllLevels = function (cb) {
  this.mongo.connect(function (err, db) {
    assert.equal(null, err);
    console.log("Connected to server");

    findLevels({}, db, function (err, docs) {
      db.close();
      cb(err, docs)
    });
  });
}

var findLevels = function(query, db, cb) {
  var collection = db.collection(LEVEL_COLLECTION_NAME);

  collection.find(query).toArray(function (err, docs) {
    assert.equal(err, null);
    // assert.equal(2, docs.length);
    console.log("Found the following levels");
    console.dir(docs);
    cb(err, docs);
  });
}

var connectAndDeleteLevel = function (query, cb) {
  this.mongo.connect(function (err, db) {
    assert.equal(null, err);
    console.log("Connected to server");

    deleteLevel(query, db, function (err, result) {
      db.close();
      cb(err, result)
    });
  });
}

var deleteLevel = function(query, db, cb) {
  var collection = db.collection(LEVEL_COLLECTION_NAME);

  collection.deleteOne(query, function (err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    console.log("Removed level");
    cb(err, result);
  });
}
