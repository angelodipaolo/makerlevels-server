//  MakerLevels Server
//
//  Copyright © 2015 Angelo Di Paolo. All rights reserved.
//

var Bcrypt = require('bcrypt');
var Joi = require('joi');
var pre = require('./pre');

module.exports = [

  {
    method:  'POST',
    path:    '/session',
    config: {
      validate: {
        payload: Joi.object().keys({
          name: Joi.string(),
          password: Joi.string()
        })
      },
      pre: [pre.AssignDB],
    },
    handler: function (request, reply) {
      var db = request.pre.db;

      var name = request.payload.name
      var password = request.payload.password

      db.users.connectAndFindUsers({name: name}, function (error, users) {
        if (error) { return reply({error: error}).code(500); }

        var user = users[0];

        if (user) {
          Bcrypt.compare(password, user.password, function(err, passwordMatched) {
            if (err) { throw err; }
            if (!passwordMatched) {
              return reply().code(401);
            }

            console.log("user authenticated")
            request.auth.session.set(user);

            return reply({user: {_id: user._id, name: user.name, miiverse_name: user.miiverse_name}}).code(201)
          });
        }
      });
    }
  },

  {
    method:  'DELETE',
    path:    '/session',
    config: {
      auth: 'session'
    },
    handler: function (request, reply) {
      request.auth.session.clear();
      reply().code(204);
    }
  }

]
