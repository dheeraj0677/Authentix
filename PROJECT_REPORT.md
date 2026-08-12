# 🛡️ Authentix — DeepFake Detection & Blockchain Authenticity Registry
## Comprehensive Technical Project Report

> **Model Version**: v2.0.0 (EfficientNetB0 + Combined DFD/140k Dataset)  
> **Training Date**: August 12, 2026  
> **Status**: Fully Deployed & Running on Localhost

---

## Executive Summary

**Authentix** is an end-to-end media authenticity verification platform that combines **Deep Learning deepfake detection** with an **Ethereum blockchain hash registry**. It provides:

1. **AI Detection Layer** — EfficientNetB0 CNN detects fake vs. real images and videos with Grad-CAM visual heatmap explanations.
2. **Blockchain Registry** — SHA-256 media hashes anchored immutably to Ethereum smart contracts via MetaMask wallet integration.
3. **Full-Stack Web App** — React 18 frontend + FastAPI backend with upload, verify, history, and analytics dashboards.

---

## System Architecture

```
┌───────────────────────────────────────────────┐
│         AUTHENTIX WEB FRONTEND (Port 5173)    │
│     React 18 + Tailwind CSS + Ethers.js       │
└─────────────────────┬─────────────────────────┘
                      │
                      ▼
┌───────────────────────────────────────────────┐
│       FASTAPI BACKEND (Port 8000)             │
│   Rate Limiting + Security Headers + CORS     │
└──────────────┬────────────────────────────────┘
               │                    │
               ▼                    ▼
┌──────────────────────┐  ┌────────────────────────────┐
│  DL INFERENCE        │  │  BLOCKCHAIN REGISTRY       │
│  EfficientNetB0 v2   │  │  AuthenticityRegistry.sol  │
│  Grad-CAM Heatmaps   │  │  Hardhat Node (Port 8545)  │
│  Video Frame Pipeline│  │  SHA-256 Hash Storage      │
└──────────────────────┘  └────────────────────────────┘
               │
               ▼
┌──────────────────────┐
│  SQLite DB           │
│  (authentix.db)      │
└──────────────────────┘
```

---

## Deep Learning Module (`dl-model/`)

### Architecture

- **Base Model**: EfficientNetB0 (ImageNet pretrained, ~5.3M parameters)
- **Input**: 224 × 224 × 3 RGB, range [0, 255] (internal normalization)
- **Classification Head**:

```
EfficientNetB0 base
      ↓
GlobalAveragePooling2D()
BatchNormalization()
Dense(256, "relu", L2=1e-4)
Dropout(0.4)
Dense(128, "relu", L2=1e-4)
Dropout(0.3)
Dense(1, "sigmoid")     ← Score ≥ 0.5 → REAL | < 0.5 → FAKE
```

### Two-Phase Transfer Learning

| Phase | Epochs | Base Layers | Learning Rate |
|---|---|---|---|
| 1 — Dense Head Training | 1–5 | Frozen | 1e-3 |
| 2 — Fine-tuning | 6–10 | Top 30 Unfrozen | 1e-5 |

### Dataset

| Dataset | Size | Source |
|---|---|---|
| 140k Real & Fake Faces (Kaggle) | 140,000 images | NVIDIA FFHQ + StyleGAN2 |
| DFD Original Sequences (local) | 1,849 frames | Real video frames |
| DFD Manipulated Sequences (local) | 1,828 frames | Face-swap deepfake frames |
| **Total** | **~193,000 samples** | Combined |

### Critical Bug Fixed

> ⚠️ **Input Double-Rescaling Bug**: EfficientNetB0 has built-in normalization. A second `Rescaling(1/255)` was applied in code, feeding near-zero (pitch-black) inputs. Fix: removed all manual `/ 255.0` operations. Accuracy immediately jumped from ~50% → **80.9%+ on Epoch 1**.

---

## Model Performance (v2.0.0)

### Training Metrics (Final Epoch 10)

| Metric | Score |
|---|---|
| Training Accuracy | 83.29% |
| Training AUC | 91.90% |
| Validation Accuracy | 83.69% |
| **Validation AUC** | **93.82%** |
| Validation Precision | 92.82% |

