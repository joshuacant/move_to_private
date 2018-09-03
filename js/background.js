"use strict";
const kTST_ID = 'treestyletab@piro.sakura.ne.jp';
const ext_ID = 'tst-open_in_private@dontpokebadgers.com';
let closeExistingTab = true;
let removeFromHistory = false;
let registrationStatus = false;

window.addEventListener('DOMContentLoaded', async () => {
    const initalizingOptions = await browser.storage.local.get();
    loadOptions(initalizingOptions);
    let registrationTimeout = 0;
    while (registrationStatus === false && registrationTimeout < 10000) {
        console.log("registering tst-open_in_private");
        await timeout(registrationTimeout);
        await registerToTST();
        registrationTimeout = registrationTimeout + 1000;
    }
    browser.storage.onChanged.addListener(reloadOptions);
    browser.runtime.onMessageExternal.addListener(onMessageExternal);
});

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function onMessageExternal(aMessage, aSender) {
    if (aSender.id === kTST_ID) {
      //console.log(aMessage.type)
      switch (aMessage.type) {
        case 'ready':
          //console.log("re-registering");
          registerToTST();
          break;
        case 'fake-contextMenu-click':
          //console.log("menu item clicked " + aMessage.info.menuItemId);
          toPrivateWindow(aMessage.tab);
          break;
      }
  }
};

async function registerToTST() {
    try {
        const self = await browser.management.getSelf();
        let success = await browser.runtime.sendMessage(kTST_ID, {
            type: 'register-self',
            name: self.id,
            listeningTypes: ['fake-contextMenu-click', 'tabbar-clicked', 'ready'],
        });
        console.log("tst-open_in_private registration successful");
        registrationStatus = true;
        await addPrivateMenuItem();
        return true;
    }
    catch (ex) {
        console.log("tst-open_in_private registration failed with " + ex);
        return false;
    }
}

async function loadOptions(options) {
  if (Object.keys(options).length == 0) {
    //console.log("no options");
    createOptions();
  }
  else {
    closeExistingTab = options.closeExistingTab;
    //console.log(options);
  }
}

async function reloadOptions(options) {
  closeExistingTab = options.closeExistingTab.newValue;
  //console.log(options);
}

async function createOptions() {
  browser.storage.local.set({
    closeExistingTab: closeExistingTab
  });
  //console.log("creating default options");
  let reloadingOptions = browser.storage.local.get();
  reloadingOptions.then(loadOptions);
}

async function addPrivateMenuItem() {
  await browser.runtime.sendMessage(kTST_ID, {
    type: 'fake-contextMenu-remove-all'
  });
  let id = 1;
  let type = 'normal';
  let title = 'Open Tab in Private Window';
  let parentId = null;
  let params = {id, type, title, contexts: ['tab']};
  await browser.runtime.sendMessage(kTST_ID, {
    type: 'fake-contextMenu-create',
    params
  });
}

function toPrivateWindow(tab) {
  if (!tab.url.startsWith('http')) { return; }
  browser.windows.create({"url":tab.url, "incognito":true});
  if (closeExistingTab) {
    browser.tabs.remove(tab.id);
  }
  if (removeFromHistory) {
    browser.history.deleteUrl({"url": tab.url});
  }
}
