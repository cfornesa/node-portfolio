// Application State
let messages = [];
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
const languageSelect    = document.getElementById('languageSelect');

document.addEventListener('DOMContentLoaded', function () {
    setupEventListeners();
    setupWelcomeChips();
    updateSendButton();
});

function setupWelcomeChips() {
    document.querySelectorAll('.welcome-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            messageInput.value = chip.textContent.trim();
            autoResizeTextarea();
            updateSendButton();
            messageInput.focus();
        });
    });
}

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

    try {
        const response = await fetch('/tanaga/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_input: content, language: languageSelect.value }),
        });

        const data = await response.json();
        const isError = !data.reply || data.reply.startsWith('Error:') || data.reply.startsWith('System Error:');

        const aiMessage = {
            id: (Date.now() + 1).toString(),
            content: data.reply || 'No response received.',
            type: 'ai',
            language: data.metadata ? data.metadata.language : null,
            meterValid: data.metadata ? data.metadata.meter && data.metadata.meter.all_match : null,
            timestamp: new Date(),
            isError,
        };
        messages.push(aiMessage);
        displayMessage(aiMessage);
    } catch (error) {
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
        : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>';

    const senderLabel = message.type === 'user' ? 'You' : 'The Modern Oralist';

    const languageBadge = message.language
        ? '<span class="message-model">' + escapeHtml(message.language) + '</span>'
        : '';

    const meterBadge = (message.meterValid !== null && message.meterValid !== undefined)
        ? '<span class="meter-badge ' + (message.meterValid ? 'meter-valid' : 'meter-invalid') + '">'
          + (message.meterValid ? '✓ meter' : '⚠ meter off') + '</span>'
        : '';

    el.innerHTML = [
        '<div class="message-wrapper">',
            '<div class="message-header">',
                '<div class="message-avatar">' + avatarIcon + '</div>',
                '<div class="message-info">',
                    '<span class="message-sender">' + senderLabel + '</span>',
                    languageBadge,
                '</div>',
            '</div>',
            '<div class="message-bubble">',
                '<div class="message-text">' + escapeHtml(message.content) + '</div>',
            '</div>',
            '<div class="message-footer">',
                '<span>' + time + '</span>',
                meterBadge,
            '</div>',
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
    messagesContainer.innerHTML = '';
    showWelcomeScreen();
    hideClearButton();
    setLoadingState(false);
    updateSendButton();
}

// Get the domain name for the current page
const domainName = window.location.hostname;

// Get all instances of class "brand"
const brandElements = document.querySelectorAll('.brand');

// Select #headerNav
const headerNav = document.getElementById('headerNav');

if (domainName === 'agents.augmenthumankind.com') {
    brandElements.forEach(element => {
        element.textContent = 'Augment Humankind';
    });
} else if (domainName === 'chris.com.ph' || domainName === 'chrisfornesa.com' || domainName === 'cfornesa.com') {
    brandElements.forEach(element => {
        element.textContent = 'Chris Fornesa';
    });
} else if (domainName === 'localhost') {
    brandElements.forEach(element => {
        element.textContent = 'Test Case';
    });
} else {
    brandElements.forEach(element => {
        element.textContent = 'Augment Humankind';
    });
    headerNav.innerHTML = `
        <a href="/resume" class="nav-link">Resume Guide</a>
        <a href="/art" class="nav-link">Art Guide</a>
        <a href="/tanaga" class="nav-link nav-link--active">Tanaga Guide</a>
        <a href="/" class="nav-link">Home</a>
    `;
}