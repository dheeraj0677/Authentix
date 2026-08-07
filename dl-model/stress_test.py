import os
import cv2
import json
import argparse
import numpy as np
import tensorflow as tf
from predict import get_or_load_model

def apply_jpeg_compression(img_bgr, quality):
    encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), quality]
    _, encimg = cv2.imencode('.jpg', img_bgr, encode_param)
    decimg = cv2.imdecode(encimg, 1)
    return decimg

def apply_downscaling(img_bgr, target_size):
    h, w = img_bgr.shape[:2]
    downscaled = cv2.resize(img_bgr, (target_size, target_size), interpolation=cv2.INTER_AREA)
    upscaled = cv2.resize(downscaled, (w, h), interpolation=cv2.INTER_CUBIC)
    return upscaled

def apply_gaussian_noise(img_bgr, sigma=25):
    row, col, ch = img_bgr.shape
    gauss = np.random.normal(0, sigma, (row, col, ch)).astype(np.float32)
    noisy = img_bgr.astype(np.float32) + gauss
    noisy = np.clip(noisy, 0, 255).astype(np.uint8)
    return noisy

def apply_gaussian_blur(img_bgr, kernel_size=5):
    return cv2.GaussianBlur(img_bgr, (kernel_size, kernel_size), 0)

def evaluate_on_images(model, image_paths_with_labels):
    correct = 0
    total = len(image_paths_with_labels)
    if total == 0:
        return 0.0

    for img_bgr, true_label in image_paths_with_labels:
        rgb_img = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        resized_img = cv2.resize(rgb_img, (224, 224))
        img_array = np.expand_dims(resized_img.astype(np.float32) / 255.0, axis=0)

        raw_score = float(model.predict(img_array, verbose=0)[0][0])
        pred_label = "REAL" if raw_score >= 0.5 else "FAKE"

        if pred_label == true_label:
            correct += 1

    return round((correct / total) * 100.0, 2)

def run_stress_test(data_dir="data", model_path="saved_model/authentix_model.keras", output_file="plots/robustness_report.md"):
    print("[INFO] Initializing Authentix Robustness & Stress-Testing Suite...")
    model = get_or_load_model(model_path)

    # Synthetic sample images generator if data directory is empty
    sample_items = []
    if os.path.exists(data_dir):
        for label, folder in [("REAL", "real"), ("FAKE", "fake")]:
            target_folder = os.path.join(data_dir, folder)
            if os.path.exists(target_folder):
                files = os.listdir(target_folder)[:10]
                for f in files:
                    p = os.path.join(target_folder, f)
                    img = cv2.imread(p)
                    if img is not None:
                        sample_items.append((img, label))

    # Generate synthetic benchmark images if data folder not populated
    if len(sample_items) < 5:
        print("\n" + "!" * 70)
        print("[WARNING] No real dataset found in '{data_dir}/real/' and '{data_dir}/fake/'.")
        print("[WARNING] Generating SYNTHETIC random images as a fallback for pipeline testing.")
        print("[WARNING] Results from synthetic images are MEANINGLESS for real-world evaluation.")
        print("[WARNING] To get valid stress test results, provide a real deepfake dataset.")
        print("!" * 70 + "\n")
        np.random.seed(42)
        for i in range(10):
            # Synthetic REAL image — face-like oval
            real_img = np.full((224, 224, 3), 180, dtype=np.uint8)
            cv2.ellipse(real_img, (112, 110), (70, 90), 0, 0, 360, (220, 190, 160), -1)
            cv2.circle(real_img, (90, 95), 12, (60, 40, 30), -1)   # left eye
            cv2.circle(real_img, (134, 95), 12, (60, 40, 30), -1)  # right eye
            cv2.ellipse(real_img, (112, 145), (25, 10), 0, 0, 180, (180, 80, 80), -1)  # mouth
            sample_items.append((real_img, "REAL"))

            # Synthetic FAKE image — blocky artifact pattern
            fake_img = np.zeros((224, 224, 3), dtype=np.uint8)
            for bx in range(0, 224, 16):
                for by in range(0, 224, 16):
                    color = np.random.randint(0, 255, 3).tolist()
                    cv2.rectangle(fake_img, (bx, by), (bx+15, by+15), color, -1)
            sample_items.append((fake_img, "FAKE"))

    # Baseline evaluation
    baseline_acc = evaluate_on_images(model, sample_items)

    perturbations = [
        ("Clean Baseline", lambda img: img),
        ("JPEG Compression (Q=90)", lambda img: apply_jpeg_compression(img, 90)),
        ("JPEG Compression (Q=70)", lambda img: apply_jpeg_compression(img, 70)),
        ("JPEG Compression (Q=50)", lambda img: apply_jpeg_compression(img, 50)),
        ("Downscaling (112x112)", lambda img: apply_downscaling(img, 112)),
        ("Downscaling (56x56)", lambda img: apply_downscaling(img, 56)),
        ("Gaussian Noise (sigma=10)", lambda img: apply_gaussian_noise(img, 10)),
        ("Gaussian Noise (sigma=25)", lambda img: apply_gaussian_noise(img, 25)),
        ("Gaussian Blur (3x3)", lambda img: apply_gaussian_blur(img, 3)),
        ("Gaussian Blur (5x5)", lambda img: apply_gaussian_blur(img, 5)),
    ]

    results = []

    print("\n" + "=" * 70)
    print(f"{'Perturbation Condition':<30} | {'Accuracy (%)':<15} | {'Drop (%)':<15}")
    print("=" * 70)

    for name, transform in perturbations:
        transformed_items = [(transform(img.copy()), label) for img, label in sample_items]
        acc = evaluate_on_images(model, transformed_items)
        drop = round(baseline_acc - acc, 2)
        results.append({"condition": name, "accuracy": acc, "drop": drop})
        print(f"{name:<30} | {acc:<15} | {-drop if drop > 0 else 0.0:<15}")

    print("=" * 70)

    # Generate Markdown Table
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    md_content = "# Authentix Model Robustness & Perturbation Stress-Test Report\n\n"
    md_content += "| Perturbation Condition | Accuracy (%) | Accuracy Drop (%) | Resilience Rating |\n"
    md_content += "|---|---|---|---|\n"

    for r in results:
        drop_str = f"-{r['drop']}%" if r['drop'] > 0 else "0.0%"
        rating = "High" if r['drop'] <= 5.0 else ("Moderate" if r['drop'] <= 15.0 else "Low")
        md_content += f"| {r['condition']} | {r['accuracy']}% | {drop_str} | {rating} |\n"

    with open(output_file, "w") as f:
        f.write(md_content)

    print(f"\n[SUCCESS] Robustness report saved to '{output_file}'")
    return results

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Authentix Model Stress-Testing Suite")
    parser.add_argument("--data_dir", type=str, default="data")
    args = parser.parse_args()
    run_stress_test(args.data_dir)
