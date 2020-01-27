'use strict'
const cors = require('cors')({origin: "https://nyaaway.com"});
const fetch = require('node-fetch');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// define URL about RiotGamesAPI
const URL = {
  SUMMONER: "https://jp1.api.riotgames.com/lol/summoner/v4/summoners/by-name/",
  RANK: "https://jp1.api.riotgames.com/lol/league/v4/entries/by-summoner/",
  MATCH: "https://jp1.api.riotgames.com/lol/match/v4/matchlists/by-account/",
  GAMEDATA: "https://jp1.api.riotgames.com/lol/match/v4/matches/",
  V1_SUMMONER_front: "https://acs.leagueoflegends.com/v1/players?name=",
  V1_SUMMONER_back: "&region=JP",
  V1_MATCH_front: "https://acs.leagueoflegends.com/v1/stats/player_history/",
  V1_MATCH_back: "?beginIndex=0&endIndex=1"
}
// define OPTIONS about headers
const options = {
  method: 'GET',
  headers: {'X-Riot-Token': '自分のRiotGamesAPIキー'}
}

// define function to send request to RiotGamesAPI
// dodge CORS!!
const getJSON = async (url) => {
  try {
    const response = await fetch(url, options);
    const resjson = await response.json();
    return resjson;
  } catch(error) {
    throw new Error(error);
  }
}


// 1, まず9998-9999でリクエスト送る(通算ゲーム数を知るため)
// 2, totalGamesをhttpにsend、それをMAXとして100ずつマッチヒストリーをとる
// 3, マッチヒストリーのmatches[index].gameIdを保存
// 4, gameIdからGAMEDATAのparticipantIdentities[index].players.currentAccountId
//    の値と同じやつのparticipantIdentities[index].players.summonerNameを格納する


// return only Summoner Pro
exports.returnAccountId = functions.https.onRequest((req, res) =>{
  return cors(req, res, () => {
    getJSON(URL.SUMMONER + encodeURIComponent(req.query.sn))
    .then(summoner => res.send(summoner))
    .catch(error => res.status(400).send(error));
  });
});


// 1, .../returnSummoner?sn=***
// 2, send request to RiotGamesAPI for getJSON with sn
// 3, get response from getJSON then send JSON to HTTP
exports.returnSummoner = functions.https.onRequest((req, res) =>{
  return cors(req, res, () => {
    getJSON(URL.SUMMONER + encodeURIComponent(req.query.sn))
    .then(summoner => getJSON(URL.RANK + summoner.id))
    .then(league => res.send(league))
    .catch(error => res.status(400).send(error));
  });
});

// 1, .../returnTotalMatches?sn=***
// 2, send request to RiotGamesAPI for getJSON with sn
// 3, get response from getJSON then send JSON to HTTP
exports.returnTotalMatches = functions.https.onRequest((req, res) =>{
  return cors(req, res, () => {
    getJSON(URL.MATCH + req.query.id + "?endIndex=9999&beginIndex=9998")
    .then(total => res.send(total))
    .catch(error => res.status(400).send(error));
  });
});

// return Match History with index
exports.returnMatchHistory = functions.https.onRequest((req, res) =>{
  return cors(req, res, () => {
    getJSON(URL.MATCH + req.query.index)
    .then(history => res.send(history.matches))
    .catch(error => res.status(400).send(error));
  });
});

// return Game Data with Game ID
exports.returnGameData = functions.https.onRequest((req, res) =>{
  return cors(req, res, () => {
    getJSON(URL.GAMEDATA + req.query.gameid)
    .then(gamedata => res.send(gamedata.participantIdentities))
    .catch(error => res.status(400).send(error));
  });
});

//---------------------------------------------------------

// return AccountID for V1 API
exports.returnAccountIdForV1 = functions.https.onRequest((req, res) =>{
  return cors(req, res, () => {
    getJSON(URL.V1_SUMMONER_front + encodeURIComponent(req.query.sn) + URL.V1_SUMMONER_back)
    .then(summoner => getJSON(URL.V1_MATCH_front + summoner.platformId + "/" + summoner.accountId + URL.V1_MATCH_back))
    .then(data => res.send(data))
    .catch(error => res.status(400).send(error));
  });
});


// return MatchData.SummonerName for V1 API

exports.returnMatchDataForV1 = functions.https.onRequest((req, res) =>{
  return cors(req, res, () => {
    getJSON(URL.V1_MATCH_front + req.query.accountid + URL.V1_MATCH_back)
    .then(data => res.send(data))
    .catch(error => res.status(400).send(error));
  });
});

//---------------------------------------------------------
