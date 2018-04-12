var AWS = require('aws-sdk');
var s3 = new AWS.S3({
   apiVersion: '2006-03-01',
   signatureVersion: 'v4',
   region: 'us-east-1',
});
var argv = require('yargs').argv;
var completed = 0;

if (!argv.buckets && !argv["all-buckets"]) {
   console.error([
    "Usage: node list-objects.js (--buckets=bucket1,bucket2|--all-buckets) > all-objects.list",
    "   --buckets : comma-delimited list of s3 bucket names to list the ",
    "               contents of.",
    "   --all-buckets : lists all objects in all buckets",
    "",
    "Lists the contents of s3 buckets in a format compatable ",
    "with head-blaster.js.",
    ''
    ].join('\n'));
   process.exit(-1);
}

forEachBucket(function(bucketName, next) {
   log("\rListing from bucket: " + bucketName + "\n");
   var total = 0;
   s3.listObjects({Bucket:bucketName}).eachPage(
   function(err, data) {
      if (err) {
         console.dir(err);
         return;
      }
      setTimeout(function() {
         if (!data) {
            process.stdout.write("TOTAL BYTES:" + bucketName + ":" + total + "\n");
            return next();
         }
         data.Contents.forEach(function(object) {
            total += object.Size;
            process.stdout.write(bucketName + ":" + object.Size + ":" + object.Key + "\n");
         });
         completed += data.Contents.length;
         log("\rListed " + completed + " objects.");
      }, 0);
   });
});

function forEachBucket(callback) {
   var buckets = [];
   if (argv.buckets) {
      buckets = argv.buckets.split(",");
      popBucket();
   } else {
      s3.listBuckets().eachPage(
      function(err, data) {
         if (err) {
            console.error(err);
            process.exit(1);
         }
         if (data) {
            newBuckets = data.Buckets.map((bucket) => bucket.Name);
            buckets = buckets.concat(newBuckets);
            log("Got " + data.Buckets.length + " buckets\n");
         } else {
            popBucket();
         }
      });
   }

   function popBucket() {
      var bucket = buckets.shift();
      if (!bucket) return;
      callback(bucket, popBucket);
   }
}

function log(str) {
   process.stderr.write(str);
}
