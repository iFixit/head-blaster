var AWS = require('aws-sdk');
var _ = require('underscore');
var s3 = new AWS.S3({apiVersion: '2006-03-01'});

module.exports = function(bucket, key, headerTransformer, callback) {
   s3.headObject({Bucket: bucket, Key: key}, function(err, headers) {
      if (err) {
         return callback(err);
      }

      var newHeaders = _.clone(headers);
      newHeaders = headerTransformer(newHeaders);

      var e = encodeURIComponent;
      var requestParams = {
         Bucket: bucket,
         Key: key,
         CopySource: e(bucket) + '/' + e(key),
         MetadataDirective: 'REPLACE',
         ACL: 'public-read'
      };

      requestParams = _.extend({}, newHeaders, requestParams);
      removeDisallowedHeaders(requestParams);

      s3.copyObject(requestParams, function(err, response) {
         callback(err, response, headers, newHeaders);
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
