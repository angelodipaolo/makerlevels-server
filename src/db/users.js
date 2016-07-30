//  MakerLevels Server
//
//  Copyright © 2015 Angelo Di Paolo. All rights reserved.
//

var assert = require('assert')
var ObjectID = require('mongodb').ObjectID;
var USERS_COLLECTION_NAME = "users"

module.exports = function UsersModel(options) {

  if (!(this instanceof UsersModel)) {
    return new UsersModel(arguments);
  }

  this.mongo = options.mongo
  this.connectAndGetUserForID = connectAndGetUserForID
  this.userForID = userForID
  this.connectAndFindUsers = connectAndFindUsers
  this.connectAndInsertUser = connectAndInsertUser
  this.insertUser = insertUser
  this.connectAndDeleteUser = connectAndDeleteUser
  this.deleteUser = deleteUser
  this.connectAndUpdateUser = connectAndUpdateUser
  this.updateUser = updateUser
  return this
}

var connectAndInsertUser = function (user, cb) {
  this.mongo.connect(function (err, db) {
    assert.equal(null, err);
    console.log("Connected to server");

    insertUser(user, db, function (err, result) {
      db.close();
      cb(err, result)
    });
  });
};

var insertUser = function (user, db, cb) {
  var collection = db.collection(USERS_COLLECTION_NAME);

  collection.insert([user], function (err, result) {
    assert.equal(err, null);
    console.log("Inserted user into the users collection");
    console.log(user);

    cb(err, result);
  });
};

// MARK: - Finding Users

var connectAndGetUserForID = function (userID, cb) {
  this.mongo.connect(function (err, db) {
    assert.equal(null, err);
    console.log("Connected to server");

    userForID(userID, db, function (err, user) {
      db.close();
      cb(err, user)
    });
  });
}

var userForID = function (userID, db, cb) {
  var collection = db.collection(USERS_COLLECTION_NAME);
 
  collection.findOne({_id: new ObjectID(userID)}, function (err, user) {
    assert.equal(err, null);
    // assert.equal(2, docs.length);
    console.log("Found the following user");
    console.dir(user);
    cb(err, user);
  })
}

var connectAndFindUsers = function (query, cb) {
  this.mongo.connect(function (err, db) {
    assert.equal(null, err);
    console.log("Connected to server");

    findUsers(query, db, function (err, users) {
      db.close();
      cb(err, users)
    });
  });
}

var connectAndFindAllUsers = function (cb) {
  this.mongo.connect(function (err, db) {
    assert.equal(null, err);
    console.log("Connected to server");

    findUsers({}, db, function (err, users) {
      db.close();
      cb(err, users)
    });
  });
}

var findUsers = function(query, db, cb) {
  var collection = db.collection(USERS_COLLECTION_NAME);

  collection.find(query).toArray(function (err, users) {
    assert.equal(err, null);
    console.log("Found the following users");
    console.dir(users);
    cb(err, users);
  });
}

// MARK: - Updating Users

var connectAndUpdateUser = function (query, user, cb) {
  this.mongo.connect(function (err, db) {
    assert.equal(null, err);
    console.log("Connected to server");

    updateUser(query, user, db, function (err, docs) {
      db.close();
      cb(err, docs)
    });
  });
}

var updateUser = function(query, user, db, cb) {
  var collection = db.collection(USERS_COLLECTION_NAME);
  
  collection.update(query, {$set: user}, function (err, result) {
    assert.equal(err, null);
    console.log("Updated user");
    cb(err, result);
  });  
}

// MARK: Deleting Users

var connectAndDeleteUser = function (query, cb) {
  this.mongo.connect(function (err, db) {
    assert.equal(null, err);

    deleteUser(query, db, function (err, result) {
      db.close();
      cb(err, result)
    });
  });
}

var deleteUser = function(query, db, cb) {
  var collection = db.collection(USERS_COLLECTION_NAME);

  collection.deleteOne(query, function (err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    console.log("Removed user");
    cb(err, result);
  });
}
