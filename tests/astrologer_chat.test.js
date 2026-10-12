import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultAstrologerChatService, VERIFIED_ASTROLOGERS, QUICK_PROMPTS } from '../src/services/AstrologerChatService.js';
import { renderAstrologerChatScreen } from '../src/screens/AstrologerChatScreen.js';
import { ROUTES } from '../src/navigation/routes.js';

describe('Astrologer Chat & Consultation Hub', () => {
  test('ROUTES contains CHAT identifier', () => {
    assert.equal(ROUTES.CHAT, 'chat');
  });

  test('AstrologerChatService provides verified astrologers directory', () => {
    const list = defaultAstrologerChatService.getVerifiedAstrologers();
    assert.ok(Array.isArray(list));
    assert.ok(list.length >= 3);

    const first = list[0];
    assert.ok(first.name);
    assert.ok(first.rating >= 4.5);
    assert.ok(first.ratePerMinute > 0);
    assert.ok(Array.isArray(first.specialties));
  });

  test('AstrologerChatService provides pre-configured quick prompts', () => {
    const prompts = defaultAstrologerChatService.getQuickPrompts();
    assert.ok(prompts.length >= 4);
    assert.ok(prompts.some(p => p.id === 'career'));
    assert.ok(prompts.some(p => p.id === 'love'));
  });

  test('AI Astrologer synthesizes nuanced responses for diverse life dimensions', async () => {
    // Career query
    const careerRes = await defaultAstrologerChatService.generateAIResponse('When will my career shift?', {
      name: 'Aditya',
      rashi: 'Simha',
      dominant: 'RIGHT'
    });
    assert.ok(careerRes.text.includes('Fate Line') || careerRes.text.includes('vocational'));
    assert.equal(careerRes.sender, 'astrologer');

    // Love query
    const loveRes = await defaultAstrologerChatService.generateAIResponse('What does my Heart Line show about marriage?', {
      name: 'Priya',
      rashi: 'Karka',
      dominant: 'LEFT'
    });
    assert.ok(loveRes.text.includes('Heart Line') || loveRes.text.includes('Venus'));

    // Invariant: Response must never contain fatalistic expiration dates or medical diagnostic claims
    assert.ok(!careerRes.text.toLowerCase().includes('you will die'));
    assert.ok(!careerRes.text.toLowerCase().includes('cancer'));
  });

  test('AstrologerChatService delivers full astrological reading and offers optional palm scan', async () => {
    // Unscanned mode: delivers full astrological chart interpretation and offers optional palm scan
    const unscannedRes = await defaultAstrologerChatService.generateAIResponse('Will I get a promotion?', {
      name: 'Karan',
      rashi: 'Dhanu',
      hasScannedPalm: false
    });
    assert.ok(unscannedRes.text.includes('Dhanu'));
    assert.ok(unscannedRes.text.includes('calculated'));
    assert.ok(unscannedRes.text.includes('vocational') || unscannedRes.text.includes('placements'));
    assert.ok(unscannedRes.structuredResponse && unscannedRes.structuredResponse.answer);
    assert.equal(unscannedRes.showScanCTA, true, 'Can offer optional scan CTA when palm is not yet scanned');

    // Scanned mode: provides integrated palm analysis
    const scannedRes = await defaultAstrologerChatService.generateAIResponse('Will I get a promotion?', {
      name: 'Karan',
      rashi: 'Dhanu',
      hasScannedPalm: true
    });
    assert.ok(scannedRes.text.includes('scanned') || scannedRes.text.includes('Fate Line'));
    assert.equal(scannedRes.showScanCTA, false, 'Must not show scan CTA when palm is already scanned');
    assert.equal(scannedRes.isPalmConnected, true, 'Must indicate palm is connected');
  });

  test('AstrologerChatScreen renders AI Chat interface with Acharya Dev and input', () => {
    let dom = '';
    const container = {
      get innerHTML() { return dom; },
      set innerHTML(val) { dom = val; },
      querySelector: () => null,
      querySelectorAll: () => []
    };

    renderAstrologerChatScreen(container, { tab: 'ai_chat' });
    assert.ok(dom.includes('Acharya Dev'), 'Must render Acharya Dev persona');
    assert.ok(dom.includes('chat-text-input'), 'Must have message input field');
    assert.ok(dom.includes('chat-quick-chips-row'), 'Must include quick prompt chips');
    assert.ok(dom.includes('💬 AI Chat'), 'Must have AI Chat tab');
    assert.ok(dom.includes('header-scan-palm-btn'), 'Must have header scan palm button');
  });

  test('AstrologerChatScreen renders Verified Masters directory when directory tab is active', () => {
    let dom = '';
    const container = {
      get innerHTML() { return dom; },
      set innerHTML(val) { dom = val; },
      querySelector: () => null,
      querySelectorAll: () => []
    };

    renderAstrologerChatScreen(container, { tab: 'directory' });
    assert.ok(dom.includes('Talk to Verified Astrologers'), 'Must display directory heading');
    assert.ok(dom.includes('Pandit Raghunath Shastri'), 'Must display verified astrologer names');
    assert.ok(dom.includes('Call Now'), 'Must include Call action button');
    assert.ok(dom.includes('consultation-modal-overlay'), 'Must include consultation modal structure');
  });
});
