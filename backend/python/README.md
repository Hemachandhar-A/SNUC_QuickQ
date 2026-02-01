# Queue detection (YOLO person detection)

The queue monitor uses **YOLOv8** to detect persons in a video and stream bounding boxes to the dashboard.

## No video = no random detection

- If there is **no video file** in this folder, the backend sends a **no-video** state: **no random boxes**, count 0, and a clear message in the UI.
- Detection is **only real** when a video file is present and the backend has started the Python script.

## Enable real person detection

1. **Install Python deps** (once):
   ```bash
   pip install -r requirements.txt
   ```
   This installs `ultralytics` (YOLOv8) and `opencv-python-headless`. The first run will download the `yolov8n.pt` model.

2. **Add a video file** into this folder (`backend/python/`):
   - Supported: `.mp4`, `.avi`, `.mov`, `.mkv`, `.webm`
   - Any filename (e.g. `sample.mp4`, `crowd.mp4`)

3. **Restart the Node backend** so it picks up the video and starts the YOLO process.

The backend will:
- Look for a video in `backend/python/`
- Start `yolo_detect.py <video_path>` and stream JSON per frame
- Emit real bounding boxes and counts over Socket.IO

## Optional: download a sample video

To test real detection without your own file:

```bash
python download_sample_video.py
```

This downloads a short sample into this folder. Then restart the backend.
