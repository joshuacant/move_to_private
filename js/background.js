"use strict";
let closeExistingTab = true;
let removeFromHistory = false;

window.addEventListener('DOMContentLoaded', async () => {
    const initalizingOptions = await browser.storage.local.get();
    loadOptions(initalizingOptions);
    await addPrivateMenuItem();
    browser.storage.onChanged.addListener(reloadOptions);
    browser.menus.onClicked.addListener(toPrivateWindow);
});

async function loadOptions(options) {
  if (Object.keys(options).length == 0) {
    //console.log("no options");
    createOptions();
  }
  else {
    closeExistingTab = options.closeExistingTab;
    removeFromHistory = options.removeFromHistory;
    //console.log(options);
  }
}

async function reloadOptions(options) {
  closeExistingTab = options.closeExistingTab.newValue;
  removeFromHistory = options.removeFromHistory.newValue;
  //console.log(options);
}

async function createOptions() {
  browser.storage.local.set({
    closeExistingTab: closeExistingTab,
    removeFromHistory: removeFromHistory
  });
  //console.log("creating default options");
  let reloadingOptions = browser.storage.local.get();
  reloadingOptions.then(loadOptions);
}

async function addPrivateMenuItem() {
  await browser.menus.removeAll();
  let id = "1";
  let type = 'normal';
  let title = 'Open Tab in Private Window';
  let parentId = null;
  await browser.menus.create({
    id: id, 
    type: type, 
    title: title, 
    contexts: ['tab']
    });
}

function toPrivateWindow(info,tab) {
  if (!tab.url.startsWith('http')) { return; }
  browser.windows.create({"url":tab.url, "incognito":true});
  if (closeExistingTab) {
    browser.tabs.remove(tab.id);
  }
  if (removeFromHistory) {
    browser.history.deleteUrl({"url": tab.url});
  }
}
