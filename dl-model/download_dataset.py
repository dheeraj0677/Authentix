"""
Authentix Dataset Downloader & Preparer
========================================
Downloads and prepares deepfake detection datasets from Kaggle:
1. DFD (Deep Fake Detection) — video dataset, extracts face frames
2. 140k Real and Fake Faces — image dataset (StyleGAN vs FFHQ)

Combines both into a unified dl-model/data/ directory:
    data/
    ├── real/
    └── fake/

Usage:
    python download_dataset.py                     # Download both, full dataset
    python download_dataset.py --max_images 20000  # Limit to 20k images total
    python download_dataset.py --skip_dfd          # Skip video dataset (images only)
    python download_dataset.py --skip_140k         # Skip image dataset (videos only)
"""

import os
import sys
import shutil
import argparse
import random
from pathlib import Path

# ─── Constants ───────────────────────────────────────────────────────────────
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
REAL_DIR = os.path.join(DATA_DIR, "real")
FAKE_DIR = os.path.join(DATA_DIR, "fake")

DFD_DATASET = "sanikatiwarekar/deep-fake-detection-dfd-entire-original-dataset"
FACES_140K_DATASET = "xhlulu/140k-real-and-fake-faces"

# How many frames to extract per video from DFD
FRAMES_PER_VIDEO = 15


def download_with_kagglehub(dataset_slug):
    """Download a dataset using kagglehub and return the local path."""
    try:
        import kagglehub
    except ImportError:
        print("[ERROR] kagglehub is not installed. Run: pip install kagglehub")
        sys.exit(1)

    print(f"\n{'='*60}")
    print(f"  Downloading: {dataset_slug}")
    print(f"{'='*60}")
    path = kagglehub.dataset_download(dataset_slug)
    print(f"[OK] Downloaded to: {path}")
    return path


def extract_frames_from_video(video_path, output_dir, label_prefix, max_frames=FRAMES_PER_VIDEO):
    """
    Extract evenly-spaced frames from a video file and save as JPEGs.
    Returns the number of frames successfully extracted.
    """
    try:
        import cv2
    except ImportError:
        print("[ERROR] opencv-python is required. Run: pip install opencv-python")
        sys.exit(1)

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return 0

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total_frames <= 0:
        cap.release()
        return 0

    # Pick evenly spaced frame indices
    if total_frames <= max_frames:
        indices = list(range(total_frames))
    else:
        indices = [int(i * total_frames / max_frames) for i in range(max_frames)]

    video_name = Path(video_path).stem
    count = 0

    for idx in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ret, frame = cap.read()
        if not ret:
            continue

        # Resize to 256x256 for consistency
        frame_resized = cv2.resize(frame, (256, 256))
        out_name = f"{label_prefix}_{video_name}_f{idx:05d}.jpg"
        out_path = os.path.join(output_dir, out_name)
        cv2.imwrite(out_path, frame_resized, [cv2.IMWRITE_JPEG_QUALITY, 95])
        count += 1

    cap.release()
    return count


