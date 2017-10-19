const kTST_ID = 'treestyletab@piro.sakura.ne.jp';
const ext_ID = 'tst-open_in_private@dontpokebadgers.com'
var closeExistingTab = true;
var removeFromHistory = false;

function initialRegisterToTST() {
  setTimeout(registerToTST, 3000);
}

async function registerToTST() {
  var success = await browser.runtime.sendMessage(kTST_ID, {
    type: 'register-self',
    name: ext_ID,
    //style: '.tab {color: red;}'
  })
//  if (!success) {
//    console.log(ext_ID+" unable to register.");
//    }
//  else {
//    console.log(ext_ID+" registered sucessfully.");
//  }
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
  var reloadingOptions = browser.storage.local.get();
  reloadingOptions.then(loadOptions);
}

async function addPrivateMenuItem() {
  await browser.runtime.sendMessage(kTST_ID, {
    type: 'fake-contextMenu-remove-all'
  });
  var id = 1;
  var type = 'normal';
  var title = 'Open Tab in Private Mode';
  var parentId = null;
  let params = {id, type, title, contexts: ['tab']};
  await browser.runtime.sendMessage(kTST_ID, {
    type: 'fake-contextMenu-create',
    params
  });
}

function makePrivate(tab) {
  if (!tab.url.startsWith('http')) { return; }
  browser.windows.create({"url":tab.url, "incognito":true});
  if (closeExistingTab) {
    browser.tabs.remove(tab.id);
  }
  if (removeFromHistory) {
    browser.history.deleteUrl({"url": tab.url});
  }
}

initialRegisterToTST();
var initalizingOptions = browser.storage.local.get();
initalizingOptions.then(loadOptions);
browser.storage.onChanged.addListener(reloadOptions);
addPrivateMenuItem();
browser.runtime.onMessageExternal.addListener((aMessage, aSender) => {
//  var refreshingOptions = browser.storage.local.get();
//  refreshingOptions.then(loadOptions);
  switch (aSender.id) {
    case kTST_ID:
      //console.log(aMessage.type)
      switch (aMessage.type) {
        case 'ready':
          //console.log("re-registering");
          registerToTST();
          break;
        case 'fake-contextMenu-click':
          //console.log("menu item clicked " + aMessage.info.menuItemId);
          makePrivate(aMessage.tab);
          break;
      }
      break;
  }
});

//var success = await browser.runtime.sendMessage(kTST_ID, {
//  type: 'unregister-self'
//});
