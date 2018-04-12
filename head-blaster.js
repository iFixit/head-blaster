var Queue = require('notify-queue');
var argv = require('yargs').argv;
var fs = require('fs');
var concurrency = argv.concurrency;
var completed = 0;
var errors = 0;
var objectQueue = new Queue();

if (!argv.file || !argv.concurrency || !argv.operation) {
   console.error([
    "Usage: node index.js --file=input.file --concurrency=2 --operation=./operations/fix-cache-headers.js > output.log",
    "   --file          : input file with one 'bucket:key' per line",
    "   --concurrency   : number of api calls to make in parallel (typically 2-10)",
    "   --operation     : path to module exporting: ",
    "                     function(bucket, key, callback) {/* do stuff */ callback(err)}",
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
   operation(object.bucket, object.key, function(err) {
      completed++;
      if (err) errors++;
      printStatus(completed, count);
      done();
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
