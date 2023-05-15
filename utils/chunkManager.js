const fs = require('fs');
const { spawn } = require('child_process');
const ffmpegPath = 'C:/PATH_Environments/ffmpeg.exe';

const path = require('path')
// Promisify fs.readFile function
let outputPaths = []
async function chunkManager(filename, index, isChunkDone) {
    
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
      outputPaths[index]=outputPath
      console.log(outputPaths);
      if(isChunkDone){
        console.log('chunk done');
        setTimeout(()=>{
          isChunkDone(outputPaths.filter(i=>i))
          outputPaths=[]
        },1000)
      }
      
    } else {
      console.error(`FFmpeg exited with code ${code}`);
    }
  });
  
  ffmpeg.stdout.on('data', (data) => {
    // console.log(`stdout: ${data}`);
    
  });
  
  ffmpeg.stderr.on('data', (data) => {
    // console.error(`stderr: ${data}`);
  });
}

module.exports=chunkManager