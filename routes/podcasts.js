const express = require("express");
const PodcastRoute = express.Router();
const fs = require("fs");
const crypto = require("crypto");
const axios = require("axios");
const { doTranscription } = require("../utils/openai");
const download = require("../utils/download");
const path = require('path')

const apiKey = "WMCG87GQJE2ESTMPPWWC";
const apiSecret = "HfJ$QQwJ9hn2aBHKR9Gn$#2WTv8kEkCYfHFqeAv2";

const generateHeader = () => {
  const apiHeaderTime = Math.floor(Date.now() / 1000);
  const sha1Algorithm = "sha1";
  const data4Hash = apiKey + apiSecret + apiHeaderTime;
  const sha1Hash = crypto.createHash(sha1Algorithm);
  sha1Hash.update(data4Hash);
  const hash4Header = sha1Hash.digest("hex");
  return {
    "X-Auth-Date": "" + apiHeaderTime,
    "X-Auth-Key": apiKey,
    Authorization: hash4Header,
    "User-Agent": "SuperPodcastPlayer/1.8",
  };
};

// Get all Trending Podcast
PodcastRoute.get("/all", (req, res) => {
  try{
    const options = {
    method: "get",
    headers: generateHeader(),
  };
  const url = `https://api.podcastindex.org/api/1.0/podcasts/trending?pretty`;
  axios(url, options)
    .then((response) => {
      const result = response.data;
      res.send({ status: "ok", data: result });
    })
  }catch(err){
    console.log(err.message);
  }
});

// All Episodes by feed id
PodcastRoute.get("/episodes/:feedId", (req, res) => {
  try{
    const options = {
      method: "get",
      headers: generateHeader(),
    };
    const {feedId} = req.params;
    const url = `https://api.podcastindex.org/api/1.0/episodes/byfeedid?id=${feedId}&pretty`;
    axios(url, options).then((response) => {

      const result = response.data.items
      res.send({ status: "ok", data: result });
    });
  }catch(err){
    console.log(err.message);
  }
});



// 1 Episode by episodeid
PodcastRoute.get("/episode/:feedId/:podcastId", async (req, res) => {
  try{
    const options1 = {
      method: "get",
      headers: generateHeader(),
    };
    const { feedId, podcastId } = req.params;
    const url = `https://api.podcastindex.org/api/1.0/episodes/byfeedid?id=${feedId}&pretty`;
    let exactResult = {};
    axios(url, options1).then((response) => {
      const result = response.data.items;
      exactResult = result.find((item) => item.id == podcastId);
      res.send({ status: "ok", data: exactResult });
    })
    
  }catch(err){
    console.log(err.message);
  }
});


// Function: Podcast Transcribe
PodcastRoute.post('/transcription', (req, res)=> {
  const {transUrl, enclosureUrl} = req.body
  console.log(transUrl, enclosureUrl);
  const options = {
    method: "get",
    headers: generateHeader(),
  };
  if(transUrl){
    axios(transUrl, options).then((response) => {
      const result = response.data
        .replace(/^\d(.+)?/gm, "")
        .replaceAll("\n", "");
      
      res.send({ status: "ok", data: result });
    })
  }else{
    // doTranscription()
    // .then(result=>result.json())
    // .then(result=>{
    //   console.log(result);
    // })
    res.send({ status: "ok", data: "No transcription" })
  }
 
})


// Podcast Author
PodcastRoute.get('/author/:feedId', (req, res)=>{
  const {feedId} = req.params
  const url = `https://api.podcastindex.org/api/1.0/podcasts/byfeedid?id=${feedId}&pretty`;
  const options = {
    method: "get",
    headers: generateHeader(),
  };
  
  axios(url, options).then((response) => {
    const feed = response.data.feed
    res.send({status:'ok', data: feed})
  })
})

module.exports = PodcastRoute;
