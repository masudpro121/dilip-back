const  express = require('express')
const PodcastRoute = express.Router()
const fs = require('fs')
const crypto = require('crypto');
const axios = require('axios');

const apiKey = "WMCG87GQJE2ESTMPPWWC";
const apiSecret = "HfJ$QQwJ9hn2aBHKR9Gn$#2WTv8kEkCYfHFqeAv2";
const apiHeaderTime = Math.floor(Date.now()/1000);
const sha1Algorithm = "sha1";
const data4Hash = apiKey + apiSecret + apiHeaderTime;
const sha1Hash = crypto.createHash(sha1Algorithm);
sha1Hash.update(data4Hash);
const hash4Header = sha1Hash.digest('hex');



// Get all Trending Podcast 
PodcastRoute.get('/all', (req, res)=>{
    const options = {
        method: 'get',
        headers: {
          'X-Auth-Date': '' + apiHeaderTime,
          'X-Auth-Key': apiKey,
          'Authorization': hash4Header,
          'User-Agent': 'SuperPodcastPlayer/1.8',
        },
      };
    const url = `https://api.podcastindex.org/api/1.0/podcasts/trending?pretty`;
    axios(url, options)
    .then(response => {
      const result = response.data;
      res.send({status: 'ok', data: result});
    });
})

// Podcast Transcribe
PodcastRoute.get('/transcribe/:transurl', (req, res)=>{
    const options = {
        method: 'get',
        headers: {
          'X-Auth-Date': '' + apiHeaderTime,
          'X-Auth-Key': apiKey,
          'Authorization': hash4Header,
          'User-Agent': 'SuperPodcastPlayer/1.8',
        },
      };
    const url = req.params.transurl.replaceAll('-', '/')
    console.log(url, 'url');
    axios(url, options)
    .then(response => {
      const result = response.data.replace(/^\d(.+)?/gm, '').replaceAll('\n\n', '\n')
      res.send(result);
    });
})

PodcastRoute.get('/episodes/:id', (req, res)=>{
    const options = {
        method: 'get',
        headers: {
          'X-Auth-Date': '' + apiHeaderTime,
          'X-Auth-Key': apiKey,
          'Authorization': hash4Header,
          'User-Agent': 'SuperPodcastPlayer/1.8',
        },
      };
    const id= req.params.id
    const url = `https://api.podcastindex.org/api/1.0/episodes/byfeedid?id=${id}&pretty`;
    axios(url, options)
    .then(response => {
      const result = response.data;
      res.send({status: 'ok', data: result});
    });
})

module.exports = PodcastRoute