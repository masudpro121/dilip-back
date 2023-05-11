const { Configuration, OpenAIApi } = require("openai");
const axios = require('axios')
const fs = require('fs')
const FormData = require('form-data')
const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);
const apiKey =process.env.OPENAI_KEY
const doTranscription = (filePath, cb) => {
  axios({
    method: 'get',
    url: filePath,
    responseType: 'stream'
  }).then(response => {
    const formData = new FormData();
    formData.append('model', 'whisper-1');
    formData.append('file', response.data, { filename: 'audio.mp3' });
    axios.post("https://api.openai.com/v1/audio/transcriptions", formData, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        ...formData.getHeaders()
      }
    })
    .then(response => {
      cb(response.data.text)
    })
    .catch(err => {
      console.log(err);
    });
  });
   
}

// const doTranscription = (filePath, prompt) => {
//     return openai.createTranscription(
//         fs.createReadStream(filePath),
//         "whisper-1",
//         prompt
//       )
      
// }

const doSummarize = (text) =>{
  return openai.createCompletion({
    model: "text-davinci-003",
    prompt: text,
    max_tokens: 2048,
    temperature: 0,
  });
}

module.exports = {
    doTranscription, doSummarize
}