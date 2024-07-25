chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "updatePopup") {
        document.getElementById('summaryContent').textContent = request.summary;
    }
});