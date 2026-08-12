import os
import json
import argparse
import datetime
import tensorflow as tf
from data import load_datasets
from model import build_model, unfreeze_for_finetuning

def train_model(data_dir="data", epochs_phase1=10, epochs_phase2=10, batch_size=32, 
                save_dir="saved_model", max_train_samples=None, max_val_samples=None, max_test_samples=None):
    """
    Two-phase Deep Learning training loop:
    Phase 1: Train classification head with frozen EfficientNetB0 base.
    Phase 2: Unfreeze top 30 layers and fine-tune at low learning rate with LR scheduling.
    Saves model_metadata.json alongside the trained .keras model.
    """
    os.makedirs(save_dir, exist_ok=True)
    model_path = os.path.join(save_dir, "authentix_model.keras")
    metadata_path = os.path.join(save_dir, "model_metadata.json")

    print("[INFO] Loading datasets...")
    train_ds, val_ds, test_ds, label_map = load_datasets(
        data_dir, 
        batch_size=batch_size,
        max_train_samples=max_train_samples,
        max_val_samples=max_val_samples,
        max_test_samples=max_test_samples
    )
    print(f"[INFO] Class mapping: {label_map}")

    # Build model
    print("[INFO] Building EfficientNetB0 CNN model...")
    model, base_model = build_model()
    model.summary()

    # Callbacks for Phase 1
    callbacks_p1 = [
        tf.keras.callbacks.ModelCheckpoint(
            filepath=model_path,
            monitor="val_auc",
            mode="max",
            save_best_only=True,
            verbose=1
        ),
        tf.keras.callbacks.EarlyStopping(
            monitor="val_auc",
            mode="max",
            patience=4,
            restore_best_weights=True,
            verbose=1
        )
    ]

    # --- Phase 1: Frozen Base Training ---
    print(f"\n==================================================")
    print(f"   PHASE 1: Training Classification Head ({epochs_phase1} epochs)")
    print(f"==================================================")
    history_phase1 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs_phase1,
        callbacks=callbacks_p1
    )

    # --- Phase 2: Fine-Tuning Top Layers ---
    print(f"\n==================================================")
    print(f"   PHASE 2: Fine-tuning Top 30 Base Layers ({epochs_phase2} epochs)")
    print(f"==================================================")
    model = unfreeze_for_finetuning(model, base_model, num_layers_to_unfreeze=30, learning_rate=1e-5)
    model.summary()

    # Callbacks for Phase 2 — add LR scheduler
    callbacks_p2 = [
        tf.keras.callbacks.ModelCheckpoint(
            filepath=model_path,
            monitor="val_auc",
            mode="max",
            save_best_only=True,
            verbose=1
        ),
        tf.keras.callbacks.EarlyStopping(
            monitor="val_auc",
            mode="max",
            patience=4,
            restore_best_weights=True,
            verbose=1
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.5,
            patience=2,
            min_lr=1e-7,
            verbose=1
        )
    ]

    history_phase2 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs_phase1 + epochs_phase2,
        initial_epoch=len(history_phase1.epoch),
        callbacks=callbacks_p2
    )

    # Evaluate on Test Set
    print("\n==================================================")
    print("   EVALUATION ON TEST SET")
    print("==================================================")
    best_model = tf.keras.models.load_model(model_path)
    test_metrics = best_model.evaluate(test_ds)
    test_loss = float(test_metrics[0])
    test_accuracy = float(test_metrics[1])
    test_precision = float(test_metrics[2])
    test_recall = float(test_metrics[3])
    test_auc = float(test_metrics[4])

    print(f"Test Loss      : {test_loss:.4f}")
    print(f"Test Accuracy  : {test_accuracy:.4f}")
    print(f"Test Precision : {test_precision:.4f}")
    print(f"Test Recall    : {test_recall:.4f}")
    print(f"Test AUC       : {test_auc:.4f}")

    # Calculate F1 score
    if test_precision + test_recall > 0:
        test_f1 = 2 * (test_precision * test_recall) / (test_precision * test_recall)
    else:
        test_f1 = 0.0
    print(f"Test F1-Score  : {test_f1:.4f}")

    # Save model metadata
    metadata = {
        "model_name": "EfficientNetB0 DeepFake Classifier",
        "model_version": "v2.0.0",
        "dataset_version": "140k_Real_Fake_Faces_v2.0",
        "training_date": datetime.datetime.now().strftime("%Y-%m-%d"),
        "training_config": {
            "epochs_phase1": epochs_phase1,
            "epochs_phase2": epochs_phase2,
            "batch_size": batch_size,
            "data_dir": data_dir,
            "img_size": [224, 224],
            "optimizer_p1": "Adam(lr=1e-3)",
            "optimizer_p2": "Adam(lr=1e-5)",
            "architecture": "EfficientNetB0 + BatchNorm + Dense(256) + Dense(128) + Sigmoid"
        },
        "test_metrics": {
            "accuracy": round(test_accuracy, 4),
            "precision": round(test_precision, 4),
            "recall": round(test_recall, 4),
            "f1_score": round(test_f1, 4),
            "auc": round(test_auc, 4),
            "loss": round(test_loss, 4)
        }
    }

    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"\n[SUCCESS] Model metadata saved to '{metadata_path}'")
    print(f"[SUCCESS] Best model saved to '{model_path}'")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train Authentix Deep Learning DeepFake Detector")
    parser.add_argument("--data_dir", type=str, default="data", help="Path to dataset folder")
    parser.add_argument("--epochs_p1", type=int, default=10, help="Epochs for Phase 1 (frozen base)")
    parser.add_argument("--epochs_p2", type=int, default=10, help="Epochs for Phase 2 (fine-tuning)")
    parser.add_argument("--batch_size", type=int, default=32, help="Batch size")
    parser.add_argument("--max_train_samples", type=int, default=None, help="Max train samples (default: all)")
    parser.add_argument("--max_val_samples", type=int, default=None, help="Max val samples (default: all)")
    parser.add_argument("--max_test_samples", type=int, default=None, help="Max test samples (default: all)")
    args = parser.parse_args()

    train_model(
        args.data_dir, 
        args.epochs_p1, 
        args.epochs_p2, 
        args.batch_size,
        max_train_samples=args.max_train_samples,
        max_val_samples=args.max_val_samples,
        max_test_samples=args.max_test_samples
    )
