//  MakerLevels Server
//
//  Copyright © 2015 Angelo Di Paolo. All rights reserved.
//

module.exports = []
  .concat(require('./routes/levels'))
  .concat(require('./routes/users'))
  .concat(require('./routes/session'))
  .concat(require('./routes/image'))
  ;
