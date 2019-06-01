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
        starTab(groupID, tabID){
            let groupIDX = this.state.groups.findIndex(group => group.id == groupID);
            targetGroup = this.state.groups[groupIDX];
            
            let tabIDX = targetGroup.tabs.findIndex(tab => tab.id == tabID);
            let tab = targetGroup.tabs[tabIDX];

            tab.starred = !tab.starred;
        },
        deleteTab(groupID, tabID){
            if(confirm("Do you really want to delete this tab?")){
                let groupIDX = this.state.groups.findIndex(group => group.id == groupID);
                targetGroup = this.state.groups[groupIDX];
                
                let tabIDX = targetGroup.tabs.findIndex(tab => tab.id == tabID);
                targetGroup.tabs.splice(tabIDX, 1);
            }
        },
        deleteGroup(groupID){
            if(confirm("Do you really want to delete this group?")){
                let groupIDX = this.state.groups.findIndex(group => group.id == groupID);
                this.state.groups.splice(groupIDX, 1);
            }
        },
        openAlltabs(groupID){
            let groupIDX = this.state.groups.findIndex(group => group.id == groupID);
            for(tab of this.state.groups[groupIDX].tabs)
                chrome.tabs.create({url: tab.url});
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
        },
        addToMerge(groupID){
            if(this.merge.includes(groupID)){
                let groupIDX = this.merge.findIndex(id => id == groupID);
                this.merge.splice(groupIDX, 1);
            }
            else{
                this.merge.push(groupID);
            }
        },
        mergeGroups(){
            let groups = [];
            for(groupID of this.merge){
                let groupIDX = this.state.groups.findIndex(group => group.id == groupID);
                groups.push(this.state.groups.splice(groupIDX, 1)[0]);
            }
            let mergedTabs = [];
            let mergedTags = [];
            for(group of groups){
                mergedTabs = mergedTabs.concat(group.tabs);
                mergedTags = mergedTags.concat(group.tags);
            }
            this.state.groups.push({
                id: Utils.genID(),
                title: this.mergeTitle || groups[0].title,
                date: Utils.getCurrentDate(),
                tags: mergedTags,
                description: "",
                tabs: mergedTabs
            });
            this.merge = [];
            this.mergeTitle = '';
        },
        addTag(event){
            this.state.tags.push({
                id: Utils.genID(),
                title: event.target.value
            });
            event.target.value = '';
        },
        showTagMenu(event){
            let openedMenu = event.target.nextElementSibling.classList.contains('show');

            let allElements = Array.from(document.querySelectorAll('.show'))
            for (let element of allElements) {
                element.classList.remove('show')
            }
            if(openedMenu == false){
                event.target.nextElementSibling.classList.add('show');
                event.target.nextElementSibling.focus();
            }
        },
        hideDropdown(event){
            event.target.classList.remove('show')
        },
        toggleTagInGroup(groupID, tagID){
            let groupIDX = this.state.groups.findIndex(group => group.id == groupID);
            let groupTags = this.state.groups[groupIDX].tags;

            if(groupTags.includes(tagID)){
                let tagIDX = groupTags.findIndex(tag => tag == tagID);
                groupTags.splice(tagIDX, 1);
            }else{
                groupTags.push(tagID);
            }
        },
        clearSelectedTags(){
            this.selectedTags = [];
        },
        addToSelectedTags(tagID){
            this.clearSelectedTags();
            this.selectedTags.push(tagID);
        },
        deleteTag(tagID){
            let tagIDX = this.state.tags.findIndex(tag => tag.id == tagID);
            this.state.tags.splice(tagIDX, 1);

            for(group of this.state.groups){
                if(group.tags.includes(tagID)){
                    tagIDX = group.tags.findIndex(tag => tag == tagID);
                    group.tags.splice(tagIDX, 1);
                }
            }
        }
    },
    computed: {
        tabsNumber(){
            let sum = 0;
            for(group of this.state.groups){
                sum += group.tabs.length;
            }
            return sum;
        },
        filteredGroups(){
            if(this.selectedTags.length == 0)
                return this.state.groups

            let filtered = this.state.groups.filter(group => {
                for(tag of this.selectedTags){
                    if(group.tags.includes(tag)) 
                        return true;
                }
                return false;
            });
            return filtered;
        },
        selectedTag(){
            let tagID = this.selectedTags[0];
            let tagIDX = this.state.tags.findIndex(tag => tag.id == tagID);
            return this.state.tags[tagIDX].title;
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