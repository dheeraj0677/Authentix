import os
import json
import argparse
import numpy as np
import tensorflow as tf
from data import load_datasets
from predict import get_or_load_model

def evaluate_model_performance(data_dir="data", model_path="saved_model/authentix_model.keras", output_json="plots/evaluation_metrics.json"):
    """
    Evaluates EfficientNetB0 model performance on the real test split.
    Computes Confusion Matrix, F1-Score, and ROC-AUC from actual model inference.
    """
    print("[INFO] Running comprehensive model evaluation on real test data...")
    model = get_or_load_model(model_path)

    if not os.path.exists(data_dir):
        print(f"[ERROR] Dataset directory '{data_dir}' not found. Cannot evaluate on real data.")
        return None

    try:
        # Determine model input shape dynamically
        img_size = (224, 224)
        if model is not None and hasattr(model, "input_shape") and model.input_shape is not None:
            try:
                h, w = model.input_shape[1], model.input_shape[2]
                if h is not None and w is not None:
                    img_size = (w, h)
            except Exception:
                pass
        
        print(f"[INFO] Evaluating model with target image resolution: {img_size}")
        _, _, test_ds, label_map = load_datasets(data_dir, img_size=img_size, batch_size=32)
        print(f"[INFO] Evaluating with class mapping: {label_map}")

        print("[INFO] Running inference on test set...")
        all_scores = []
        all_labels = []

        for batch_x, batch_y in test_ds:
            preds = model.predict(batch_x, verbose=0)
            all_scores.extend(preds.flatten().tolist())
            all_labels.extend(batch_y.numpy().flatten().tolist())

        y_true = np.array(all_labels, dtype=int)
        y_scores = np.array(all_scores)

    except Exception as e:
        print(f"[WARN] Failed to load dataset for evaluation: {e}")
        return None

    y_pred = (y_scores >= 0.5).astype(int)

    # Calculate Confusion Matrix
    tp = int(np.sum((y_true == 1) & (y_pred == 1)))
    tn = int(np.sum((y_true == 0) & (y_pred == 0)))
    fp = int(np.sum((y_true == 0) & (y_pred == 1)))
    fn = int(np.sum((y_true == 1) & (y_pred == 0)))

    accuracy = round(float((tp + tn) / len(y_true)), 4) if len(y_true) > 0 else 0.0
    precision = round(float(tp / (tp + fp)) if (tp + fp) > 0 else 0.0, 4)
    recall = round(float(tp / (tp + fn)) if (tp + fn) > 0 else 0.0, 4)
    f1_score = round(float(2 * (precision * recall) / (precision + recall)) if (precision + recall) > 0 else 0.0, 4)

    # Compute ROC-AUC
    try:
        from sklearn.metrics import roc_auc_score
        auc = round(float(roc_auc_score(y_true, y_scores)), 4)
    except Exception:
        thresholds = np.linspace(0, 1, 100)
        tprs, fprs = [], []
        for t in thresholds:
            p = (y_scores >= t).astype(int)
            tprs.append(np.sum((y_true == 1) & (p == 1)) / max(np.sum(y_true == 1), 1))
            fprs.append(np.sum((y_true == 0) & (p == 1)) / max(np.sum(y_true == 0), 1))
        
        trapz_fn = getattr(np, "trapezoid", getattr(np, "trapz", None))
        if trapz_fn:
            auc = round(float(trapz_fn(tprs[::-1], fprs[::-1])), 4)
        else:
            # Simple Riemann sum fallback for AUC
            sorted_pairs = sorted(zip(fprs, tprs))
            auc_val = 0.0
            for i in range(1, len(sorted_pairs)):
                dx = sorted_pairs[i][0] - sorted_pairs[i-1][0]
                dy = (sorted_pairs[i][1] + sorted_pairs[i-1][1]) / 2.0
                auc_val += dx * dy
            auc = round(float(auc_val), 4)

    metrics = {
        "dataset": data_dir,
        "sample_count": len(y_true),
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1_score": f1_score,
        "roc_auc": auc,
        "confusion_matrix": {
            "true_positive": tp,
            "true_negative": tn,
            "false_positive": fp,
            "false_negative": fn
        }
    }

    os.makedirs(os.path.dirname(output_json) if os.path.dirname(output_json) else ".", exist_ok=True)
    with open(output_json, "w") as f:
        json.dump(metrics, f, indent=2)

    print("\n==================================================")
    print("   AUTHENTIX EVALUATION METRICS REPORT")
    print("==================================================")
    print(f"Dataset    : {data_dir} ({len(y_true)} samples)")
    print(f"Accuracy   : {accuracy * 100:.2f}%")
    print(f"Precision  : {precision * 100:.2f}%")
    print(f"Recall     : {recall * 100:.2f}%")
    print(f"F1-Score   : {f1_score * 100:.2f}%")
    print(f"ROC-AUC    : {auc:.4f}")
    print(f"Confusion  : TP={tp}, TN={tn}, FP={fp}, FN={fn}")
    print(f"\n[SUCCESS] Metrics saved to '{output_json}'")

    return metrics

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Authentix Real Model Evaluation")
    parser.add_argument("--data_dir", type=str, default="data", help="Path to dataset (real/ and fake/ subdirs)")
    parser.add_argument("--model", type=str, default="saved_model/authentix_model.keras", help="Path to trained .keras model")
    parser.add_argument("--output", type=str, default="plots/evaluation_metrics.json", help="Output JSON path")
    args = parser.parse_args()

    evaluate_model_performance(args.data_dir, args.model, args.output)
