// Application State
let messages = [];
let conversationHistory = [];
let isLoading = false;

// DOM Elements
const welcomeScreen     = document.querySelector('.welcome-screen-chat');
const messagesContainer = document.getElementById('messagesContainer');
const loadingIndicator  = document.getElementById('loadingIndicator');
const messagesEnd       = document.getElementById('messagesEnd');
const clearBtn          = document.getElementById('clearBtn');
const chatForm          = document.getElementById('chatForm');
const messageInput      = document.getElementById('messageInput');
const sendButton        = document.getElementById('sendButton');
const sendIcon          = document.getElementById('sendIcon');
const loadingSpinner    = document.getElementById('loadingSpinner');

document.addEventListener('DOMContentLoaded', function () {
    setupEventListeners();
    updateSendButton();
});

function setupEventListeners() {
    chatForm.addEventListener('submit', handleSubmit);
    clearBtn.addEventListener('click', clearChat);
    messageInput.addEventListener('input', handleInputChange);
    messageInput.addEventListener('keydown', handleKeyDown);
}

function handleSubmit(e) {
    e.preventDefault();
    const content = messageInput.value.trim();
    if (!content || isLoading) return;
    sendMessage(content);
}

function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
}

function handleInputChange() { autoResizeTextarea(); updateSendButton(); }

function autoResizeTextarea() {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 128) + 'px';
}

function updateSendButton() {
    sendButton.disabled = !messageInput.value.trim().length || isLoading;
}

async function sendMessage(content) {
    const userMessage = { id: Date.now().toString(), content, type: 'user', timestamp: new Date() };
    messages.push(userMessage);
    displayMessage(userMessage);
    messageInput.value = '';
    messageInput.style.height = 'auto';
    hideWelcomeScreen();
    showClearButton();
    setLoadingState(true);
    conversationHistory.push({ role: 'user', content });

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: content,
                history: conversationHistory.slice(0, -1),
            }),
        });

        const data = await response.json();
        const isError = !data.reply || data.reply.startsWith('Error:') || data.reply.startsWith('System Error:');

        const aiMessage = {
            id: (Date.now() + 1).toString(),
            content: data.reply || 'No response received.',
            type: 'ai',
            timestamp: new Date(),
            isError,
        };
        messages.push(aiMessage);
        displayMessage(aiMessage);

        if (!isError) {
            conversationHistory.push({ role: 'assistant', content: data.reply });
        } else {
            conversationHistory.pop();
        }
    } catch (error) {
        conversationHistory.pop();
        displayMessage({
            id: (Date.now() + 1).toString(),
            content: 'Error: ' + error.message,
            type: 'ai',
            timestamp: new Date(),
            isError: true,
        });
    } finally {
        setLoadingState(false);
    }
}

function displayMessage(message) {
    const el = document.createElement('div');
    el.className = 'message ' + message.type;
    const time = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const avatarIcon = message.type === 'user'
        ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
        : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/><circle cx="12" cy="16" r="1" fill="currentColor" stroke="none"/></svg>';

    const senderLabel = message.type === 'user' ? 'You' : 'Portfolio Assistant';

    el.innerHTML = [
        '<div class="message-wrapper">',
            '<div class="message-header">',
                '<div class="message-avatar">' + avatarIcon + '</div>',
                '<div class="message-info">',
                    '<span class="message-sender">' + senderLabel + '</span>',
                '</div>',
            '</div>',
            '<div class="message-bubble">',
                '<div class="message-text">' + escapeHtml(message.content) + '</div>',
            '</div>',
            '<div class="message-footer"><span>' + time + '</span></div>',
        '</div>'
    ].join('');

    messagesContainer.appendChild(el);
    scrollToBottom();
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function setLoadingState(loading) {
    isLoading = loading;
    updateSendButton();
    messageInput.disabled = loading;
    sendIcon.style.display = loading ? 'none' : 'block';
    loadingSpinner.style.display = loading ? 'block' : 'none';
    loadingIndicator.style.display = loading ? 'block' : 'none';
    if (loading) scrollToBottom();
}

function hideWelcomeScreen() { welcomeScreen.style.display = 'none'; }
function showWelcomeScreen()  { welcomeScreen.style.display = 'flex'; }
function showClearButton()    { clearBtn.style.display = 'flex'; }
function hideClearButton()    { clearBtn.style.display = 'none'; }
function scrollToBottom()     { messagesEnd.scrollIntoView({ behavior: 'smooth' }); }

function clearChat() {
    messages = [];
    conversationHistory = [];
    messagesContainer.innerHTML = '';
    showWelcomeScreen();
    hideClearButton();
    setLoadingState(false);
    updateSendButton();
}
