let app = new Vue({
  el: '#app',
  data: {
    options: {
      silentdelete : false,
      popupmenu: true
    }
  },
  mounted(){
    Utils.getOptions().then((options) => {
      if (options){
          this.options = options;
      }
    });
  },
  methods:{
      
  },
  watch: {
    options: {
      handler: function(options) {
        Utils.setOptions(this.options);
      },
      deep: true
    }
}
});