//  MakerLevels Server
//
//  Copyright © 2015 Angelo Di Paolo. All rights reserved.
//

// load variables from `/.env` into `process.env`
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load();
}

var Hapi   = require('hapi');
var DataModel = require('./src/datamodel');
var AuthCookie = require('hapi-auth-cookie');

var routes = require('./src/routes');

// MARK: - Server Configuration

var server = new Hapi.Server(); // Create a server object
server.connection({ port: process.env.PORT }); // Add connection. Here we added the port number

// MARK: - Model

var model = new DataModel()
server.app.db = model

// MARK: - Auth

server.register(AuthCookie, function (err) {
  if (err) {
    console.error('Failed to load Hapi Auth Cookie.');
    throw err;
  }

  server.auth.strategy('session', 'cookie', {
    password:   process.env.COOKIE_SECRET,
    cookie:     "sid",
    isSecure:   false, // TODO: set to true for prodution
    redirectTo: false
  });
});

// MARK: - Routing
routes.forEach(function(r) {
  server.route(r);
});

// MARK: - Server Start

server.start(function () {
  console.log('Server running at:', server.info.uri);
});

module.exports = server;
