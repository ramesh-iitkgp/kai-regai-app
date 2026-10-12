import test from 'node:test';
import assert from 'node:assert/strict';

import { TAROT_DECK, TAROT_DECK_MAP, MAJOR_ARCANA, MINOR_ARCANA, getCardById } from '../src/tarot/data/tarotDeck.js';
import { TAROT_SPREADS, TAROT_SPREADS_MAP, getSpreadById } from '../src/tarot/data/tarotSpreads.js';
import { TarotEngine, defaultTarotEngine } from '../src/tarot/engine/tarotEngine.js';
import { validateTarotDeck } from '../src/tarot/utils/validateDeck.js';
import { TarotPersistenceService } from '../src/tarot/services/tarotPersistence.js';
import { TarotInterpretationService } from '../src/tarot/services/tarotInterpretationService.js';
import { renderTarotCardView } from '../src/tarot/components/TarotCardView.js';
import { renderCardCarousel } from '../src/tarot/components/CardCarousel.js';
import { renderFannedDeck, renderSpreadTable } from '../src/tarot/components/TarotSpreadLayout.js';
import { renderTarotResultSheet } from '../src/tarot/components/TarotResultSheet.js';

test('Tarot Module Master Suite — 78-Card Deck, Engine, Spreads & UX', async (t) => {

  await t.test('1. Deck Integrity — Complete 78-Card Catalogue & Schema Validation', () => {
    // 78 Total Cards
    assert.equal(TAROT_DECK.length, 78, 'Master deck should have exactly 78 cards');
    assert.equal(MAJOR_ARCANA.length, 22, 'Master deck should have exactly 22 Major Arcana cards');
    assert.equal(MINOR_ARCANA.length, 56, 'Master deck should have exactly 56 Minor Arcana cards');
    assert.equal(Object.keys(TAROT_DECK_MAP).length, 78, 'TAROT_DECK_MAP should index all 78 cards');

    // Run automated validator
    const valResult = validateTarotDeck(TAROT_DECK);
    assert.equal(valResult.isValid, true, `Deck validation should pass without errors. Found: ${valResult.errors.join('; ')}`);
    assert.equal(valResult.totalCards, 78);
    assert.equal(valResult.majorCount, 22);
    assert.equal(valResult.minorCount, 56);

    // Verify 4 Minor Arcana suits have 14 ranks each
    const expectedSuits = ['wands', 'cups', 'swords', 'pentacles'];
    const expectedRanks = ['ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'page', 'knight', 'queen', 'king'];

    expectedSuits.forEach(suit => {
      const suitCards = MINOR_ARCANA.filter(c => c.suit === suit);
      assert.equal(suitCards.length, 14, `Suit ${suit} must have exactly 14 cards`);
      expectedRanks.forEach(rank => {
        const found = suitCards.find(c => c.rank === rank);
        assert.ok(found, `Suit ${suit} must contain rank ${rank}`);
        assert.ok(found.name, `Card ${found.id} must have a name`);
        assert.ok(found.image, `Card ${found.id} must have an image path`);
        assert.ok(found.loveMeaning, `Card ${found.id} must have loveMeaning`);
        assert.ok(found.careerMeaning, `Card ${found.id} must have careerMeaning`);
        assert.ok(found.financeMeaning, `Card ${found.id} must have financeMeaning`);
        assert.ok(found.personalGrowthMeaning, `Card ${found.id} must have personalGrowthMeaning`);
        assert.ok(found.traditionalSymbolism, `Card ${found.id} must have traditionalSymbolism`);
      });
    });

    // Check Major Arcana naming and Rider-Waite-Smith conventions
    const expectedMajors = [
      'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor',
      'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit',
      'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death',
      'Temperance', 'The Devil', 'The Tower', 'The Star', 'The Moon',
      'The Sun', 'Judgement', 'The World'
    ];

    expectedMajors.forEach((name, idx) => {
      const card = MAJOR_ARCANA[idx];
      assert.equal(card.name, name, `Card ${idx} should be ${name}`);
      assert.ok(card.id, `Card ${name} must have unique id`);
      assert.ok(card.roman, `Card ${name} must have Roman numeral`);
      assert.ok(card.astrologyRuler, `Card ${name} must have astrological ruler`);
      assert.ok(card.palmistryCorrespondence, `Card ${name} must have palmistry correspondence`);
      assert.ok(card.mountName, `Card ${name} must specify palm mount`);
      assert.ok(card.keywordsUpright.length >= 3, `Card ${name} must have at least 3 upright keywords`);
      assert.ok(card.keywordsReversed.length >= 3, `Card ${name} must have at least 3 reversed keywords`);
      assert.ok(card.meaningUpright.length > 50, `Card ${name} must have detailed meaningUpright`);
      assert.ok(card.meaningReversed.length > 50, `Card ${name} must have detailed meaningReversed`);
      assert.ok(card.reflectionPrompt.length > 20, `Card ${name} must have contemplative reflection prompt`);
      assert.ok(card.guidanceUpaya.length > 20, `Card ${name} must have actionable mindful upaya`);
    });
  });

  await t.test('2. Spreads Integrity — Daily, Love, Classic, and Extended Spreads', () => {
    assert.ok(TAROT_SPREADS.length >= 5, 'Should have at least 5 spreads defined');

    // Daily Spread (1 card)
    const dailySpread = getSpreadById('daily');
    assert.ok(dailySpread, 'Daily spread must exist');
    assert.equal(dailySpread.cardCount, 1, 'Daily spread must require 1 card');
    assert.equal(dailySpread.positions.length, 1);
    assert.ok(dailySpread.instructions.includes('Take a moment to focus on your day'));

    // Love Spread (2 cards: You and Partner)
    const loveSpread = getSpreadById('love');
    assert.ok(loveSpread, 'Love spread must exist');
    assert.equal(loveSpread.cardCount, 2, 'Love spread must require 2 cards');
    assert.equal(loveSpread.positions[0].name, 'You', 'Position 0 must be You');
    assert.equal(loveSpread.positions[1].name, 'Partner', 'Position 1 must be Partner');
    assert.ok(loveSpread.instructions.includes('two cards to explore your own perspective and the other person'));

    // Classic Spread (3 cards: Past, Present, Future)
    const classicSpread = getSpreadById('classic');
    assert.ok(classicSpread, 'Classic spread must exist');
    assert.equal(classicSpread.cardCount, 3, 'Classic spread must require 3 cards');
    assert.equal(classicSpread.positions[0].name, 'Past', 'Position 0 must be Past');
    assert.equal(classicSpread.positions[1].name, 'Present', 'Position 1 must be Present');
    assert.equal(classicSpread.positions[2].name, 'Future', 'Position 2 must be Future');

    // Legacy Aliases Map Verification
    assert.ok(TAROT_SPREADS_MAP['single_daily'], 'single_daily alias must resolve');
    assert.ok(TAROT_SPREADS_MAP['love_union'], 'love_union alias must resolve');
    assert.ok(TAROT_SPREADS_MAP['trinity_time'], 'trinity_time alias must resolve');
    assert.ok(TAROT_SPREADS_MAP['career_calling'], 'career_calling spread must resolve');
    assert.ok(TAROT_SPREADS_MAP['guidance_cross'], 'guidance_cross spread must resolve');
  });

  await t.test('3. Engine Shuffling & Deterministic Seeding over 78 Cards', () => {
    const engine = new TarotEngine();
    const shuffled1 = engine.shuffle(TAROT_DECK, 98765);
    const shuffled2 = engine.shuffle(TAROT_DECK, 98765);
    const shuffledRandom = engine.shuffle(TAROT_DECK);

    assert.equal(shuffled1.length, 78, 'Shuffled deck must retain full 78 card count');
    assert.deepEqual(
      shuffled1.map(c => c.id),
      shuffled2.map(c => c.id),
      'Identical seeds must produce identical 78-card shuffles'
    );
    assert.notDeepEqual(
      shuffled1.map(c => c.id),
      shuffledRandom.map(c => c.id),
      'Random shuffles should differ from seeded shuffle'
    );
  });

  await t.test('4. Daily Tarot Consultation — 1 Card with Date Anchor Persistence', () => {
    const engine = defaultTarotEngine;
    const persistence = new TarotPersistenceService();

    const reading = engine.conductReading({ spreadId: 'daily', question: 'Daily theme' });
    assert.equal(reading.cards.length, 1, 'Daily spread must draw 1 card');
    assert.ok(reading.cards[0].name, 'Card must have name');
    assert.ok(reading.synthesis.title.includes(reading.cards[0].name), 'Title must reference drawn card');

    // Save anchored to date
    const dateKey = '2026-10-09';
    persistence.saveDailyReading(reading, 'user_123', dateKey);

    // Reopen same date
    const reopened = persistence.getDailyReading('user_123', dateKey);
    assert.ok(reopened, 'Must retrieve saved daily reading');
    assert.equal(reopened.id, reading.id, 'Reading ID must match');
    assert.equal(reopened.cards[0].id, reading.cards[0].id, 'Drawn card must be identical on revisit');
  });

  await t.test('5. Love Tarot Consultation — 2 Cards (You & Partner) with Combined Relationship Synthesis', () => {
    const engine = defaultTarotEngine;
    const loveReading = engine.conductReading({
      spreadId: 'love',
      selectedCardIds: ['major_06_lovers', 'cups_02']
    });

    assert.equal(loveReading.cards.length, 2, 'Love spread must have 2 cards');
    assert.equal(loveReading.cards[0].id, 'major_06_lovers', 'Card 0 must be The Lovers');
    assert.equal(loveReading.cards[1].id, 'cups_02', 'Card 1 must be Two of Cups');
    assert.equal(loveReading.cards[0].positionName, 'You', 'Slot 0 is You');
    assert.equal(loveReading.cards[1].positionName, 'Partner', 'Slot 1 is Partner');

    // Combined synthesis verification
    assert.ok(loveReading.synthesis.title.includes('Relational Dynamic'), 'Title must cite relational dynamic');
    assert.ok(loveReading.synthesis.narrative.includes('The Lovers'), 'Narrative weaves You card');
    assert.ok(loveReading.synthesis.narrative.includes('Two of Cups'), 'Narrative weaves Partner card');
    assert.ok(loveReading.synthesis.narrative.includes('The Sacred Bridge'), 'Must contain the bridge synthesis');
  });

  await t.test('6. Classic Tarot Consultation — 3 Cards (Past, Present, Future)', () => {
    const engine = defaultTarotEngine;
    const classicReading = engine.conductReading({
      spreadId: 'classic',
      selectedCardIds: ['wands_ace', 'swords_03', 'pentacles_10']
    });

    assert.equal(classicReading.cards.length, 3, 'Classic spread must have 3 cards');
    assert.equal(classicReading.cards[0].positionName, 'Past', 'Position 0 must be Past');
    assert.equal(classicReading.cards[1].positionName, 'Present', 'Position 1 must be Present');
    assert.equal(classicReading.cards[2].positionName, 'Future', 'Position 2 must be Future');

    const cardIds = classicReading.cards.map(c => c.id);
    const uniqueIds = new Set(cardIds);
    assert.equal(uniqueIds.size, 3, 'All 3 cards must be unique in spread');

    assert.ok(classicReading.synthesis.narrative.includes('Ace of Wands'), 'Narrative weaves Past card');
    assert.ok(classicReading.synthesis.narrative.includes('Three of Swords'), 'Narrative weaves Present card');
    assert.ok(classicReading.synthesis.narrative.includes('Ten of Pentacles'), 'Narrative weaves Future card');
  });

  await t.test('7. Reading History Archive & Deletion', () => {
    const persistence = new TarotPersistenceService();
    persistence.clearAllReadings();

    const reading1 = defaultTarotEngine.conductReading({ spreadId: 'daily' });
    const reading2 = defaultTarotEngine.conductReading({ spreadId: 'love' });

    persistence.saveReading(reading1);
    persistence.saveReading(reading2);

    const history = persistence.getReadingHistory();
    assert.equal(history.length, 2, 'History must contain 2 saved readings');
    assert.equal(history[0].id, reading2.id, 'Newest reading should be first');

    // Reopen specific reading
    const fetched = persistence.getReadingById(reading1.id);
    assert.ok(fetched, 'Should fetch reading by ID');
    assert.equal(fetched.id, reading1.id);

    // Delete reading
    const deleted = persistence.deleteReading(reading1.id);
    assert.equal(deleted, true);
    assert.equal(persistence.getReadingHistory().length, 1, 'History length should be 1 after delete');
  });

  await t.test('8. UI Components Rendering — Card View, Carousel, and Result Sheet', () => {
    const majorCard = TAROT_DECK[1]; // The Magician
    const minorCard = TAROT_DECK.find(c => c.id === 'wands_ace'); // Ace of Wands

    // Major Arcana markup
    const majorHtml = renderTarotCardView({ card: majorCard, isFlipped: true, isReversed: false, size: 'medium' });
    assert.ok(majorHtml.includes('The Magician'), 'Rendered card contains Major name');
    assert.ok(majorHtml.includes('tarot-card-front'), 'Contains card front markup');
    assert.ok(majorHtml.includes('tarot-card-back'), 'Contains card back markup');

    // Minor Arcana markup
    const minorHtml = renderTarotCardView({ card: minorCard, isFlipped: true, isReversed: true, size: 'large' });
    assert.ok(minorHtml.includes('Ace of Wands'), 'Rendered card contains Minor name');
    assert.ok(minorHtml.includes('REV'), 'Rendered reversed badge');

    // Card Carousel markup
    const carouselHtml = renderCardCarousel({
      deck: TAROT_DECK,
      currentIndex: 0,
      selectedCardIds: ['major_00_fool'],
      spread: getSpreadById('love'),
      maxSelect: 2
    });
    assert.ok(carouselHtml.includes('tarot-carousel-viewport'), 'Contains carousel viewport');
    assert.ok(carouselHtml.includes('Select 1 more card'), 'Contains remaining count text');
    assert.ok(carouselHtml.includes('tarot-carousel-prev'), 'Contains prev button');
    assert.ok(carouselHtml.includes('tarot-carousel-next'), 'Contains next button');

    // Spread Table markup
    const spreadTableHtml = renderSpreadTable({
      spread: getSpreadById('classic'),
      cards: [{ card: TAROT_DECK[0], isReversed: false }, { card: TAROT_DECK[1], isReversed: true }, { card: TAROT_DECK[2], isReversed: false }],
      flippedStates: [true, false, false]
    });
    assert.ok(spreadTableHtml.includes('tarot-spread-table'), 'Contains spread table');
    assert.ok(spreadTableHtml.includes('Past'), 'Contains position name');

    // Result Sheet markup
    const testReading = defaultTarotEngine.conductReading({ spreadId: 'daily' });
    const resultHtml = renderTarotResultSheet({ reading: testReading });
    assert.ok(resultHtml.includes('tarot-result-sheet'), 'Contains result sheet root');
    assert.ok(resultHtml.includes('Hasta Samudrika Convergence'), 'Contains Palmistry convergence heading');
    assert.ok(resultHtml.includes('tarot-draw-again-btn'), 'Contains Draw Another Spread CTA');
    assert.ok(!resultHtml.includes('tarot-discuss-ai-btn'), 'Does not contain Discuss with AI Astrologer CTA');
    assert.ok(resultHtml.includes('Overview'), 'Contains Overview category tab');
    assert.ok(resultHtml.includes('Love'), 'Contains Love category tab');
    assert.ok(resultHtml.includes('Career'), 'Contains Career category tab');
  });
});
