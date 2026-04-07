// Application State
let messages = [];
let isLoading = false;
let currentResume = null;
let chatHistory = [];

// DOM Elements
const welcomeScreen     = document.querySelector('.welcome-screen-chat');
const messagesContainer = document.getElementById('messagesContainer');
const loadingIndicator  = document.getElementById('loadingIndicator');
const messagesEnd       = document.getElementById('messagesEnd');
const clearBtn          = document.getElementById('clearBtn');
const buildForm         = document.getElementById('buildForm');
const buildButton       = document.getElementById('buildButton');
const buildIcon         = document.getElementById('buildIcon');
const buildSpinner      = document.getElementById('buildSpinner');
const fieldName         = document.getElementById('fieldName');
const fieldOccupation   = document.getElementById('fieldOccupation');
const fieldIndustry     = document.getElementById('fieldIndustry');
const fieldJobDescription = document.getElementById('fieldJobDescription');
const fieldSummary      = document.getElementById('fieldSummary');
const fieldSkills       = document.getElementById('fieldSkills');
const fieldExperience   = document.getElementById('fieldExperience');
const fieldEducation    = document.getElementById('fieldEducation');
const fieldAwards       = document.getElementById('fieldAwards');
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
    buildForm.addEventListener('submit', handleBuildSubmit);
    chatForm.addEventListener('submit', handleChatSubmit);
    clearBtn.addEventListener('click', clearChat);
    messageInput.addEventListener('input', handleInputChange);
    messageInput.addEventListener('keydown', handleKeyDown);
}

// ── Phase 1: Build ────────────────────────────────────────────────────────────

function handleBuildSubmit(e) {
    e.preventDefault();
    if (isLoading) return;
    buildResume();
}

async function buildResume() {
    const payload = {
        name:            fieldName.value.trim(),
        occupation:      fieldOccupation.value.trim(),
        industry:        fieldIndustry.value.trim(),
        job_description: fieldJobDescription.value.trim(),
        summary:         fieldSummary.value.trim(),
        skills:          fieldSkills.value.trim(),
        experience:      fieldExperience.value.trim(),
        education:       fieldEducation.value.trim(),
        awards:          fieldAwards.value.trim()
    };

    const userMessage = {
        id: Date.now().toString(),
        content: `Building resume for ${payload.name} — ${payload.occupation} in ${payload.industry}.`,
        type: 'user',
        phase: null,
        timestamp: new Date()
    };
    messages.push(userMessage);
    displayMessage(userMessage);
    hideWelcomeScreen();
    showClearButton();
    setBuildLoadingState(true);

    try {
        const response = await fetch('/resume/build', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        const isError = !data.reply || data.reply.startsWith('System Error:') || data.error;

        currentResume = isError ? null : data.reply;

        const aiMessage = {
            id: (Date.now() + 1).toString(),
            content: data.reply || data.error || 'No response received.',
            type: 'ai',
            phase: 'build',
            timestamp: new Date(),
            isError
        };
        messages.push(aiMessage);
        displayMessage(aiMessage);

        if (!isError) {
            buildForm.style.display = 'none';
            chatForm.style.display = 'flex';
            chatHistory = [];
            messageInput.focus();
        }
    } catch (error) {
        const errMsg = {
            id: (Date.now() + 1).toString(),
            content: 'Error: ' + error.message,
            type: 'ai',
            phase: null,
            timestamp: new Date(),
            isError: true
        };
        messages.push(errMsg);
        displayMessage(errMsg);
    } finally {
        setBuildLoadingState(false);
    }
}

// ── Phase 2: Chat ─────────────────────────────────────────────────────────────

function handleChatSubmit(e) {
    e.preventDefault();
    const content = messageInput.value.trim();
    if (!content || isLoading) return;
    sendChatMessage(content);
}

function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleChatSubmit(e);
    }
}

