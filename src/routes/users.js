//  MakerLevels Server
//
//  Copyright © 2015 Angelo Di Paolo. All rights reserved.
//

var Bcrypt = require('bcrypt');
var Joi = require('joi');
var pre = require('./pre');
var ObjectID = require('mongodb').ObjectID;

module.exports = [

  // MARK: Create User

  {
    method:  'POST',
    path:    '/users',
    config: {
      pre: [pre.AssignDB],
      validate: {
        payload: {
          name: Joi.string(),
          password: Joi.string(),
          miiverse_name: Joi.string()
        }
      }
    },
    handler: function (request, reply) {
      var db = request.pre.db;

      Bcrypt.hash(request.payload.password, 8, function(err, hash) {
        if (err) { throw err; }

        request.payload.password = hash;

        var newUser = request.payload

        db.users.connectAndInsertUser(newUser, function (error, result) {
          if (error) { return reply({error: error.message}).code(500); }

          var user = result.ops[0]

          reply({user: {name: user.name, _id: user._id}})
            .code(201)
        });

      });
    }
  },

  // MARK: Update User

  {
    method:  'PUT',
    path:    '/users/{id}',
    config: {
      pre: [pre.AssignDB]
    },
    handler: function (request, reply) {
      var db = request.pre.db;
      var userID = request.params.id

      Bcrypt.hash(request.payload.password, 8, function(err, hash) {
        if (err) { throw err; }

        request.payload.password = hash;

        var updatedUser = request.payload

        db.users.connectAndUpdateUser({_id: new ObjectID(userID)}, updatedUser, function (error, result) {
          if (error) { return reply({error: error.message}).code(500); }

          return reply().code(204);
        });

      });
    }
  },

  // MARK: View User

  {
    method: "GET",
    path:   "/users/{id}",
    config: {
    pre: [pre.AssignDB],
      validate: {
        params: {
          id: Joi.string()
        }
      }
    },
    handler: function (request, reply) {
      var db = request.pre.db;

      db.users.connectAndGetUserForID(request.params.id, function (error, user) {
        if (error) { return reply({error: error}); }
      
        reply({user: user});

      });
    }
  },

  {
    method: "GET",
    path:   "/users",
    config: {
    pre: [pre.AssignDB],
      validate: {
        params: {
          id: Joi.string()
        }
      }
    },
    handler: function (request, reply) {
      var db = request.pre.db;
      var userID = request.params.id

      db.users.connectAndFindUsers({_id: new ObjectID(userID)}, function (error, user) {
        if (error) { return reply({error: error}); }

        reply({
          user: user[0]
        });

      });
    }
  },

  // MARK: View Authenticated User

  {
    method: "GET",
    path:   "/users/me",
    config: {
      pre: [pre.AssignDB],
      auth: 'session'
    },
    handler: function (request, reply) {
      reply({
        user: request.auth.credentials
      });
    }
  },


  {
    method: 'DELETE',
    path:'/users/{id}',
    config: {
      pre: [pre.AssignDB],
      validate: {
        query: {
          id: Joi.string()
        }
      }
    },
    handler: function (request, reply) {
      var db = request.pre.db;
      var userID = request.params.id
      console.log("delete user "+userID)
      
      db.users.connectAndDeleteUser({_id: new ObjectID(userID)}, function (error, result) {
        if (error) { return reply(error).code(500); };

        return reply().code(204)
      });
    }
  },

]
