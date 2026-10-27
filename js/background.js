"use strict";

async function _init() {
  const self = await browser.management.getSelf();
  console.log(self.id + " loading");

  await loadOptions(self);
  await addPrivateMenuItem();

  browser.storage.onChanged.addListener(reloadOptions);
  browser.menus.onClicked.addListener(toPrivateWindow);
}

let closeExistingTab = true;
let removeFromHistory = false;
async function loadOptions(self) {
  let options = await browser.storage.local.get();
  if (Object.keys(options).length == 0) {
    createOptions(self);
  }
  else {
    closeExistingTab = options.closeExistingTab;
    removeFromHistory = options.removeFromHistory;
  }
}

async function reloadOptions(options) {
  closeExistingTab = options.closeExistingTab.newValue;
  removeFromHistory = options.removeFromHistory.newValue;
}

async function createOptions(self) {
  console.log(self.id + " creating options");
  await browser.storage.local.set({
    closeExistingTab: closeExistingTab,
    removeFromHistory: removeFromHistory
  });
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

function toPrivateWindow(info, tab) {
  if (!tab.url.startsWith('http')) { return; }
  browser.windows.create({ "url": tab.url, "incognito": true });
  if (closeExistingTab) {
    browser.tabs.remove(tab.id);
  }
  if (removeFromHistory) {
    browser.history.deleteUrl({ "url": tab.url });
  }
}

_init();
