const express = require("express");
const PodcastRoute = express.Router();
const fs = require("fs");
const crypto = require("crypto");
const { doTranscription, doSummarize } = require("../utils/openai");
const download = require("../utils/download");
const path = require("path");
const axios = require("axios");
axios.defaults.maxBodyLength = 50000000000;

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
  if(type=="little"){
    prompt = "Write a summary within 30 words for : "
  }else if(type=="short"){
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


// Transcript by url
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
      const transcription = response.data.replace(/^\d(.+)?/gm, "").replaceAll("\n", "").split(' ').slice(0,1000).join(' ')
      let count = 0;
      let count2=0; let limit2 = 3;
      
      const data = {}
      data.titles = []
      data.detailsOfTitles=[]
      const shouldResponse = () => {
        console.log(count, 'count');
        console.log(count2, 'count2');
        if(count==3 && count2==limit2){
          console.log('delivered');
          res.send({ status: "ok", data});
        }
      }
      doSummarize('write a short summary within 50 words: '+transcription)
      // doSummarize('how are you')
      .then(result=>{
        count++
        const actualResult = result.data.choices[0].text
        data.summarize = actualResult
        shouldResponse()
       
      })

      doSummarize("write 5 key insights with bullet point for this: "+transcription)
      .then(result=>{
        count++
        const actualResult = result.data.choices[0].text
        data.keyInsights = actualResult
        shouldResponse()
      })

      doSummarize("write 3 blog title every title will be in a line : "+transcription)
        .then(result=>{
          count++
          const actualResult = result.data.choices[0].text
          data.titles = actualResult.split('\n').filter(i=>i.length)
          shouldResponse()

          for(let i=0; i<limit2; i++){
            doSummarize("write details within 150 words and show it in bullet point  : "+data.titles[i])
            .then(result=>{
              count2++
              const actualResult = result.data.choices[0].text
              data.detailsOfTitles[i] = actualResult
              shouldResponse()
            }) 
          }
        })
    })
})




// Ai Transcription
PodcastRoute.post("/ai-transcription", (req, res) => {
  const {enclosureUrl} = req.body
  let summarizeList=[]
  let count = 0;
  const cb = (transcriptionsList) =>{
    console.log( 'start summarizing');
    
    transcriptionsList.forEach((t,i)=>{
      let multiply = 1
      if(t.text>1000){
        multiply = 3
      }else if(t.text>500){
        multiply = 2
      }
      doSummarize(`write a headline inside this syntax <Headline></Headline> and then Make a highly Compressed highly Narrated summarize inside this syntax <Summarize></Summarize> and then make a summary within ${20*multiply} words inside <Short></Short> and then make a summary within ${50*multiply} words inside <Medium></Medium> and then make a summary within ${100*multiply} words inside <Large></Large>: ` + t.text)
      .then((result) => {
        count++
        const actualResult = result.data.choices[0].text;
        summarizeList[i]={text:actualResult, endTime: t.endTime}
        console.log('Summarized ', count);
        if(transcriptionsList.length == count){
          const texts = summarizeList.map(tr=>{
            return tr.text.match(/^(<Short>)(.+)(<\/Short>$)/gm)[0].replaceAll(/(<Short>)|(<\/Short>)/g, '')
          })
          const smallSummary = texts.join(" ").split(" ").slice(0,1300).join(" ")
          doSummarize(`write a summary within 40 words inside this syntax <Sum></Sum> and then write ${Math.ceil(smallSummary.length/100)} key insights in  bullet point inside this syntax <Insight></Insight>:  `+smallSummary)
          .then(sumandkey=>{
            console.log('summary and key insight');
            const summaryAndKeyInsights = sumandkey.data.choices[0].text
            res.send({ status: "ok", data: {summarizeList, summaryAndKeyInsights} })
          })
        }
      })
      .catch(err=>{
        count++
        console.log( 'error summarizing');
        console.log(err)
      })
    })
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
