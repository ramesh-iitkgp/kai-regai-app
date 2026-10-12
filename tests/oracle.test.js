import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderOracleSphere } from '../src/oracle/components/OracleSphere.js';
import { renderAskOracleScreen, SUGGESTED_QUESTIONS } from '../src/oracle/screens/AskOracleScreen.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

test('Oracle Module & Animation Suite', async (t) => {
  await t.test('1. Oracle media assets exist in public/assets/oracle and are non-empty', () => {
    const assetsDir = path.join(projectRoot, 'public', 'assets', 'oracle');
    assert.ok(fs.existsSync(assetsDir), 'public/assets/oracle directory should exist');

    const mp4Path = path.join(assetsDir, 'oracle_loop.mp4');
    const webpPath = path.join(assetsDir, 'oracle_loop.webp');
    const gifPath = path.join(assetsDir, 'oracle_loop.gif');

    assert.ok(fs.existsSync(mp4Path), 'oracle_loop.mp4 must exist');
    assert.ok(fs.existsSync(webpPath), 'oracle_loop.webp must exist');
    assert.ok(fs.existsSync(gifPath), 'oracle_loop.gif must exist');

    const mp4Stat = fs.statSync(mp4Path);
    const webpStat = fs.statSync(webpPath);
    const gifStat = fs.statSync(gifPath);

    assert.ok(mp4Stat.size > 50000, `oracle_loop.mp4 should be substantial (>50KB, got ${mp4Stat.size})`);
    assert.ok(webpStat.size > 100000, `oracle_loop.webp should be substantial (>100KB, got ${webpStat.size})`);
    assert.ok(gifStat.size > 100000, `oracle_loop.gif should be substantial (>100KB, got ${gifStat.size})`);
  });

  await t.test('2. renderOracleSphere generates valid markup with video and WebP/GIF fallback stack', () => {
    const htmlIdle = renderOracleSphere({ state: 'idle', size: 220 });
    
    assert.ok(htmlIdle.includes('class="oracle-sphere-wrapper'), 'Contains sphere wrapper');
    assert.ok(htmlIdle.includes('data-state="idle"'), 'Has idle state attribute');
    assert.ok(htmlIdle.includes('--sphere-size: 220px;'), 'Sets correct size variable');
    assert.ok(htmlIdle.includes('class="oracle-loop-video"'), 'Contains looping video element');
    assert.ok(htmlIdle.includes('autoplay'), 'Video has autoplay');
    assert.ok(htmlIdle.includes('loop'), 'Video has loop attribute');
    assert.ok(htmlIdle.includes('muted'), 'Video has muted attribute');
    assert.ok(htmlIdle.includes('playsinline'), 'Video has playsinline attribute');
    assert.ok(htmlIdle.includes('src="/assets/oracle/oracle_loop.mp4"'), 'Points to MP4 source');
    assert.ok(htmlIdle.includes('srcset="/assets/oracle/oracle_loop.webp"'), 'Points to WebP source');
    assert.ok(htmlIdle.includes('src="/assets/oracle/oracle_loop.gif"'), 'Points to GIF fallback');
    assert.ok(htmlIdle.includes('class="oracle-sphere-specular-overlay"'), 'Contains specular glass overlay');
  });

  await t.test('3. renderOracleSphere supports consulting state with mantram status text', () => {
    const status = 'Reading the moment...';
    const htmlConsulting = renderOracleSphere({ 
      state: 'consulting', 
      size: 240, 
      statusText: status 
    });

    assert.ok(htmlConsulting.includes('data-state="consulting"'), 'Has consulting state attribute');
    assert.ok(htmlConsulting.includes('--sphere-size: 240px;'), 'Sets correct size variable');
    assert.ok(htmlConsulting.includes('class="oracle-status-text"'), 'Contains status text element');
    assert.ok(htmlConsulting.includes(status), 'Renders provided status text');
  });

  await t.test('4. renderOracleSphere supports result state with compact sizing', () => {
    const htmlResult = renderOracleSphere({ state: 'result', size: 200 });

    assert.ok(htmlResult.includes('data-state="result"'), 'Has result state attribute');
    assert.ok(htmlResult.includes('compact'), 'Contains compact modifier class');
    // Result compact size is Math.round(200 * 0.65) = 130px
    assert.ok(htmlResult.includes('--sphere-size: 130px;'), 'Scales size proportionally in result mode');
  });

  await t.test('5. renderAskOracleScreen mounts successfully with question chips and consult CTA', () => {
    // Mock minimal DOM container
    const mockContainer = {
      innerHTML: '',
      querySelector: () => null,
      querySelectorAll: () => []
    };

    renderAskOracleScreen(mockContainer);

    assert.ok(mockContainer.innerHTML.includes('oracle-screen-root'), 'Mounts oracle screen root');
    assert.ok(mockContainer.innerHTML.includes('Ask the Oracle'), 'Header title is rendered');
    assert.ok(mockContainer.innerHTML.includes('oracle-loop-video'), 'Mounts looping video in hero stage');
    assert.ok(mockContainer.innerHTML.includes('oracle-chip-card'), 'Mounts question chips');
    assert.ok(mockContainer.innerHTML.includes(SUGGESTED_QUESTIONS[0]), 'Contains first suggested question');
    assert.ok(mockContainer.innerHTML.includes('id="oracle-consult-btn"'), 'Contains consult CTA');
  });
});
