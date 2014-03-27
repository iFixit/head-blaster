var modifyHeaders = require('./modify-headers.js');
var Queue = require('notify-queue');
var argv = require('yargs').argv;
var fs = require('fs');
var concurrency = argv.concurrency;
var completed = 0;
var errors = 0;
var objectQueue = new Queue();

if (!argv.file || !argv.concurrency || !argv.operation) {
   console.error([
    "Usage: node index.js --file=input.file --concurrency=2 --operation=./operations/fix-cache-headers.js",
    "   --file          : input file with one 'bucket:key' per line",
    "   --concurrency   : number of api calls to make parallel (typically 2-10)",
    "   --operation     : path to module exporting: ",
    "                     function(inheaders) {return outheaders;}",
    "                     see operations/*",
    ''
    ].join('\n'));
   process.exit(-1);
}

var operation = require(argv.operation);
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
   fixObjectHeaders(object.bucket, object.key, function(err) {
      completed++;
      if (err) errors++;
      printStatus(completed, count);
      done();
   });
}

function fixObjectHeaders(bucket, key, callback) {
   modifyHeaders(bucket, key, operation,
   function(err, response, original, fixed) {
      if (err) {
         console.log("FAILURE:%s:%s", bucket,key);
      } else {
         console.log("SUCCESS:%s:%s before:%s", bucket, key, JSON.stringify(original));
         console.log("               after:%s", JSON.stringify(fixed));
      }
      callback(err);
   });
}

function printStatus(current, count) {
   var ratio = current / count * 100;
   var pct = Math.round(1000*ratio) / 1000 + "%";
   out("\rProgress: " + pct + " (" + current + ' / ' + count + ") Errors: " + errors);
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
