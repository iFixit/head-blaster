## head-blaster
A programmatic way to alter the s3 headers of many keys in many buckets.

Usage:

    node index.js --file=input --concurrency=3 --operation=./operations/fix-cache-headers.js > output.log

where input is a file like:

    bucket-name:key/path
    bucket-name:key/path
    ...

Make new npm modules as needed for different operations, see examples in
operations/*.js.

