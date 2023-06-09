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





async function download(url, cb) {
  const outputPaths = []
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });

  let contentLength = response.headers['content-length'];
  const Mb = 1024 * 1024; 
  const CHUNK_SIZE = (contentLength/Mb) < 10 ? Mb*1 : Mb*3
  let totalChunks = Math.ceil(contentLength / CHUNK_SIZE);
  const randomTime = Math.ceil(Math.random()*Date.now())
  let offset = 0;
  let chunkIndex = 0;
  let fileName = `${randomTime}-chunk-${chunkIndex}.mp3`
  let writeStream = fs.createWriteStream(path.join('storage',fileName));
  // chunkPaths.push("o-"+fileName)

  response.data.on('data', (chunk) => {
    let chunkSize = chunk.length;
    writeStream.write(chunk);
    offset += chunkSize;

    if (offset >= CHUNK_SIZE) {
      offset = 0;
      writeStream.end();
      chunkManager(fileName, chunkIndex, outputPaths)
      chunkIndex++;
      fileName=`${randomTime}-chunk-${chunkIndex}.mp3`
      // chunkPaths.push("o-"+fileName)
      if (chunkIndex < totalChunks) {
        writeStream = fs.createWriteStream(path.join('storage',fileName));
       
      }
    }
  });

  response.data.on('end', () => {
    writeStream.end();
    const isChunkDone=(paths)=>{
      cb(paths)
    }
    chunkManager(fileName, chunkIndex, outputPaths, isChunkDone)
    console.log('Audio file downloaded successfully.');
  });
}





module.exports = download

