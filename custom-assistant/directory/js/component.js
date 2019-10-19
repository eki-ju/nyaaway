Vue.component('hero-header', {
  data: function(){
    return{
      menuActive:false,
    }
  },
  methods: {
    menuToggle(){
      this.menuActive = !this.menuActive;
    }
  },
  template: `
  <div class="hero-head">
    <nav class="navbar">
      <div class="container">
        <div class="navbar-brand">
          <a class="navbar-item" href="../">
            <img src="../img/logo.png" alt="Logo">
          </a>
          <span class="navbar-burger burger" v-bind:class="{ 'is-active': menuActive }" v-on:click="menuToggle()"　data-target="navbarMenuHeroA">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </div>
        <div id="navbarMenuHeroA" class="navbar-menu" v-bind:class="{ 'is-active': menuActive }">
          <div class="navbar-end">
            <a class="navbar-item" href="../">
              Home
            </a>
            <a class="navbar-item" href="../ca/">
              Custom Assistant
            </a>
            <a class="navbar-item  is-active">
              LoL人物名鑑
            </a>
            <a class="navbar-item" href="../tantei/">
              LoL探偵
            </a>
            <a class="navbar-item" href="../keisatsu/">
              LoL警察
            </a>
          </div>
        </div>
      </div>
    </nav>
  </div>
  `
});
Vue.component("hero-footer", {
  template: `
  <div class="hero-foot">
    <nav class="tabs">
      <div class="container">
        <ul>
        <li><a href="https://twitter.com/nyaaway" target="_blank">Twitter</a></li>
        <li><a href="https://qiita.com/nyaaway" target="_blank">Qiita</a></li>
        <li><a href="http://jp.op.gg/summoner/userName=%CF%80%CF%86%CF%89%CF%86%CF%80%E3%81%AB%E3%82%83%E3%83%BC%E3%83%BD%CE%B8%CE%B5%CE%B8%E3%83%8E%E3%81%86%E3%81%87%E3%81%84" target="_blank">OP.GG</a></li>
        </ul>
      </div>
    </nav>
  </div>
  `
});
