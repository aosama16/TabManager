// Tab structure {title, url, date, starred, note}
let app = new Vue({
  el: '#app',
  data: {tabs:[{id: "", title: "", url: ""}]},
  mounted(){
    this.tabs.pop(); // pops default data
    Utils.queryTabs({ currentWindow: true }).then((tabs) => {
      for(tab of tabs){
        this.tabs.push({id: tab.id, title: tab.title, url: tab.url});
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
        for (tab of this.tabs) 
          group.tabs.push(Utils.createTab(tab.title, tab.url, Utils.getCurrentDate()));
        state.groups.push(group);
      
        Utils.setState(state);
      },

      openManagerPage(){
        chrome.tabs.create({ active: true, url: chrome.runtime.getURL('sessions.html') });
      },

      async saveCloseSession(){
        await this.addCurrentSession();
        this.openManagerPage();
        for (tab of this.tabs) {
          chrome.tabs.remove(tab.id);
        }
      }
  }
});