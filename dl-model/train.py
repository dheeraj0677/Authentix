import os
import argparse
import tensorflow as tf
from data import load_datasets
from model import build_model, unfreeze_for_finetuning

def train_model(data_dir, epochs_phase1=10, epochs_phase2=10, batch_size=32, save_dir="saved_model"):
    """
    Two-phase Deep Learning training loop:
    Phase 1: Train classification head with frozen EfficientNetB0 base.
    Phase 2: Unfreeze top 30 layers and fine-tune at low learning rate.
    """
    os.makedirs(save_dir, exist_ok=True)
    model_path = os.path.join(save_dir, "authentix_model.keras")

    print("[INFO] Loading datasets...")
    train_ds, val_ds, test_ds, label_map = load_datasets(data_dir, batch_size=batch_size)
    print(f"[INFO] Class mapping: {label_map}")

    # Build model
    print("[INFO] Building EfficientNetB0 CNN model...")
    model, base_model = build_model()
    model.summary()

    # Callbacks
    callbacks = [
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
        callbacks=callbacks
    )

    # --- Phase 2: Fine-Tuning Top Layers ---
    print(f"\n==================================================")
    print(f"   PHASE 2: Fine-tuning Top 30 Base Layers ({epochs_phase2} epochs)")
    print(f"==================================================")
    model = unfreeze_for_finetuning(model, base_model, num_layers_to_unfreeze=30, learning_rate=1e-5)
    model.summary()

    history_phase2 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs_phase1 + epochs_phase2,
        initial_epoch=len(history_phase1.epoch),
        callbacks=callbacks
    )

    # Evaluate on Test Set
    print("\n==================================================")
    print("   EVALUATION ON TEST SET")
    print("==================================================")
    best_model = tf.keras.models.load_model(model_path)
    test_metrics = best_model.evaluate(test_ds)
    print(f"Test Loss: {test_metrics[0]:.4f}")
    print(f"Test Accuracy: {test_metrics[1]:.4f}")
    print(f"Test Precision: {test_metrics[2]:.4f}")
    print(f"Test Recall: {test_metrics[3]:.4f}")
    print(f"Test AUC: {test_metrics[4]:.4f}")

    print(f"\n[SUCCESS] Best model saved to '{model_path}'")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train Authentix Deep Learning DeepFake Detector")
    parser.add_argument("--data_dir", type=str, default="data", help="Path to dataset folder containing real/ and fake/ subfolders")
    parser.add_argument("--epochs_p1", type=int, default=10, help="Epochs for Phase 1 (frozen base)")
    parser.add_argument("--epochs_p2", type=int, default=10, help="Epochs for Phase 2 (fine-tuning)")
    parser.add_argument("--batch_size", type=int, default=32, help="Batch size")
    args = parser.parse_args()

    train_model(args.data_dir, args.epochs_p1, args.epochs_p2, args.batch_size)
