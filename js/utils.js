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
            description: "",
            tabs: []
        };
    }

    static createTab(title, url, date){
        return {
            id: Utils.genID(),
            title: tab.title,
            url: tab.url,
            date: date
        };
    }
}

Utils.defaultEmptyState = {
    state: {
        groups: [{
            title: "",
            description: "",
            id: "",
            tags: [],
            date: "",
            tabs: [{
                id: "",
                date: "",
                title: "",
                url: ""
            }]
        }]
    },
    init: true
}