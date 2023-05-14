const { Configuration, OpenAIApi } = require("openai");
const ffmpeg = require("fluent-ffmpeg");
const axios = require("axios");
axios.defaults.maxBodyLength = 500000;
const path = require("path");

const fs = require("fs");
const FormData = require("form-data");
const download = require("./download");
const { log } = require("console");
const chunkManager = require("./chunkManager");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);
const apiKey = process.env.OPENAI_KEY;

const doTranscription = (url, cb) => {
  // const paths2=['965723078066-chunk-0.mp3', '965723078066-chunk-1.mp3']
  
  const downloaded =  (pa) => {
    console.log(pa, 'paths');
    let i=0;
    const paths = pa.map((p)=>fs.createReadStream(path.join("storage", p)))
    let transcriptions = [];

    function loopIt(){
      openai.createTranscription(paths[i],"whisper-1")
        .then((res) => {
          transcriptions[i] = res.data.text;
          i++;
          if(i<paths.length){
            loopIt()
          }
          if (paths.length == i) {
            cb(transcriptions)
          }
        });

    }
    loopIt()
  };
  // downloaded([ 'o-752939142096-chunk-0.mp3', 'o-1463408083808-chunk-1.mp3' ] )
  download(url, downloaded);
};

// const doTranscription = (filePath, prompt) => {
//     return openai.createTranscription(
//         fs.createReadStream(filePath),
//         "whisper-1",
//         prompt
//       )

// }
// const doTranscription = (filePath, cb) => {
//   console.log('transcripting');
//   axios({
//     method: 'get',
//     url: filePath,
//     responseType: 'stream'
//   }).then(response => {
//     const formData = new FormData();
//     formData.append('model', 'whisper-1');
//     formData.append('file', response.data, { filename: 'audio.mp3' });
//     formData.append('prompt', 'Generate a compressed summary for this transcription');

//     axios.post("https://api.openai.com/v1/audio/transcriptions", formData, {
//       headers: {
//         Authorization: `Bearer ${apiKey}`,
//         ...formData.getHeaders()
//       }
//     })
//     .then(response => {
//       console.log(response);
//       cb(response.data)
//     })
//     .catch(err => {
//       console.log(err);
//     });
//   });

// }

// const doTranscription = (filePath, prompt) => {
//     return openai.createTranscription(
//         fs.createReadStream(filePath),
//         "whisper-1",
//         prompt
//       )

// }

const doSummarize = (text) => {
  return openai.createCompletion({
    model: "text-davinci-003",
    prompt: text,
    max_tokens: 2048,
    temperature: 0,
  });
};

module.exports = {
  doTranscription,
  doSummarize,
};
