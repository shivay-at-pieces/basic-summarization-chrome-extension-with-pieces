chrome.runtime.onInstalled.addListener(function() {
    chrome.contextMenus.create({
        id: "summarizeText",
        title: "Summarize selected text",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === "summarizeText") {
        chrome.tabs.sendMessage(tab.id, {action: "summarizeText"});
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "displaySummary") {
        chrome.sidePanel.open({tabId: sender.tab.id});
        chrome.runtime.sendMessage({action: "updateSidePanel", summary: message.summary});
    }
    return true;
});

let contentScriptReady = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "contentScriptReady") {
        contentScriptReady = true;
        console.log("Content script is ready");
    } else if (message.action === "correctGrammar") {
        if (contentScriptReady) {
            handleGrammarCorrection(message, sender);
        } else {
            console.log("Content script not ready, waiting...");
            setTimeout(() => handleGrammarCorrection(message, sender), 1000);
        }
    } else if (message.action === "displayCorrection") {
        chrome.runtime.sendMessage({action: "updateSidePanel", correction: message.correction});
    }
    return true;
});

function handleGrammarCorrection(message, sender) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs && tabs[0]) {
            if (tabs[0].url && tabs[0].url.startsWith("chrome://")) {
                chrome.runtime.sendMessage({action: "updateSidePanel", correction: "Error: Cannot correct grammar on chrome:// pages."});
                return;
            }
            chrome.tabs.sendMessage(tabs[0].id, {action: "correctGrammar", text: message.text}, function(response) {
                if (chrome.runtime.lastError) {
                    console.error("Error sending message to content script:", chrome.runtime.lastError.message);
                    // Inject the content script if it's not already there
                    chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        files: ['content.js']
                    }, function() {
                        if (chrome.runtime.lastError) {
                            console.error("Error injecting content script:", chrome.runtime.lastError.message);
                            chrome.runtime.sendMessage({action: "updateSidePanel", correction: "Error: Unable to inject content script."});
                        } else {
                            // Retry sending the message after injecting the content script
                            setTimeout(() => {
                                chrome.tabs.sendMessage(tabs[0].id, {action: "correctGrammar", text: message.text}, function(retryResponse) {
                                    if (chrome.runtime.lastError) {
                                        console.error("Retry failed:", chrome.runtime.lastError.message);
                                        chrome.runtime.sendMessage({action: "updateSidePanel", correction: "Error: Unable to process request after retry."});
                                    }
                                });
                            }, 1000); // 1 second delay
                        }
                    });
                }
            });
        } else {
            console.error("No active tab found");
            chrome.runtime.sendMessage({action: "updateSidePanel", correction: "Error: No active tab found."});
        }
    });
}