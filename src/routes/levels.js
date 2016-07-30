//  MakerLevels Server
//
//  Copyright © 2015 Angelo Di Paolo. All rights reserved.
//

var Joi = require('joi');
var pre = require('./pre');
var ObjectID = require('mongodb').ObjectID;
var AWS = require('aws-sdk')
var s3 = new AWS.S3();

module.exports = [

  // MARK: Fetch Level

  {
    method: 'GET',
    path:'/levels/{id}',
    config: {
      pre: [pre.AssignDB]
    },
    handler: function (request, reply) {
      var db = request.pre.db;
      var levelID = request.params.id
      var levelObjectID = new ObjectID(levelID)
      console.log('fetch levelID = '+levelID)

      db.levels.connectAndFindLevels({_id: levelObjectID}, function (err, result) {
        var level = result[0];

        if (!level) {
          return reply({error: "Level ID '"+levelID+"' not found."}).code(500); 
        }

        return reply({level: level})
      });
    }
  },

  // MARK: Fetch Course

  {
    method: 'GET',
    path:'/courses/{id}',
    config: {
      pre: [pre.AssignDB],
      validate: {
        query: {
          course_id: Joi.string()
        }
      }
    },
    handler: function (request, reply) {
      var db = request.pre.db;
      var course_id = request.params.id
      console.log('fetch course_id = '+course_id)

      db.levels.connectAndFindLevels({course_id: course_id}, function (err, result) {
        var level = result[0];

        if (!level) {
          return reply({error: "Course ID '"+courseID+"' not found."}).code(500);
        }

        return reply({level: level})
      });
    }
  },

  // MARK: Fetch All Levels

  {
    method: 'GET',
    path:'/levels',
    config: {
      pre: [pre.AssignDB],
      validate: {
        query: {
          pageSize: Joi.number(),
          page: Joi.number()
        }
      }
    },
    handler: handleLevelIndex
  },


  // MARK: Fetch All of a User's Levels

  {
    method: 'GET',
    path:'/users/{user_id}/levels',
    config: {
      pre: [pre.AssignDB],
      auth: 'session'
    },
    handler: function (request, reply) {
      var userID = request.params.user_id;

      if (userID === 'me' && request.auth.credentials._id) {
        userID = request.auth.credentials._id;
      }

      handleLevelIndex(request, reply, {user_id: userID})
    }
  },

  // MARK: Insert Level

  {
    method: 'POST',
    path:'/levels',
    config: {
      pre: [pre.AssignDB],
      auth: 'session',
      validate: {
        payload: {
          level: Joi.any().required(),
          screenshot: Joi.any()
        }
      }
    },
    handler: function (request, reply) {
      var model = request.pre.db;
      var level = JSON.parse(request.payload.level);
      var screenshot = request.payload.screenshot;
      var user = request.auth.credentials._id;

      var commitLevel = (db, cb) => {
        console.log('insert level ='+level);
        model.levels.insertLevel(level, db, cb);
      };

      var replyWith = (error, status) => {
        if (error) {
          console.log("insert level error ="+error)
          reply(error).code(500); 
        } else {
          reply().code(204);
        }
      };

      var uploadToS3 = (screenshot, cb) => {
          // upload file to S3
          var pendingUpload = s3.upload({
            Bucket: "makerlevels-screenshots", // TODO move to configuration somewhere
            Key: level.course_id, // TODO change this to something unique; e.g. user-id + datestamp
            Body: screenshot
          });

          // if/when the upload errors
          pendingUpload.on('error', cb);

          // initiate the transfer to amazon s3
          pendingUpload.send(cb);
      };

      model.mongo.connect(function (mongoError, db) {
        model.levels.findLevels({course_id: level.course_id}, db, function (err, levels) {
          var existingLevel = levels[0];

          if (existingLevel) {
              db.close();

              replyWith({
                error: "Failed to insert level", 
                message: "Level already exists or cannot be updated because it does not belong to this user."
              })
          } else {
            // when an image has been uploaded
            if (screenshot) {

              uploadToS3(screenshot, (err, data) => {
                if (err) { replyWith(err); }

                level.screenshot_url = data.Location;
                
                commitLevel(db, () => {
                  db.close()
                  replyWith()
                });
              });
            } else {
              commitLevel(db, () => {
                  db.close()
                  replyWith()
              });
            }
          }
        
        });
      });

    }
  },

  // MARK: Update Level

  {
    method:  'PUT',
    path:    '/levels/{id}',
    config: {
      auth: 'session',
      pre: [pre.AssignDB]
    },
    handler: function (request, reply) {
      var updatedLevel = request.payload.level;
      var model = request.pre.db;
      var levelID = request.params.id
      var levelObjectID = new ObjectID(levelID)

      model.mongo.connect(function (mongoError, db) {
        if (mongoError) { return reply(error).code(500); };

        // find the existing level to compare user_id        
        model.levels.findLevels({_id: levelObjectID}, db, function (findError, result) {
          if (findError) {
            db.close();
            return reply(findError).code(500); 
          };

          var level = result[0];

          if (!level) {
            db.close();
            return reply({error: "Level ID '"+levelID+"' not found."}).code(500); 
          }

          if (level.user_id !== request.auth.credentials._id) {
            db.close();
            return reply({error: "User does not have permission to modify the provided level."}).code(401); 
          }

          model.levels.updateLevel({_id: levelObjectID}, updatedLevel, db, function (updateError, result) {
            db.close();

            if (updateError) { return reply(updateError).code(500); };

            return reply().code(204);
          });
        });
      });
    }
  },

  // MARK: Delete Level

  {
    method: 'DELETE',
    path:'/levels/{id}',
    config: {
      pre: [pre.AssignDB],
      validate: {
        query: {
          course_id: Joi.string()
        }
      }
    },
    handler: function (request, reply) {
      var db = request.pre.db;
      var levelID = request.params.id
      console.log("delete level "+levelID)
      
      db.levels.connectAndDeleteLevel({_id: new ObjectID(levelID)}, function (error, result) {
        if (error) { return reply(error).code(500); };

        return reply().code(204)
      });
    }
  },

];

function paginatedResults(pageInfo, levels) {
  if (levels.length > pageInfo.pageLength)  {
    var position = (pageInfo.page * pageInfo.size) - 1
    levels = levels.slice(position, position+pageInfo.size);
  }

  return levels;
}

function pageInfoFromRequest(request) {
  return {
    size: request.query.pageSize || 25,
    page: request.query.page || 1
  }
}

function paginationJSON(pageInfo, resultCount) {
  var pages = 1

  var pages = resultCount / pageInfo.size
  var intValue = parseInt(pages, 10)

  if (pages !== intValue) {
    pages = intValue + 1
  }

  return {
    page: pageInfo.page,
    pages: pages,
    size: pageInfo.size
  }
}

function handleLevelIndex(request, reply, query) {
  var db = request.pre.db;
  var pageInfo = pageInfoFromRequest(request)

  if (!query) {
    query = {}
  }

  db.levels.connectAndFindLevels(query, function (err, levels) {
    if (err) { reply(err).code(500) };

    var pagination = paginationJSON(pageInfo, levels.length)
    console.log(pagination)

    if (pagination.page > pagination.pages) {
      return reply({error: "Page " + pagination.page + " not found"}).code(404)
    }

    return reply({
      levels: paginatedResults(pagination, levels),
      pagination: pagination
    })
  });
}
