/**
 * Kai RegAI — Astrologer Chat Screen (Minimal Clean Celestial Design)
 * 
 * Invariants & Styling:
 * - Clean, distraction-free conversational window inspired by the celestial reference
 * - Deep obsidian cosmos background with radiant sun/moon face medallion
 * - Minimalist floating glass header with Acharya Dev persona and tab toggle
 * - 2x2 grid of quick suggestion pills above the bottom capsule input bar
 * - Soft warm gold accents (#d6ad68, #e4c276) and elegant typography
 * - Tested with tests/astrologer_chat.test.js
 */

import { router } from '../navigation/router.js';
import { ROUTES } from '../navigation/routes.js';
import { defaultAstrologerChatService } from '../services/AstrologerChatService.js';
import { reportTelemetry, TELEMETRY_EVENTS } from '../report/ReportTelemetry.js';

export function renderAstrologerChatScreen(container, params = {}) {
  let activeTab = params.tab || 'ai_chat'; // 'ai_chat' or 'directory'
  const chatService = defaultAstrologerChatService;
  let chatHistory = chatService.getChatHistory();
  const astrologers = chatService.getVerifiedAstrologers();
  const quickPrompts = chatService.getQuickPrompts();
  const isPalmScanned = chatService.hasScannedPalm();
  let currentSystem = chatService.getAstrologySystem();

  const storedName = (typeof window !== 'undefined' && localStorage.getItem('kai_user_name')) || 'Seeker';

  function formatMarkdown(text) {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #e4c276;">$1</strong>')
      .replace(/\n\n/g, '<br><br>');
  }

  function renderMessagesHtml() {
    return chatHistory.map(msg => {
      const isUser = msg.sender === 'user';
      if (isUser) {
        return `
          <div class="chat-message-row user-row" style="display: flex; justify-content: flex-end; margin-bottom: 20px;">
            <div class="chat-bubble user-bubble user-bubble-celestial" style="max-width: 82%;">
              <p style="margin: 0; white-space: pre-wrap; color: #ffffff; font-size: 14px; line-height: 1.45;">${msg.text}</p>
              <div style="display: flex; justify-content: flex-end; align-items: center; gap: 4px; font-size: 11px; color: rgba(255, 255, 255, 0.7); margin-top: 6px;">
                <span>${msg.timestamp || '3:26 PM'}</span>
                <span class="material-symbols-outlined" style="font-size: 14px; color: rgba(228, 194, 118, 0.9);">done_all</span>
              </div>
            </div>
          </div>
        `;
      } else {
        return `
          <div class="chat-message-row astrologer-row" style="display: flex; gap: 12px; align-items: flex-start; margin-bottom: 20px;">
            <div style="width: 44px; height: 44px; border-radius: 9999px; overflow: hidden; border: 1.5px solid rgba(228, 194, 118, 0.65); box-shadow: 0 0 12px rgba(228, 194, 118, 0.35); flex-shrink: 0; background: #14121c;">
              <img src="${msg.avatar || '/assets/home/astrologer_avatar_acharya.jpg'}" alt="${msg.senderName || 'Acharya Dev'}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div style="flex: 1; max-width: calc(100% - 56px);">
              <div class="chat-bubble astrologer-bubble astrologer-bubble-celestial">
                <div style="margin: 0; color: #f1ede4; font-size: 14px; line-height: 1.55; white-space: pre-wrap;">${formatMarkdown(msg.text)}</div>
              </div>
              <div style="margin-top: 5px; font-size: 11px; color: rgba(228, 194, 118, 0.6); padding-left: 4px;">${msg.timestamp || '3:25 PM'}</div>
            </div>
          </div>
        `;
      }
    }).join('');
  }

  function renderDirectoryHtml() {
    return `
      <div class="astrologer-directory-container" style="padding: 16px 14px 40px;">
        <div style="background: radial-gradient(circle at top, rgba(228, 194, 118, 0.12) 0%, rgba(16, 12, 10, 0.95) 100%), #100c0a; border: 1px solid rgba(228, 194, 118, 0.35); border-radius: 18px; padding: 18px; margin-bottom: 18px; text-align: center;">
          <span class="kai-badge" style="background: rgba(228, 194, 118, 0.18); color: #e4c276; border: 1px solid rgba(228, 194, 118, 0.4); font-size: 10.5px; padding: 2px 8px; margin-bottom: 6px;">
            ✦ EXPERT CONSULTATION DIRECTORY (PREVIEW)
          </span>
          <h3 style="font-family: var(--font-display); font-size: 18px; font-weight: 700; color: #ffffff; margin: 6px 0;">
            Talk to Verified Astrologers
          </h3>
          <p style="font-size: 12px; color: #cbd5e1; margin: 0; line-height: 1.45;">
            Preview profiles of certified masters of Hasta Samudrika and Vedic astrology. Live voice connections activate with regional network launch.
          </p>
        </div>

        <div class="astrologer-cards-list" style="display: flex; flex-direction: column; gap: 14px;">
          ${astrologers.map(ast => `
            <div class="astrologer-card" style="background: rgba(16, 12, 10, 0.85); border: 1px solid rgba(228, 194, 118, 0.3); border-radius: 18px; padding: 14px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4); display: flex; flex-direction: column; gap: 10px; backdrop-filter: blur(10px);">
              <div style="display: flex; gap: 12px; align-items: flex-start;">
                <div style="position: relative;">
                  <div style="width: 50px; height: 50px; border-radius: 9999px; overflow: hidden; border: 1.5px solid rgba(228, 194, 118, 0.6); box-shadow: 0 0 12px rgba(228, 194, 118, 0.3); background: #1a1626; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; color: #e4c276;">
                    ${ast.avatar 
                      ? `<img src="${ast.avatar}" alt="${ast.name}" style="width: 100%; height: 100%; object-fit: cover;">` 
                      : `<span>${ast.initials || 'AS'}</span>`}
                  </div>
                  <span style="position: absolute; bottom: 0; right: 0; width: 12px; height: 12px; border-radius: 9999px; background: ${ast.isOnline ? '#4ade80' : '#eab308'}; border: 2px solid #111422; box-shadow: 0 0 6px ${ast.isOnline ? '#4ade80' : '#eab308'};"></span>
                </div>

                <div style="flex: 1;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                      <h4 style="font-family: var(--font-display); font-size: 14.5px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 4px;">
                        <span>${ast.name}</span>
                        <span class="material-symbols-outlined" style="font-size: 15px; color: #38bdf8;">verified</span>
                      </h4>
                      <span style="font-size: 11px; color: #e4c276; font-weight: 600;">${ast.title}</span>
                    </div>
                    <div style="text-align: right;">
                      <span style="font-size: 14px; font-weight: 800; color: #e4c276;">₹${ast.ratePerMinute}</span>
                      <span style="font-size: 10px; color: #94a3b8; display: block;">/ min</span>
                    </div>
                  </div>

                  <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px; font-size: 11px; color: #cbd5e1;">
                    <span style="color: #e4c276; font-weight: 700;">★ ${ast.rating}</span>
                    <span>•</span>
                    <span>${ast.experienceYears} yrs exp</span>
                    <span>•</span>
                    <span style="color: #94a3b8;">${ast.totalConsultations}+ sessions</span>
                  </div>

                  <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-top: 6px;">
                    ${ast.specialties.map(s => `
                      <span style="background: rgba(255, 255, 255, 0.05); color: #cbd5e1; font-size: 9.5px; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(255, 255, 255, 0.08);">${s}</span>
                    `).join('')}
                  </div>
                </div>
              </div>

              <!-- Action Footer -->
              <div style="display: flex; gap: 8px; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 10px; align-items: center; justify-content: space-between;">
                <span style="font-size: 10px; color: #94a3b8;">
                  Languages: <strong>${ast.languages.join(', ')}</strong>
                </span>
                <div style="display: flex; gap: 6px;">
                  <button class="connect-astrologer-btn kai-btn" data-ast-id="${ast.id}" data-type="chat" style="padding: 6px 12px; font-size: 11px; background: rgba(228, 194, 118, 0.15); border: 1px solid rgba(228, 194, 118, 0.4); color: #e4c276; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                    <span class="material-symbols-outlined" style="font-size: 14px;">chat</span>
                    <span>Chat</span>
                  </button>
                  <button class="connect-astrologer-btn kai-btn" data-ast-id="${ast.id}" data-type="call" style="padding: 6px 12px; font-size: 11px; background: linear-gradient(135deg, #d6ad68, #b8860b); border: none; color: #100e14; font-weight: 700; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                    <span class="material-symbols-outlined" style="font-size: 14px;">call</span>
                    <span>Call Now</span>
                  </button>
                </div>
              </div>

            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="astrologer-chat-wrapper-celestial" style="display: flex; flex-direction: column; height: 100%; min-height: 100vh; max-height: 100vh; background: #060814 url('/assets/chat/chat_celestial_bg.jpg') no-repeat center center / cover; color: #ffffff; overflow: hidden; position: relative;">
      
      <!-- Clean Minimal Header (Clutter-Free) -->
      <header class="astrologer-header" style="padding: 10px 16px; background: rgba(6, 8, 20, 0.72); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid rgba(228, 194, 118, 0.2); display: flex; align-items: center; justify-content: space-between; z-index: 50; flex-shrink: 0;">
        <!-- Left: Back Button & Persona -->
        <div style="display: flex; align-items: center; gap: 10px;">
          <button id="chat-back-btn" class="kai-btn-icon" style="background: none; border: none; color: #d6ad68; cursor: pointer; display: flex; align-items: center; padding: 4px;" aria-label="Back">
            <span class="material-symbols-outlined" style="font-size: 22px;">arrow_back</span>
          </button>
          
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 32px; height: 32px; border-radius: 9999px; overflow: hidden; border: 1.5px solid rgba(228, 194, 118, 0.75); box-shadow: 0 0 8px rgba(228, 194, 118, 0.35); background: #14121c; flex-shrink: 0;">
              <img src="/assets/home/astrologer_avatar_acharya.jpg" alt="Acharya Dev" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div>
              <h2 style="font-family: var(--font-display); font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; line-height: 1.2;">
                Acharya Dev
              </h2>
              <div style="display: flex; align-items: center; gap: 4px; margin-top: 1px;">
                <span style="width: 5px; height: 5px; border-radius: 9999px; background: #4ade80; box-shadow: 0 0 5px #4ade80;"></span>
                <span style="font-size: 10px; color: #4ade80; font-weight: 500;">Online</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Minimal Tab Toggle & Action -->
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="display: inline-flex; background: rgba(0, 0, 0, 0.45); padding: 2px; border-radius: 9999px; border: 1px solid rgba(228, 194, 118, 0.25); flex-shrink: 0;">
            <button id="toggle-tab-ai" class="chat-tab-btn" style="border: none; border-radius: 9999px; padding: 4px 8px; font-size: 10px; font-weight: 700; cursor: pointer; transition: all 0.2s; background: ${activeTab === 'ai_chat' ? '#d6ad68' : 'transparent'}; color: ${activeTab === 'ai_chat' ? '#0a0d18' : '#94a3b8'};">
              💬 AI Chat
            </button>
            <button id="toggle-tab-directory" class="chat-tab-btn" style="border: none; border-radius: 9999px; padding: 4px 8px; font-size: 10px; font-weight: 700; cursor: pointer; transition: all 0.2s; background: ${activeTab === 'directory' ? '#d6ad68' : 'transparent'}; color: ${activeTab === 'directory' ? '#0a0d18' : '#94a3b8'};">
              👨‍🏫 Masters
            </button>
          </div>

          <button id="chat-new-chat-btn" type="button" style="background: none; border: none; color: #d6ad68; cursor: pointer; display: flex; align-items: center; padding: 4px;" title="Start a fresh chat" aria-label="New Chat">
            <span class="material-symbols-outlined" style="font-size: 19px;">refresh</span>
          </button>

          <button id="header-scan-palm-btn" style="display: none;" aria-label="Scan Palm"></button>
        </div>
      </header>

      <!-- Main Dynamic Chat Area -->
      ${activeTab === 'ai_chat' ? `
        <!-- Scrollable Messages Container -->
        <main id="chat-messages-container" style="flex: 1 1 0%; min-height: 0; padding: 16px 16px 8px; overflow-y: auto; -webkit-overflow-scrolling: touch; display: flex; flex-direction: column;">
          
          ${renderMessagesHtml()}

          <!-- Typing Indicator -->
          <div id="chat-typing-indicator" style="display: none; align-items: flex-start; gap: 12px; margin-bottom: 20px;">
            <div style="width: 44px; height: 44px; border-radius: 9999px; overflow: hidden; border: 1.5px solid rgba(228, 194, 118, 0.65); box-shadow: 0 0 12px rgba(228, 194, 118, 0.35); flex-shrink: 0; background: #14121c;">
              <img src="/assets/home/astrologer_avatar_acharya.jpg" alt="Acharya Dev" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div class="astrologer-bubble-celestial" style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 18px;">
              <span style="font-size: 12.5px; color: #e4c276; font-weight: 500;">Acharya Dev is reading the celestial alignments</span>
              <span style="display: inline-flex; gap: 4px;">
                <span class="glow-pulsing" style="width: 5px; height: 5px; border-radius: 9999px; background: #e4c276; display: inline-block;"></span>
                <span class="glow-pulsing" style="width: 5px; height: 5px; border-radius: 9999px; background: #e4c276; display: inline-block; animation-delay: 0.2s;"></span>
                <span class="glow-pulsing" style="width: 5px; height: 5px; border-radius: 9999px; background: #e4c276; display: inline-block; animation-delay: 0.4s;"></span>
              </span>
            </div>
          </div>
        </main>

        <!-- 2x2 Suggestion Pills Grid -->
        <div id="chat-quick-chips-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 6px 16px 10px; flex-shrink: 0;">
          ${quickPrompts.slice(0, 4).map(p => `
            <button class="quick-chip-btn chat-quick-pill" type="button" data-text="${p.text}">
              <span class="material-symbols-outlined" style="font-size: 17px; color: #d6ad68; flex-shrink: 0;">${p.icon || 'auto_awesome'}</span>
              <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.label}</span>
            </button>
          `).join('')}
        </div>

        <!-- Clean Docked Capsule Input Footer -->
        <footer class="chat-input-footer" style="flex-shrink: 0; padding: 0 16px 14px; background: transparent;">
          <form id="chat-input-form" action="javascript:void(0);" class="chat-input-capsule">
            <button id="chat-extra-actions-btn" type="button" aria-label="Add Context" style="width: 34px; height: 34px; border-radius: 9999px; border: 1.2px solid rgba(228, 194, 118, 0.55); background: transparent; color: #d6ad68; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; padding: 0;">
              <span class="material-symbols-outlined" style="font-size: 20px;">add</span>
            </button>
            <input 
              id="chat-text-input" 
              name="chat_message" 
              type="text" 
              placeholder="Ask anything about tarot, astrology..." 
              autocomplete="off" 
              style="flex: 1; background: transparent; border: none; outline: none; font-size: 13.5px; color: #ffffff; padding: 6px 0;"
            />
            <button 
              id="chat-send-btn" 
              type="submit" 
              aria-label="Send message" 
              style="width: 36px; height: 36px; border-radius: 9999px; background: #d6ad68; border: none; color: #100e14; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; box-shadow: 0 2px 10px rgba(214, 173, 104, 0.4); padding: 0;"
            >
              <span class="material-symbols-outlined" style="font-size: 18px; font-weight: 700;">send</span>
            </button>
          </form>
        </footer>
      ` : `
        <!-- Verified Masters Directory View -->
        <main id="chat-main-content" style="flex: 1 1 0%; min-height: 0; overflow-y: auto; display: flex; flex-direction: column;">
          ${renderDirectoryHtml()}
        </main>
      `}

      <!-- Consultation Request Modal Container -->
      <div id="consultation-modal-overlay" style="display: none; position: fixed; inset: 0; background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(8px); z-index: 100; align-items: flex-end; justify-content: center;">
        <div id="consultation-modal-card" class="kai-card" style="width: 100%; max-width: 460px; background: #12101c; border-radius: 24px 24px 0 0; border-top: 2px solid #e4c276; padding: 20px 18px 30px; box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.8);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3 id="modal-ast-name" style="font-family: var(--font-display); font-size: 16px; font-weight: 700; color: #ffffff;">Consultation Request</h3>
            <button id="consultation-modal-close" class="kai-btn-icon" style="background: none; border: none; color: #94a3b8; cursor: pointer;">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <p style="font-size: 12px; color: #cbd5e1; margin: 10px 0;">Live consultation with verified masters.</p>
        </div>
      </div>

    </div>
  `;

  // Attach Event Listeners
  attachChatListeners();

  function attachChatListeners() {
    // Back navigation
    container.querySelector('#chat-back-btn')?.addEventListener('click', () => {
      router.navigate(ROUTES.HOME);
    });

    // New Chat / Clear History
    container.querySelector('#chat-new-chat-btn')?.addEventListener('click', () => {
      chatService.clearHistory();
      renderAstrologerChatScreen(container, { tab: 'ai_chat' });
    });

    // Tab switcher
    container.querySelector('#toggle-tab-ai')?.addEventListener('click', () => {
      if (activeTab !== 'ai_chat') {
        renderAstrologerChatScreen(container, { tab: 'ai_chat' });
      }
    });

    container.querySelector('#toggle-tab-directory')?.addEventListener('click', () => {
      if (activeTab !== 'directory') {
        renderAstrologerChatScreen(container, { tab: 'directory' });
      }
    });

    if (activeTab === 'ai_chat') {
      const messagesContainer = container.querySelector('#chat-messages-container');
      const textInput = container.querySelector('#chat-text-input');
      const inputForm = container.querySelector('#chat-input-form');
      const sendBtn = container.querySelector('#chat-send-btn');
      const typingIndicator = container.querySelector('#chat-typing-indicator');

      function scrollToBottom() {
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }
      scrollToBottom();

      // Quick prompt buttons
      container.querySelectorAll('.quick-chip-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const promptText = btn.getAttribute('data-text');
          if (promptText) {
            handleSendMessage(promptText);
          }
        });
      });

      // Extra action / suggestion
      container.querySelector('#chat-extra-actions-btn')?.addEventListener('click', () => {
        if (textInput) {
          textInput.focus();
        }
      });

      // Form submit
      inputForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        if (textInput && textInput.value) {
          handleSendMessage(textInput.value);
        }
      });

      // Send button click
      sendBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        if (textInput && textInput.value) {
          handleSendMessage(textInput.value);
        }
      });

      // Keydown Enter listener
      textInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          if (textInput.value) {
            handleSendMessage(textInput.value);
          }
        }
      });

      let isSending = false;

      async function handleSendMessage(text) {
        if (!text || !text.trim() || isSending) return;
        const trimmed = text.trim();
        isSending = true;

        const userMsg = {
          id: 'user-' + Date.now(),
          sender: 'user',
          text: trimmed,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        chatService.saveMessage(userMsg);
        chatHistory = chatService.getChatHistory();

        if (textInput) {
          textInput.value = '';
        }

        // Render user message immediately
        if (messagesContainer && typingIndicator) {
          typingIndicator.insertAdjacentHTML('beforebegin', `
            <div class="chat-message-row user-row" style="display: flex; justify-content: flex-end; margin-bottom: 20px;">
              <div class="chat-bubble user-bubble user-bubble-celestial" style="max-width: 82%;">
                <p style="margin: 0; white-space: pre-wrap; color: #ffffff; font-size: 14px; line-height: 1.45;">${userMsg.text}</p>
                <div style="display: flex; justify-content: flex-end; align-items: center; gap: 4px; font-size: 11px; color: rgba(255, 255, 255, 0.7); margin-top: 6px;">
                  <span>${userMsg.timestamp}</span>
                  <span class="material-symbols-outlined" style="font-size: 14px; color: rgba(228, 194, 118, 0.9);">done_all</span>
                </div>
              </div>
            </div>
          `);
          typingIndicator.style.display = 'flex';
          scrollToBottom();
        }

        reportTelemetry.logEvent(TELEMETRY_EVENTS.FEATURE_ACCESSED, { feature: 'astrologer_chat_message', system: currentSystem });

        try {
          // Generate AI Response grounded in custom calculated chart
          const aiMsg = await chatService.generateAIResponse(trimmed, {
            name: storedName,
            system: currentSystem
          });

          chatService.saveMessage(aiMsg);
          chatHistory = chatService.getChatHistory();

          if (typingIndicator) {
            typingIndicator.style.display = 'none';

            const streamId = 'stream-' + Date.now();
            typingIndicator.insertAdjacentHTML('beforebegin', `
              <div class="chat-message-row astrologer-row" style="display: flex; gap: 12px; align-items: flex-start; margin-bottom: 20px;">
                <div style="width: 44px; height: 44px; border-radius: 9999px; overflow: hidden; border: 1.5px solid rgba(228, 194, 118, 0.65); box-shadow: 0 0 12px rgba(228, 194, 118, 0.35); flex-shrink: 0; background: #14121c;">
                  <img src="${aiMsg.avatar || '/assets/home/astrologer_avatar_acharya.jpg'}" alt="${aiMsg.senderName || 'Acharya Dev'}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div style="flex: 1; max-width: calc(100% - 56px);">
                  <div class="chat-bubble astrologer-bubble astrologer-bubble-celestial" id="bubble-${streamId}">
                    <div id="text-${streamId}" style="margin: 0; color: #f1ede4; font-size: 14px; line-height: 1.55; white-space: pre-wrap;"></div>
                  </div>
                  <div style="margin-top: 5px; font-size: 11px; color: rgba(228, 194, 118, 0.6); padding-left: 4px;">${aiMsg.timestamp || 'Just now'}</div>
                </div>
              </div>
            `);

            // Clean typewriter stream effect
            const targetEl = container.querySelector(`#text-${streamId}`);
            const bubbleEl = container.querySelector(`#bubble-${streamId}`);

            const fullWords = (aiMsg.text || '').split(' ');
            let wordIdx = 0;
            let currentStr = '';
            let isSkipped = false;
            let streamTimer = null;

            function finishStream() {
              if (isSkipped) return;
              isSkipped = true;
              if (streamTimer) clearTimeout(streamTimer);
              if (targetEl) targetEl.innerHTML = formatMarkdown(aiMsg.text);
              scrollToBottom();
              if (textInput) textInput.focus();
            }

            bubbleEl?.addEventListener('click', finishStream, { once: true });

            function typeNextWord() {
              if (isSkipped) return;
              if (wordIdx >= fullWords.length) {
                finishStream();
                return;
              }

              const nextWord = fullWords[wordIdx];
              currentStr = currentStr ? currentStr + ' ' + nextWord : nextWord;
              wordIdx++;

              if (targetEl) {
                targetEl.innerHTML = formatMarkdown(currentStr) + 
                  '<span class="typing-cursor" style="display: inline-block; width: 6px; height: 13px; background: #e4c276; margin-left: 3px; vertical-align: middle; border-radius: 1px; box-shadow: 0 0 6px rgba(228, 194, 118, 0.6); animation: pulse 0.8s infinite;"></span>';
              }
              scrollToBottom();

              let delay = 65;
              if (/[.!?]$/.test(nextWord)) {
                delay = 200;
              } else if (/[,;:]$/.test(nextWord)) {
                delay = 110;
              } else if (nextWord.includes('\n')) {
                delay = 240;
              }

              streamTimer = setTimeout(typeNextWord, delay);
            }

            typeNextWord();
          }
        } catch (err) {
          console.error('Astrologer chat response error:', err);
          if (typingIndicator) {
            typingIndicator.style.display = 'none';
            typingIndicator.insertAdjacentHTML('beforebegin', `
              <div class="chat-message-row astrologer-row" style="display: flex; gap: 12px; align-items: flex-start; margin-bottom: 20px;">
                <div style="width: 44px; height: 44px; border-radius: 9999px; overflow: hidden; border: 1.5px solid rgba(228, 194, 118, 0.65); box-shadow: 0 0 12px rgba(228, 194, 118, 0.35); flex-shrink: 0; background: #14121c;">
                  <img src="/assets/home/astrologer_avatar_acharya.jpg" alt="Acharya Dev" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div style="flex: 1; max-width: calc(100% - 56px);">
                  <div class="chat-bubble astrologer-bubble astrologer-bubble-celestial">
                    <div style="margin: 0; color: #f1ede4; font-size: 14px; line-height: 1.55; white-space: pre-wrap;">I have received your inquiry regarding "${trimmed}". In contemplation with the celestial movements, mindful focus on your core priorities is currently indicated.</div>
                  </div>
                  <div style="margin-top: 5px; font-size: 11px; color: rgba(228, 194, 118, 0.6); padding-left: 4px;">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            `);
          }
        } finally {
          isSending = false;
          if (typingIndicator) typingIndicator.style.display = 'none';
          if (textInput) {
            textInput.focus();
          }
          scrollToBottom();
        }
      }
    }
  }
}
