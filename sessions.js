let app = new Vue({
    el: '#app',
    data: {
        state:{
            groups:[{
                title: "",
                description: "",
                id: "",
                tabs: [{
                        id: "",
                        date: "",
                        title: "",
                        url: ""
                    }],
                tag: ""
            }]
        }
    },
    mounted(){
        chrome.storage.local.get(['state'], (data) => { 
            if(Object.keys(data).length > 0) 
                this.state = data.state; 
        });
    },
    methods:{
        getFavicon(tab){
            if(tab.url)
                return `https://www.google.com/s2/favicons?domain=${new URL(tab.url).hostname}`;
            else
                return ""
        }
    }
});
