let app = new Vue({
    el: '#app',
    data: Utils.defaultEmptyState,
    mounted(){
        // Update state
        this.getState();

        // Update state when tab is in focus again
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
        deleteGroup(groupID, silent=false){
            if(silent || confirm("Do you really want to delete this group?")){
                let groupIDX = this.state.groups.findIndex(group => group.id == groupID);
                this.state.groups.splice(groupIDX, 1);
            }
        },
        openAlltabs(groupID){
            let groupIDX = this.state.groups.findIndex(group => group.id == groupID);
            for(tab of this.state.groups[groupIDX].tabs)
                chrome.tabs.create({url: tab.url});
        },
        // archiveGroup(groupID){
        //     let groupIDX = this.state.groups.findIndex(group => group.id == groupID);
        //     let archive = this.state.groups.splice(groupIDX, 1)[0];

        //     for(tab of archive.tabs){
        //         tab.starred = false;
        //     }

        //     this.state.archive.push(archive);
        // },
        saveID(event){
            this.movedID = event.item.attributes['data-id'].textContent;
            this.inDrag = true;
        },
        endDrag(){
            this.inDrag = false;
        },
        highlight(event){
            if(this.inDrag){
                event.target.style.background = '#546e7a';
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
        moveTabNewGroup(){
            var self = this; // Binding this to the function in set timout
            setTimeout(() => { // Set timout to let Vue Draggable finish its drop then process the data
                if(self.movedID == '')
                    return;
                let tabID = self.movedID;
                if(tabID){
                    let tab, fromGroup;
                    for(group of self.state.groups){
                        tab = group.tabs.find(tab => {return tab.id === tabID });
                        fromGroup = group
                        if(tab) break;
                    }
                    
                    let SrcGroupIDX = self.state.groups.findIndex(g => g.id == fromGroup.id);
                    let SrcGroup = self.state.groups[SrcGroupIDX];
                    let tabIDX = SrcGroup.tabs.findIndex(t => t.id == tabID);
                    SrcGroup.tabs.splice(tabIDX, 1);

                    let DestGroup = Utils.createGroup(Utils.getCurrentDate());
                    
                    DestGroup.tabs.push(tab);
                    this.state.groups.push(DestGroup);
                }
                self.movedID = '';
            }, 10);
        },
        scrollto(groupID){
            this.clearSelectedTags();
            setTimeout(() => { // Set timout to let filter finish then scroll
                let el = document.querySelector(`.main [data-id='${groupID}']`);
                if(el)
                    el.scrollIntoView(true);
            }, 10);
        },
        addToMerge(event, groupID){
            if(this.merge.includes(groupID)){
                event.target.textContent = 'SELECT';
                let groupIDX = this.merge.findIndex(id => id == groupID);
                this.merge.splice(groupIDX, 1);
            }
            else{
                event.target.textContent = 'UNSELECT';
                this.merge.push(groupID);
            }
        },
        cancelMergeSelection(){
            this.merge = [];
            let selectbtns = document.getElementsByClassName("selectbtn");
            for(btn of selectbtns){
                btn.textContent = 'SELECT';
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
            this.state.groups.unshift({
                id: Utils.genID(),
                title: this.mergeTitle || groups[0].title,
                date: Utils.getCurrentDate(),
                tags: mergedTags,
                description: "",
                tabs: mergedTabs,
                description: 'description'
            });
            this.merge = [];
            this.mergeTitle = '';
            let selectbtns = document.getElementsByClassName("selectbtn");
            for(btn of selectbtns){
                btn.textContent = 'SELECT';
            }
        },
        deleteSelectedGroups(){
            for(groupID of this.merge){
                this.deleteGroup(groupID, true)
            }

            this.merge = [];
            this.mergeTitle = '';

            let selectbtns = document.getElementsByClassName("selectbtn");
            for(btn of selectbtns){
                btn.textContent = 'SELECT';
            }
        },
        addTag(event){
            let tagTitle = event.target.value;
            if(this.state.tags.some(tag => tag.title.toLowerCase() == tagTitle.toLowerCase())){
                M.toast({html: 'Tag already exists!', classes: 'rounded'})
                event.target.value = '';
                return;
            }

            this.state.tags.push({
                id: Utils.genID(),
                title: tagTitle
            });
            event.target.value = '';
        },
        showTagMenu(event){
            let openedMenu = event.currentTarget.nextElementSibling.classList.contains('show');

            let allElements = Array.from(document.querySelectorAll('.show'))
            for (let element of allElements) {
                element.classList.remove('show')
            }
            if(openedMenu == false){
                event.currentTarget.nextElementSibling.classList.add('show');
                
                // Close dropdown when clicked away
                document.addEventListener("click", this.hideTagMenu);
            }
        },
        hideTagMenu(event){
            // If user clicks inside the element, do nothing
            if (event.target.closest(".dropdown")) return;
        
            // If user clicks outside the element, hide it!
            let allElements = Array.from(document.querySelectorAll('.show'))
            for (let element of allElements) {
                element.classList.remove('show')
            }
            document.removeEventListener("click", this.hideTagMenu);
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

            this.filter = '';
        },
        clearSearchText(){
            this.search = '';
        },
        addToSelectedTags(tagID){
            this.clearSelectedTags();
            this.selectedTags.push(tagID);

            this.filter = 'tags'
        },
        deleteTag(tagID){
            if(this.filter == 'tags'){
                this.filter = '';
                this.selectedTags = [];
            }
            
            let self = this;
            setTimeout(() => { // Set timout to let filter finish then scroll    
                let tagIDX = self.state.tags.findIndex(tag => tag.id == tagID);
                self.state.tags.splice(tagIDX, 1);

                for(group of self.state.groups){
                    if(group.tags.includes(tagID)){
                        tagIDX = group.tags.findIndex(tag => tag == tagID);
                        group.tags.splice(tagIDX, 1);
                    }
                }
            }, 10);
        },
        deleteEmptyGroups(){
            this.state.groups = this.state.groups.filter(group => group.tabs.length > 0);
        },
        createNewGroup(){
            this.state.groups.push(Utils.createGroup(Utils.getCurrentDate()));
        },
        // displayArchive(){
        //     this.filter = 'archive';
        // },
        filteredTabs(tabs){
            return tabs.filter(tab => tab.title.toLowerCase().includes(this.search.toLowerCase()));
        },
        checkTab(tab){
            tab.checked = true;
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
            if(this.filter == '')
                return this.state.groups
            
            if(this.filter == 'tags'){
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
            }
            // else if (this.filter == 'archive'){
            //     return this.state.archive;
            // }
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
            inserted: function (el) { el.style.width = `${(el.value.length * 12)+5}px` }, 
            update: function (el) { el.style.width = `${(el.value.length * 12)+5}px` }}
    }
});