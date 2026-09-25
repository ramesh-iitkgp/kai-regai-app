# P14 Evaluation Protocol — Mathematical Metrics & Verification Harness

**Product:** Kai RegAI  
**Descriptor:** PALM READING  
**Tagline:** The Story Written in Your Hands.  
**Phase:** P14 — Real-Palm Dataset & Accuracy Validation  
**Protocol Version:** 1.0.0  
**Status:** FROZEN & CERTIFIED  

---

## 1. Executive Summary & Purpose

The P14 Evaluation Protocol formalizes the quantitative mathematical metrics, computational algorithms, and evaluation harnesses used to assess the Kai RegAI palm computer vision engine.

The protocol ensures that:
1. Every reported metric is mathematically defined without ambiguity.
2. Metrics are computed identically across all dataset splits.
3. Machine-readable artifacts (`cv/real-validation/reports/p14_metrics.json`) are automatically generated.
4. Evaluation is 100% deterministic and reproducible via `npm run cv:evaluate`.

---

## 2. Presence Classification Metrics

For each major palm line $L \in \{\text{life}, \text{head}, \text{heart}, \text{fate}, \text{sun}\}$, ground truth presence $y \in \{0, 1\}$ and algorithmic detection $\hat{y} \in \{0, 1\}$ yield the confusion matrix:

$$\text{TP} = \sum [y=1 \land \hat{y}=1], \quad \text{FP} = \sum [y=0 \land \hat{y}=1]$$
$$\text{TN} = \sum [y=0 \land \hat{y}=0], \quad \text{FN} = \sum [y=1 \land \hat{y}=0]$$

From these counts, the protocol computes:

$$\text{Precision} = \frac{\text{TP}}{\text{TP} + \text{FP}}, \quad \text{Recall} = \frac{\text{TP}}{\text{TP} + \text{FN}}$$

$$\text{F}_1 = \frac{2 \cdot \text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}$$

$$\text{Specificity} = \frac{\text{TN}}{\text{TN} + \text{FP}}, \quad \text{FPR} = \frac{\text{FP}}{\text{TN} + \text{FP}}, \quad \text{FNR} = \frac{\text{FN}}{\text{TP} + \text{FN}}$$

When denominators equal zero, metrics are defined with standard epistemic conventions (e.g. if $\text{TP}+\text{FP}=0$, Precision $\equiv 1.0$; if $\text{TP}+\text{FN}=0$, Recall $\equiv 1.0$).

---

## 3. Geometric Localization Metrics

For true positive pairs where both ground truth polyline $G = \{g_1, \dots, g_m\}$ and detected polyline $D = \{d_1, \dots, d_n\}$ exist in normalized canonical coordinates:

### 3.1 Point-to-Curve Euclidean Distance
For any point $p$ and polyline $C$:
$$\text{dist}(p, C) = \min_{c \in C} \|p - c\|_2$$

The forward and reverse mean point-to-curve distances are:
$$\bar{d}_{D \to G} = \frac{1}{|D|} \sum_{d \in D} \text{dist}(d, G), \quad \bar{d}_{G \to D} = \frac{1}{|G|} \sum_{g \in G} \text{dist}(g, D)$$

The symmetric mean point-to-curve localization error is:
$$\mathcal{E}_{\text{mean}} = \frac{\bar{d}_{D \to G} + \bar{d}_{G \to D}}{2}$$

The median and 95th percentile ($P_{95}$) errors are derived from the sorted union of forward and reverse point distances.

### 3.2 Hausdorff Distance
The directed Hausdorff distances are:
$$h(D, G) = \max_{d \in D} \min_{g \in G} \|d - g\|_2, \quad h(G, D) = \max_{g \in G} \min_{d \in D} \|g - d\|_2$$

The symmetric Hausdorff distance is:
$$H(D, G) = \max(h(D, G), h(G, D))$$

### 3.3 Endpoint Error
Measuring origin and termination registration:
$$\mathcal{E}_{\text{endpoint}} = \frac{\|d_1 - g_1\|_2 + \|d_n - g_m\|_2}{2}$$

---

## 4. Confidence Calibration & ECE

To evaluate whether predicted confidence scores $c \in [0.5, 1.0]$ reflect genuine geometric accuracy:

1. A detection is defined as **geometrically accurate** if $\mathcal{E}_{\text{mean}} \le 0.25$.
2. Predictions are partitioned into $M=5$ uniform confidence bins $B_m$ with intervals $[0.5, 0.6), [0.6, 0.7), [0.7, 0.8), [0.8, 0.9), [0.9, 1.0]$.
3. For each bin $B_m$, the average confidence $\text{conf}(B_m)$ and empirical accuracy $\text{acc}(B_m)$ are calculated:
   $$\text{conf}(B_m) = \frac{1}{|B_m|} \sum_{i \in B_m} c_i, \quad \text{acc}(B_m) = \frac{1}{|B_m|} \sum_{i \in B_m} \mathbf{1}[\text{accurate}_i]$$
4. The Expected Calibration Error (ECE) is computed as:
   $$\text{ECE} = \sum_{m=1}^M \frac{|B_m|}{N} |\text{acc}(B_m) - \text{conf}(B_m)|$$
   The production target is $\text{ECE} \le 0.15$.

---

## 5. Temporal Stability Protocol

Temporal stability benchmarks assess inter-frame resilience against handheld micro-movement:

1. **Jitter Synthesis**: A real capture is displaced across 5 sequential frames with sinusoidal coordinate translation ($\Delta x = \pm 2\text{px}, \Delta y = \pm 2\text{px}$).
2. **Polyline Displacement Jitter**:
   $$\text{Jitter} = \frac{1}{K-1} \sum_{k=1}^{K-1} \mathcal{E}_{\text{mean}}(D_{k+1}, D_k)$$
   Target: $\text{Jitter} \le 0.05$.
3. **Status Preservation Rate**: Ratio of line presence statuses that remain identical across all consecutive frames.
   Target: $\text{Rate} \ge 0.95$.

---

## 6. Memory & Resource Lifecycle Protocol

To verify zero progressive memory leaks during batch or repeated inference:
1. `initialHeap` is recorded via `process.memoryUsage().heapUsed`.
2. The vision engine executes 25 consecutive inferences on full-resolution camera buffers.
3. `finalHeap` is recorded, and the delta $\Delta M = \text{finalHeap} - \text{initialHeap}$ is evaluated.
4. A memory leak is flagged if $\Delta M > 50\text{MB}$.

---

## 7. Automated Harness Execution

The evaluation harness is executed deterministically via:

```bash
npm run cv:evaluate
```

This compiles and writes the unified machine-readable evaluation report to:
- `cv/real-validation/dataset/reports/p14_metrics.json`
- `cv/real-validation/reports/p14_metrics.json`
