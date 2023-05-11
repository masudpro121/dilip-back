const { Configuration, OpenAIApi } = require("openai");
const fs = require('fs')
const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

const doTranscription = (filePath) => {
    return openai.createTranscription(
        fs.createReadStream(filePath),
        "whisper-1"
      )
      
}

module.exports = {
    doTranscription
}