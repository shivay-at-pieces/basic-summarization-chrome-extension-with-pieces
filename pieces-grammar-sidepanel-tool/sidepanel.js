document.addEventListener('DOMContentLoaded', function() {
    const chatContainer = document.getElementById('chatContainer');
    const textInput = document.getElementById('textInput');
    const submitButton = document.getElementById('submitButton');

    function addMessageToChat(message, isUser) {
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        messageElement.style.marginBottom = '10px';
        messageElement.style.padding = '5px';
        messageElement.style.borderRadius = '5px';
        messageElement.style.maxWidth = '80%';
        messageElement.style.alignSelf = isUser ? 'flex-end' : 'flex-start';
        messageElement.style.backgroundColor = isUser ? '#e6f2ff' : '#f0f0f0';
        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    submitButton.addEventListener('click', function() {
        const text = textInput.value.trim();
        if (text) {
            addMessageToChat(text, true);
            chrome.runtime.sendMessage({action: "correctGrammar", text: text}, function(response) {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError.message);
                }
            });
            textInput.value = '';
        }
    });

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === "updateSidePanel") {
            addMessageToChat(request.correction, false);
        }
    });
});