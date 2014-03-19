var modifyHeaders = require('./modify-headers.js');
var Queue = require('notify-queue');
var argv = require('yargs').argv;
var fs = require('fs');
var concurrency = argv.concurrency;
var completed = 0;

if (!argv.file) {
   console.error("--file= argument is required");
   process.exit(-1);
}

if (!concurrency) {
   console.error("--concurrency= argument is required");
   process.exit(-1);
}

var contents = fs.readFileSync(argv.file, 'utf8');
lines = contents.split("\n");
var count = lines.length;

var objectQueue = new Queue();

lines.forEach(function(line) {
   objectQueue.push(line);
});

for(var i=0; i<concurrency; i++) {
   objectQueue.pop(processLine);
}

function processLine(line, done) {
   var object = parseLine(line);
   fixObjectCacheHeaders(object.bucket, object.key, function() {
      completed++;
      printStatus(completed, count);
      done();
   });
}

function fixObjectCacheHeaders(bucket, key, callback) {
   modifyHeaders(bucket, key, fixCacheHeaders,
   function(err, response) {
      if (err) {
         console.log("FAILURE:%s:%s", bucket,key);
      } else {
         console.log("SUCCESS:%s:%s", bucket,key);
      }
      callback();
   });
}

function fixCacheHeaders(headers) {
   delete headers.Expires;
   headers.CacheControl = 'max-age=31557600';
   return headers;
}

function printStatus(i, count) {
   process.stdout.write("\rProgress: " + i);
}

function parseLine(line) {
   var sep = line.indexOf(':');
   var bucket = line.substring(0,sep);
   var key = line.substring(sep+1);
   return {
      bucket: bucket,
      key: key
   };
}
