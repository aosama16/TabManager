let tabsDiv = document.getElementById('opentabs');

chrome.tabs.query({currentWindow: true}, (tabs)=>{
  for(tab of tabs){
    let item = document.createElement('div');

    let title = document.createTextNode(tab.title);
    let url = document.createElement('a');
    url.appendChild(title);
    url.href = tab.url;
    url.onclick = () => chrome.tabs.create({ active: true, url: url.href });

    let image = document.createElement('img');
    image.src = tab.favIconUrl;
    image.className = 'favicon'

    item.appendChild(image);
    item.appendChild(url);

    tabsDiv.appendChild(item);
  }
});