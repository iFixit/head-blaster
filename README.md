## head-blaster
A programmatic way to alter the s3 headers of many keys in many buckets.

Usage:
   node index.js --file=intput --concurrency=3 > output.log

where input is a file like:

    bucket-name:key/path
    bucket-name:key/path
    ...

Edit `index.js:fixCacheHeaders()` to alter what is done to each object in the
list.

