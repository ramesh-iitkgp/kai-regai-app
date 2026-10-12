/**
 * ReadingsArchiveScreen Component — Readings Timeline & Hand Comparator
 * Matches Stitch: design/stitch/kai_regai_readings_archive/
 * Source of truth: docs/p2/SCREEN_SPECIFICATIONS.md (SCR-RDG-001)
 */

import { router } from '../navigation/router.js';
import { ROUTES } from '../navigation/routes.js';
import { mockReadings } from '../mock/mockReadings.js';
import { readingHistoryService } from '../services/ReadingHistoryService.js';
import { i18n } from '../services/i18n.js';

export function renderReadingsArchiveScreen(container) {
  let activeFilter = router.preservedState.readingsFilter || 'ALL';
  let persistedItems = [];

  // Async fetch from local storage
  readingHistoryService.listHistory().then(({ records }) => {
    if (records && records.length > 0) {
      persistedItems = records.map(r => ({
        id: r.readingId,
        title: r.metadata.displayTitle,
        hand_side: r.metadata.handSide,
        mode: r.readingMethod === 'MODE_2_QUESTIONNAIRE' ? 'MODE_2_GUIDED' : 'MODE_1_SCANNER',
        timestamp: r.createdAt,
        summary: r.metadata.summary,
        tags: r.metadata.tags,
        isPersisted: true,
        persistedRecord: r
      }));
      render();
    }
  }).catch(() => {});

  function render() {
    const allList = [...persistedItems, ...mockReadings];
    const filtered = allList.filter(r => {
      if (activeFilter === 'QUICK') return r.mode === 'MODE_1_SCANNER';
      if (activeFilter === 'GUIDED') return r.mode === 'MODE_2_GUIDED';
      return true;
    });

    container.innerHTML = `
      <div style="padding: 16px 16px calc(var(--bottom-nav-height) + 24px); display: flex; flex-direction: column; gap: 18px;">
        
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="font-family: var(--font-display); font-size: 26px; font-weight: 600; color: var(--color-text-high);">
              ${i18n.t('archive_title')}
            </h1>
            <p style="font-size: 13px; color: var(--color-on-surface-variant); margin-top: 2px;">
              ${i18n.t('archive_sub')}
            </p>
          </div>
          <button id="archive-compare-btn" class="kai-btn-icon" aria-label="${i18n.t('archive_compare')}" title="${i18n.t('archive_compare')}">
            <span class="material-symbols-outlined">compare_arrows</span>
          </button>
        </div>

        <!-- Filter Selector Pills -->
        <div style="display: flex; gap: 8px;">
          <button class="kai-badge ${activeFilter === 'ALL' ? 'kai-badge-secondary' : ''}" data-filter="ALL" style="cursor: pointer; padding: 6px 14px; border-radius: var(--radius-full); background: ${activeFilter === 'ALL' ? 'var(--color-secondary)' : 'var(--color-surface-container-high)'}; color: ${activeFilter === 'ALL' ? '#000' : 'var(--color-on-surface)'}; border: none;">
            ${i18n.t('archive_filter_all')} (${allList.length})
          </button>
          <button class="kai-badge ${activeFilter === 'QUICK' ? 'kai-badge-secondary' : ''}" data-filter="QUICK" style="cursor: pointer; padding: 6px 14px; border-radius: var(--radius-full); background: ${activeFilter === 'QUICK' ? 'var(--color-secondary)' : 'var(--color-surface-container-high)'}; color: ${activeFilter === 'QUICK' ? '#000' : 'var(--color-on-surface)'}; border: none;">
            ${i18n.t('archive_filter_quick')}
          </button>
          <button class="kai-badge ${activeFilter === 'GUIDED' ? 'kai-badge-secondary' : ''}" data-filter="GUIDED" style="cursor: pointer; padding: 6px 14px; border-radius: var(--radius-full); background: ${activeFilter === 'GUIDED' ? 'var(--color-secondary)' : 'var(--color-surface-container-high)'}; color: ${activeFilter === 'GUIDED' ? '#000' : 'var(--color-on-surface)'}; border: none;">
            ${i18n.t('archive_filter_guided')}
          </button>
        </div>

        <!-- Readings Cards List -->
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${filtered.length === 0 ? `
            <div class="kai-card" style="padding: 32px 16px; text-align: center;">
              <span class="material-symbols-outlined" style="font-size: 36px; color: var(--color-outline);">inventory_2</span>
              <p style="font-size: 14px; color: var(--color-on-surface-variant); margin-top: 8px;">${i18n.t('archive_empty')}</p>
            </div>
          ` : filtered.map(item => {
            const currentLang = i18n.getLanguage();
            const displayTitle = (item.title && (item.title.includes('Hastarekha') || item.title.includes('Karmic') || item.title.includes('Solar') || item.title.includes('Radiance') || item.title.includes('Dossier') || item.title.includes('Blueprint')))
              ? (item.title.includes('Solar') || item.title.includes('Radiance') ? i18n.t('mock_title_0') : i18n.t('mock_title_1'))
              : item.title;

            const displaySummary = (item.summary && (item.summary.includes('In-depth') || item.summary.includes('Comprehensive') || item.summary.includes('Deep') || item.summary.includes('7-chapter')))
              ? (item.summary.includes('Deep') ? i18n.t('mock_summary_0') : i18n.t('mock_summary_1'))
              : item.summary;

            const TAG_LOCALIZATION = {
              'Guided In-Depth': { en: 'Guided In-Depth', ta: 'வழிகாட்டப்பட்ட அறிக்கை', hi: 'निर्देशित गहन विश्लेषण', te: 'మార్గదర్శక లోతైన విశ్లేషణ', kn: 'ಮಾರ್ಗದರ್ಶಿತ ಆಳವಾದ ವರದಿ', ml: 'മാർഗ്ഗനിർദ്ദേശിതമായ വിശകലനം' },
              'Trident Marking': { en: 'Trident Marking', ta: 'திரிசூலக் குறி', hi: 'त्रिशूल चिह्न', te: 'త్రిశూల చిహ్నం', kn: 'ತ್ರಿಶೂಲ ಗುರುತು', ml: 'ത്രിശൂല അടയാളം' },
              'Supple Thumb': { en: 'Supple Thumb', ta: 'நெகிழ்வான விரல்', hi: 'लचीला अंगूठा', te: 'సరళమైన బొటనవేలు', kn: 'ಮೃದುವಾದ ಹೆಬ್ಬೆರಳು', ml: 'വഴക്കമുള്ള തള്ളവിരൽ' },
              'Vedic Synthesis': { en: 'Vedic Synthesis', ta: 'வேத சாமுத்ரிகா', hi: 'वैदिक संश्लेषण', te: 'వైదిక సంశ్లేషణ', kn: 'ವೈದಿಕ ಸಮನ್ವಯ', ml: 'വൈദിക സമന്വയം' },
              'Deep Life Line': { en: 'Deep Life Line', ta: 'ஆழ்ந்த ஆயுள் ரேகை', hi: 'गहरी जीवन रेखा', te: 'లోతైన జీవన రేఖ', kn: 'ಆಳವಾದ ಜೀವ ರೇಖೆ', ml: 'ആഴമുള്ള ജീവരേഖ' },
              'High Solar Mount': { en: 'High Solar Mount', ta: 'சூரிய மேடு', hi: 'उन्नत सूर्य पर्वत', te: 'ఉన్నత సూర్య పర్వతం', kn: 'ಉನ್ನತ ಸೂರ್ಯ ಪರ್ವತ', ml: 'ഉയർന്ന സൂര്യ പർവ്വതം' },
              'Solar Vitality': { en: 'Solar Vitality', ta: 'சூரிய ஆற்றல்', hi: 'सौर तेज', te: 'సౌర తేజస్సు', kn: 'ಸೌರ ಚೈತನ್ಯ', ml: 'സൗര ഓജസ്സ്' },
              'Expansive Vitality': { en: 'Expansive Vitality', ta: 'விரிவான ஆற்றல்', hi: 'विस्तृत जीवन शक्ति', te: 'విస్తృత ప్రాణశక్తి', kn: 'ವಿಸ್ತಾರವಾದ ಜೀವಶಕ್ತಿ', ml: 'ವಿಪುಲമായ ജീവശക്തി' },
              'Creative Intellect': { en: 'Creative Intellect', ta: 'படைப்பு அறிவுத்திறன்', hi: 'रचनात्मक बुद्धि', te: 'సృజనాత్మక మేధస్సు', kn: 'ಸೃಜನಶೀಲ ಬುದ್ಧಿಶಕ್ತಿ', ml: 'സൃഷ്ടിപരമായ ബുദ്ധിശക്തി' },
              'Vedic Solar Line': { en: 'Vedic Solar Line', ta: 'வேத சூரிய ரேகை', hi: 'वैदिक सूर्य रेखा', te: 'వైదిక సూర్య రేఖ', kn: 'ವೈದಿಕ ಸೂರ್ಯ ರೇಖೆ', ml: 'വൈദിക സൂര്യ രേഖ' }
            };

            const displayTags = (item.tags || []).map(t => TAG_LOCALIZATION[t]?.[currentLang] || TAG_LOCALIZATION[t]?.en || t);

            return `
              <div class="kai-card ${item.mode === 'MODE_2_GUIDED' ? 'kai-card-gold-rim' : ''}" 
                   data-reading-id="${item.id}"
                   role="button" tabindex="0"
                   style="padding: 16px; cursor: pointer; background: var(--color-surface-container);">
                
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="material-symbols-outlined" style="color: ${item.mode === 'MODE_2_GUIDED' ? 'var(--color-secondary)' : 'var(--color-primary)'}; font-size: 20px;">
                      ${item.mode === 'MODE_2_GUIDED' ? 'menu_book' : 'document_scanner'}
                    </span>
                    <span style="font-size: 11px; font-weight: 700; color: var(--color-outline); letter-spacing: 0.04em;">
                      ${item.hand_side === 'RIGHT' ? i18n.t('dominant_right') : i18n.t('dominant_left')} • ${item.mode === 'MODE_2_GUIDED' ? i18n.t('archive_guided_badge') : i18n.t('archive_scanner_badge')}
                    </span>
                  </div>
                  <span style="font-size: 11px; color: var(--color-outline); font-family: monospace;">
                    ${new Date(item.timestamp).toLocaleDateString()}
                  </span>
                </div>

                <h3 style="font-size: 16px; font-weight: 600; color: var(--color-text-high);">
                  ${displayTitle}
                </h3>
                <p style="font-size: 12px; color: var(--color-on-surface-variant); margin-top: 4px; line-height: 1.4;">
                  ${displaySummary}
                </p>

                <!-- Tags -->
                <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px;">
                  ${displayTags.map(t => `
                    <span class="kai-badge" style="font-size: 9px; background: rgba(255,255,255,0.05); color: var(--color-on-surface-variant);">
                      ${t}
                    </span>
                  `).join('')}
                </div>

              </div>
            `;
          }).join('')}
        </div>

      </div>
    `;

    // Filter selector listeners
    container.querySelectorAll('[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeFilter = btn.getAttribute('data-filter');
        router.preservedState.readingsFilter = activeFilter;
        render();
      });
    });

    // Card click listener
    container.querySelectorAll('[data-reading-id]').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-reading-id');
        const found = allList.find(x => x.id === id);
        if (found?.isPersisted) {
          const dossier = found.persistedRecord.interpretationSnapshot;
          if (found.mode === 'MODE_2_GUIDED') {
            router.navigate(ROUTES.DETAILED_REPORT, { dossier, id });
          } else {
            router.navigate(ROUTES.QUICK_REPORT, { dossier, id });
          }
        } else {
          const r = mockReadings.find(x => x.id === id);
          if (r?.mode === 'MODE_2_GUIDED') {
            router.navigate(ROUTES.DETAILED_REPORT, { id });
          } else {
            router.navigate(ROUTES.QUICK_REPORT, { id });
          }
        }
      });
    });

    // Compare Hands button listener
    container.querySelector('#archive-compare-btn')?.addEventListener('click', () => {
      alert(`${i18n.t('archive_compare')}: ${i18n.t('dominant_left')} (${i18n.t('layer_traditional')}) — ${i18n.t('dominant_right')} (${i18n.t('layer_synthesis')}).`);
    });
  }

  render();
}
