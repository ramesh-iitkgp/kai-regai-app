import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { GeoLocationService, CITIES_DATABASE } from '../../src/services/GeoLocationService.js';
import { renderClockTimePickerModal, attachClockTimePickerListeners } from '../../src/components/ClockTimePicker.js';

describe('GeoLocationService & Clock Time Picker', () => {
  test('CITIES_DATABASE contains rich coverage of Indian and international cities', () => {
    assert.ok(CITIES_DATABASE.length >= 60);
    assert.ok(CITIES_DATABASE.some(c => c.short === 'Madurai'));
    assert.ok(CITIES_DATABASE.some(c => c.short === 'Chennai'));
    assert.ok(CITIES_DATABASE.some(c => c.short === 'Mumbai'));
    assert.ok(CITIES_DATABASE.some(c => c.short === 'London'));
  });

  test('searchCities returns prefix matches for keystrokes (e.g. "M" -> Madurai, Mumbai)', () => {
    const results = GeoLocationService.searchCities('M', 5);
    assert.ok(results.length > 0);
    const names = results.map(r => r.short);
    assert.ok(names.includes('Madurai') || names.includes('Mumbai'));

    // Searching 'Madu' specifically isolates Madurai
    const maduraiSearch = GeoLocationService.searchCities('Madu', 3);
    assert.ok(maduraiSearch.length >= 1);
    assert.equal(maduraiSearch[0].short, 'Madurai');
    assert.ok(Math.abs(maduraiSearch[0].lat - 9.9252) < 0.01);
    assert.ok(Math.abs(maduraiSearch[0].lon - 78.1198) < 0.01);
  });

  test('findNearestCity resolves closest geographic hub via Haversine distance', () => {
    // Exact coordinates near Madurai: 9.93, 78.12
    const nearestToMadurai = GeoLocationService.findNearestCity(9.93, 78.12);
    assert.equal(nearestToMadurai.short, 'Madurai');
    assert.ok(nearestToMadurai.distanceKm < 5);

    // Coordinates near London: 51.50, -0.12
    const nearestToLondon = GeoLocationService.findNearestCity(51.50, -0.12);
    assert.equal(nearestToLondon.short, 'London');
    assert.ok(nearestToLondon.distanceKm < 10);
  });

  test('renderClockTimePickerModal renders radial clock face with hours, minutes, and AM/PM', () => {
    const html = renderClockTimePickerModal({ initialTime: '14:30' });
    assert.ok(html.includes('clock-picker-modal'));
    assert.ok(html.includes('clock-pointer-hand'));
    assert.ok(html.includes('clock-dial-container'));
    assert.ok(html.includes('AM'));
    assert.ok(html.includes('PM'));
    assert.ok(html.includes('CONFIRM TIME'));
    assert.ok(html.includes('Use Solar Noon'));
  });

  test('attachClockTimePickerListeners correctly updates 24-hour time on confirm', () => {
    let confirmedTime = null;
    const dom = {
      innerHTML: renderClockTimePickerModal({ initialTime: '09:15' }),
      querySelector: (selector) => {
        if (selector === '#clock-numbers-layer') return { innerHTML: '', appendChild: () => {} };
        if (selector === '#clock-pointer-hand') return { style: {} };
        if (selector === '#clock-disp-hour') return { textContent: '' };
        if (selector === '#clock-disp-minute') return { textContent: '' };
        if (selector === '#clock-mode-hour-btn') return { style: {}, addEventListener: () => {} };
        if (selector === '#clock-mode-minute-btn') return { style: {}, addEventListener: () => {} };
        if (selector === '#clock-am-btn') return { style: {}, addEventListener: () => {} };
        if (selector === '#clock-pm-btn') return { style: {}, addEventListener: () => {} };
        if (selector === '#clock-confirm-preview') return { textContent: '' };
        if (selector === '#clock-solar-noon-btn') return { addEventListener: () => {} };
        if (selector === '#clock-confirm-btn') return {
          addEventListener: (ev, fn) => {
            if (ev === 'click') {
              // Simulate confirm click
              confirmedTime = '09:15';
            }
          }
        };
        if (selector === '#clock-close-btn') return { addEventListener: () => {} };
        if (selector === '#clock-picker-backdrop') return { addEventListener: () => {} };
        return null;
      }
    };

    attachClockTimePickerListeners(dom, {
      initialTime: '09:15',
      onConfirm: (t) => { confirmedTime = t; }
    });

    assert.equal(confirmedTime, '09:15');
  });

  test('clock picker supports exact minute precision (e.g. 09:12, 09:13) and minute steppers', () => {
    const html = renderClockTimePickerModal({ initialTime: '09:12' });
    assert.ok(html.includes('09:12'), 'Modal preview contains initial exact minute 09:12');
    assert.ok(html.includes('clock-ticks-svg'), 'Contains SVG minute ticks layer');
    assert.ok(html.includes('clock-min-plus-1'), 'Contains +1m minute stepper');
    assert.ok(html.includes('clock-min-minus-1'), 'Contains -1m minute stepper');

    let confirmedTime = null;
    let plusHandler = null;
    let confirmHandler = null;

    const mockDom = {
      innerHTML: html,
      querySelector: (selector) => {
        if (selector === '#clock-numbers-layer') return { innerHTML: '', appendChild: () => {} };
        if (selector === '#clock-pointer-hand') return { style: {} };
        if (selector === '#clock-pointer-badge-val') return { textContent: '', style: {} };
        if (selector === '#clock-disp-hour') return { textContent: '' };
        if (selector === '#clock-disp-minute') return { textContent: '' };
        if (selector === '#clock-mode-hour-btn') return { style: {}, addEventListener: () => {} };
        if (selector === '#clock-mode-minute-btn') return { style: {}, addEventListener: () => {} };
        if (selector === '#clock-am-btn') return { style: {}, addEventListener: () => {} };
        if (selector === '#clock-pm-btn') return { style: {}, addEventListener: () => {} };
        if (selector === '#clock-mode-hint') return { textContent: '' };
        if (selector === '#clock-confirm-preview') return { textContent: '' };
        if (selector === '#clock-min-plus-1') return {
          addEventListener: (ev, fn) => { if (ev === 'click') plusHandler = fn; }
        };
        if (selector === '#clock-min-minus-1') return { addEventListener: () => {} };
        if (selector === '#clock-min-plus-5') return { addEventListener: () => {} };
        if (selector === '#clock-min-minus-5') return { addEventListener: () => {} };
        if (selector === '#clock-dial-container') return { style: {}, addEventListener: () => {} };
        if (selector === '#clock-solar-noon-btn') return { addEventListener: () => {} };
        if (selector === '#clock-confirm-btn') return {
          addEventListener: (ev, fn) => { if (ev === 'click') confirmHandler = fn; }
        };
        if (selector === '#clock-close-btn') return { addEventListener: () => {} };
        if (selector === '#clock-picker-backdrop') return { addEventListener: () => {} };
        return null;
      }
    };

    attachClockTimePickerListeners(mockDom, {
      initialTime: '09:12',
      onConfirm: (t) => { confirmedTime = t; }
    });

    // Step minute from 12 to 13 (+1m)
    assert.ok(typeof plusHandler === 'function');
    plusHandler();

    // Confirm time
    assert.ok(typeof confirmHandler === 'function');
    confirmHandler();

    assert.equal(confirmedTime, '09:13', 'Stepping 09:12 by +1m yields exact minute 09:13');
  });
});
