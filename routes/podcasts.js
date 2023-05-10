const express = require("express");
const PodcastRoute = express.Router();
const fs = require("fs");
const crypto = require("crypto");
const axios = require("axios");

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
PodcastRoute.get("/episodes/:id", (req, res) => {
  try{
    const options = {
      method: "get",
      headers: generateHeader(),
    };
    const id = req.params.id;
    const url = `https://api.podcastindex.org/api/1.0/episodes/byfeedid?id=${id}&pretty`;
    axios(url, options).then((response) => {
      const result = response.data;
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
    const url2 = `https://api.podcastindex.org/api/1.0/podcasts/byfeedid?id=${feedId}&pretty`;
    let exactResult = {};
    axios(url, options1).then((response) => {
      const result = response.data.items;
      exactResult = result.find((item) => item.id == podcastId);
      podcastAuthor(url2, exactResult, res)
      
    })
    
  }catch(err){
    console.log(err.message);
  }
});

// Function: Podcast Author

const podcastAuthor = (url2, exactResult, res) => {
  const options2 = {
    method: "get",
    headers: generateHeader(),
  };
  axios(url2, options2).then((response) => {
    const feed = response.data.feed;
    exactResult.podcast = feed;
    
    const url = exactResult.transcriptUrl;
    if(url){
      podcastTranscribe(url, exactResult, res)
    }else{
      res.send({ status: "ok", data: exactResult });
    }
  })
}

// Function: Podcast Transcribe
const podcastTranscribe = (url, exactResult, res) => {
  const options3 = {
    method: "get",
    headers: generateHeader(),
  };
  axios(url, options3).then((response) => {
    const result = response.data
      .replace(/^\d(.+)?/gm, "")
      .replaceAll("\n", "");
    exactResult.transcription = result;
    res.send({ status: "ok", data: exactResult });
  })
  
}

module.exports = PodcastRoute;
