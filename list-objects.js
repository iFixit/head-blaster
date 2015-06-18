var AWS = require('aws-sdk');
var s3 = new AWS.S3({apiVersion: '2006-03-01'});
var argv = require('yargs').argv;
var completed = 0;

if (!argv.buckets) {
   console.error([
    "Usage: node list-objects.js --buckets=bucket1,bucket2 > all-objects.list",
    "   --buckets : comma-delimited list of s3 bucket names to list the ",
    "               contents of.",
    "",
    "Lists the contents of s3 buckets in a format compatable ",
    "with head-blaster.js.",
    ''
    ].join('\n'));
   process.exit(-1);
}

var buckets = argv.buckets.split(",")
buckets.forEach(function(bucketName) {
   s3.listObjects({Bucket:bucketName}).eachPage(
   function(err, data) {
      if (err) {
         console.error(err);
         process.exit(1);
      }
      setTimeout(function() {
         data.Contents.forEach(function(object) {
            process.stdout.write(bucketName + ":" + object.Key + "\n");
         });
         completed += data.Contents.length;
         log("\rListed " + completed + " objects.");
      }, 0);
   });
});

function log(str) {
   process.stderr.write(str);
}
