# 🛡️ Authentix — DeepFake Verification & Blockchain Registry

Authentix is an enterprise-grade, full-stack **Deep Learning** and **Ethereum Blockchain** media verification platform. It detects DeepFake images and videos using an **EfficientNetB0 Convolutional Neural Network**, visualizes decision regions via **Grad-CAM activation heatmaps**, generates printable **PDF Verification Certificates**, pins media to **IPFS**, and registers cryptographic SHA-256 digests on **Ethereum Smart Contracts** for tamper-proof provenance.

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
├── docker-compose.yml           # Multi-container orchestration
├── Dockerfile                   # Backend Dockerfile
├── Dockerfile.frontend          # Frontend Dockerfile
└── README.md
```

---

## 🚀 Getting Started

### Option A: Using Docker Compose (Recommended)

```bash
docker-compose up --build
```
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:8000`
- **Hardhat Node**: `http://localhost:8545`

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
