var setAcl = require('../set-acl.js');

module.exports = setAcl(function getAcl(bucket, key) {
   return {ACL: 'private'};
});

