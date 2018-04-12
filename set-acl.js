var AWS = require('aws-sdk');
var s3 = new AWS.S3({apiVersion: '2006-03-01'});

module.exports = function(getAcl) {
   return function (bucket, key, callback) {
      putObjectAcl(bucket, key, getAcl(bucket, key),
      function(err) {
         if (err) {
            console.log("FAILURE:%s:%s", bucket, key);
         } else {
            console.log("SUCCESS:%s:%s", bucket, key);
         }
         callback(err);
      });
   }
}


function putObjectAcl(bucket, key, acl, callback) {
   acl = acl || {};
   acl.Bucket = bucket;
   acl.Key = key;
   s3.putObjectAcl(acl, function(err) {
      callback(err);
   });
}
