## head-blaster
A programmatic way to alter *many* s3 objects in many buckets in parallel

Usage:

    node list-objects.js --buckets=some-bucket-name,other-bucket > objects.list
    node head-blaster.js --file=objects.list --concurrency=3 --operation=./operations/fix-cache-headers.js > output.log

where objects.list is a file like:

    bucket-name:key/path
    bucket-name:key/path
    ...

In between listing and modifying is a good time to trim down the list if you
only want to affect objects with a certain key prefix or something.

Make new npm modules as needed for different operations, see examples in
operations/*.js.

