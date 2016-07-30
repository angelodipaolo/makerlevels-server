//  MakerLevels Server
//
//  Copyright © 2015 Angelo Di Paolo. All rights reserved.
//

const Code = require('code');
const Lab = require('lab');
const AWS = require('aws-sdk');

const expect = Code.expect;
const lab = exports.lab = Lab.script();
const s3 = new AWS.S3();

lab.experiment('server', () => {
  const server = require('../index');

  lab.test('image upload', (done) => {

    var multipartPayload =
            '--AaB03x\r\n' +
            'content-disposition: form-data; name="field1"\r\n' +
            '\r\n' +
            'Joe Blow\r\nalmost tricked you!\r\n' +
            '--AaB03x\r\n' +
            'content-disposition: form-data; name="field1"\r\n' +
            '\r\n' +
            'Repeated name segment\r\n' +
            '--AaB03x\r\n' +
            'content-disposition: form-data; name="screenshot"; filename="test-file.txt"\r\n' +
            'Content-Type: text/plain\r\n' +
            '\r\n' +
            '... contents of file1.txt ...\r\r\n' +
            '--AaB03x--\r\n';

    server.inject({ method: 'POST', url: '/image', payload: multipartPayload, headers: { 'content-type': 'multipart/form-data; boundary=AaB03x' } }, (res) => {

      // TODO update to use an API endpoint that deletes an image instead; shouldn't leak implementation details like this
      s3.deleteObject({
        Key: 'test-file.txt',
        Bucket: process.env.IMAGE_BUCKET
      }, function(err, data) {
        expect(err).to.not.exist();
        expect(data).to.exist();

        done();
      });
    });
  });
});
