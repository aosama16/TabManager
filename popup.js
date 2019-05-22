window.addEventListener("load", function () {
  let tabsDiv = document.getElementById('opentabs');
  let currentSession;
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    currentSession = tabs;
    for (tab of tabs) {
      let item = document.createElement('div');

      let title = document.createTextNode(tab.title);
      let url = document.createElement('a');
      url.appendChild(title);
      url.href = tab.url;
      url.onclick = () => chrome.tabs.create({ active: true, url: url.href });

      let image = document.createElement('img');
      if (tab.favIconUrl == undefined) {
        tab.favIconUrl = 'images/no-favicon.png';
      }
      image.src = tab.favIconUrl;
      image.className = 'favicon'
      image.onerror = () => image.src = 'images/no-favicon.png';

      item.appendChild(image);
      item.appendChild(url);

      tabsDiv.appendChild(item);
    }
  });
  function updateTabs() {
    
  }

  function executeAsynchronously(functions, timeout) {
    for (var i = 0; i < functions.length; i++) {
      setTimeout(functions[i], timeout);
    }
  }

  let saveSessionBtn = document.getElementById('saveSession');
  saveSessionBtn.onclick = () => {
    let defaultData = {
      groups: []
    }
    chrome.storage.local.get({ 'sessions': defaultData }, (data) => {
      data = data.sessions;

      let group = {
        tag: "",
        description: "",
        tabs: []
      }

      let currentDate = new Date();
      let time = currentDate.toLocaleString([], { hour: '2-digit', minute: '2-digit' });
      currentDate = currentDate.getDate() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getFullYear() + " " + time;
      for (tab of currentSession) {
        let savedTab = {
          title: tab.title,
          url: tab.url,
          date: currentDate,
          favicon: tab.favIconUrl,
          starred: false,
          note: ""
        }
        group.tabs.push(savedTab);
      }

      data.groups.push(group);
      chrome.storage.local.set({ 'sessions': data });
    });
  }

  let saveSessionCloseBtn = document.getElementById('saveSessionClose');
  saveSessionCloseBtn.onclick = () => {
    let defaultData = {
      groups: []
    }
    chrome.storage.local.get({ 'sessions': defaultData }, (data) => {
      data = data.sessions;

      let group = {
        tag: "",
        description: "",
        tabs: []
      }

      let currentDate = new Date();
      let time = currentDate.toLocaleString([], { hour: '2-digit', minute: '2-digit' });
      currentDate = currentDate.getDate() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getFullYear() + " " + time;
      for (tab of currentSession) {
        let savedTab = {
          title: tab.title,
          url: tab.url,
          date: currentDate,
          favicon: tab.favIconUrl,
          starred: false,
          note: ""
        }
        group.tabs.push(savedTab);
      }

      data.groups.push(group);
      chrome.storage.local.set({ 'sessions': data });
      chrome.tabs.create({ active: true, url: chrome.runtime.getURL('sessions.html') });
      for (tab of currentSession) {
        chrome.tabs.remove(tab.id);
      }
    });
  }

  let openSessionsBtn = document.getElementById('openSession');
  openSessionsBtn.onclick = () => chrome.tabs.create({ active: true, url: chrome.runtime.getURL('sessions.html') });
});