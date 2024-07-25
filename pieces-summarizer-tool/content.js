import { PiecesClient } from 'pieces-copilot-sdk';

const piecesClient = new PiecesClient({ baseUrl: 'http://localhost:1000' }); // Use appropriate base URL

// async function summarizeText(text) {
//     try {
//         const conversation = await piecesClient.createConversation({
//             name: "Text Summarization",
//             firstMessage: `Please summarize the following text: ${text}`
//         });
        
//         const summary = conversation.answer.text;
//         chrome.runtime.sendMessage({action: "displaySummary", summary: summary});
//     } catch (error) {
//         console.error('Error summarizing text:', error);
//         chrome.runtime.sendMessage({action: "displaySummary", summary: 'Error occurred while summarizing text.'});
//     }
// }
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

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "summarizeText") {
        summarizeText(window.getSelection().toString().trim());
    }
});

