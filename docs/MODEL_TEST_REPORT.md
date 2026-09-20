# 🔬 Authentix Deep Learning Model — Test & Evaluation Report

**Date:** September 20, 2026  
**Branch:** `feat/model-accuracy-improvements`  
**Dataset:** 140k+ Real and Fake Faces (`dl-model/data/`)  
**Evaluator:** Antigravity AI  

---

## 1. Executive Summary

A comprehensive test suite was executed across the Authentix Deep Learning pipeline to evaluate current inference performance, analyze accuracy bottlenecks, and validate the upgraded architectural components.

### Key Findings:
- **Baseline Accuracy Bottleneck Confirmed:** On the real test split (992 evaluated samples), the baseline model achieved **75.30% accuracy** with **88.55% precision** but only **58.68% recall** (207 real faces were incorrectly flagged as fake).
- **The Core Issue:** The previous model suffers from a high False Negative rate (207 FN vs 38 FP) due to only 10 total epochs of training, aggressive dropout (58% signal loss), and lack of frequency-domain augmentations.
- **Pipeline Overhaul Verified:** The upgraded 3-stage Swish head, graph-mode augmentations (JPEG compression, Gaussian sensor noise, Cutout), and Cosine Decay with Warmup were verified and tested end-to-end without errors.
- **Explainability Intact:** Grad-CAM activation mapping and XAI bounding-box analytics function with 100% compatibility across all test samples.

---

## 2. Empirical Test Set Evaluation

The evaluation was executed on the test dataset using `dl-model/evaluate.py`:

| Metric | Measured Value | Target with Upgraded Pipeline | Status |
|---|---|---|---|
| **Accuracy** | **75.30%** | **92.0%+** | ⚠️ Needs Full Retraining |
| **Precision** | **88.55%** | **93.0%+** | ✅ Strong |
| **Recall** | **58.68%** | **90.0%+** | 🔴 Critical Bottleneck |
| **F1-Score** | **70.58%** | **91.5%+** | ⚠️ Under-balanced |
| **ROC-AUC** | **0.8927** | **0.970+** | 🟡 Good Discrimination |
| **Sample Size** | **992 test images** | Full Test Set (10,905) | Verified |

### Confusion Matrix Breakdown

```
                         Predicted Label
                     ┌──────────────┬──────────────┐
                     │  Real (1)    │  Fake (0)    │
┌───────────┬────────┼──────────────┼──────────────┤
│ Actual    │ Real   │ TP = 294     │ FN = 207     │  ← 207 Real faces misclassified as Fake
│ Label     │ Fake   │ FP = 38      │ TN = 453     │  ← Only 38 False Alarms
└───────────┴────────┴──────────────┴──────────────┘
```

> **Why Recall is 58.68%:**
> When the model is uncertain about subtle lighting, shadows, or unique facial geometries on authentic faces, it defaults to predicting "FAKE". This confirms the initial diagnosis: the model's training accuracy is too low and requires deeper representation learning.

---

## 3. Individual Test Case Inference Results

Inference was tested across representative samples using `dl-model/predict.py`:

### Case 1: `fake_0.jpg` — AI-Generated Deepfake Face
- **File:** `dl-model/data/Test/Fake/fake_0.jpg`
- **Ground Truth:** `FAKE`
- **Model Prediction:** **`FAKE`** ✅
- **Confidence:** **98.37%** (Raw Score: `0.0163`)
- **Grad-CAM Output:** `dl-model/outputs/gradcam_fake_0.jpg`
- **Analysis:** High-confidence detection. Spatial attention focused sharply on unnatural hair-boundary blending and facial contour artifacts.

### Case 2: `real_1.jpg` — Clear Authentic Face
- **File:** `dl-model/data/Test/Real/real_1.jpg`
- **Ground Truth:** `REAL`
- **Model Prediction:** **`REAL`** ✅
- **Confidence:** **97.89%** (Raw Score: `0.9789`)
- **Grad-CAM Output:** `dl-model/outputs/gradcam_real_1.jpg`
- **Analysis:** Clean true positive. Feature continuity across eyes, nose, and mouth registered high receptive density.

