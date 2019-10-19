var vm = new Vue({
  el: "#app",
  data: {
    req: req,
    summoners: summoners,
    rankarmor: rankarmor,
    mmr: [0, 0],
    URL: {
      SUMMONER: "https://us-central1-costom-assistant.cloudfunctions.net/returnSummoner?sn=",
      RANK: "https://us-central1-costom-assistant.cloudfunctions.net/returnSummonerRank?id=",
      TIER: "./img/"
    }
  },
  computed: {
    blueMMR: function(){
      return (this.summoners[0].mmr + this.summoners[2].mmr + this.summoners[4].mmr + this.summoners[6].mmr + this.summoners[8].mmr)/5;
    },
    redMMR: function(){
      return (this.summoners[1].mmr + this.summoners[3].mmr + this.summoners[5].mmr + this.summoners[7].mmr + this.summoners[9].mmr)/5;
    }
  },
  methods: {
    // get a summoner profile with Summoner Name
    getSummoner: function(num){
      'use strict';
      if(vm.req[num]){
        fetch(vm.URL.SUMMONER + vm.req[num])
        .then(response => response.json())
        .then(function(json){
          console.log(json);
          let reslength = json.length;
          if(reslength){
            // select soloQ json
            let index = (json[0].queueType === "RANKED_SOLO_5x5")? 0:1;
            let tier = json[index].tier;
            let division = "";
            if(tier !== "CHALLENGER" && tier !== "GRANDMASTER" && tier !== "MASTER"){
              division = vm.restoreNumber(json[index].rank);
            }
            vm.summoners[num].tier = tier;
            vm.summoners[num].division = division;
            vm.summoners[num].name = json[index].summonerName;
            vm.summoners[num].lp = json[index].leaguePoints;
            vm.rankarmor[num] = vm.URL.TIER + tier + division + ".png";
            vm.summoners[num].mmr = vm.calcMMR(tier, division, vm.summoners[num].lp);
            vm.req[num] = null;

          } else {
            // 要素数0の配列 = Unranked
            if(reslength === 0){
              vm.summoners[num].name = vm.req[num];
              vm.summoners[num].tier = "UNRANKED";
              vm.summoners[num].division = null;
              vm.summoners[num].lp = null;
              vm.rankarmor[num] = vm.URL.TIER + "default.png";
              vm.summoners[num].mmr = vm.calcMMR(vm.summoners[num].tier, null, null);
              vm.req[num] = null;
            } else {
              // undefine = 存在しないサモナーネーム
              alert("サモナーネーム「" + vm.req[num] + "」は見つかりませんでした。");
              vm.summoners[num].name = null;
              vm.summoners[num].tier = null;
              vm.summoners[num].division = null;
              vm.summoners[num].lp = null;
              vm.rankarmor[num] = null;
              vm.summoners[num].mmr = null;
              vm.req[num] = null;
            }
          }
        })
        .catch(error => {
          console.log(error);
          alert("エラーが発生しました。");
        });
      } else {
        alert("サモナーネームを入力してください。");
      }
    },
    // チームを無条件でシャッフルする
    shuffleTeam: function(){
      let rnd = vm.createRandom();
      for(let i=0; i<10; i+=2){
        [vm.summoners[rnd[i]].name, vm.summoners[rnd[i+1]].name] = [vm.summoners[rnd[i+1]].name, vm.summoners[rnd[i]].name];
        [vm.summoners[rnd[i]].tier, vm.summoners[rnd[i+1]].tier] = [vm.summoners[rnd[i+1]].tier, vm.summoners[rnd[i]].tier];
        [vm.summoners[rnd[i]].division, vm.summoners[rnd[i+1]].division] = [vm.summoners[rnd[i+1]].division, vm.summoners[rnd[i]].division];
        [vm.summoners[rnd[i]].lp, vm.summoners[rnd[i+1]].lp] = [vm.summoners[rnd[i+1]].lp, vm.summoners[rnd[i]].lp];
        [vm.summoners[rnd[i]].mmr, vm.summoners[rnd[i+1]].mmr] = [vm.summoners[rnd[i+1]].mmr, vm.summoners[rnd[i]].mmr];
        [vm.rankarmor[rnd[i]], vm.rankarmor[rnd[i+1]]] = [vm.rankarmor[rnd[i+1]], vm.rankarmor[rnd[i]]];
      }
    },
    // チームをレートで分ける
    divideRate: function(){
      // なぜか失敗することがあるので、2回やる
      for(let n=0; n<2; n++){
        let suitable_team = [0, 0, 0, 0]; //最適チーム保存用変数
        let whole_ave = 0; //全体の平均
        let diff = Math.abs(vm.blueMMR - vm.redMMR); //差の一時保存用変数
        console.log("diff = " + diff);
        let test = 0;
        let kaisuu = 0;

        // 全体の平均値を求める
        vm.summoners.forEach(value => whole_ave += value.mmr);
        whole_ave /= 10;

        // 最適(最も全体平均に近い)チームの全探索
        for(let w=1; w<7; w++){
        	for(let x=w+1; x<8; x++){
          	for(let y=x+1; y<9; y++){
            	for(let z=y+1; z<10; z++){
              	let team_ave = (vm.summoners[0].mmr + vm.summoners[w].mmr + vm.summoners[x].mmr + vm.summoners[y].mmr + vm.summoners[z].mmr)/5;
                let _diff = Math.abs(whole_ave - team_ave); //全体平均とチーム平均の差
              	if(_diff < diff){
                	diff = _diff;
                  suitable_team = [w, x, y, z]; //差が少なければチームを保存
                  test = team_ave;
                  console.log(++kaisuu + "回目の平均値更新 | team_ave : " + team_ave);
                  console.log("その時のdiff = " + diff);
                }
              }
            }
          }
        }
        console.log("whole_abe : "+whole_ave+" | team_ave : "+test);

        // テーブル入れ替えの前処理
        for(let t=1; t<4; t++){
          if(suitable_team[t] == t*2) suitable_team[t] = suitable_team[t-1];
        }
        // 入れ替え
        for(let i=2,j=0; i<10; i+=2,j++){
          [vm.summoners[i].name, vm.summoners[suitable_team[j]].name] = [vm.summoners[suitable_team[j]].name, vm.summoners[i].name];
          [vm.summoners[i].tier, vm.summoners[suitable_team[j]].tier] = [vm.summoners[suitable_team[j]].tier, vm.summoners[i].tier];
          [vm.summoners[i].division, vm.summoners[suitable_team[j]].division] = [vm.summoners[suitable_team[j]].division, vm.summoners[i].division];
          [vm.summoners[i].lp, vm.summoners[suitable_team[j]].lp] = [vm.summoners[suitable_team[j]].lp, vm.summoners[i].lp];
          [vm.summoners[i].mmr, vm.summoners[suitable_team[j]].mmr] = [vm.summoners[suitable_team[j]].mmr, vm.summoners[i].mmr];
          [vm.rankarmor[i], vm.rankarmor[suitable_team[j]]] = [vm.rankarmor[suitable_team[j]], vm.rankarmor[i]];
        }
      }
    },

/*-----------------------------------------------------------------------------*/

    // 0〜9のランダム生成
    createRandom: function(){
      let arr=[0,1,2,3,4,5,6,7,8,9];
      let len=arr.length;
      while (len) {
        let i = Math.floor( Math.random() * len );
        let j = arr[--len];
        arr[len] = arr[i];
        arr[i] = j;
      }
      return arr;
    },
    // "III" -> 3
    restoreNumber: function(roman) {
      switch(roman){
        case 'I': return 1;
        case 'II': return 2;
        case 'III': return 3;
        case 'IV': return 4;
        default: return null;
      }
    },
    // MMRを計算する
    calcMMR: function(tier, div, lp) {
      switch(tier){
        case 'IRON': return 400 + (4-div)*100 + lp;
        case 'BRONZE': return 800 + (4-div)*100 + lp;
        case 'SILVER': return 1200 + (4-div)*60 + lp;
        case 'GOLD': return 1400 + (4-div)*60 + lp;
        case 'PLATINUM': return 1700 + (4-div)*70 + lp;
        case 'DIAMOND': return 2100 + (4-div)*100 + lp;
        case 'MASTER': return 2500 + lp;
        case 'GRANDMASTER': return 2500 + lp;
        case 'CHALLENGER': return 2500 + lp;
        default: return 1000;
      }
    },
    // debug用関数
    debugFunc: function(){
      vm.req[0] = "BC WayNyaaky";
      vm.getSummoner(0);
      vm.req[1] = "sefuji";
      vm.getSummoner(1);
      vm.req[2] = "kkjr";
      vm.getSummoner(2);
      vm.req[3] = "プリパラ";
      vm.getSummoner(3);
      vm.req[4] = "Candy Magic";
      vm.getSummoner(4);
      vm.req[5] = "THUNDERSTORM";
      vm.getSummoner(5);
      vm.req[6] = "RAINSTORM";
      vm.getSummoner(6);
      vm.req[7] = "UuuEee";
      vm.getSummoner(7);
      vm.req[8] = "横おつ";
      vm.getSummoner(8);
      vm.req[9] = "ve1sas";
      vm.getSummoner(9);
    }
  }
});
