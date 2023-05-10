const http = require('https');
const fs = require('fs');

const download = function(url, dest, cb) {
  const file = fs.createWriteStream(dest);
  const request = http.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);  // close() is async, call cb after close completes.
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
  });
};

module.exports = download