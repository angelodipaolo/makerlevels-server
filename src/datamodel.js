//  MakerLevels Server
//
//  Copyright © 2015 Angelo Di Paolo. All rights reserved.
//

var MongoClient = require('mongodb').MongoClient
var LevelsModel = require('./db/levels');
var UsersModel = require('./db/users');
var MONGOLAB_URI = process.env.MONGOLAB_URI;

module.exports = function DataModel(params) {
  if (!(this instanceof DataModel)) {
    return new DataModel(arguments);
  }

  this.mongo = {
    url: MONGOLAB_URI,
    client: MongoClient,
    connect: function (callback) {
      this.client.connect(MONGOLAB_URI, function (error, db) {
        callback(error, db)
      });
    }
  };

  this.levels = new LevelsModel({mongo: this.mongo})
  this.users = new UsersModel({mongo: this.mongo})

  return this;
}