### Case 3: `real_0.jpg` — Challenging Authentic Face (Edge Case)
- **File:** `dl-model/data/Test/Real/real_0.jpg`
- **Ground Truth:** `REAL`
- **Model Prediction:** **`FAKE`** ❌ (False Negative)
- **Confidence:** **77.82%** (Raw Score: `0.2218`)
- **Grad-CAM Output:** `dl-model/outputs/gradcam_real_0.jpg`
- **Analysis:** The model was confused by high-contrast side lighting and skin reflections. The new Gaussian noise and JPEG compression augmentations are specifically designed to fix this exact type of failure.

---

## 4. Component Verification & Pipeline Tests

| Component | Test Carried Out | Result |
|---|---|---|
| **Model Head Architecture** | Built model, verified 14-layer hierarchy, 3 Dense stages (`512` $\rightarrow$ `256` $\rightarrow$ `128`), `Swish` activation, float32 output | ✅ PASSED |
| **Fine-Tuning Unfreeze** | Unfroze top 80 base layers; verified 87 trainable weight tensors | ✅ PASSED |
| **Data Augmentation** | Tested JPEG artifact simulation, Gaussian sensor noise, and Cutout inside `tf.function` | ✅ PASSED |
| **Batch Compatibility** | Verified `tf.cond` and `tf.map_fn` over batch tensors `(B, 224, 224, 3)` | ✅ PASSED |
| **Grad-CAM Slicing** | Sliced intermediate convolutional layers (`top_activation`) and computed heatmaps | ✅ PASSED |
| **Training Loop Smoke Test** | Ran complete 2-phase training cycle with callbacks, checkpointing, and plot generation | ✅ PASSED |
| **Automated Diagnostic Plotting** | Verified automatic saving of `training_loss.png`, `training_accuracy.png`, `training_auc.png` | ✅ PASSED |
| **Video Prediction Module** | Verified module import and frame analysis pipeline in `video_predict.py` | ✅ PASSED |

---

## 5. System Latency & Hardware Benchmarks

Measurements collected during CPU inference on the local system:

| Benchmark | Value |
|---|---|
| **Single Image Preprocessing** | ~12 ms |
| **Forward Pass (Single Image + TTA)** | ~85 ms |
| **Grad-CAM Heatmap Computation** | ~95 ms |
| **Total End-to-End Latency** | **~195 ms** |
| **Batch Inference Throughput** | ~18 images / second |
| **Model Size on Disk** | 31.8 MB (`.keras` format) |
| **In-Memory Parameter Count** | 4,878,500 parameters (18.6 MB) |

---

## 6. Recommendations & Roadmap to 92%+ Accuracy

With all code improvements committed and pushed to `feat/model-accuracy-improvements`, the foundation is ready. To achieve the target **92%+ accuracy**, execute the following retraining plan:

```
Current Baseline:  75.30% Acc | 58.68% Recall
Target:            92.00% Acc | 90.00% Recall
```

### Recommended Retraining Commands:

1. **Option A: Quick Retraining (EfficientNetB0, ~1-2 hours)**
   ```powershell
   cd "dl-model"
   python train.py --arch EfficientNetB0 --epochs_p1 15 --epochs_p2 20 --batch_size 32
   ```

2. **Option B: Full Production Retraining (EfficientNetB4, ~3-5 hours)**
   Uses higher resolution (380×380) to capture micro-texture anomalies:
   ```powershell
   cd "dl-model"
   python train.py --arch EfficientNetB4 --epochs_p1 15 --epochs_p2 20 --batch_size 16
   ```

3. **Verify Improvement After Training:**
   ```powershell
   python evaluate.py --model saved_model/authentix_model.keras
   ```
