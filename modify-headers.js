var AWS = require('aws-sdk');
var _ = require('underscore');
var s3 = new AWS.S3({apiVersion: '2006-03-01'});

module.exports = function(bucket, key, headerTransformer, callback) {
   s3.headObject({Bucket: bucket, Key: key}, function(err, headers) {
      if (err) {
         return callback(err);
      }

      var newHeaders = headerTransformer(headers);
      newHeaders = removeDisallowedHeaders(newHeaders);

      var e = encodeURIComponent;
      var requestParams = {
         Bucket: bucket,
         Key: key + '.test',
         CopySource: e(bucket) + '/' + e(key),
         MetadataDirective: 'REPLACE',
         ACL: 'public-read'
      };

      _.extend(newHeaders, requestParams);

      s3.copyObject(newHeaders, function(err, response) {
         callback(err, response);
      });
   });
};

function removeDisallowedHeaders(headers) {
   delete headers.AcceptRanges;
   delete headers.ContentLength;
   delete headers.ETag;
   delete headers.LastModified;
   return headers;
}
