var AWS = require('aws-sdk');
var _ = require('underscore');
var Queue = require('notify-queue');

var s3 = new AWS.S3({apiVersion: '2006-03-01'});

var b = 'some-bucket';
var k = 'some-key';

s3.headObject({Bucket: b, Key: k}, function(err, headers) {
   if (err) {
      console.log(err, err.stack);
   }

   var newHeaders = fixHeaders(headers);
   var requestParams = {
      Bucket: b,
      Key: k + ".test",
      CopySource: b + '/' + k,
      MetadataDirective: 'REPLACE',
      ACL: 'public-read'
   }

   _.extend(newHeaders, requestParams);

   s3.copyObject(newHeaders, function(err, response) {
      if (err) {
         console.log(err, err.stack);
      } else {
         console.dir(response);
      }
   });
});

function fixHeaders(headers) {
   delete headers.Expires;
   delete headers['AcceptRanges'];
   delete headers['ContentLength'];
   delete headers['ETag'];
   delete headers['LastModified'];
   headers.CacheControl = 'max-age=31557600';
   return headers;
}
