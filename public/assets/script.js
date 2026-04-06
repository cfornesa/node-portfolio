document.addEventListener('DOMContentLoaded', () => {
    /* -------------------------------------------------------------------------- */
    /* Theme Toggle Logic                                                         */
    /* -------------------------------------------------------------------------- */
    const themeBtns = document.querySelectorAll('.theme-toggle-btn');
    
    const updateThemeIcons = (isDark) => {
        themeBtns.forEach(btn => {
            const svg = btn.querySelector('svg');
            if (svg) {
                if (isDark) {
                    // Moon icon (approximated for dark mode)
                    svg.innerHTML = '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>';
                } else {
                    // Sun icon
                    svg.innerHTML = '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path>';
                }
            }
        });
    };

    // Initialize icons based on current theme
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    updateThemeIcons(currentTheme === 'dark');

    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const html = document.documentElement;
            const isDark = html.classList.toggle('dark');
            const newTheme = isDark ? 'dark' : 'light';
            
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcons(isDark);
        });
    });

    /* -------------------------------------------------------------------------- */
    /* Mobile Menu Logic                                                          */
    /* -------------------------------------------------------------------------- */
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
        
        mobileMenu.addEventListener('click', (e) => {
            // Close menu if a link is clicked or if the overlay itself is clicked
            if (e.target.tagName === 'A' || e.target === mobileMenu) {
                mobileMenu.classList.add('hidden');
            }
        });
    }

    /* -------------------------------------------------------------------------- */
    /* Chatbot Modal Logic                                                        */
    /* -------------------------------------------------------------------------- */
    const chatToggleBtn = document.getElementById('chat-toggle-btn');
    const chatCloseBtn = document.getElementById('chat-close');
    const chatbotModal = document.getElementById('chatbot-modal');
    
    if (chatToggleBtn && chatbotModal) {
        chatToggleBtn.addEventListener('click', () => {
            chatbotModal.classList.remove('hidden');
            // Remove the empty div initially placed inside messages to allow clean append
            const msgs = document.getElementById('chat-messages');
            if(msgs && msgs.children.length === 2 && msgs.children[1].innerHTML === "") {
                 msgs.removeChild(msgs.children[1]);
            }
        });
    }

    if (chatCloseBtn && chatbotModal) {
        chatCloseBtn.addEventListener('click', () => {
            chatbotModal.classList.add('hidden');
        });
        // Optional: close on clicking outside
        chatbotModal.addEventListener('click', (e) => {
            if (e.target === chatbotModal) {
                chatbotModal.classList.add('hidden');
            }
        });
    }

    /* -------------------------------------------------------------------------- */
    /* Chatbot Messaging Logic                                                    */
    /* -------------------------------------------------------------------------- */
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    let chatHistory = [];

    const appendMessage = (role, content) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `flex gap-3 ${role === 'user' ? 'justify-end' : ''}`;
        
        let innerHTML = '';
        if (role === 'assistant') {
            innerHTML = `
                <div class="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center shrink-0 border border-outline-variant/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot text-primary"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>
                </div>
                <div class="bg-surface-container border border-outline-variant/10 rounded-2xl rounded-tl-sm p-4 text-sm text-on-surface-variant max-w-[85%]">
                    ${content}
                </div>
            `;
        } else {
            innerHTML = `
                <div class="bg-primary/10 border border-primary/20 text-on-surface rounded-2xl rounded-tr-sm p-4 text-sm max-w-[85%]">
                    ${content}
                </div>
                <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user text-primary"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
            `;
        }
        
        msgDiv.innerHTML = innerHTML;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const showLoading = () => {
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'chat-loading';
        loadingDiv.className = 'flex gap-3';
        loadingDiv.innerHTML = `
            <div class="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center shrink-0 border border-outline-variant/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot text-primary"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>
            </div>
            <div class="bg-surface-container border border-outline-variant/10 rounded-2xl rounded-tl-sm p-4 text-sm text-on-surface-variant flex items-center gap-1">
                <span class="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
                <span class="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
                <span class="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style="animation-delay: 0.4s"></span>
            </div>
        `;
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const removeLoading = () => {
        const loadingDiv = document.getElementById('chat-loading');
        if (loadingDiv) {
            loadingDiv.remove();
        }
    };

    const handleSendMessage = async (message) => {
        if (!message.trim()) return;

        // Remove initial prompt buttons if they are still there
        const initialPrompts = chatMessages.querySelector('.text-center');
        if (initialPrompts) {
            initialPrompts.remove();
        }

        appendMessage('user', message);
        chatHistory.push({ role: 'user', content: message });
        
        showLoading();

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: message,
                    history: chatHistory
                })
            });

            if (!response.ok) throw new Error('Failed to fetch response');
            
            const data = await response.json();
            
            removeLoading();
            
            if (data.reply) {
                appendMessage('assistant', data.reply);
                chatHistory.push({ role: 'assistant', content: data.reply });
            } else {
                appendMessage('assistant', 'Sorry, I could not process your request at this time.');
            }

        } catch (error) {
            console.error('Chat error:', error);
            removeLoading();
            appendMessage('assistant', 'An error occurred while trying to communicate with the server.');
        }
    };

    if (chatForm && chatInput) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const message = chatInput.value;
            chatInput.value = '';
            handleSendMessage(message);
        });
    }

    /* -------------------------------------------------------------------------- */
    /* Quick Prompt Buttons                                                       */
    /* -------------------------------------------------------------------------- */
    const quickPrompts = document.querySelectorAll('.quick-prompt-btn');
    quickPrompts.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (chatInput) {
                chatInput.value = btn.textContent.trim();
                chatInput.focus();
            }
        });
    });

    /* -------------------------------------------------------------------------- */
    /* Resume Zoom Logic                                                          */
    /* -------------------------------------------------------------------------- */
    const zoomInBtns = document.querySelectorAll('.zoom-in-btn');
    const zoomOutBtns = document.querySelectorAll('.zoom-out-btn');
    const zoomContainer = document.getElementById('resume-zoom-container');
    const zoomText = document.getElementById('zoom-level-text');
    let currentZoom = 1.0;

    const updateZoom = () => {
        if (zoomContainer) {
            zoomContainer.style.transform = `scale(${currentZoom.toFixed(1)})`;
        }
        if (zoomText) {
            zoomText.textContent = `${Math.round(currentZoom * 100)}%`;
        }
    };

    zoomInBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentZoom < 2.0) {
                currentZoom += 0.1;
                updateZoom();
            }
        });
    });

    zoomOutBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentZoom > 0.5) {
                currentZoom -= 0.1;
                updateZoom();
            }
        });
    });

    /* -------------------------------------------------------------------------- */
    /* Smooth Scrolling for anchor links                                          */
    /* -------------------------------------------------------------------------- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            if (targetId) {
                const targetEl = document.getElementById(targetId);
                if (targetEl) {
                    targetEl.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    /* -------------------------------------------------------------------------- */
    /* Resume Modal Logic                                                         */
    /* -------------------------------------------------------------------------- */
    const resumeToggleBtns = document.querySelectorAll('.resume-toggle-btn');
    const resumeCloseBtns = document.querySelectorAll('.resume-close-btn');
    const resumeModal = document.getElementById('resume-modal');
    
    if (resumeModal) {
        resumeToggleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                resumeModal.classList.remove('hidden');
            });
        });

        resumeCloseBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                resumeModal.classList.add('hidden');
            });
        });

        resumeModal.addEventListener('click', (e) => {
            if (e.target === resumeModal) {
                resumeModal.classList.add('hidden');
            }
        });
    }
});