def process_dfd_dataset(dfd_path, max_images=None):
    """
    Process the DFD video dataset:
    - Find real/original and fake/manipulated video directories
    - Extract frames from each video
    - Save into data/real/ and data/fake/
    """
    print(f"\n{'='*60}")
    print(f"  Processing DFD Video Dataset")
    print(f"{'='*60}")

    # Discover directory structure
    dfd_root = Path(dfd_path)
    all_dirs = [str(p) for p in dfd_root.rglob("*") if p.is_dir()]
    all_files = [str(p) for p in dfd_root.rglob("*.mp4")]

    print(f"[INFO] Found {len(all_files)} MP4 files in DFD dataset")
    if not all_files:
        # Try other video extensions
        for ext in ["*.avi", "*.mkv", "*.mov"]:
            all_files.extend([str(p) for p in dfd_root.rglob(ext)])
        print(f"[INFO] Found {len(all_files)} total video files after checking other formats")

    if not all_files:
        print("[WARN] No video files found in DFD dataset. Skipping.")
        return 0

    # Classify videos as real or fake based on directory names
    real_videos = []
    fake_videos = []

    for vf in all_files:
        vf_lower = vf.lower()
        if any(kw in vf_lower for kw in ["original", "real", "pristine", "youtube"]):
            real_videos.append(vf)
        elif any(kw in vf_lower for kw in ["manipulated", "fake", "deepfake", "altered", "reenact", "swap"]):
            fake_videos.append(vf)
        else:
            # Default: if parent directory name hints at fake, classify accordingly
            parent = Path(vf).parent.name.lower()
            if any(kw in parent for kw in ["manipulated", "fake", "deepfake"]):
                fake_videos.append(vf)
            elif any(kw in parent for kw in ["original", "real"]):
                real_videos.append(vf)
            else:
                # Unknown — skip or default to fake (since DFD is mostly manipulated)
                fake_videos.append(vf)

    print(f"[INFO] Classified: {len(real_videos)} real videos, {len(fake_videos)} fake videos")

    # Balance: limit to avoid extreme imbalance in extracted frames
    if max_images:
        max_per_class = max_images // 2
        max_real_videos = max(1, max_per_class // FRAMES_PER_VIDEO)
        max_fake_videos = max(1, max_per_class // FRAMES_PER_VIDEO)
        random.shuffle(real_videos)
        random.shuffle(fake_videos)
        real_videos = real_videos[:max_real_videos]
        fake_videos = fake_videos[:max_fake_videos]

    total_extracted = 0

    # Extract real frames
    print(f"\n[INFO] Extracting frames from {len(real_videos)} real videos...")
    for i, vpath in enumerate(real_videos, 1):
        n = extract_frames_from_video(vpath, REAL_DIR, "dfd_real")
        total_extracted += n
        if i % 50 == 0 or i == len(real_videos):
            print(f"  Real: {i}/{len(real_videos)} videos processed...")

    # Extract fake frames
    print(f"[INFO] Extracting frames from {len(fake_videos)} fake videos...")
    for i, vpath in enumerate(fake_videos, 1):
        n = extract_frames_from_video(vpath, FAKE_DIR, "dfd_fake")
        total_extracted += n
        if i % 50 == 0 or i == len(fake_videos):
            print(f"  Fake: {i}/{len(fake_videos)} videos processed...")

    print(f"[OK] DFD: Extracted {total_extracted} total frames")
    return total_extracted


def process_140k_dataset(faces_path, max_images=None):
    """
    Process the 140k Real and Fake Faces image dataset.
    Copies images into data/real/ and data/fake/.
    """
    print(f"\n{'='*60}")
    print(f"  Processing 140k Real and Fake Faces Dataset")
    print(f"{'='*60}")

    faces_root = Path(faces_path)

    # Find all image files
    image_extensions = {"*.jpg", "*.jpeg", "*.png", "*.bmp", "*.webp"}
    all_images = []
    for ext in image_extensions:
        all_images.extend(list(faces_root.rglob(ext)))

    print(f"[INFO] Found {len(all_images)} images in 140k dataset")

    # Classify images based on directory structure
    real_images = []
    fake_images = []

    for img_path in all_images:
        path_str = str(img_path).lower()
        # Check parent directories for classification
        if any(kw in path_str for kw in ["/real/", "\\real\\", "/real_", "\\real_"]):
            real_images.append(str(img_path))
        elif any(kw in path_str for kw in ["/fake/", "\\fake\\", "/fake_", "\\fake_", "/synthetic", "\\synthetic"]):
            fake_images.append(str(img_path))
        else:
            # Try filename hints
            fname = img_path.stem.lower()
            if "real" in fname:
                real_images.append(str(img_path))
            elif "fake" in fname or "synthetic" in fname:
                fake_images.append(str(img_path))

    print(f"[INFO] Classified: {len(real_images)} real, {len(fake_images)} fake")

    # Apply max_images limit per class
    if max_images:
        max_per_class = max_images // 2
        random.shuffle(real_images)
        random.shuffle(fake_images)
        real_images = real_images[:max_per_class]
        fake_images = fake_images[:max_per_class]
        print(f"[INFO] Limited to: {len(real_images)} real, {len(fake_images)} fake")

    total_copied = 0

    # Copy real images
    print(f"[INFO] Copying {len(real_images)} real images...")
    for i, src in enumerate(real_images, 1):
        ext = Path(src).suffix
        dst = os.path.join(REAL_DIR, f"140k_real_{i:06d}{ext}")
        try:
            shutil.copy2(src, dst)
            total_copied += 1
        except Exception as e:
            pass
        if i % 5000 == 0:
            print(f"  Real: {i}/{len(real_images)} copied...")

    # Copy fake images
    print(f"[INFO] Copying {len(fake_images)} fake images...")
    for i, src in enumerate(fake_images, 1):
        ext = Path(src).suffix
        dst = os.path.join(FAKE_DIR, f"140k_fake_{i:06d}{ext}")
        try:
            shutil.copy2(src, dst)
            total_copied += 1
        except Exception as e:
            pass
        if i % 5000 == 0:
            print(f"  Fake: {i}/{len(fake_images)} copied...")

    print(f"[OK] 140k: Copied {total_copied} images")
    return total_copied


def print_summary():
    """Print final dataset statistics."""
    real_count = len([f for f in os.listdir(REAL_DIR) if os.path.isfile(os.path.join(REAL_DIR, f))]) if os.path.exists(REAL_DIR) else 0
    fake_count = len([f for f in os.listdir(FAKE_DIR) if os.path.isfile(os.path.join(FAKE_DIR, f))]) if os.path.exists(FAKE_DIR) else 0

    print(f"\n{'='*60}")
    print(f"  DATASET PREPARATION COMPLETE")
    print(f"{'='*60}")
    print(f"  Location : {DATA_DIR}")
    print(f"  Real     : {real_count:,} images")
    print(f"  Fake     : {fake_count:,} images")
    print(f"  Total    : {real_count + fake_count:,} images")
    print(f"{'='*60}")

    if real_count == 0 or fake_count == 0:
        print("\n[WARNING] One class has 0 images! Training will fail.")
        print("  Check dataset download paths and directory structure.")
    elif abs(real_count - fake_count) / max(real_count, fake_count) > 0.3:
        print(f"\n[WARNING] Dataset is imbalanced (ratio: {real_count}:{fake_count}).")
        print("  Consider using class weights during training.")
    else:
        print(f"\n[OK] Dataset is well-balanced. Ready to train!")
        print(f"  Run: python train.py --data_dir data --epochs_p1 15 --epochs_p2 15")


def main():
    parser = argparse.ArgumentParser(description="Download & prepare deepfake datasets for Authentix")
    parser.add_argument("--max_images", type=int, default=None,
                        help="Max total images to use (None = all). Split evenly between datasets.")
    parser.add_argument("--skip_dfd", action="store_true",
                        help="Skip the DFD video dataset")
    parser.add_argument("--skip_140k", action="store_true",
                        help="Skip the 140k Real and Fake Faces dataset")
    parser.add_argument("--frames_per_video", type=int, default=15,
                        help="Frames to extract per DFD video (default: 15)")
    args = parser.parse_args()

    # Update module-level constant
    _frames_per_video = args.frames_per_video

    # Create output directories
    os.makedirs(REAL_DIR, exist_ok=True)
    os.makedirs(FAKE_DIR, exist_ok=True)

    # Calculate per-dataset limits
    dfd_limit = None
    faces_limit = None
    if args.max_images:
        if not args.skip_dfd and not args.skip_140k:
            # Split budget: 30% DFD, 70% 140k (since 140k is higher quality images)
            dfd_limit = int(args.max_images * 0.3)
            faces_limit = int(args.max_images * 0.7)
        elif args.skip_dfd:
            faces_limit = args.max_images
        elif args.skip_140k:
            dfd_limit = args.max_images

    total = 0

    # Download and process DFD dataset
    if not args.skip_dfd:
        try:
            dfd_path = download_with_kagglehub(DFD_DATASET)
            total += process_dfd_dataset(dfd_path, max_images=dfd_limit)
        except Exception as e:
            print(f"[ERROR] Failed to download/process DFD dataset: {e}")
            print("[INFO] Continuing with other datasets...")

    # Download and process 140k dataset
    if not args.skip_140k:
        try:
            faces_path = download_with_kagglehub(FACES_140K_DATASET)
            total += process_140k_dataset(faces_path, max_images=faces_limit)
        except Exception as e:
            print(f"[ERROR] Failed to download/process 140k dataset: {e}")
            print("[INFO] Continuing...")

    print_summary()

    if total > 0:
        print(f"\n[NEXT STEP] Train the model:")
        print(f"  python train.py --data_dir data --epochs_p1 15 --epochs_p2 15 --batch_size 32")


if __name__ == "__main__":
    main()
