/**
 * Kai RegAI — Controlled Threshold Calibration & Sweep Engine
 * Phase: P5.1 — Real-Palm Validation & Calibration
 */

import fs from 'fs';
import path from 'path';
import { runRealPalmValidation } from './run-validation.js';

export async function runThresholdSweep() {
  console.log('=== Starting Controlled Threshold Calibration Sweep ===');

  const sweepConfigs = [
    {
      id: 'baseline_default',
      desc: 'Baseline default parameters',
      config: {}
    },
    {
      id: 'clahe_clip_high',
      desc: 'High contrast enhancement (clip limit = 3.5)',
      config: {
        enhancement: { claheClipLimit: 3.5 }
      }
    },
    {
      id: 'clahe_clip_low',
      desc: 'Conservative contrast enhancement (clip limit = 1.8)',
      config: {
        enhancement: { claheClipLimit: 1.8 }
      }
    },
    {
      id: 'binarize_sensitive',
      desc: 'Sensitive candidate binarization (tau = 0.14)',
      config: {
        topology: { binaryBinarizationThreshold: 0.14 }
      }
    },
    {
      id: 'binarize_strict',
      desc: 'Strict candidate binarization (tau = 0.24)',
      config: {
        topology: { binaryBinarizationThreshold: 0.24 }
      }
    },
    {
      id: 'prune_aggressive',
      desc: 'Aggressive spur pruning (18px)',
      config: {
        topology: { branchPruningThreshold: 18, minCandidateLength: 28 }
      }
    }
  ];

  const sweepResults = [];

  for (const sweep of sweepConfigs) {
    const startTime = performance.now();
    const summary = await runRealPalmValidation(sweep.config);
    const totalTime = performance.now() - startTime;

    const row = {
      configId: sweep.id,
      description: sweep.desc,
      runtimeMs: Number(totalTime.toFixed(2)),
      qualityPassRate: summary.passedQualityGateCount / (summary.totalEvaluated || 1),
      totalFailures: summary.failures.length,
      metrics: {
        life_tp: summary.lineMetrics.life.tp,
        life_fp: summary.lineMetrics.life.fp,
        head_tp: summary.lineMetrics.head.tp,
        head_fp: summary.lineMetrics.head.fp,
        heart_tp: summary.lineMetrics.heart.tp,
        heart_fp: summary.lineMetrics.heart.fp,
        fate_tn: summary.lineMetrics.fate.tn,
        fate_fp: summary.lineMetrics.fate.fp,
        sun_tn: summary.lineMetrics.sun.tn,
        sun_fp: summary.lineMetrics.sun.fp
      }
    };
    sweepResults.push(row);
    console.log(`[Sweep] ${sweep.id}: PassRate=${(row.qualityPassRate*100).toFixed(0)}%, Failures=${row.totalFailures}, Time=${row.runtimeMs}ms`);
  }

  const reportPath = path.resolve('cv/real-validation/reports/calibration_sweep_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(sweepResults, null, 2));
  console.log('Saved sweep report to:', reportPath);
  return sweepResults;
}

if (process.argv[1]?.endsWith('threshold-sweep.js')) {
  runThresholdSweep();
}
