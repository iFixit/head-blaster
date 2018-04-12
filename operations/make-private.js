var setAclFactory = require('../set-acl.js');

module.exports = setAclFactory(function getAcl(bucket, key) {
   return {ACL: 'private'};
});

