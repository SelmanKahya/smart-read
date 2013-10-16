function getClickHandler() {
  return function(info, tab) {

    // construct a url pass data to the view
    var url = 'extractBook.html#' + info.linkUrl;

    // Create a new window to the info page.
    chrome.windows.create({ url: url, width: 900, height: 760 });
  };
};

chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    var optionString = localStorage["READIUM_OPTIONS"];
    var options = (optionString && JSON.parse(optionString) ) || {"singleton": {}};
    sendResponse(options["singleton"]);
  });

// create a context menu item
chrome.contextMenus.create({
  "title" : "Add to Readium Library",
  "type" : "normal",
  "contexts" : ["link"],
  "onclick" : getClickHandler()
});


