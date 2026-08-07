# 🛡️ Authentix — DeepFake Verification & Blockchain Registry

Authentix is an enterprise-grade, full-stack **Deep Learning** and **Ethereum Blockchain** media verification platform. It detects DeepFake images and videos using an **EfficientNetB0 Convolutional Neural Network**, visualizes decision regions via **Grad-CAM activation heatmaps**, generates printable **PDF Verification Certificates**, and registers cryptographic SHA-256 media digests on a Solidity **Ethereum Smart Contract** for tamper-proof authenticity verification.

---

## 🌟 Key Features

- **Dual-Layer Security**: Combines AI deepfake classification with immutable blockchain smart contract registration.
- **Image & Video Support**: Analyzes both static images (`.jpg`, `.png`, `.webp`) and video clips (`.mp4`, `.avi`, `.mov`, `.webm`) using frame sampling (1 FPS) and confidence timeline aggregation.
- **Grad-CAM Visual Explainability**: Highlights exact pixel regions (eyes, mouth, lighting boundaries) driving the classification verdict. Automatically extracts the Grad-CAM heatmap for the **most suspicious video frame**.
- **Zero-Knowledge Blockchain Ledger**: Stores lightweight cryptographic SHA-256 hashes and short verdicts on `AuthenticityRegistry.sol` to preserve privacy and minimize gas fees.
- **Automated PDF Verification Certificate**: Generates downloadable, official PDF certificates containing file metadata, SHA-256 digest, AI verdict, Grad-CAM overlay comparison, and blockchain transaction hash.
- **Empirical Robustness Benchmarking**: Includes stress-testing tools evaluating accuracy under real-world social media degradations (JPEG compression, downscaling, Gaussian noise, blur).

---

## 🏛️ System Architecture

```
                               ┌──────────────────────────────────────────────┐
                               │           AUTHENTIX WEB FRONTEND             │
                               │        React 18 + Tailwind CSS + Ethers.js    │
                               └──────────────────────┬───────────────────────┘
                                                      │
                                                      ▼
                               ┌──────────────────────────────────────────────┐
                               │             FastAPI / Node Backend           │
                               │        SQLAlchemy Caching + SHA-256 Hashing    │
                               └──────────────┬────────────────┬──────────────┘
                                              │                │
                      ┌───────────────────────┘                └──────────────────────┐
                      ▼                                                               ▼
   ┌────────────────────────────────────┐                          ┌────────────────────────────────────┐
   │    MODULE 1: Deep Learning         │                          │    MODULE 2: Blockchain Registry   │
   │  - EfficientNetB0 Transfer Learn   │                          │  - AuthenticityRegistry.sol        │
   │  - Video Frame Aggregation         │                          │  - Hardhat Local Ethereum Node     │
   │  - Grad-CAM Heatmap Overlay        │                          │  - SHA-256 On-Chain Storage        │
   └────────────────────────────────────┘                          └────────────────────────────────────┘
```

---

## 📂 Repository Structure

```
Authentix/
├── dl-model/                    # Module 1: Deep Learning Detector (TensorFlow/Keras)
│   ├── data.py                  # Dataset loading & augmentation pipeline
│   ├── model.py                 # EfficientNetB0 CNN architecture builder
│   ├── train.py                 # Two-phase transfer learning loop
│   ├── predict.py               # Image inference & JSON output
│   ├── video_predict.py         # Video frame extraction & timeline analyzer
│   ├── gradcam.py               # Grad-CAM heatmap generator
│   ├── stress_test.py           # Robustness & perturbation benchmark tool
│   ├── evaluate.py              # Confusion matrix & performance evaluation
│   └── requirements.txt
│
├── blockchain/                  # Module 2: Smart Contract Registry (Solidity + Hardhat)
│   ├── contracts/
│   │   └── AuthenticityRegistry.sol
│   ├── scripts/
│   │   └── deploy.js
│   ├── test/
│   │   └── AuthenticityRegistry.test.js
│   ├── web3_client.py           # Python ↔ Blockchain Web3 bridge
│   └── hardhat.config.js
│
├── webapp/                      # Module 3: Full-Stack Web Application
│   ├── backend/                 # FastAPI & Node Express backend servers
│   │   ├── pdf_generator.py     # PDF Certificate Generator
│   │   ├── main.py              # FastAPI server
│   │   └── server.js            # Express server
│   └── frontend/                # React 18 + Tailwind CSS client
│
├── PROJECT_REPORT.md            # Comprehensive Technical Project Report
└── README.md
```

---

## 🚀 Quick Start (Running in 3 Terminals)

### 1. Terminal 1: Start Blockchain Node & Deploy Contract
```bash
cd blockchain
npm install
npm run node
```
*In a second terminal:*
```bash
cd blockchain
npm run deploy:local
```

### 2. Terminal 2: Start Backend API Server
```bash
cd webapp/backend
node server.js
# Or FastAPI server: uvicorn main:app --reload --port 8000
```

### 3. Terminal 3: Start React Frontend Application
```bash
cd webapp/frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 🧪 Deep Learning CLI Tools (Module 1)

* **Single Image Prediction**:
  ```bash
  cd dl-model
  python predict.py --image path/to/image.jpg
  ```

* **Video DeepFake Analysis**:
  ```bash
  cd dl-model
  python video_predict.py --video path/to/video.mp4
  ```

* **Run Model Robustness Stress Test**:
  ```bash
  cd dl-model
  python stress_test.py
  ```

---

## 📜 Smart Contract Test (Module 2)

Run Hardhat unit test suite:
```bash
cd blockchain
npm test
```

---

## 💡 How the End-to-End Flow Works

1. **Upload & Detect**: User uploads an image or video on the Web App (`/`).
2. **Deep Learning Verdict**: EfficientNetB0 classifies media as **REAL** or **FAKE** with confidence % and displays a **Grad-CAM heatmap overlay**.
3. **Cryptographic Hashing**: The backend computes a unique SHA-256 digest of the media file.
4. **Blockchain Anchor**: Clicking **"Register Hash on Blockchain"** prompts MetaMask to send a transaction to `AuthenticityRegistry.sol`.
5. **PDF Certificate**: Clicking **"Download Official PDF Verification Certificate"** downloads a printable authenticity report.
6. **Verification**: Re-uploading the file on the **Verify** page recomputes the SHA-256 hash and checks the immutable blockchain ledger to confirm if it is **Authentic** or **Modified/Tampered**.
