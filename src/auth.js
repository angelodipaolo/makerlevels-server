//  MakerLevels Server
//
//  Copyright © 2015 Angelo Di Paolo. All rights reserved.
//

var Bcrypt = require('bcrypt');
var Basic = require('hapi-auth-basic');

var userModel;

var validate = function (request, username, password, callback) {

  userModel.connectAndFindUsers({name: username}, function (error, users) {
    if (error) {
      return callback(null, false);
    }

    var user = users[0]

    if (!user) {
      return callback(null, false);
    }

    Bcrypt.compare(password, user.password, function (err, isValid) {
      callback(err, isValid, { id: user.id, name: user.name });
    });
  });
};

exports.registerWithServer = function (server, options, callback) {
  userModel = options.userModel
  server.register(Basic, function (error) {
    server.auth.strategy('simple', 'basic', { validateFunc: validate });

    if (error) {
      console.log("auth error: error")
    }

    callback(error);
  });
}
