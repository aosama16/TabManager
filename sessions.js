window.addEventListener("load", function () {
    let tabs = document.getElementById('sessions');

    let defaultData = {
        groups: []
    }
    chrome.storage.local.get({ 'sessions': defaultData }, (data) => {
        data = data.sessions;

        for (group of data.groups) {
            let groupDiv = document.createElement('div');
            let header = document.createElement('h2');
            header.appendChild(document.createTextNode(`Session - ${group.tabs.length} tabs`));
            groupDiv.appendChild(header);

            for (tab of group.tabs) {
                let item = document.createElement('div');

                let title = document.createTextNode(tab.title);
                let url = document.createElement('a');
                url.appendChild(title);
                url.href = tab.url;
                url.target = "_blank"

                let image = document.createElement('img');
                image.src = `https://www.google.com/s2/favicons?domain=${new URL(tab.url).hostname}`;
                image.className = 'favicon'
                image.onerror = () => image.src = 'images/no-favicon.png';

                item.appendChild(image);
                item.appendChild(url);

                groupDiv.appendChild(item);
            }
            tabs.appendChild(groupDiv);
        }
    });
});