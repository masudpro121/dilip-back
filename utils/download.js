const https = require('https');
const axios = require('axios');
const fs = require('fs');
const path = require('path')
const download = (audioUrl, fileName, cb) => {
  const rand = Math.ceil(Math.random()*Date.now())
  const fileStream = fs.createWriteStream(path.join('storage',rand+fileName));
  axios({
    method: 'get',
    url: audioUrl,
    responseType: 'stream'
  }).then(response => {
    response.data.pipe(fileStream);
    fileStream.on('finish', () => {
      cb(fileStream.path)
      console.log(`${fileName} downloaded successfully`);
    });
  }).catch(error => {
    console.error(`Error downloading ${fileName}: ${error.message}`);
  });
}

module.exports = download