async function sendChatMessage(content) {
    const userMessage = {
        id: Date.now().toString(),
        content,
        type: 'user',
        phase: null,
        timestamp: new Date()
    };
    messages.push(userMessage);
    displayMessage(userMessage);
    messageInput.value = '';
    messageInput.style.height = 'auto';
    setChatLoadingState(true);
    chatHistory.push({ role: 'user', content });

    try {
        const response = await fetch('/resume/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resume: currentResume, message: content, history: chatHistory })
        });

        const data = await response.json();
        const isError = !data.reply || data.reply.startsWith('System Error:') || data.error;

        if (!isError) {
            currentResume = data.reply;
            chatHistory.push({ role: 'assistant', content: data.reply });
        }

        const aiMessage = {
            id: (Date.now() + 1).toString(),
            content: data.reply || data.error || 'No response received.',
            type: 'ai',
            phase: 'edit',
            timestamp: new Date(),
            isError
        };
        messages.push(aiMessage);
        displayMessage(aiMessage);
    } catch (error) {
        const errMsg = {
            id: (Date.now() + 1).toString(),
            content: 'Error: ' + error.message,
            type: 'ai',
            phase: null,
            timestamp: new Date(),
            isError: true
        };
        messages.push(errMsg);
        displayMessage(errMsg);
    } finally {
        setChatLoadingState(false);
    }
}

// ── Display ───────────────────────────────────────────────────────────────────

function displayMessage(message) {
    const el = document.createElement('div');
    el.className = 'message ' + message.type;
    const time = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const avatarIcon = message.type === 'user'
        ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
        : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/></svg>';

    const phaseBadge = message.phase
        ? '<span class="message-model">' + (message.phase === 'build' ? 'Built' : 'Edited') + '</span>'
        : '';

    const senderLabel = message.type === 'user' ? 'You' : 'Career Strategist';

    el.innerHTML = [
        '<div class="message-wrapper">',
            '<div class="message-header">',
                '<div class="message-avatar">' + avatarIcon + '</div>',
                '<div class="message-info">',
                    '<span class="message-sender">' + senderLabel + '</span>',
                    phaseBadge,
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
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ── Loading States ────────────────────────────────────────────────────────────

function setBuildLoadingState(loading) {
    isLoading = loading;
    buildButton.disabled = loading;
    buildIcon.style.display = loading ? 'none' : 'inline';
    buildSpinner.style.display = loading ? 'block' : 'none';
    loadingIndicator.style.display = loading ? 'block' : 'none';
    if (loading) scrollToBottom();
}

function setChatLoadingState(loading) {
    isLoading = loading;
    updateSendButton();
    messageInput.disabled = loading;
    sendIcon.style.display = loading ? 'none' : 'block';
    loadingSpinner.style.display = loading ? 'block' : 'none';
    loadingIndicator.style.display = loading ? 'block' : 'none';
    if (loading) scrollToBottom();
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function handleInputChange() { autoResizeTextarea(); updateSendButton(); }

function autoResizeTextarea() {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 128) + 'px';
}

function updateSendButton() {
    sendButton.disabled = !messageInput.value.trim().length || isLoading;
}

function hideWelcomeScreen() { welcomeScreen.style.display = 'none'; }
function showWelcomeScreen()  { welcomeScreen.style.display = 'flex'; }
function showClearButton()    { clearBtn.style.display = 'flex'; }
function hideClearButton()    { clearBtn.style.display = 'none'; }
function scrollToBottom()     { messagesEnd.scrollIntoView({ behavior: 'smooth' }); }

function clearChat() {
    messages = [];
    chatHistory = [];
    currentResume = null;
    messagesContainer.innerHTML = '';
    buildForm.reset();
    buildForm.style.display = 'block';
    chatForm.style.display = 'none';
    showWelcomeScreen();
    hideClearButton();
    isLoading = false;
    loadingIndicator.style.display = 'none';
    updateSendButton();
}

// Get the domain name for the current page
const domainName = window.location.hostname;

// Get all instances of class "brand"
const brandElements = document.querySelectorAll('.brand');

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
        <a href="/resume" class="nav-link nav-link--active">Resume Guide</a>
        <a href="/art" class="nav-link">Art Guide</a>
        <a href="/tanaga" class="nav-link">Tanaga Guide</a>
        <a href="/" class="nav-link">Home</a>
    `;
}