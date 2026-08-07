# Authentix — Deep Learning Module (`dl-model`)

This module houses the Deep Learning DeepFake classification pipeline built on **EfficientNetB0 (ImageNet pretrained CNN)**, featuring transfer learning, fine-tuning, and **Grad-CAM visual explainability**.

---

## 📁 Dataset Folder Structure

Organize your deepfake dataset inside `dl-model/data/` as follows:

```
dl-model/data/
├── real/
│   ├── real_0001.jpg
│   ├── real_0002.png
│   └── ...
└── fake/
    ├── fake_0001.jpg
    ├── fake_0002.png
    └── ...
```

*Compatible with FaceForensics++, Celeb-DF, Kaggle Real/Fake Faces, or any custom image dataset.*

---

## 🚀 Setup & Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

---

## 🏋️ Training the Deep Learning Model

Run the two-phase training loop:
```bash
python train.py --data_dir data --epochs_p1 10 --epochs_p2 10 --batch_size 32
```

- **Phase 1**: Trains dense head for 10 epochs while keeping EfficientNetB0 base frozen.
- **Phase 2**: Unfreezes top 30 convolutional layers of EfficientNetB0 and fine-tunes at `lr=1e-5`.
- Saves best checkpoint to `saved_model/authentix_model.keras` based on validation AUC (`val_auc`).

---

## 🔍 Single Image Inference & Grad-CAM Heatmap

Test the model on any image:
```bash
python predict.py --image path/to/sample.jpg
```

Output:
```json
{
  "prediction": "FAKE",
  "confidence": 98.45,
  "raw_score": 0.0155,
  "gradcam_path": "outputs/gradcam_sample.jpg"
}
```

The script automatically generates a Grad-CAM heatmap overlay showing which image regions drove the REAL/FAKE classification!
