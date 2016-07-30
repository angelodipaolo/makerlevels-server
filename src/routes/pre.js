//  MakerLevels Server
//
//  Copyright © 2015 Angelo Di Paolo. All rights reserved.
//

exports.AssignDB = {
  assign: "db",
  method: function (request, reply) {
    reply(request.server.app.db);
  }
};
