var vm = new Vue({
  el: "#app",
  data: {
    req: null,
    summonerName: null,
    URL: {
      ACCOUNTID: "https://us-central1-costom-assistant.cloudfunctions.net/returnAccountIdForV1?sn=",
      GAMEDATA: "https://us-central1-costom-assistant.cloudfunctions.net/returnMatchDataForV1?accountid="
    }
  },
  computed: {

  },

  // ---------- API用関数群 ---------------

  // get the account id
  methods: {
    getAccountId: function(){
      'use strict';

      // まずリセット
      vm.summonerName = null;

      if(vm.req){
        fetch(vm.URL.ACCOUNTID + vm.req)
        .then(response => response.json())
        .then(function(json){
          if(json.games.games[0].participantIdentities[0].player.summonerName !== undefined){
            vm.summonerName = json.games.games[0].participantIdentities[0].player.summonerName;
          }
          else alert("サモナーネームの取得に失敗しました。");
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
    getSummonerName: function(){
      'use strict';
      if(vm.accountId !== null && vm.accountId !== ""){
        fetch(vm.URL.GAMEDATA + vm.accountId)
        .then(response => response.json())
        .then(function(json){
          console.log("サモナーネーム = " + json.games.games[0].participantIdentities[0].player.summonerName);
          vm.summonerName = json.games.games[0].participantIdentities[0].player.summonerName;
        })
        .catch(error => {
          console.log(error);
          alert("エラーが発生しました。");
        });
      } else {
        alert("先にサモナーネームを入力してください。");
      }
    }
  }
});
