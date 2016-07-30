//  MakerLevels Server
//
//  Copyright © 2015 Angelo Di Paolo. All rights reserved.
//

var Joi = require('joi');
var AWS = require('aws-sdk');

var s3 = new AWS.S3({
  params: { Bucket: process.env.IMAGE_BUCKET }
});
var pre = require('./pre');

module.exports = [

  // MARK: Fetch Image

  {
    method: 'GET',
    path:'/images/{image_id}',
    config: {
      pre: [pre.AssignDB],
      validate: {
        query: {
          image_id: Joi.string()
        }
      }
    },
    handler: function (request, reply) {
      var db = request.pre.db;
      var image_id = request.params.image_id
      console.log('image_id ='+image_id)

      db.images.imageForId({image_id: image_id}, function (err, result) {
        var image = result[0];

        if (!image) {
          return reply({error: "Image ID '"+image_id+"' not found."}).code(404);
        }

        // request image from S3 and pipe the result to `reply`

        return reply().code(200);
      });
    }
  },

  // MARK: Insert Image

  {
    method: 'POST',
    path: '/image',
    config: {
      pre: [pre.AssignDB],
      payload: {
        output: 'stream',
        parse: true
      },
      validate: {
        payload: {
          'screenshot': Joi.any().required(),
          'field1': Joi.any(), // temporary
          'field2': Joi.any()  // temporary
        }
      }
    },
    handler: function (request, reply) {
      var db = request.pre.db;

      var screenshot = request.payload.screenshot;
      var filename = request.payload.screenshot.hapi.filename;
      var headers = request.payload.screenshot.hapi.headers;

      // upload file to S3
      var pendingUpload = s3.upload({
        Key: filename, // TODO change this to something unique; e.g. user-id + datestamp
        Body: screenshot
      });

      // fires on partial upload progress
      // pendingUpload.on('httpUploadProgress', console.log);

      // fires on upload error
      pendingUpload.on('error', reply);

      // initiate the transfer to amazon s3
      pendingUpload.send(function (err, data) {
        // console.log('data: ', data); // data.ETag, data.Location

        // store the location of the image in mongodb
        // db.images.insertImage({src: 'TODO'}, function (error, result) {
        //   if (error) { return reply(error).code(500); };
        //
        //   reply().code(201);
        // });

        reply(data);
      });
    }
  }

]
