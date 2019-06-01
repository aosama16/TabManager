class Utils {
    static genID() { // UUIDv4
        return `${1e7}-${1e3}-${4e3}-${8e3}-${1e11}`.replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        )
    }
    
    static async getState() {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(['state'], (data) => {
                data = data.state;
                resolve(data);
            });
        });
    }

    static async setState(state) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.set({'state': state}, () => {
                resolve();
            });
        });
    }

    static async queryTabs(options){
        return new Promise((resolve, reject) => {
            chrome.tabs.query(options, (tabs) => {
                resolve(tabs);
            });
        });
    }

    static createGroup(date){
        return {
            id: Utils.genID(),
            title: `Session at ${date}`,
            date: date,
            tags: [],
            description: "description",
            tabs: []
        };
    }

    static createTab(title, url, date){
        return {
            id: Utils.genID(),
            title: title,
            url: url,
            date: date,
            starred: false,
            checked: false
        };
    }

    static getCurrentDate(){
        // TODO find a better way to get the date
        let currentDate = new Date();
        let time = currentDate.toLocaleString([], { hour: '2-digit', minute: '2-digit' });
        currentDate = currentDate.getDate() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getFullYear() + " " + time;
        return currentDate;
    }
}

Utils.defaultEmptyState = {
    state: {
        groups: [],
        archive: [],
        tags: []
    },
    merge:[],
    mergeTitle:'',
    updateGroupID: '',
    updateTagID: '',
    updateGroupDescription: '',
    movedID: '',
    inDrag: false,
    selectedTags: [],
    filter: ''
}