import os
import json
import argparse
import numpy as np
import cv2
import tensorflow as tf
from data import load_datasets
from predict import get_or_load_model

def apply_perturbation(image_batch, condition_name, param):
    """
    Applies real-world perturbations to a batch of images [B, H, W, 3] in [0, 255].
    """
    perturbed = []
    for img in image_batch:
        img_np = np.clip(img.copy(), 0, 255).astype(np.uint8)
        h, w = img_np.shape[:2]

        if condition_name == "clean":
            res = img_np

        elif condition_name == "jpeg":
            # param is quality (e.g., 90, 70, 50)
            encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), int(param)]
            _, enc = cv2.imencode(".jpg", img_np, encode_param)
            res = cv2.imdecode(enc, cv2.IMREAD_COLOR)

        elif condition_name == "downscale":
            # param is target dimension (e.g., 112, 56)
            down = cv2.resize(img_np, (param, param), interpolation=cv2.INTER_LINEAR)
            res = cv2.resize(down, (w, h), interpolation=cv2.INTER_LINEAR)

        elif condition_name == "noise":
            # param is sigma (e.g., 10, 25)
            noise = np.random.normal(0, param, img_np.shape).astype(np.float32)
            res = np.clip(img_np.astype(np.float32) + noise, 0, 255).astype(np.uint8)

        elif condition_name == "blur":
            # param is kernel size (e.g., 3, 5)
            k = int(param)
            res = cv2.GaussianBlur(img_np, (k, k), 0)

        else:
            res = img_np

        perturbed.append(res.astype(np.float32))

    return np.array(perturbed, dtype=np.float32)


def run_stress_test(data_dir="data", model_path="saved_model/authentix_model.keras", 
                    output_json="plots/stress_test_report.json", max_samples=500):
    """
    Evaluates model robustness across real-world perturbation conditions.
    Matches the Authentix Review Report evaluation benchmark.
    """
    print(f"\n========================================================")
    print(f"   AUTHENTIX ROBUSTNESS & STRESS-TEST BENCHMARK         ")
    print(f"========================================================")

    model = get_or_load_model(model_path)
    if not os.path.exists(data_dir):
        print(f"[ERROR] Dataset folder '{data_dir}' not found.")
        return None

    img_size = (224, 224)
    if model is not None and hasattr(model, "input_shape") and model.input_shape is not None:
        try:
            h, w = model.input_shape[1], model.input_shape[2]
            if h and w:
                img_size = (w, h)
        except Exception:
            pass

    print(f"[INFO] Loading test dataset split (target resolution: {img_size})...")
    _, _, test_ds, label_map = load_datasets(data_dir, img_size=img_size, batch_size=32, max_test_samples=max_samples)

    # Cache clean batches in memory for consistent comparison across conditions
    all_images = []
    all_labels = []
    for bx, by in test_ds:
        all_images.append(bx.numpy())
        all_labels.append(by.numpy().flatten())

    if not all_images:
        print("[ERROR] No test samples loaded.")
        return None

    all_images = np.concatenate(all_images, axis=0)
    all_labels = np.concatenate(all_labels, axis=0).astype(int)
    total_samples = len(all_labels)
    print(f"[INFO] Cached {total_samples} test images for stress-testing.")

    # Benchmark conditions specified in Section 4.4 of Review Report
    test_conditions = [
        ("Clean baseline", "clean", None),
        ("JPEG compression (Q = 90)", "jpeg", 90),
        ("JPEG compression (Q = 70)", "jpeg", 70),
        ("JPEG compression (Q = 50)", "jpeg", 50),
        ("Downscaling (112x112)", "downscale", 112),
        ("Downscaling (56x56)", "downscale", 56),
        ("Gaussian noise (sigma = 10)", "noise", 10),
        ("Gaussian noise (sigma = 25)", "noise", 25),
        ("Gaussian blur (3x3)", "blur", 3),
        ("Gaussian blur (5x5)", "blur", 5),
    ]

    results = []
    baseline_accuracy = None

    for label, cond_type, param in test_conditions:
        batch_preds = []
        batch_size = 32
        num_batches = int(np.ceil(total_samples / batch_size))

        for i in range(num_batches):
            b_start = i * batch_size
            b_end = min(total_samples, (i + 1) * batch_size)
            sub_batch = all_images[b_start:b_end]

            # Apply perturbation
            perturbed_batch = apply_perturbation(sub_batch, cond_type, param)
            preds = model.predict(perturbed_batch, verbose=0).flatten()
            batch_preds.extend(preds.tolist())

        y_pred = (np.array(batch_preds) >= 0.5).astype(int)
        accuracy = round(float(np.mean(y_pred == all_labels) * 100.0), 2)

        if baseline_accuracy is None:
            baseline_accuracy = accuracy
            acc_drop = 0.0
        else:
            acc_drop = round(baseline_accuracy - accuracy, 2)

        # Resilience rating: High (drop <= 5%), Moderate (drop <= 15%), Low (drop > 15%)
        if acc_drop <= 5.0:
            rating = "High"
        elif acc_drop <= 15.0:
            rating = "Moderate"
        else:
            rating = "Low"

        results.append({
            "condition": label,
            "accuracy": accuracy,
            "accuracy_drop": f"-{acc_drop}%" if acc_drop > 0 else "0.0%",
            "resilience_rating": rating
        })

    # Print Formatted Report Table
    print("\n" + "=" * 80)
    print(f"{'Perturbation Condition':<35} | {'Accuracy':<10} | {'Drop':<10} | {'Resilience'}")
    print("-" * 80)
    for r in results:
        print(f"{r['condition']:<35} | {r['accuracy']:.2f}%{'':<3} | {r['accuracy_drop']:<10} | {r['resilience_rating']}")
    print("=" * 80 + "\n")

    # Save to JSON
    os.makedirs(os.path.dirname(output_json) if os.path.dirname(output_json) else ".", exist_ok=True)
    report_data = {
        "model": model_path,
        "test_samples": total_samples,
        "baseline_accuracy": baseline_accuracy,
        "benchmark_table": results
    }
    with open(output_json, "w") as f:
        json.dump(report_data, f, indent=2)

    print(f"[SUCCESS] Stress test report saved to '{output_json}'")
    return report_data


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Authentix Model Robustness Stress Test")
    parser.add_argument("--data_dir", type=str, default="data", help="Dataset directory")
    parser.add_argument("--model", type=str, default="saved_model/authentix_model.keras", help="Model path")
    parser.add_argument("--output", type=str, default="plots/stress_test_report.json", help="Output JSON path")
    parser.add_argument("--max_samples", type=int, default=300, help="Max test samples to evaluate")
    args = parser.parse_args()

    run_stress_test(args.data_dir, args.model, args.output, args.max_samples)
