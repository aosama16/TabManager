let app = new Vue({
    el: '#app',
    data: Utils.defaultEmptyState,
    mounted(){
        this.getState();
        window.addEventListener("focus", this.getState);
    },
    methods:{
        getState(){
            Utils.getState().then((state) => {
                if (state){
                    this.state = state;
                }
            });
        },
        getFavicon(tab){
            if(!tab.url)
                return ""
            return `https://www.google.com/s2/favicons?domain=${new URL(tab.url).hostname}`;
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
        },
        saveID(event){
            this.movedID = event.item.attributes['data-id'].textContent;
            this.inDrag = true;
        },
        endDrag(){
            this.inDrag = false;
        },
        highlight(event){
            if(this.inDrag){
                event.target.style.background = 'rgba(0,128,128,0.2)';
                event.target.style.color = 'white';
            }
        },
        removeHighlight(event){
            event.target.style.background = '';
            event.target.style.color = '';
        },
        moveTab(event){
            var self = this; // Binding this to the function in set timout
            setTimeout(() => { // Set timout to let Vue Draggable finish its drop then process the data
                if(self.movedID == '')
                    return;
                let tabID = self.movedID;
                let groupID = event.target.attributes["data-id"].textContent;
                if(tabID && groupID){
                    let tab, fromGroup;
                    for(group of self.state.groups){
                        tab = group.tabs.find(tab => {return tab.id === tabID });
                        fromGroup = group
                        if(tab) break;
                    }
                    
                    if(group.id != groupID){
                        let SrcGroupIDX = self.state.groups.findIndex(g => g.id == fromGroup.id);
                        let SrcGroup = self.state.groups[SrcGroupIDX];
    
                        let DestGroupIDX = self.state.groups.findIndex(g => g.id == groupID);
                        let DestGroup = self.state.groups[DestGroupIDX];
                        
                        DestGroup.tabs.push(tab);
    
                        let tabIDX = SrcGroup.tabs.findIndex(t => t.id == tabID);
                        SrcGroup.tabs.splice(tabIDX, 1);
                    }
                }
                self.movedID = '';
                this.removeHighlight(event);
            }, 10);
        },
        scrollto(groupID){
            let el = document.querySelector(`.main [data-id='${groupID}']`);
            if(el)
                el.scrollIntoView(true);
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
        focus: { inserted: function (el) { el.focus(); }},
        resizable: {
            inserted: function (el) { el.style.width = `${el.value.length * 10}px` }, 
            update: function (el) { el.style.width = `${el.value.length * 10}px` }}
    }
});