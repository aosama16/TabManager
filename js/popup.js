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
          // return `https://api.faviconkit.com/${new URL(tab.url).hostname}/144`;
      },

      async addCurrentSession() {
        // TODO find a better way to get the date
        let currentDate = new Date();
        let time = currentDate.toLocaleString([], { hour: '2-digit', minute: '2-digit' });
        currentDate = currentDate.getDate() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getFullYear() + " " + time;
        
        let state = await Utils.getState();
        if(!state)
          state = {groups: []};

        let group = Utils.createGroup(currentDate);
        for (tab of this.tabs) 
          group.tabs.push(Utils.createTab(tab.title, tab.url, currentDate));
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