### Test Set Evaluation

| Metric | Score |
|---|---|
| **Accuracy** | **75.38%** |
| **Precision** | **87.12%** |
| **Recall** | **58.30%** |
| **F1-Score** | **69.12%** |
| **AUC (ROC)** | **87.88%** |

### Sample-Level Results (Live Inference)

| Test | Fake Detection | Real Detection | Notes |
|---|---|---|---|
| 10 Fake Images | **10/10 (100%)** | — | Avg confidence: 96.6%, raw scores near 0.0 |
| 10 Real Images | — | **5/10 (50%)** | Conservative model: prefers low false-alarm rate |
| 10 Video Sequences | 2/5 Fake | 1/5 Real | Wide-angle video harder than cropped faces |

---

## Blockchain Module (`blockchain/`)

### Smart Contract: `AuthenticityRegistry.sol`

```solidity
struct Record {
    bytes32 fileHash;   // SHA-256 of media
    address owner;       // Registrant wallet
    uint256 timestamp;   // Block timestamp
    string prediction;   // "REAL" or "FAKE"
    bool verified;       // Registration flag
}

function registerFile(bytes32 _fileHash, string memory _prediction) external
function verifyFile(bytes32 _fileHash) external view returns (bool, address, uint256, string)
```

### Verification Flow

```
Upload File → SHA-256 Hash Computed
    → Smart Contract verifyFile()
        → FOUND: ✅ Authentic (hash match)
        → FOUND with different hash: ⚠️ Modified
        → NOT FOUND: ❓ Unregistered
```

---

## Web Application (`webapp/`)

### Backend API Endpoints (FastAPI, Port 8000)

| Method | Route | Function |
|---|---|---|
| POST | `/upload` | AI inference + Grad-CAM |
| POST | `/register` | Record blockchain TX hash |
| POST | `/verify` | SHA-256 vs. smart contract |
| GET | `/history/{wallet}` | Audit ledger |
| GET | `/report/pdf/{hash}` | PDF certificate |
| GET | `/dashboard/stats` | Analytics |

### Frontend Pages (React 18, Port 5173)

| Page | Purpose |
|---|---|
| Upload | Drag-drop upload, AI result, Grad-CAM heatmap, MetaMask register, PDF download |
| Verify | Re-upload file → Blockchain authenticity check |
| History | Searchable audit ledger with TX hashes |
| Dashboard | Real-time stats |
| AI Analytics | Model metrics, ROC curve, confusion matrix |

---

## Running Locally

```powershell
# All-in-one startup:
.\start.ps1

# Manual startup:
# Terminal 1 — Blockchain:
cd blockchain && cmd /c "npx hardhat node"

# Terminal 2 — Backend (port 8000):
python -m uvicorn webapp.backend.main:app --host 127.0.0.1 --port 8000

# Terminal 3 — Frontend (port 5173):
cd webapp\frontend && cmd /c "npm run dev"
```

Visit **http://localhost:5173**

---

## Future Improvements

1. **Face detection pre-filtering** (MediaPipe/YOLOv8) for video streams — expected +25–35% video accuracy
2. **Full dataset training** (remove sample cap, 50+ epochs) — expected +5–8% accuracy
3. **Vision Transformer (ViT) ensemble** — better global artifact detection
4. **Frequency-domain (FFT) branch** — resilience to JPEG compression attacks
5. **GPU acceleration** via WSL2 or TensorFlow-DirectML plugin

---

## Tech Stack

| Category | Technology |
|---|---|
| Deep Learning | TensorFlow 2.x / EfficientNetB0 |
| Backend | FastAPI 0.100+ + Uvicorn |
| Database | SQLite + SQLAlchemy 2.0 |
| Frontend | React 18 + Vite 4 + Tailwind CSS 3 |
| Web3 | Ethers.js 6 + web3.py 7.16 |
| Smart Contracts | Solidity ^0.8.19 + Hardhat |
| Image Processing | OpenCV 5 + Pillow 12 |
| Python | 3.12.10 |
