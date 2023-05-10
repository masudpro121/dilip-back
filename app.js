const { Configuration, OpenAIApi } = require('openai')

const express = require('express')
require('dotenv').config()
const cors = require('cors')
const PodcastRoute = require('./routes/podcasts')
const PORT = process.env.PORT || 8000
const app = express()
// app.set('server.timeout', 6000000);
app.use(cors())
app.use(express.json())
app.use('/podcast', PodcastRoute)

app.listen(PORT, ()=>{
  console.log("Server is running on port: "+PORT);
})


process.on('uncaughtException', (err, origin) => {
  console.error(`Caught exception: ${err}\nException origin: ${origin}`);
});

process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled rejection: ${err}\nPromise: ${promise}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server shut down');
    process.exit(0);
  });
});




