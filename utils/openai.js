const { Configuration, OpenAIApi } = require("openai");
const fs = require('fs')
const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

const doTranscription = (url) => {
    return openai.createTranscription(
        fs.createReadStream("https://hanashi.koelab.net/wp-content/uploads/hanashi-721.mp3"),
        "whisper-1"
      )
      
}

module.exports = {
    doTranscription
}