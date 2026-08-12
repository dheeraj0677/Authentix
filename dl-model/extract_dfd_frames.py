import os
import cv2
from pathlib import Path

def extract_frames(video_path, output_dir, label_prefix, max_frames=8):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return 0

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total_frames <= 0:
        cap.release()
        return 0

    if total_frames <= max_frames:
        indices = list(range(total_frames))
    else:
        step = total_frames / float(max_frames)
        indices = [int(i * step) for i in range(max_frames)]

    video_name = Path(video_path).stem
    count = 0

    for idx in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ret, frame = cap.read()
        if not ret or frame is None:
            continue

        # Resize to 256x256
        frame_resized = cv2.resize(frame, (256, 256))
        out_name = f"{label_prefix}_{video_name}_f{idx:05d}.jpg"
        out_path = os.path.join(output_dir, out_name)
        cv2.imwrite(out_path, frame_resized, [cv2.IMWRITE_JPEG_QUALITY, 95])
        count += 1

    cap.release()
    return count

def main():
    base_archive = r"C:\Users\Dheer\Downloads\archive"
    real_video_dir = os.path.join(base_archive, "DFD_original sequences")
    fake_video_dir = os.path.join(base_archive, "DFD_manipulated_sequences", "DFD_manipulated_sequences")

    train_real_out = r"data\Train\Real"
    train_fake_out = r"data\Train\Fake"

    os.makedirs(train_real_out, exist_ok=True)
    os.makedirs(train_fake_out, exist_ok=True)

    real_videos = [os.path.join(real_video_dir, f) for f in os.listdir(real_video_dir) if f.endswith(".mp4")]
    fake_videos = [os.path.join(fake_video_dir, f) for f in os.listdir(fake_video_dir) if f.endswith(".mp4")]

    print(f"[INFO] Found {len(real_videos)} real videos and {len(fake_videos)} fake videos in archive.")

    # Extract ~10 frames per real video
    real_extracted = 0
    print("[INFO] Extracting frames from real videos...")
    for i, vpath in enumerate(real_videos, 1):
        real_extracted += extract_frames(vpath, train_real_out, "dfd_real", max_frames=10)
        if i % 50 == 0 or i == len(real_videos):
            print(f"       Real: {i}/{len(real_videos)} videos processed ({real_extracted} frames extracted)")

    # Extract ~2 frames per fake video (from first 1800 to balance)
    fake_extracted = 0
    fake_target_videos = fake_videos[:1800]
    print(f"[INFO] Extracting frames from {len(fake_target_videos)} fake videos...")
    for i, vpath in enumerate(fake_target_videos, 1):
        fake_extracted += extract_frames(vpath, train_fake_out, "dfd_fake", max_frames=2)
        if i % 200 == 0 or i == len(fake_target_videos):
            print(f"       Fake: {i}/{len(fake_target_videos)} videos processed ({fake_extracted} frames extracted)")

    print(f"\n[SUCCESS] Extraction finished!")
    print(f"          Real frames added : {real_extracted}")
    print(f"          Fake frames added : {fake_extracted}")

if __name__ == "__main__":
    main()
