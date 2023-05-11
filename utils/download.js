const https = require('https');
const axios = require('axios');
const fs = require('fs');
const path = require('path')
const download = (audioUrl, fileName, cb) => {
  const myfileName = Math.ceil(Math.random()*Date.now())+fileName
  const fileStream = fs.createWriteStream(path.join('storage',myfileName));
  axios({
    method: 'get',
    url: audioUrl,
    responseType: 'stream'
  }).then(response => {
    response.data.pipe(fileStream);
    fileStream.on('finish', () => {
      cb(fileStream.path)
      console.log(`${myfileName} downloaded successfully`);
    });
  }).catch(error => {
    console.error(`Error downloading ${myfileName}: ${error.message}`);
  });
}

module.exports = download

