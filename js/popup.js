// Tab structure {title, url, date, starred, note}
let app = new Vue({
  el: '#app',
  data: {
    openedTabs:[],
    state: Utils.defaultEmptyState.state
  },
  mounted(){
    // Get opened tabs
    Utils.queryTabs({ currentWindow: true }).then((tabs) => {
      for(tab of tabs){
        this.openedTabs.push({id: tab.id, title: tab.title, url: tab.url});
      }
    });

    // Get state
    Utils.getState().then((state) => {
      if (state){
          this.state = state;
      }
    });
  },
  methods:{
      getFavicon(tab){
          if(!tab.url)
              return ""
          return `https://www.google.com/s2/favicons?domain=${new URL(tab.url).hostname}`;
      },

      async addCurrentSession() {
        let state = await Utils.getState();
        if(!state)
          state = Utils.defaultEmptyState.state;

        let group = Utils.createGroup(Utils.getCurrentDate());
        for (tab of this.openedTabs) 
          group.tabs.push(Utils.createTab((tab.title || 'Untitled'), tab.url, Utils.getCurrentDate()));
          
        state.groups.unshift(group);
        Utils.setState(state);

        M.toast({html: 'Session saved!', classes: 'rounded'})
      },

      openManagerPage(){
        chrome.tabs.create({ active: true, url: chrome.runtime.getURL('sessions.html') });
      },

      async saveCloseSession(){
        await this.addCurrentSession();
        this.openManagerPage();
        for (tab of this.openedTabs) {
          chrome.tabs.remove(tab.id);
        }
      }
  },
  computed:{
    starredTabs(){
      let starredTabs = [];
      for(group of this.state.groups){
        let starred = group.tabs.filter(tab => tab.starred == true);
        starredTabs = starredTabs.concat(starred);
      }
      return starredTabs;
    }
  }
});