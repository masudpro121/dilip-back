const { Configuration, OpenAIApi } = require('openai')

const express = require('express')
require('dotenv').config()
const cors = require('cors')
const PodcastRoute = require('./routes/podcasts')
const PORT = process.env.PORT || 8000
const app = express()

app.use(cors())
app.use(express.json())
app.use('/podcast', PodcastRoute)

app.listen(PORT, ()=>{
  console.log("Server is running on port: "+PORT);
})






