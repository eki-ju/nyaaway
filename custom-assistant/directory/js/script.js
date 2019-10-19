var vm = new Vue({
  el: "#app",
  data: {
    users: {
      streamer: null,
      pro: null
    }
  },
  created: function() {
    fetch('./json/streamer.json')
    .then(response => response.json())
    .then(function(json){
      console.log(json);
      vm.$set(vm.users, "streamer", json.streamer);
      vm.$set(vm.users, "pro", json.pro);
      console.log(vm.users.streamer);
      console.log(vm.users.pro);
    })
    .catch(error => {
      console.log(error);
    });
  },
  computed: {
  },
  methods: {
  }
});
