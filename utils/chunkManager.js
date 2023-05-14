const fs = require('fs');
const { spawn } = require('child_process');
const ffmpegPath = 'C:/PATH_Environments/ffmpeg.exe';

const path = require('path')
// Promisify fs.readFile function

async function chunkManager(filename) {
    
    // input file path
    const inputPath = path.join('storage', filename);
    const outputPath = path.join('storage', "o-"+filename);
    
const args = [
    '-i', inputPath,
    '-acodec', 'libmp3lame',
    outputPath,
  ];
  
  const ffmpeg = spawn(ffmpegPath, args);
  
  ffmpeg.on('close', (code) => {
    if (code === 0) {
      console.log('Audio encoding complete!');
    } else {
      console.error(`FFmpeg exited with code ${code}`);
    }
  });
  
  ffmpeg.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });
  
  ffmpeg.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });
}

module.exports=chunkManager