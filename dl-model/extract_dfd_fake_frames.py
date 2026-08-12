import os
import cv2
from pathlib import Path

def extract_one_frame(video_path, output_dir, label_prefix):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return 0

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total_frames <= 0:
        cap.release()
        return 0

    target_frame = min(15, total_frames - 1)
    cap.set(cv2.CAP_PROP_POS_FRAMES, target_frame)
    ret, frame = cap.read()
    cap.release()

    if not ret or frame is None:
        return 0

    frame_resized = cv2.resize(frame, (256, 256))
    video_name = Path(video_path).stem
    out_name = f"{label_prefix}_{video_name}.jpg"
    out_path = os.path.join(output_dir, out_name)
    cv2.imwrite(out_path, frame_resized, [cv2.IMWRITE_JPEG_QUALITY, 95])
    return 1

def main():
    base_archive = r"C:\Users\Dheer\Downloads\archive"
    fake_video_dir = os.path.join(base_archive, "DFD_manipulated_sequences", "DFD_manipulated_sequences")
    train_fake_out = r"data\Train\Fake"
    os.makedirs(train_fake_out, exist_ok=True)

    fake_videos = [os.path.join(fake_video_dir, f) for f in os.listdir(fake_video_dir) if f.endswith(".mp4")]
    
    # We have 1828 real frames, let's extract 1828 fake frames
    target_count = 1828
    fake_target = fake_videos[:target_count]
    print(f"[INFO] Extracting 1 frame from each of {len(fake_target)} fake videos to balance the 1,828 real frames...")

    count = 0
    for i, vpath in enumerate(fake_target, 1):
        count += extract_one_frame(vpath, train_fake_out, "dfd_fake")
        if i % 300 == 0 or i == len(fake_target):
            print(f"       Fake: {i}/{len(fake_target)} processed ({count} frames saved)")

    print(f"\n[SUCCESS] Extracted {count} fake frames to match {target_count} real frames!")

if __name__ == "__main__":
    main()
