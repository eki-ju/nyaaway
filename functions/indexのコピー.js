// import node-fetch
// import fetch from 'node-fetch';
const cors = require('cors')({origin: "https://nyaaway.com"});
const fetch = require('node-fetch');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const URL = {
  SUMMONER: "https://jp1.api.riotgames.com/lol/summoner/v4/summoners/by-name/",
  RANK: "https://jp1.api.riotgames.com/lol/league/v4/positions/by-summoner/"
};

var summoner = {
  name: null,
  id: null,
  tier: null,
  division: null,
  lp: null
};

const options = {
  method: 'GET',
  headers: {'X-Riot-Token': 'RGAPI-2a2da245-5823-4c69-bcd6-4a5f8911b6f0'}
};


exports.returnSummonerId = functions.https.onRequest((req, res) =>{
  return cors(req, res, () => {
    fetch(URL.SUMMONER + req.query.sn, options)
     .then(response => response.json())
      .then(function(json){
        summoner.name = json.name;
        summoner.id = json.id;
        //res.send(json);
      }).catch(error => res.status(072).send("Fail!"));

    fetch(URL.RANK + summoner.id, options)
     .then(response => response.json())
      .then(function(json){
        summoner.tier = json[0].tier;
        summoner.division = json[0].rank;
        summoner.lp = json[0].leaguePoints;
        res.send(summoner);
      }).catch(error => res.status(072).send("Fail!"));
  });
});


exports.returnSummonerRank = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    fetch(URL.RANK + req.query.id, options)
     .then(response => response.json())
      .then(function(json){
        res.send(json);
      }).catch(error => res.status(072).send("Fail!"));
    });
});


// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original
exports.addMessage = functions.https.onRequest((req, res) => {
  // Grab the text parameter.
  const original = req.query.text;
  // Push the new message into the Realtime Database using the Firebase Admin SDK.
  return admin.database().ref('/messages').push({original: original}).then((snapshot) => {
    // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
    return res.redirect(303, snapshot.ref.toString());
  });
});

// Listens for new messages added to /messages/:pushId/original and creates an
// uppercase version of the message to /messages/:pushId/uppercase
exports.makeUppercase = functions.database.ref('/messages/{pushId}/original')
    .onCreate((snapshot, context) => {
      // Grab the current value of what was written to the Realtime Database.
      const original = snapshot.val();
      console.log('Uppercasing', context.params.pushId, original);
      const uppercase = original.toUpperCase();
      // You must return a Promise when performing asynchronous tasks inside a Functions such as
      // writing to the Firebase Realtime Database.
      // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
      return snapshot.ref.parent.child('uppercase').set(uppercase);
    });
