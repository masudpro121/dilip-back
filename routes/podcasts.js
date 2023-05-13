const express = require("express");
const PodcastRoute = express.Router();
const fs = require("fs");
const crypto = require("crypto");
const { doTranscription, doSummarize } = require("../utils/openai");
const download = require("../utils/download");
const path = require("path");
const axios = require("axios");
axios.defaults.maxBodyLength = 50000000;

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
  try {
    const options = {
      method: "get",
      headers: generateHeader(),
    };
    const recent = `https://api.podcastindex.org/api/1.0/recent/newfeeds?pretty&max=20`;
    const trending =
      "https://api.podcastindex.org/api/1.0/podcasts/trending?pretty";
    axios(trending, options).then((response) => {
      const result = response.data;
      res.send({ status: "ok", data: result });
    });
  } catch (err) {
    console.log(err.message);
  }
});

// All Episodes by feed id
PodcastRoute.get("/episodes/:feedId", (req, res) => {
  try {
    const options = {
      method: "get",
      headers: generateHeader(),
    };
    const { feedId } = req.params;
    const url = `https://api.podcastindex.org/api/1.0/episodes/byfeedid?id=${feedId}&pretty`;
    axios(url, options).then((response) => {
      const result = { items: response.data.items };
      const options2 = {
        method: "get",
        headers: generateHeader(),
      };
      const url2 = `https://api.podcastindex.org/api/1.0/podcasts/byfeedid?id=${feedId}&pretty`;
      axios(url2, options2).then((resp) => {
        result.podcast = resp.data.feed;
        res.send({ status: "ok", data: result });
      });
    });
  } catch (err) {
    console.log(err.message);
  }
});

// 1 Episode by episodeid
PodcastRoute.get("/episode/:feedId/:podcastId", (req, res) => {
  try {
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

      const options2 = {
        method: "get",
        headers: generateHeader(),
      };
      const url2 = `https://api.podcastindex.org/api/1.0/podcasts/byfeedid?id=${feedId}&pretty`;
      axios(url2, options2).then((resp) => {
        exactResult.podcast = resp.data.feed;
        res.send({ status: "ok", data: exactResult });
      });
    });
  } catch (err) {
    console.log(err.message);
  }
});

// Default Podcast Transcribe
PodcastRoute.post("/summary", (req, res) => {
  const { text, type } = req.body;
  let prompt = ""
  if(type=="short"){
    prompt = "Write a summary within 100 words for : "
  }else if(type=="medium"){
    prompt = "Write a summary within 300 words for : "
  }else if(type=="large"){
    prompt = "Write a summary within 500 words for : "
  }else{
    prompt = "Write a summary within 100 words for : "
  }
  doSummarize(prompt + text)
    .then((result) => {
      const actualResult = result.data.choices[0].text;
      res.send({ status: "ok", data:actualResult });
    });
  // res.send({ status: "ok", data: result});
});


PodcastRoute.post('/transcription-by-url', (req, res)=> {
    const {transUrl} = req.body
    const options = {
      method: "get",
      headers: generateHeader(),
    };
      axios(transUrl, options).then((response) => {
        const result = response.data.replace(/^\d(.+)?/gm, "")
        res.send(JSON.stringify({ status: "ok", data: result }));
      })
    })

// Backup: Details and Default Podcast Transcribe
PodcastRoute.post('/details-transcription', (req, res)=> {
  const {transUrl} = req.body
  const options = {
    method: "get",
    headers: generateHeader(),
  };
    axios(transUrl, options).then((response) => {
      const result = response.data.replace(/^\d(.+)?/gm, "").replaceAll("\n", "").split(' ').slice(0,1000).join(' ')
      let count = 0;
      const data = {}
      doSummarize('write a short summary within 50 words: '+result)
      // doSummarize('how are you')
      .then(result=>{
        count++
        console.log(count, 'count');
        const actualResult = result.data.choices[0].text
        data.summarize = actualResult
        if(count==3){
          res.send({ status: "ok", data });
        }
      })

      doSummarize("write less than 5 key insights with bullet point for this: "+result)
      // doSummarize("bangladeshi flower")
      .then(result=>{
        count++
        console.log(count, 'count');
        const actualResult = result.data.choices[0].text
        data.keyInsights = actualResult

        doSummarize("write paragraph for every key insights: "+data.keyInsights)
        // doSummarize("5 flower name")
        .then(result=>{
          count++
          console.log(count, 'count');
          const actualResult = result.data.choices[0].text
          data.details = actualResult
          if(count==3){
            res.send({ status: "ok", data });
          }
        })
      })

      // res.send({ status: "ok", data: result});
    })

})




// Ai Transcription
PodcastRoute.post("/ai-transcription", (req, res) => {
  const {enclosureUrl} = req.body
  const cb = (text) =>{

    res.send({ status: "ok", data: text })
  }
  doTranscription(enclosureUrl, cb)
});

// Podcast Author
PodcastRoute.get("/author/:feedId", (req, res) => {
  const { feedId } = req.params;
  const url = `https://api.podcastindex.org/api/1.0/podcasts/byfeedid?id=${feedId}&pretty`;
  const options = {
    method: "get",
    headers: generateHeader(),
  };

  axios(url, options).then((response) => {
    const feed = response.data.feed;
    res.send({ status: "ok", data: feed });
  });
});

module.exports = PodcastRoute;
