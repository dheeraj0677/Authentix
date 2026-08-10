<div align="center">

# 🛡️ Authentix

**DeepFake Detection · Blockchain Provenance · Explainable AI**

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)](https://python.org)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.12+-FF6F00?logo=tensorflow&logoColor=white)](https://tensorflow.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Hardhat](https://img.shields.io/badge/Ethereum-Hardhat-yellow?logo=ethereum&logoColor=black)](https://hardhat.org)
[![Vite](https://img.shields.io/badge/Vite-4.4+-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)

A full-stack media authenticity platform combining a **deep learning deepfake detector**, **Ethereum smart contract registry**, and **explainable AI visualizations**.

</div>

---

## What It Does

| Capability | How |
|---|---|
| 🤖 **DeepFake Detection** | EfficientNetB0 CNN classifies images & videos as REAL or FAKE with confidence scores |
| 🔥 **Explainable AI** | Grad-CAM heatmaps highlight exact pixel regions driving the AI verdict |
| ⛓️ **Blockchain Provenance** | SHA-256 hash of media is anchored on Ethereum via Solidity smart contracts |
| 📄 **PDF Certificates** | Downloadable verification certificates with metadata, Grad-CAM overlay & TX hash |
| 🌐 **Decentralized Storage** | Media pinned to IPFS; only hashes stored on-chain for privacy & low gas fees |
| 📊 **Analytics Dashboard** | Real-time AI analytics, detection history, and per-frame video timelines |

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Ethers.js, MetaMask |
| **Backend** | FastAPI, SQLAlchemy, Python 3.10+ |
| **AI / ML** | TensorFlow 2.12, Keras, OpenCV, EfficientNetB0 |
| **Blockchain** | Solidity, Hardhat, Ethers.js v5, Web3.py |
| **Storage** | IPFS (Kubo / Fallback CID), SQLite |
| **Scripts** | Native PowerShell Automation (`start.ps1`, `setup.ps1`, `stop.ps1`) |

---

## Project Structure

```
Authentix/
│
├── dl-model/                   # Deep Learning Module
│   ├── model.py                #   EfficientNetB0 CNN builder
│   ├── train.py                #   Two-phase transfer learning
│   ├── predict.py              #   Image inference CLI
│   ├── video_predict.py        #   Video frame analysis & timeline
│   ├── gradcam.py              #   Grad-CAM heatmap generator
│   ├── evaluate.py             #   Metrics & confusion matrix
│   └── stress_test.py          #   Noise/compression robustness tests
│
├── blockchain/                 # Smart Contract Module
│   ├── contracts/              #   Solidity contracts (Registry, Controller)
│   ├── scripts/                #   Deployment scripts
│   ├── test/                   #   Hardhat unit tests
│   └── web3_client.py          #   Python ↔ Ethereum Web3 bridge
│
├── webapp/
│   ├── backend/                # FastAPI Server
│   │   ├── main.py             #   API endpoints & DL inference
│   │   ├── pdf_generator.py    #   Certificate engine (ReportLab)
│   │   ├── auth_manager.py     #   JWT authentication
│   │   ├── ipfs_client.py      #   IPFS upload handler
│   │   └── schemas.py          #   Pydantic data models
│   └── frontend/               # React Application
│       └── src/
│           ├── pages/          #   Upload, Verify, History, Analytics
│           └── components/     #   DropZone, GradCam, ResultCard, etc.
│
├── setup.ps1                   # One-click dependency installer
├── start.ps1                   # One-click service launcher (Blockchain + Backend + Frontend)
├── stop.ps1                    # Clean shutdown script
└── README.md
```

---

## Quick Start (No Docker Required)

### 1-Click Native Launcher (PowerShell)

First-time setup (installs all Python and Node.js dependencies):
```powershell
.\setup.ps1
```

Start all services (Hardhat node, FastAPI backend, React frontend):
```powershell
.\start.ps1
```

| Service | URL | Description |
|---|---|---|
| **Frontend UI** | http://localhost:5173 | React 18 / Vite Client |
| **Backend API** | http://127.0.0.1:8000 | FastAPI REST Server |
| **API Docs** | http://127.0.0.1:8000/docs | Interactive Swagger UI |
| **Ethereum Node** | http://127.0.0.1:8545 | Hardhat JSON-RPC Node |

To gracefully stop all services:
```powershell
.\stop.ps1
```

---

### Manual Setup

<details>
<summary><b>Step 1 — Blockchain Node</b></summary>

```bash
cd blockchain
npm install
npm run node          # Start local Hardhat network
```

In a second terminal:
```bash
cd blockchain
npm run deploy:local  # Deploy smart contracts
```

To deploy to Sepolia testnet:
```bash
npm run deploy:sepolia
```
</details>

<details>
<summary><b>Step 2 — Backend API</b></summary>

```bash
cd webapp/backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
</details>

<details>
<summary><b>Step 3 — Frontend</b></summary>

```bash
cd webapp/frontend
npm install
npm run dev
```

Open http://localhost:5173
</details>

---

## Deep Learning CLI

```bash
# Classify a single image
python dl-model/predict.py --image path/to/image.jpg

# Analyze a video (frame-by-frame timeline)
python dl-model/video_predict.py --video path/to/video.mp4

# Run robustness stress test (JPEG, blur, noise)
python dl-model/stress_test.py
```

---

## Smart Contracts

```bash
cd blockchain

npm test              # Run Hardhat unit tests
npm run compile       # Compile Solidity contracts
```

Deployed contracts:
- **`AuthenticityRegistry.sol`** — Core hash registry
- **`RegistryController.sol`** — Access control & modular registry management

---

## Environment Variables

Copy `.env.example` in the `blockchain/` directory and fill in your values:

```env
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=your_wallet_private_key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
```

> **Never commit real private keys.** Use `.env` files excluded by `.gitignore`.

---

## Security

- **Zero on-chain media** — Only SHA-256 hashes are stored on the blockchain; raw files stay off-chain or on IPFS.
- **JWT Authentication** — All API routes are protected via token-based auth managed by `auth_manager.py`.
- **No hardcoded secrets** — All sensitive config is loaded from environment variables.

---

<div align="center">

Made with ❤️ by [viswanath006](https://github.com/viswanath006)

</div>


---

## 🌟 Key Features

- **Dual-Layer Security**: Combines AI deepfake classification with immutable blockchain smart contract registration.
- **Image & Video Support**: Analyzes static images (`.jpg`, `.png`, `.webp`) and video clips (`.mp4`, `.avi`, `.mov`, `.webm`) using frame sampling and confidence aggregation.
- **Grad-CAM Explainability**: Highlights exact pixel regions (eyes, mouth, lighting boundaries) driving the classification verdict, including most suspicious frame analysis for videos.
- **Decentralized Storage & Blockchain Ledger**: Integrates IPFS pinning and stores cryptographic SHA-256 digests on Solidity Ethereum smart contracts to ensure privacy and low gas fees.
- **Automated PDF Verification Certificates**: Generates downloadable PDF certificates containing file metadata, SHA-256 digest, AI verdict, Grad-CAM overlay comparison, and blockchain transaction hash.
- **Interactive Web App & Analytics**: Built with React 18, Vite, Tailwind CSS, FastAPI, Node.js, and Ethers.js, featuring real-time AI analytics, history tracking, and MetaMask wallet integration.
- **Empirical Robustness Benchmarking**: Includes stress-testing scripts to evaluate model resilience under social media degradations (JPEG compression, Gaussian noise, blur, scaling).

---

## 🏛️ Architecture Overview

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │                        AUTHENTIX WEB FRONTEND                          │
 │                 React 18 + Vite + Tailwind CSS + Ethers.js             │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                         FASTAPI & NODE BACKEND                         │
 │           SQLAlchemy Caching + SHA-256 Hashing + IPFS Client          │
 └───────────────┬───────────────────┬───────────────────┬────────────────┘
                 │                   │                   │
                 ▼                   ▼                   ▼
 ┌───────────────────────┐ ┌───────────────────┐ ┌───────────────────────┐
 │ MODULE 1: DL MODEL    │ │ MODULE 2: BLOCKCHAIN│ │ MODULE 3: CERTIFICATES│
 │ - EfficientNetB0 CNN  │ │ - Smart Contracts │ │ - PDF Generator       │
 │ - Grad-CAM Visualizer │ │ - Web3 Client     │ │ - QR Code Verification│
 │ - Frame Timeline      │ │ - Hardhat / Node  │ │ - IPFS Storage        │
 └───────────────────────┘ └───────────────────┘ └───────────────────────┘
```

---

## 📂 Repository Structure

```text
Authentix/
├── dl-model/                    # Deep Learning Detector (TensorFlow / Keras)
│   ├── data.py                  # Dataset loading & augmentation pipeline
│   ├── model.py                 # EfficientNetB0 CNN architecture
│   ├── train.py                 # Two-phase transfer learning loop
│   ├── predict.py               # Image inference CLI
│   ├── video_predict.py         # Video frame extraction & timeline analyzer
│   ├── gradcam.py               # Grad-CAM heatmap generator
│   ├── stress_test.py           # Robustness & noise benchmark tool
│   └── evaluate.py              # Performance evaluation metrics
│
├── blockchain/                  # Smart Contract Registry (Solidity + Hardhat)
│   ├── contracts/               # AuthenticityRegistry & Modular Smart Contracts
│   ├── scripts/                 # Deployment scripts (deploy.js, deploy_modular.js)
│   ├── test/                    # Hardhat unit tests
│   ├── web3_client.py           # Python ↔ Web3 Bridge
│   └── hardhat.config.js
│
├── webapp/                      # Full-Stack Web Application
│   ├── backend/                 # FastAPI & Node.js server
│   │   ├── main.py              # FastAPI endpoints
│   │   ├── server.js            # Express server
│   │   ├── pdf_generator.py     # PDF Certificate Engine
│   │   ├── auth_manager.py      # Auth & JWT management
│   │   └── ipfs_client.py       # IPFS client handler
│   └── frontend/                # React 18 Client Application
│       ├── src/components/      # UI Components (DropZone, GradCam, Timeline, etc.)
│       └── src/pages/           # App Pages (Upload, Verify, History, Analytics)
│
├── setup.ps1                    # First-time setup script
├── start.ps1                    # Master startup script
├── stop.ps1                     # Process shutdown script
└── README.md
```

---

## 🚀 Getting Started (Native Windows)

### Option A: Automated PowerShell Scripts (Recommended)

```powershell
# 1. First-time setup (creates virtualenv & installs all dependencies)
.\setup.ps1

# 2. Launch all services simultaneously in dedicated windows
.\start.ps1

# 3. Stop all running services
.\stop.ps1
```

---

### Option B: Local Manual Setup

#### 1. Blockchain Node & Smart Contracts
```bash
cd blockchain
npm install
npm run node
```
*In a second terminal, deploy the smart contract:*
```bash
cd blockchain
npm run deploy:local
```

#### 2. Backend Server
```bash
cd webapp/backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
*Alternatively, start Node Express backend:*
```bash
cd webapp/backend
npm install
node server.js
```

#### 3. Frontend Application
```bash
cd webapp/frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Deep Learning CLI Tools

* **Image Classification**:
  ```bash
  python dl-model/predict.py --image path/to/image.jpg
  ```

* **Video DeepFake Analysis**:
  ```bash
  python dl-model/video_predict.py --video path/to/video.mp4
  ```

* **Model Stress Test**:
  ```bash
  python dl-model/stress_test.py
  ```

---

## 📜 Smart Contract Testing

Run unit tests on local Hardhat network:
```bash
cd blockchain
npm test
```

---

## 🛡️ Security & Privacy Notice

- **No Hardcoded Secrets**: Environment variables (`.env`) should be used for secret keys, RPC URLs, and private keys. Example templates are provided in `.env.example`.
- **Zero-Knowledge Hashing**: Raw media files are not required to be published on-chain; only cryptographic SHA-256 hashes and verification metadata are stored.
