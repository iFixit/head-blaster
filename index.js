var modifyHeaders = require('./modify-headers.js');
var Queue = require('notify-queue');
var argv = require('yargs').argv;
var fs = require('fs');
var concurrency = argv.concurrency;
var completed = 0;
var objectQueue = new Queue();

if (!argv.file) {
   console.error("--file= argument is required");
   process.exit(-1);
}

if (!concurrency) {
   console.error("--concurrency= argument is required");
   process.exit(-1);
}

console.log("Reading file...");
out("Reading file...");
var lines = fs.readFileSync(argv.file, 'utf8').split("\n");
var count = lines.length;

lines.forEach(function(line) {
   objectQueue.push(line);
});

out(" Done.\n");
out("Read " + count + " lines.\n");

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

function printStatus(current, count) {
   var ratio = current / count;
   var pct = Math.round(1000*ratio) / 1000 + "%";
   out("\rProgress: " + pct + " (" + current + ' / ' + count + ")");
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

function out(str) {
   process.stderr.write(str);
}
