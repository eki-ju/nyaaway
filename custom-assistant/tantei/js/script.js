var vm = new Vue({
  el: "#app",
  data: {
    req: null,
    accountId: null,
    totalMatches: 0,
    matchResults: [],
    allGameData: [],
    nameHistory: [],
    timestamp: [],
    flag: false,
    URL: {
      ACCOUNTID: "https://us-central1-costom-assistant.cloudfunctions.net/returnAccountId?sn=",
      TOTALMATCHES: "https://us-central1-costom-assistant.cloudfunctions.net/returnTotalMatches?id=",
      MATCHHISTORY: "https://us-central1-costom-assistant.cloudfunctions.net/returnMatchHistory?index=",
      GAMEDATA: "https://us-central1-costom-assistant.cloudfunctions.net/returnGameData?gameid="
    }
  },
  computed: {

  },

  // ---------- API用関数群 ---------------

  // get the account id
  methods: {
    getAccountId: function(){
      'use strict';

      // まず全てリセットする
      vm.accountId = null;
      vm.flag = false;
      vm.totalMatches = 0;
      vm.matchResults = [];
      vm.allGameData = [];
      vm.nameHistory = [];

      if(vm.req){
        fetch(vm.URL.ACCOUNTID + vm.req)
        .then(response => response.json())
        .then(function(json){
          console.log("アカウントID = " + json.accountId);
          vm.accountId = json.accountId;
          if(vm.accountId !== undefined){
            //alert("アカウントIDの取得に成功しました。");
            vm.getTotalMatches();
          }
          else alert("アカウントIDの取得に失敗しました。\nこのサモナーネームは現在使用されていない可能性があります。");
        })
        .catch(error => {
          console.log(error);
          alert("エラーが発生しました。");
        });
      } else {
        alert("サモナーネームを入力してください。");
      }
    },

    // get a total matches with Summoner Name
    getTotalMatches: function(){
      'use strict';
      if(vm.accountId !== null && vm.accountId !== ""){
        fetch(vm.URL.TOTALMATCHES + vm.accountId)
        .then(response => response.json())
        .then(function(json){
          console.log("トータルゲーム数 = " + json.totalGames);
          vm.totalMatches = json.totalGames;
          // alert("トータルゲーム数の取得に成功しました。");
          vm.getMatchHistory();
        })
        .catch(error => {
          console.log(error);
          alert("エラーが発生しました。");
        });
      } else {
        alert("先にサモナーネームを設定してください。");
      }
    },


    // 100ずつマッチヒストリーを取ってくる
    getMatchHistory: function(){
      'use strict';
      if(vm.totalMatches > 0){
        for(let i = 0; i < vm.totalMatches; i += 100){
          fetch(vm.URL.MATCHHISTORY + vm.accountId + "?beginIndex=" + i)
          .then(response => response.json())
          .then(function(json){
            console.log(json);
            //vm.matchResults.splice(vm.matchResults.length, 0, json);
            vm.matchResults.splice(0, 0, json);
            if(Math.ceil(vm.totalMatches/100) == vm.matchResults.length){
              vm.flag = true;
              // alert("マッチヒストリーの取得が完了しました。");
              vm.getGameData();
            }
          })
          .catch(error => {
            console.log(error);
          });
        }
      } else {
        alert("先にトータルマッチ数を取得してください。");
      }
    },

    getGameData: function(){
      'use strict';
      if(vm.matchResults.length > 0){
        for(let y = 0; y < vm.matchResults.length; y ++){
          for(let x = 0; x < vm.matchResults[y].length; x+=5){
            fetch(vm.URL.GAMEDATA + vm.matchResults[y][x].gameId)
            .then(response => response.json())
            .then(function(json){
              console.log(json);
              // 取得したGameDataを配列に格納していく
              vm.allGameData.splice(0, 0, json);
              vm.allGameData[0].splice(0, 0, vm.matchResults[y][x].timestamp);
              console.log(vm.allGameData[0][0]);
            })
            .catch(error => {
              console.log(error);
            });
          }
        }
        //console.log("すべてのゲームデータを取得しました。")
      } else {
        alert("マッチヒストリーが取得されていません。");
      }
    },

// ---------- 処理用関数群 ---------------

    // gameDataに含まれているアカウントIDを照らし合わせ、一致するもののサモナーネームを抽出する
    extractSummonerName: function(){
      if(vm.allGameData.length > 0){
        for(let z = 0; z < vm.allGameData.length; z++){
          for(let n = 1; n < 11; n++){
            if(vm.allGameData[z][n] !== undefined && vm.allGameData[z][n].player.currentAccountId == vm.accountId){
              if(vm.nameHistory.indexOf(vm.allGameData[z][n].player.summonerName) == -1){
                // アカウントIDと一致したサモナーネームを格納していく
                vm.nameHistory.splice(0, 0, vm.allGameData[z][n].player.summonerName);
                vm.timestamp.splice(0, 0, vm.allGameData[z][0]);
              }
            }
          }
        }
        // timestampを元にサモナーネームを変更順にソートしていく
        for(let i = 0; i < vm.nameHistory.length; i++){
          for(let j = i+1; j < vm.nameHistory.length; j++){
            if(vm.timestamp[i] < vm.timestamp[j]){
              // 入れ替え
              [vm.timestamp[i],vm.timestamp[j]] = [vm.timestamp[j],vm.timestamp[i]];
              [vm.nameHistory[i],vm.nameHistory[j]] = [vm.nameHistory[j],vm.nameHistory[i]];
            }
          }
        }

      } else {
        alert("ゲームデータが取得されていません。");
      }
    },
    matchResultsLength: function(){
      let length = 0;
      for(let i = 0; i < vm.matchResults.length; i++){
        for(let j = 0; j < vm.matchResults[i].length; j++){
          length++;
        }
      }
      return length;
    }
  }
});
