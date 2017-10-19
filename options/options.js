function loadOptions() {
  function setOptions(options) {
    //console.log(options);
    document.querySelector("#closeExistingTab").checked = options.closeExistingTab;
    document.querySelector("#removeFromHistory").checked = options.removeFromHistory;

  }
  var getting = browser.storage.local.get();
  getting.then(setOptions, onError);
}

function saveOptions(e) {
  e.preventDefault();
  var closeExistingTab = document.querySelector("#closeExistingTab").checked;
  var removeFromHistory = document.querySelector("#removeFromHistory").checked;
  browser.storage.local.set({
    closeExistingTab: closeExistingTab,
    removeFromHistory: removeFromHistory
  });
  loadOptions();
}

function onError(error) {
  console.log(`Error: ${error}`);
}

document.addEventListener("DOMContentLoaded", loadOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
