import os
import json
import time
import numpy as np
from predict import predict_image
from video_predict import predict_video

def run_comprehensive_evaluation():
    print("================================================================================")
    print("   AUTHENTIX DEEPFAKE DETECTOR — COMPREHENSIVE MULTI-MODAL TEST SUITE")
    print("================================================================================")
    
    # ---------------------------------------------------------
    # 1. IMAGE EVALUATION (10 Real + 10 Fake Test Images)
    # ---------------------------------------------------------
    test_fake_dir = "data/Test/Fake"
    test_real_dir = "data/Test/Real"

    fake_images = [os.path.join(test_fake_dir, f) for f in os.listdir(test_fake_dir)[:10]]
    real_images = [os.path.join(test_real_dir, f) for f in os.listdir(test_real_dir)[:10]]

    image_results = []
    print("\n[STEP 1/2] Running Inference on 20 Diverse Test Images (10 Fake + 10 Real)...")

    # Evaluate Fake Images
    for path in fake_images:
        t0 = time.time()
        res = predict_image(path, model_path="saved_model/authentix_model.keras", output_gradcam_dir="outputs")
        latency_ms = round((time.time() - t0) * 1000, 2)
        image_results.append({
            "filename": os.path.basename(path),
            "ground_truth": "FAKE",
            "predicted": res["prediction"],
            "confidence": res["confidence"],
            "raw_score": res["raw_score"],
            "latency_ms": latency_ms,
            "correct": res["prediction"] == "FAKE",
            "gradcam_path": res.get("gradcam_path", ""),
            "explanation": res.get("explanation", {}).get("explanation_text", "")
        })
        print(f"  [FAKE] {os.path.basename(path):<15} -> Pred: {res['prediction']:<5} | Conf: {res['confidence']:>5.1f}% | Raw: {res['raw_score']:>6.4f} | Latency: {latency_ms:>5.1f}ms")

    # Evaluate Real Images
    for path in real_images:
        t0 = time.time()
        res = predict_image(path, model_path="saved_model/authentix_model.keras", output_gradcam_dir="outputs")
        latency_ms = round((time.time() - t0) * 1000, 2)
        image_results.append({
            "filename": os.path.basename(path),
            "ground_truth": "REAL",
            "predicted": res["prediction"],
            "confidence": res["confidence"],
            "raw_score": res["raw_score"],
            "latency_ms": latency_ms,
            "correct": res["prediction"] == "REAL",
            "gradcam_path": res.get("gradcam_path", ""),
            "explanation": res.get("explanation", {}).get("explanation_text", "")
        })
        print(f"  [REAL] {os.path.basename(path):<15} -> Pred: {res['prediction']:<5} | Conf: {res['confidence']:>5.1f}% | Raw: {res['raw_score']:>6.4f} | Latency: {latency_ms:>5.1f}ms")

    # Image Metrics Calculation
    img_tp = sum(1 for r in image_results if r["ground_truth"] == "REAL" and r["predicted"] == "REAL")
    img_tn = sum(1 for r in image_results if r["ground_truth"] == "FAKE" and r["predicted"] == "FAKE")
    img_fp = sum(1 for r in image_results if r["ground_truth"] == "FAKE" and r["predicted"] == "REAL")
    img_fn = sum(1 for r in image_results if r["ground_truth"] == "REAL" and r["predicted"] == "FAKE")

    img_acc = round((img_tp + img_tn) / len(image_results), 4)
    img_prec = round(img_tp / (img_tp + img_fp), 4) if (img_tp + img_fp) > 0 else 0.0
    img_rec = round(img_tp / (img_tp + img_fn), 4) if (img_tp + img_fn) > 0 else 0.0
    img_f1 = round(2 * (img_prec * img_rec) / (img_prec + img_rec), 4) if (img_prec + img_rec) > 0 else 0.0
    img_avg_lat = round(float(np.mean([r["latency_ms"] for r in image_results])), 2)

    # ---------------------------------------------------------
    # 2. VIDEO EVALUATION (5 Real + 5 Fake DFD Videos)
    # ---------------------------------------------------------
    base_archive = r"C:\Users\Dheer\Downloads\archive"
    real_video_dir = os.path.join(base_archive, "DFD_original sequences")
    fake_video_dir = os.path.join(base_archive, "DFD_manipulated_sequences", "DFD_manipulated_sequences")

    real_videos = [os.path.join(real_video_dir, f) for f in os.listdir(real_video_dir) if f.endswith(".mp4")][:5]
    fake_videos = [os.path.join(fake_video_dir, f) for f in os.listdir(fake_video_dir) if f.endswith(".mp4")][:5]

    video_results = []
    print("\n[STEP 2/2] Running Frame-by-Frame Inference on 10 Videos (5 Fake + 5 Real)...")

    # Evaluate Fake Videos
    for path in fake_videos:
        t0 = time.time()
        res = predict_video(path, model_path="saved_model/authentix_model.keras", output_dir="outputs", sample_interval_sec=0.5)
        latency_ms = round((time.time() - t0) * 1000, 2)
        video_results.append({
            "filename": os.path.basename(path),
            "ground_truth": "FAKE",
            "predicted": res["prediction"],
            "confidence": res["confidence"],
            "total_frames": res["total_frames"],
            "analyzed_frames": res["analyzed_frames"],
            "fake_frame_percentage": res["fake_frame_percentage"],
            "most_suspicious_timestamp": res["most_suspicious_frame"]["timestamp_sec"],
            "most_suspicious_raw": res["most_suspicious_frame"]["raw_score"],
            "latency_ms": latency_ms,
            "correct": res["prediction"] == "FAKE"
        })
        print(f"  [FAKE VID] {os.path.basename(path)[:28]:<28} -> Pred: {res['prediction']:<5} | Conf: {res['confidence']:>5.1f}% | FakeFrames: {res['fake_frame_percentage']:>5.1f}% | Latency: {latency_ms:>6.1f}ms")

    # Evaluate Real Videos
    for path in real_videos:
        t0 = time.time()
        res = predict_video(path, model_path="saved_model/authentix_model.keras", output_dir="outputs", sample_interval_sec=0.5)
        latency_ms = round((time.time() - t0) * 1000, 2)
        video_results.append({
            "filename": os.path.basename(path),
            "ground_truth": "REAL",
            "predicted": res["prediction"],
            "confidence": res["confidence"],
            "total_frames": res["total_frames"],
            "analyzed_frames": res["analyzed_frames"],
            "fake_frame_percentage": res["fake_frame_percentage"],
            "most_suspicious_timestamp": res["most_suspicious_frame"]["timestamp_sec"],
            "most_suspicious_raw": res["most_suspicious_frame"]["raw_score"],
            "latency_ms": latency_ms,
            "correct": res["prediction"] == "REAL"
        })
        print(f"  [REAL VID] {os.path.basename(path)[:28]:<28} -> Pred: {res['prediction']:<5} | Conf: {res['confidence']:>5.1f}% | FakeFrames: {res['fake_frame_percentage']:>5.1f}% | Latency: {latency_ms:>6.1f}ms")

    # Video Metrics Calculation
    vid_tp = sum(1 for r in video_results if r["ground_truth"] == "REAL" and r["predicted"] == "REAL")
    vid_tn = sum(1 for r in video_results if r["ground_truth"] == "FAKE" and r["predicted"] == "FAKE")
    vid_fp = sum(1 for r in video_results if r["ground_truth"] == "FAKE" and r["predicted"] == "REAL")
    vid_fn = sum(1 for r in video_results if r["ground_truth"] == "REAL" and r["predicted"] == "FAKE")

    vid_acc = round((vid_tp + vid_tn) / len(video_results), 4)
    vid_prec = round(vid_tp / (vid_tp + vid_fp), 4) if (vid_tp + vid_fp) > 0 else 0.0
    vid_rec = round(vid_tp / (vid_tp + vid_fn), 4) if (vid_tp + vid_fn) > 0 else 0.0
    vid_f1 = round(2 * (vid_prec * vid_rec) / (vid_prec + vid_rec), 4) if (vid_prec + vid_rec) > 0 else 0.0
    vid_avg_lat = round(float(np.mean([r["latency_ms"] for r in video_results])), 2)

    # ---------------------------------------------------------
    # 3. SAVE STRUCTURED JSON REPORT
    # ---------------------------------------------------------
    report = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "model_version": "v2.0.0 (EfficientNetB0 + Combined DFD/140k)",
        "image_evaluation": {
            "total_tested": len(image_results),
            "accuracy": img_acc,
            "precision": img_prec,
            "recall": img_rec,
            "f1_score": img_f1,
            "average_latency_ms": img_avg_lat,
            "confusion_matrix": {"TP": img_tp, "TN": img_tn, "FP": img_fp, "FN": img_fn},
            "samples": image_results
        },
        "video_evaluation": {
            "total_tested": len(video_results),
            "accuracy": vid_acc,
            "precision": vid_prec,
            "recall": vid_rec,
            "f1_score": vid_f1,
            "average_latency_ms": vid_avg_lat,
            "confusion_matrix": {"TP": vid_tp, "TN": vid_tn, "FP": vid_fp, "FN": vid_fn},
            "samples": video_results
        }
    }

    os.makedirs("plots", exist_ok=True)
    report_path = "plots/comprehensive_test_report.json"
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)

    print("\n================================================================================")
    print("   AUTHENTIX TEST EVALUATION SUMMARY")
    print("================================================================================")
    print(f"Image Evaluation  : Accuracy={img_acc*100:.1f}% | Precision={img_prec*100:.1f}% | Recall={img_rec*100:.1f}% | F1={img_f1*100:.1f}% | Latency={img_avg_lat}ms")
    print(f"Video Evaluation  : Accuracy={vid_acc*100:.1f}% | Precision={vid_prec*100:.1f}% | Recall={vid_rec*100:.1f}% | F1={vid_f1*100:.1f}% | Latency={vid_avg_lat}ms")
    print(f"Report JSON Saved : {report_path}")
    print("================================================================================\n")

if __name__ == "__main__":
    run_comprehensive_evaluation()
