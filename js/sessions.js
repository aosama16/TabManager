let app = new Vue({
    el: '#app',
    data: Utils.defaultEmptyState,
    mounted(){
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
            // return `https://api.faviconkit.com/${new URL(tab.url).hostname}/144`;
            },
        deleteTab(groupID, tabID){
            let groupIDX = this.state.groups.findIndex(group => group.id == groupID);
            targetGroup = this.state.groups[groupIDX];
            
            let tabIDX = targetGroup.tabs.findIndex(tab => tab.id == tabID);
            targetGroup.tabs.splice(tabIDX, 1);
            
            // Delete group if tabs are empty - MAY KEEP LATER if it is considere a collection
            if(targetGroup.tabs.length == 0)
                this.state.groups.splice(groupIDX, 1)
        },
        deleteGroup(groupID){
            let groupIDX = this.state.groups.findIndex(group => group.id == groupID);
            this.state.groups.splice(groupIDX, 1)
        }
    },
    watch: {
        state: {
          handler: function(state) {
            Utils.setState(this.state);
          },
          deep: true
        }
    },
    directives: {
        focus: { inserted: function (el) { el.focus() } }
    }
});