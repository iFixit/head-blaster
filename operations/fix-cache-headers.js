module.exports = function fixCacheHeaders(headers) {
   delete headers.Expires;
   headers.CacheControl = 'max-age=31557600';
   return headers;
}

