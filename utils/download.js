const https = require('https');
const axios = require('axios');
const fs = require('fs');
const path = require('path')
const ffmpeg = require('fluent-ffmpeg');
const chunkManager = require('./chunkManager');
// const download = (audioUrl, fileName, cb) => {
//   const myfileName = Math.ceil(Math.random()*Date.now())+fileName
//   const fileStream = fs.createWriteStream(path.join('storage',myfileName));
//   axios({
//     method: 'get',
//     url: audioUrl,
//     responseType: 'stream'
//   }).then(response => {
//     response.data.pipe(fileStream);
//     fileStream.on('finish', () => {
//       cb(fileStream.path)
//       console.log(`${myfileName} downloaded successfully`);
//     });
//   }).catch(error => {
//     console.error(`Error downloading ${myfileName}: ${error.message}`);
//   });
// }



const CHUNK_SIZE = 1 * 1024 * 1024; 

async function download(url, cb) {
  const chunkPaths = []
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });

  let contentLength = response.headers['content-length'];
  let totalChunks = Math.ceil(contentLength / CHUNK_SIZE);
  const randomTime = Math.ceil(Math.random()*Date.now())
  let offset = 0;
  let chunkIndex = 0;
  let fileName = `${randomTime}-chunk-${chunkIndex}.mp3`
  let writeStream = fs.createWriteStream(path.join('storage',fileName));
  chunkPaths.push(fileName)

  response.data.on('data', (chunk) => {
    let chunkSize = chunk.length;
    writeStream.write(chunk);
    offset += chunkSize;

    if (offset >= CHUNK_SIZE) {
      offset = 0;
      writeStream.end();
      chunkManager(fileName)
      chunkIndex++;
      fileName=`${randomTime}-chunk-${chunkIndex}.mp3`
      chunkPaths.push(fileName)
      if (chunkIndex < totalChunks) {
        writeStream = fs.createWriteStream(path.join('storage',fileName));
       
      }
    }
  });

  response.data.on('end', () => {
    writeStream.end();
    chunkManager(fileName)
    console.log('Audio file downloaded successfully.');
    cb(chunkPaths)
  });
}





module.exports = download

