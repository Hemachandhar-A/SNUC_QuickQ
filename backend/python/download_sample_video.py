"""
Download a short sample video into this folder so YOLO has something to run on.
Uses a small, public-domain style sample (e.g. from sample-videos.com).
"""
import os
import sys
import urllib.request

# Small sample to test the pipeline (backend + YOLO). Replace with your own
# .mp4 that contains people for real person detection; this one may have 0 persons.
SAMPLE_URL = "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4"
OUTPUT_NAME = "sample.mp4"
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_PATH = os.path.join(SCRIPT_DIR, OUTPUT_NAME)


def main():
    if os.path.isfile(OUTPUT_PATH):
        print(f"Video already exists: {OUTPUT_PATH}")
        print("Delete it or use a different file to re-download.")
        return 0
    print(f"Downloading sample video to {OUTPUT_PATH} ...")
    try:
        urllib.request.urlretrieve(SAMPLE_URL, OUTPUT_PATH)
        print("Done. Restart the Node backend to run YOLO on this video.")
        return 0
    except Exception as e:
        print(f"Download failed: {e}", file=sys.stderr)
        print("Add any .mp4 file with people to this folder manually.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
