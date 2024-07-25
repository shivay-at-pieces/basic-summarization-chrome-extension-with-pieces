// chrome.runtime.onInstalled.addListener(function() {
//     chrome.contextMenus.create({
//         id: "summarizeText",
//         title: "Summarize selected text",
//         contexts: ["selection"]
//     });
// });

// chrome.contextMenus.onClicked.addListener(function(info, tab) {
//     if (info.menuItemId === "summarizeText") {
//         try {
//             chrome.tabs.sendMessage(tab.id, {action: "summarizeText"}, function(response) {
//                 if (chrome.runtime.lastError) {
//                     console.error(chrome.runtime.lastError.message);
//                 }
//             });
//         } catch (error) {
//             console.error("Error sending message:", error);
//         }
//     }
// });

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     if (message.action === "displaySummary") {
//         try {
//             chrome.runtime.sendMessage({action: "updatePopup", summary: message.summary}, function(response) {
//                 if (chrome.runtime.lastError) {
//                     console.error(chrome.runtime.lastError.message);
//                 }
//             });
//         } catch (error) {
//             console.error("Error sending message:", error);
//         }
//     }
//     return true;
// });


chrome.runtime.onInstalled.addListener(function() {
    chrome.contextMenus.create({
        id: "summarizeText",
        title: "Summarize selected text",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === "summarizeText") {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {action: "summarizeText"}, function(response) {
                    if (chrome.runtime.lastError) {
                        console.error("Error sending message:", chrome.runtime.lastError.message);
                    }
                });
            } else {
                console.error("No active tab found");
            }
        });
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "displaySummary") {
        chrome.runtime.sendMessage({action: "updatePopup", summary: message.summary}, function(response) {
            if (chrome.runtime.lastError) {
                console.error("Error sending message:", chrome.runtime.lastError.message);
            }
        });
    }
    return true;
});