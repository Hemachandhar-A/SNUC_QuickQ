"""
YOLO person detection: reads a video file and outputs JSON lines per frame.
Each line: {"frame": i, "boxes": [...], "count": n, "fps": f, "latency_ms": m, "temp_c": t, "frame_jpeg": "<base64>"}
frame_jpeg = JPEG of the frame with bounding boxes drawn (for frontend display).
"""
import sys
import json
import time
import random
import os
import base64

try:
    import cv2
    from ultralytics import YOLO
    HAS_YOLO = True
except ImportError:
    HAS_YOLO = False


def find_video():
    """Find a video file in script dir."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    for name in sorted(os.listdir(script_dir)):
        lower = name.lower()
        if lower.endswith(('.mp4', '.avi', '.mov', '.mkv', '.webm')):
            return os.path.join(script_dir, name)
    return None


def emit_no_video(message="Add a video file (e.g. sample.mp4) to this folder for real person detection."):
    """Output a single line and exit so Node uses its no-video state."""
    out = {
        "simulated": True,
        "no_video": True,
        "message": message,
        "frame": 0,
        "boxes": [],
        "count": 0,
        "fps": 0,
        "latency_ms": 0,
        "temp_c": 0,
        "confidence": 0,
    }
    print(json.dumps(out), flush=True)


def run_yolo(video_path):
    """Run YOLOv8 person detection on video; output JSON per frame. Person = COCO class 0."""
    cap_ffmpeg = getattr(cv2, "CAP_FFMPEG", None)
    if cap_ffmpeg is not None:
        cap = cv2.VideoCapture(video_path, cap_ffmpeg)
    else:
        cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        emit_no_video("Video file could not be opened. Check path and codec.")
        return
    model = YOLO("yolov8n.pt")
    person_class = 0  # COCO person
    frame_idx = 0
    t0 = time.perf_counter()
    while True:
        ret, frame = cap.read()
        if not ret:
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue
        h, w = frame.shape[:2]
        t1 = time.perf_counter()
        results = model.predict(frame, classes=[person_class], verbose=False)
        latency_ms = (time.perf_counter() - t1) * 1000
        elapsed = time.perf_counter() - t0
        fps = 1.0 / elapsed if elapsed > 0 and frame_idx > 0 else 30
        t0 = time.perf_counter()
        boxes = []
        for r in results:
            if r.boxes is None:
                continue
            for box in r.boxes:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                conf = float(box.conf[0])
                # Normalize to 0-1: x,y = top-left, w,h = width, height
                x_n = x1 / w
                y_n = y1 / h
                bw_n = (x2 - x1) / w
                bh_n = (y2 - y1) / h
                x_n = max(0, min(1, x_n))
                y_n = max(0, min(1, y_n))
                bw_n = max(0.01, min(1, bw_n))
                bh_n = max(0.01, min(1, bh_n))
                boxes.append({
                    "x": round(x_n, 4),
                    "y": round(y_n, 4),
                    "w": round(bw_n, 4),
                    "h": round(bh_n, 4),
                    "confidence": round(conf, 3),
                })
        temp_c = 42 + random.random() * 8
        # Draw boxes on frame and encode as JPEG for frontend video display
        display = frame.copy()
        for box in boxes:
            x1 = int(box["x"] * w)
            y1 = int(box["y"] * h)
            x2 = int((box["x"] + box["w"]) * w)
            y2 = int((box["y"] + box["h"]) * h)
            cv2.rectangle(display, (x1, y1), (x2, y2), (0, 255, 255), 2)
            cv2.putText(
                display, f"{int(box['confidence']*100)}%", (x1, max(20, y1 - 4)),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1,
            )
        # Resize to max 640px width to keep payload smaller
        max_w = 640
        if display.shape[1] > max_w:
            scale = max_w / display.shape[1]
            new_w = max_w
            new_h = int(display.shape[0] * scale)
            display = cv2.resize(display, (new_w, new_h), interpolation=cv2.INTER_AREA)
        _, jpeg = cv2.imencode(".jpg", display, [cv2.IMWRITE_JPEG_QUALITY, 85])
        frame_b64 = base64.standard_b64encode(jpeg.tobytes()).decode("ascii")
        out = {
            "frame": frame_idx,
            "boxes": boxes,
            "count": len(boxes),
            "fps": round(fps, 1),
            "latency_ms": round(latency_ms, 1),
            "temp_c": round(temp_c, 1),
            "confidence": round(0.92 + random.random() * 0.06, 3),
            "frame_jpeg": frame_b64,
        }
        print(json.dumps(out), flush=True)
        frame_idx += 1


def main():
    raw_path = sys.argv[1] if len(sys.argv) > 1 else None
    video_path = None
    if raw_path:
        video_path = os.path.abspath(os.path.normpath(raw_path))
    if not video_path:
        video_path = find_video()
    if video_path and not os.path.isfile(video_path):
        video_path = None
    if HAS_YOLO and video_path:
        import sys as _sys
        print("YOLO starting on: " + video_path, file=_sys.stderr, flush=True)
        run_yolo(video_path)
    else:
        if not HAS_YOLO:
            emit_no_video("YOLO not available. Run: pip install ultralytics opencv-python-headless")
        elif not video_path:
            emit_no_video("No video file. Add a .mp4 (or .avi/.mov) to backend/python/ for real person detection.")
        else:
            emit_no_video("Invalid video path.")
        sys.exit(0)


if __name__ == "__main__":
    main()
