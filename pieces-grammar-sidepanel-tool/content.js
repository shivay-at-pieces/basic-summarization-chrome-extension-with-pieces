console.log("Content script loading...");
import { PiecesClient } from 'pieces-copilot-sdk';

const piecesClient = new PiecesClient({ baseUrl: 'http://localhost:1000' });

function initializeContentScript() {
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        console.log("Message received in content script:", request);
        if (request.action === "summarizeText") {
            summarizeText(window.getSelection().toString().trim());
        } else if (request.action === "correctGrammar") {
            correctGrammar(request.text);
        }
        return true;  // Indicates that we will respond asynchronously
    });
    console.log("Content script initialized and ready to receive messages");
    // Notify the background script that the content script is ready
    chrome.runtime.sendMessage({action: "contentScriptReady"});
}

// Initialize the content script immediately
initializeContentScript();

async function summarizeText(text) {
    try {
        console.log("Sending request to PiecesClient with text:", text);
        const conversation = await piecesClient.createConversation({
            name: "Text Summarization",
            firstMessage: `Please summarize the following text: ${text}`
        });
        
        const summary = conversation.answer.text;
        console.log("Received summary:", summary);
        chrome.runtime.sendMessage({action: "displaySummary", summary: summary});
    } catch (error) {
        console.error('Error summarizing text:', error);
        chrome.runtime.sendMessage({action: "displaySummary", summary: 'Error occurred while summarizing text.'});
    }
}

async function correctGrammar(text) {
    try {
        console.log("Sending request to PiecesClient for grammar correction:", text);
        const conversation = await piecesClient.createConversation({
            name: "Grammar Correction",
            firstMessage: `Please correct the grammar in the following text: ${text}`
        });
        
        const correction = conversation.answer.text;
        console.log("Received correction:", correction);
        chrome.runtime.sendMessage({action: "displayCorrection", correction: correction});
    } catch (error) {
        console.error('Error correcting grammar:', error);
        chrome.runtime.sendMessage({action: "displayCorrection", correction: 'Error occurred while correcting grammar.'});
    }
}