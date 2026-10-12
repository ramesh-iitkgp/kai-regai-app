import test from 'node:test';
import assert from 'node:assert/strict';

import { TAROT_DECK } from '../src/tarot/data/tarotDeck.js';
import { getSpreadById } from '../src/tarot/data/tarotSpreads.js';
import { defaultTarotEngine } from '../src/tarot/engine/tarotEngine.js';
import { defaultTarotPersistence } from '../src/tarot/services/tarotPersistence.js';
import { renderTarotReadingScreen } from '../src/tarot/screens/TarotReadingScreen.js';

// Minimal DOM mock environment for Node.js
class MockElement {
  constructor(tag = 'div') {
    this.tagName = tag.toUpperCase();
    this.innerHTML = '';
    this.listeners = {};
    this.attributes = {};
    this.value = '';
    this.style = {};
  }

  addEventListener(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  trigger(event, data = {}) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(fn => fn(data));
    }
  }

  getAttribute(name) {
    return this.attributes[name] || null;
  }

  setAttribute(name, val) {
    this.attributes[name] = String(val);
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    const results = [];
    // Basic selector matcher for IDs, classes, and attributes
    const matchEl = (html) => {
      // Mock lookup: returns dummy interactive element if found in innerHTML
      if (selector.startsWith('#')) {
        const id = selector.slice(1);
        if (this.innerHTML.includes(`id="${id}"`)) {
          const el = new MockElement();
          el.id = id;
          return [el];
        }
      }
      return [];
    };
    return matchEl(this.innerHTML);
  }
}

test('Tarot Screen Flow & Lifecycle Simulation', async (t) => {
  await t.test('1. Setup Screen renders with all core controls and spread options', () => {
    const container = new MockElement('div');
    renderTarotReadingScreen(container, { phase: 'SETUP' });

    assert.ok(container.innerHTML.includes('Tarot Sanctuary'), 'Contains header title');
    assert.ok(container.innerHTML.includes('Daily Tarot'), 'Contains Daily Tarot spread');
    assert.ok(container.innerHTML.includes('Love Tarot'), 'Contains Love Tarot spread');
    assert.ok(container.innerHTML.includes('Classic Tarot'), 'Contains Classic Tarot spread');
    assert.ok(container.innerHTML.includes('Begin Ceremonial Shuffle'), 'Contains shuffle button');
    assert.ok(container.innerHTML.includes('Hold Your Intention'), 'Contains intention input section');
  });

  await t.test('2. Shuffle Screen renders with cosmic animation and cut deck button', () => {
    const container = new MockElement('div');
    renderTarotReadingScreen(container, { phase: 'SHUFFLE', spreadId: 'daily' });

    assert.ok(container.innerHTML.includes('tarot-shuffle-animation'), 'Contains shuffle animation container');
    assert.ok(container.innerHTML.includes('Attuning the 78 Cards'), 'Contains 78-card attunement text');
    assert.ok(container.innerHTML.includes('Cut Deck & Draw Cards'), 'Contains cut deck button');
  });

  await t.test('3. Picking Screen renders carousel and destination slot rack for Love Tarot', () => {
    const container = new MockElement('div');
    renderTarotReadingScreen(container, { phase: 'PICKING', spreadId: 'love' });

    assert.ok(container.innerHTML.includes('tarot-dest-slots-rack'), 'Contains destination slots rack');
    assert.ok(container.innerHTML.includes('You'), 'Contains You slot');
    assert.ok(container.innerHTML.includes('Partner'), 'Contains Partner slot');
    assert.ok(container.innerHTML.includes('tarot-carousel-viewport'), 'Contains carousel viewport');
    assert.ok(container.innerHTML.includes('tarot-carousel-prev'), 'Contains prev arrow');
    assert.ok(container.innerHTML.includes('tarot-carousel-next'), 'Contains next arrow');
    assert.ok(container.innerHTML.includes('tarot-select-focused-card'), 'Contains select card CTA');
  });

  await t.test('4. Reveal Screen renders spread table with cards', () => {
    const container = new MockElement('div');
    renderTarotReadingScreen(container, { phase: 'REVEAL', spreadId: 'classic' });

    assert.ok(container.innerHTML.includes('Card Reveal'), 'Contains card reveal title');
    assert.ok(container.innerHTML.includes('tarot-reveal-all-btn'), 'Contains reveal all button');
  });

  await t.test('5. Reading History Screen renders empty or populated state cleanly', () => {
    const container = new MockElement('div');
    renderTarotReadingScreen(container, { phase: 'HISTORY' });

    assert.ok(container.innerHTML.includes('Private Reading History'), 'Contains reading history header');
    assert.ok(container.innerHTML.includes('Back to Spreads'), 'Contains back to spreads button');
  });

  await t.test('6. Anonymous Picking — Card names are hidden until the Reveal page', () => {
    const container = new MockElement('div');
    // Simulate picking with 1 card chosen
    renderTarotReadingScreen(container, { phase: 'PICKING', spreadId: 'love', selectedCardIds: ['wands_10'] });

    // The picked card name "Ten of Wands" should NOT be leaked in the destination slot rack or carousel
    assert.ok(!container.innerHTML.includes('Ten of Wands'), 'Card name must not be revealed on picking page');
    assert.ok(container.innerHTML.includes('Card Chosen ✓'), 'Shows anonymous Chosen badge');
    assert.ok(container.innerHTML.includes('/assets/tarot/card_back.jpg'), 'Uses celestial reference card back image');
    assert.ok(container.innerHTML.includes('Draw with Intuition'), 'Carousel banner prompts intuitive draw without spoilers');
  });
});
