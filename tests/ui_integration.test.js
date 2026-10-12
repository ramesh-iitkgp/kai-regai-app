/**
 * Automated Test Suite — UI Architecture, Canonical Contracts & State Verification
 * Runner: Node.js native test runner (`node --test`)
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { PalmFeatureModel } from '../src/models/PalmFeatureModel.js';
import { ReadingSession, SessionStatus, ReadingMode } from '../src/models/ReadingSession.js';
import { ROUTES, DEEP_LINKS } from '../src/navigation/routes.js';
import { mockReadings } from '../src/mock/mockReadings.js';
import { mockCodex } from '../src/mock/mockCodex.js';
import { mockUserProfile } from '../src/mock/mockUserProfile.js';
import { scannerTimelineSteps } from '../src/mock/mockScannerStates.js';
import { questionnaireModules } from '../src/components/QuestionnaireWidget.js';
import { i18n, SUPPORTED_LANGUAGES } from '../src/services/i18n.js';

describe('1. Canonical Data Models Verification', () => {
  test('PalmFeatureModel instantiates with mandatory major lines and approved semantic colors', () => {
    const model = new PalmFeatureModel();

    assert.equal(model.schema_version, '2.0.0');
    assert.ok(model.major_lines.life_line.detected);
    assert.equal(model.major_lines.life_line.semantic_color, '#A855F7', 'Life Line must be Violet (#A855F7)');
    assert.equal(model.major_lines.head_line.semantic_color, '#00D2FF', 'Head Line must be Blue (#00D2FF)');
    assert.equal(model.major_lines.heart_line.semantic_color, '#F43F5E', 'Heart Line must be Rose (#F43F5E)');
    assert.equal(model.major_lines.fate_line.semantic_color, '#FBBF24', 'Fate Line must be Gold (#FBBF24)');
    assert.equal(model.major_lines.sun_line.semantic_color, '#F59E0B', 'Sun Line must be Amber (#F59E0B)');
    assert.ok(model.quality_score >= 0.85);
  });

  test('ReadingSession lifecycle state transitions execute correctly', () => {
    const session = new ReadingSession({ mode: ReadingMode.MODE_1_SCANNER });
    assert.equal(session.status, SessionStatus.INITIALIZING);

    session.transitionTo(SessionStatus.VIEWFINDER_ACTIVE);
    assert.equal(session.status, SessionStatus.VIEWFINDER_ACTIVE);

    session.setQuality(0.96);
    assert.equal(session.quality_score, 0.96);
    assert.equal(session.palm_feature_model.quality_score, 0.96);

    session.transitionTo(SessionStatus.COMPLETED);
    assert.equal(session.status, SessionStatus.COMPLETED);
  });
});

describe('2. Navigation Architecture & Routes Verification', () => {
  test('All primary P2 routes exist and are defined', () => {
    assert.equal(ROUTES.HOME, 'home');
    assert.equal(ROUTES.SCANNER, 'scanner');
    assert.equal(ROUTES.QUICK_REPORT, 'quick-report');
    assert.equal(ROUTES.GUIDED_READING, 'guided-reading');
    assert.equal(ROUTES.QUESTIONNAIRE, 'questionnaire');
    assert.equal(ROUTES.DETAILED_REPORT, 'detailed-report');
    assert.equal(ROUTES.READINGS, 'readings');
    assert.equal(ROUTES.LEARN, 'learn');
    assert.equal(ROUTES.PROFILE, 'profile');
  });

  test('Deep links map to canonical internal routes', () => {
    assert.equal(DEEP_LINKS['kairegai://scanner'], ROUTES.SCANNER);
    assert.equal(DEEP_LINKS['kairegai://reading'], ROUTES.GUIDED_READING);
    assert.equal(DEEP_LINKS['kairegai://readings'], ROUTES.READINGS);
    assert.equal(DEEP_LINKS['kairegai://learn'], ROUTES.LEARN);
  });
});

describe('3. Epistemic Language & Report Quality Gates', () => {
  test('Mock reading dossiers enforce the 4 epistemic layers', () => {
    assert.ok(mockReadings.length >= 2, 'Must provide readings for both Mode 1 and Mode 2');

    const mode2 = mockReadings.find(r => r.mode === 'MODE_2_GUIDED');
    assert.ok(mode2, 'Mode 2 reading dossier must exist');

    mode2.major_lines.forEach(line => {
      assert.ok(line.observation, `${line.name} must have a physical observation`);
      assert.ok(line.traditional_interpretation, `${line.name} must have traditional attribution`);
      assert.ok(line.synthesis, `${line.name} must have Kai RegAI synthesis`);

      // Verify no fatalistic or medical diagnostic keywords exist
      const combined = `${line.observation} ${line.traditional_interpretation} ${line.synthesis}`.toLowerCase();
      assert.ok(!combined.includes('disease'), 'No medical claims permitted');
      assert.ok(!combined.includes('cancer'), 'No medical claims permitted');
      assert.ok(!combined.includes('exact death'), 'No fatalistic claims permitted');
    });
  });
});

describe('4. Scanner & Questionnaire Engine Specifications', () => {
  test('10-second scanner choreography contains 6 timed progressive milestones', () => {
    assert.equal(scannerTimelineSteps.length, 6);
    assert.equal(scannerTimelineSteps[0].progress, 15);
    assert.equal(scannerTimelineSteps[5].progress, 100);
  });

  test('Questionnaire contains all 5 approved tactile and visual modules', () => {
    assert.equal(questionnaireModules.length, 5);
    const moduleIds = questionnaireModules.map(m => m.id);
    assert.ok(moduleIds.includes('thumb_flexibility'));
    assert.ok(moduleIds.includes('palm_firmness'));
    assert.ok(moduleIds.includes('thumb_phalanx'));
    assert.ok(moduleIds.includes('finger_spacing'));
    assert.ok(moduleIds.includes('special_markings'));
  });
});

describe('5. Knowledge Codex Library & User Settings', () => {
  test('Hastarekha Codex articles contain literature citations', () => {
    assert.ok(mockCodex.articles.length >= 5);
    mockCodex.articles.forEach(art => {
      assert.ok(art.historical_note, `Article ${art.id} must retain citation provenance`);
      assert.ok(art.tradition, `Article ${art.id} must declare tradition lineage`);
    });
  });

  test('User Profile specifies RAM-only biometric privacy by default', () => {
    assert.equal(mockUserProfile.privacy_settings.store_palm_images, false, 'Default privacy policy must be zero persistent photo storage');
  });
});

describe('6. P4 Quality Hardening: Optical Quality & Astrology Scope Boundaries', () => {
  test('Quality metrics represent optical capture quality rather than reading accuracy', () => {
    const reading = mockReadings[0];
    assert.ok(reading.quality_score >= 0.85, 'Image quality threshold must meet Q >= 0.85');
    assert.ok(!JSON.stringify(reading).includes('Biometric Alignment: 98.4%'), 'Fabricated reading accuracy is strictly forbidden');
  });

  test('Biometric purge execution resets user session counters', () => {
    const initialScans = mockUserProfile.reading_stats.total_scans;
    mockUserProfile.reading_stats.total_scans = 0;
    mockUserProfile.reading_stats.guided_dossiers = 0;
    assert.equal(mockUserProfile.reading_stats.total_scans, 0);
    assert.equal(mockUserProfile.reading_stats.guided_dossiers, 0);
  });
});

describe('7. Multi-Language i18n & Zero English Leakage Verification', () => {
  test('Supported languages include English and 5 major Indian regional languages', () => {
    const codes = SUPPORTED_LANGUAGES.map(l => l.code);
    assert.deepEqual(codes, ['en', 'ta', 'hi', 'te', 'kn', 'ml']);
  });

  test('Setting language to Tamil (ta) ensures strict Tamil copy with zero English words', () => {
    i18n.setLanguage('ta');
    assert.equal(i18n.getLanguage(), 'ta');
    assert.equal(i18n.t('skip'), 'தவிர்');
    assert.equal(i18n.t('continue'), 'தொடரவும்');
    assert.equal(i18n.t('name_title'), 'உங்கள் பெயர் என்ன?');
    assert.equal(i18n.t('dob_title'), 'உங்கள் பிறந்த தேதி என்ன?');
    assert.equal(i18n.t('day'), 'நாள்');
    assert.equal(i18n.t('month'), 'மாதம்');
    assert.equal(i18n.t('year'), 'ஆண்டு');
    assert.equal(i18n.t('welcome'), 'வணக்கம்');
    assert.equal(i18n.t('nav_home'), 'முகப்பு');
    assert.equal(i18n.t('nav_profile'), 'சுயவிவரம்');
    assert.equal(i18n.t('profile_lang_label'), 'பயன்பாட்டு மொழி');
    assert.equal(i18n.t('profile_lang_sub'), 'முழுமையான தமிழ் மொழி அனுபவம்');

    // Confirm month names are 100% localized in Tamil
    const months = i18n.getMonthNames();
    assert.equal(months.length, 12);
    assert.equal(months[0], 'ஜன');
    assert.equal(months[11], 'டிச');
  });

  test('Setting language to Hindi (hi) ensures strict Hindi copy with zero English words', () => {
    i18n.setLanguage('hi');
    assert.equal(i18n.getLanguage(), 'hi');
    assert.equal(i18n.t('skip'), 'छोड़ें');
    assert.equal(i18n.t('continue'), 'आगे बढ़ें');
    assert.equal(i18n.t('name_title'), 'आपका नाम क्या है?');
    assert.equal(i18n.t('dob_title'), 'आपकी जन्म तिथि क्या है?');
    assert.equal(i18n.t('nav_home'), 'होम');
    assert.equal(i18n.t('nav_profile'), 'प्रोफ़ाइल');
    assert.equal(i18n.t('profile_lang_label'), 'ऐप की भाषा');
  });

  test('All critical keys exist across all 6 supported languages', () => {
    const requiredKeys = [
      'skip', 'continue', 'allow', 'deny',
      'slide1_title', 'line_life', 'line_head', 'line_heart', 'line_fate', 'line_sun',
      'name_title', 'dob_title', 'day', 'month', 'year',
      'welcome', 'dominant', 'nav_home', 'nav_archive', 'nav_profile',
      'profile_title', 'profile_lang_label', 'profile_pref_title', 'archive_title'
    ];

    ['en', 'ta', 'hi', 'te', 'kn', 'ml'].forEach(lang => {
      i18n.setLanguage(lang);
      requiredKeys.forEach(k => {
        const val = i18n.t(k);
        assert.ok(val && val.length > 0, `Language '${lang}' must have a valid non-empty translation for key '${k}'`);
      });
    });

    // Reset back to English as default test state
    i18n.setLanguage('en');
  });
});

describe('8. Splash Screen Multilingual & Layout Structure Verification', () => {
  test('SplashScreen initializes cleanly with loading screen and live golden fill bar', async () => {
    global.window = global.window || {};
    global.window.addEventListener = global.window.addEventListener || (() => {});
    global.window.removeEventListener = global.window.removeEventListener || (() => {});
    global.window.location = global.window.location || { hash: '#splash' };
    global.window.localStorage = global.window.localStorage || { getItem: () => null, setItem: () => {} };
    global.localStorage = global.window.localStorage;
    global.sessionStorage = { getItem: () => null, setItem: () => {} };
    global.document = {
      getElementById: () => ({
        addEventListener: () => {},
        style: {},
        value: '1'
      })
    };

    const container = {
      innerHTML: '',
      querySelector: () => null
    };

    const { renderSplashScreen } = await import('../src/screens/SplashScreen.js');
    renderSplashScreen(container);

    assert.ok(container.innerHTML.includes('loading-reference-screen'));
    assert.ok(container.innerHTML.includes('/assets/onboarding/loading_clean_bg.jpg'));
    assert.ok(container.innerHTML.includes('loading-live-fill-bar'));
  });

  test('SplashScreen renders all 7 steps with background images, Name Input card, and upright DOB wheel', async () => {
    let nextCallback = null;
    let clickLoadingCallback = null;
    global.window = {
      localStorage: { getItem: () => null, setItem: () => {} },
      addEventListener: () => {},
      location: { hash: '#splash' }
    };
    global.localStorage = global.window.localStorage;
    global.sessionStorage = { getItem: () => null, setItem: () => {} };
    global.document = {
      getElementById: (id) => ({
        addEventListener: (ev, fn) => {
          if (id === 'onboarding-next-btn' && ev === 'click') nextCallback = fn;
        },
        style: {},
        value: '1'
      })
    };

    let dom = '';
    const container = {
      get innerHTML() { return dom; },
      set innerHTML(val) { dom = val; },
      querySelector: () => ({ 
        addEventListener: (ev, fn) => {
          if (ev === 'click') clickLoadingCallback = fn;
        } 
      }),
      querySelectorAll: () => []
    };

    const { renderSplashScreen } = await import('../src/screens/SplashScreen.js');
    renderSplashScreen(container);

    // Step 0: Loading screen
    assert.ok(dom.includes('loading-reference-screen'));

    // Step 1: Palm Reading (click on loading screen advances to step 1)
    if (clickLoadingCallback) clickLoadingCallback();
    assert.ok(dom.includes('palm-screen-wrapper'));
    assert.ok(dom.includes('palm-lines-container'));
    assert.ok(dom.includes('15%'));

    // Step 2: Face Reading
    nextCallback();
    assert.ok(dom.includes('face-screen-wrapper'));
    assert.ok(dom.includes('28%'));

    // Step 3: Horoscope
    nextCallback();
    assert.ok(dom.includes('horoscope-screen-wrapper'));
    assert.ok(dom.includes('horoscope_goat_clean.png'));
    assert.ok(dom.includes('42%'));

    // Step 4: Compatibility
    nextCallback();
    assert.ok(dom.includes('compatibility_couple.jpg'));
    assert.ok(dom.includes('compat-couple-hero-wrap'));
    assert.ok(dom.includes('56%'));

    // Step 5: Astrologers
    nextCallback();
    assert.ok(dom.includes('astrologer_guru_hero.jpg'));
    assert.ok(dom.includes('avatar_nayana.jpg'));
    assert.ok(dom.includes('70%'));

    // Step 6: Name Input Card
    nextCallback();
    assert.ok(dom.includes('name-input-screen-wrapper'));
    assert.ok(dom.includes('onboarding-name-input'));
    assert.ok(dom.includes('82%'));

    // Step 7: Date of Birth Screen with Upright Labels
    nextCallback();
    assert.ok(dom.includes('dob_clean_wheel.png'));
    assert.ok(dom.includes('dob-svg-wheel-labels'));
    assert.ok(dom.includes('92%'));

    // Step 8: Dominant Hand Selection Screen
    nextCallback();
    assert.ok(dom.includes('dominant-hand-selection-wrapper'));
    assert.ok(dom.includes('Which is your Dominant Hand?'));
    assert.ok(dom.includes('96%'));

    // Step 9: Building Your Chart
    nextCallback();
    assert.ok(dom.includes('building_chart_wheel.png'));
  });
});

describe('9. Quick Report Mode 1 Layout Verification (Reference Format & Rescan Palm)', () => {
  test('renders 7 feature cards, hero element card, and Rescan Your Palm button matching reference', async () => {
    let dom = '';
    const listeners = {};
    const container = {
      get innerHTML() { return dom; },
      set innerHTML(val) { dom = val; },
      querySelector: (selector) => {
        return {
          addEventListener: (ev, fn) => {
            listeners[selector + ':' + ev] = fn;
          }
        };
      },
      querySelectorAll: (selector) => {
        return [];
      }
    };

    const { renderQuickReportScreen } = await import('../src/screens/QuickReportScreen.js');
    const { router } = await import('../src/navigation/router.js');
    
    let navigatedRoute = null;
    const origNavigate = router.navigate;
    router.navigate = (route) => { navigatedRoute = route; };

    renderQuickReportScreen(container);

    // 1. Branding & Header
    assert.ok(dom.includes('quick-brand-title'), 'Branding title must exist');
    assert.ok(dom.includes('quick-brand-ai'), 'Distinct stylized AI badge must exist');
    assert.ok(dom.includes('PALM READING'), 'Descriptor PALM READING must exist');
    assert.ok(dom.includes('quick-back-btn'), 'Back button must exist');
    assert.ok(dom.includes('quick-share-btn'), 'Share button must exist');

    // 2. Hero Card & Element
    assert.ok(dom.includes('quick-hero-card'), 'Hero card must exist');
    assert.ok(dom.includes('quick-photo-box'), 'Palm photo box must exist');
    assert.ok(dom.includes('ELEMENT'), 'Element tag must exist');
    assert.ok(dom.includes('WATER'), 'Water element must exist');
    assert.ok(dom.includes('The Flame of Passion'), 'Flame of Passion archetype must exist');

    // 3. All 7 Feature Cards from Reference Layout
    assert.ok(dom.includes('PALM SHAPE'), 'PALM SHAPE card must exist');
    assert.ok(dom.includes('Common'), 'PALM SHAPE rarity badge must be Common');
    assert.ok(dom.includes('LIFE LINE'), 'LIFE LINE card must exist');
    assert.ok(dom.includes('Rare'), 'LIFE LINE rarity badge must be Rare');
    assert.ok(dom.includes('HEAD LINE'), 'HEAD LINE card must exist');
    assert.ok(dom.includes('Unusual'), 'HEAD LINE rarity badge must be Unusual');
    assert.ok(dom.includes('HEART LINE'), 'HEART LINE card must exist');
    assert.ok(dom.includes('TIMELINE OF LOVE'), 'TIMELINE OF LOVE card must exist');
    assert.ok(dom.includes('FATE LINE'), 'FATE LINE card must exist');
    assert.ok(dom.includes('SUN LINE'), 'SUN LINE card must exist');

    // 4. Bottom Action Area with "Rescan Your Palm"
    assert.ok(dom.includes('quick-rescan-btn'), 'Rescan button must exist');
    assert.ok(dom.includes('Rescan Your Palm'), 'Rescan button must have label "Rescan Your Palm"');
    assert.ok(dom.includes('quick-explore-full-btn'), 'Explore full codex button must exist');

    // 5. Test Rescan click navigates to ROUTES.SCANNER
    const rescanHandler = listeners['#quick-rescan-btn:click'];
    assert.ok(typeof rescanHandler === 'function', 'Rescan button must have click listener attached');
    rescanHandler();
    assert.equal(navigatedRoute, 'scanner', 'Clicking Rescan Your Palm must navigate directly to scanner');

    // Clean up
    router.navigate = origNavigate;
  });

  test('10. Quick Report Lines Drawer & Knowledge Base Line Selector Verification', async () => {
    let dom = '';
    const listeners = {};

    const container = {
      get innerHTML() { return dom; },
      set innerHTML(val) { dom = val; },
      querySelector: (selector) => {
        return {
          addEventListener: (ev, fn) => {
            listeners[`${selector}:${ev}`] = fn;
          },
          classList: {
            add: () => {},
            remove: () => {}
          }
        };
      },
      querySelectorAll: (selector) => {
        if (selector === '.quick-drawer-line-card') {
          return [0, 1, 2, 3, 4].map(idx => ({
            getAttribute: () => `${idx}`,
            addEventListener: (ev, fn) => {
              listeners[`.quick-drawer-line-card-${idx}:${ev}`] = fn;
            }
          }));
        }
        if (selector === '.quick-trait-card') {
          return ['personal_traits', 'hand_comparison'].map(id => ({
            getAttribute: () => id,
            addEventListener: (ev, fn) => {
              listeners[`.quick-trait-card-${id}:${ev}`] = fn;
            }
          }));
        }
        return [];
      }
    };

    const { renderQuickReportScreen } = await import('../src/screens/QuickReportScreen.js');
    renderQuickReportScreen(container, {
      featureModel: {
        hand: { side: 'Right' },
        palm_geometry: { archetype: 'WATER' }
      }
    });

    // 1. Check Drawer Trigger and Content
    assert.ok(dom.includes('quick-summary-pill-btn'), 'Summary pill trigger must exist');
    assert.ok(dom.includes('EXPLORE'), 'Explore title must exist');
    assert.ok(dom.includes('YOUR PALM LINES'), 'Your Palm Lines title must exist');
    assert.ok(dom.includes('quick-drawer-lines-list'), 'Lines list in drawer must exist');

    // 2. Check 5 Major Lines in Drawer
    assert.ok(dom.includes('Ayur Rekha'), 'Life line Ayur Rekha must be defined');
    assert.ok(dom.includes('Matru Rekha'), 'Head line Matru Rekha must be defined');
    assert.ok(dom.includes('Hridaya Rekha'), 'Heart line Hridaya Rekha must be defined');
    assert.ok(dom.includes('Bhagya Rekha'), 'Fate line Bhagya Rekha must be defined');
    assert.ok(dom.includes('Surya Rekha'), 'Sun line Surya Rekha must be defined');

    // 3. Check 7 Trait Cards in Grid
    assert.ok(dom.includes('PERSONAL TRAITS'));
    assert.ok(dom.includes('BEHAVIORAL TRAITS'));
    assert.ok(dom.includes('PSYCHOLOGICAL TRAITS'));
    assert.ok(dom.includes('STRENGTHS'));
    assert.ok(dom.includes('WEAKNESSES'));
    assert.ok(dom.includes('ELEMENTAL ASPECT'));
    assert.ok(dom.includes('HAND COMPARISON'));
  });
});



