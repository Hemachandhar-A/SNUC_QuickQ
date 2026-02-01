/**
 * Detection service: emits DETECTION_UPDATE with bounding boxes, FPS, latency, temp.
 * Uses Python YOLO only when a video file exists in backend/python/; otherwise
 * emits "no video" state (no random boxes).
 */

import { eventBus, EVENTS } from './eventBus.js';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Resolve absolute paths: from this file (backend/src/services) -> backend/python
const pythonDirFromScript = path.resolve(__dirname, '../../python');
// Fallbacks: npm run dev from backend/ -> backend/python; or from repo root -> backend/python
const cwd = process.cwd();
const pythonDirFromCwd = path.resolve(cwd, 'python');
const pythonDirFromCwdBackend = path.resolve(cwd, 'backend', 'python');
const scriptName = 'yolo_detect.py';

let detectionInterval;
let pythonProcess = null;
/** When Python exits with no_video, we keep showing this message in the interval instead of generic text. */
let lastNoVideoMessage = null;

const VIDEO_EXTENSIONS = ['.mp4', '.avi', '.mov', '.mkv', '.webm'];

function findVideoInDir(dir) {
  if (!dir || !fs.existsSync(dir)) return null;
  try {
    const names = fs.readdirSync(dir);
    for (const name of names) {
      const ext = path.extname(name).toLowerCase();
      if (VIDEO_EXTENSIONS.includes(ext)) return path.join(dir, name);
    }
  } catch (_) {}
  return null;
}

function getPythonDirAndVideo() {
  const candidates = [
    pythonDirFromScript,
    pythonDirFromCwd,
    pythonDirFromCwdBackend,
  ].filter((d, i, arr) => arr.indexOf(d) === i);
  for (const dir of candidates) {
    const scriptPath = path.join(dir, scriptName);
    if (fs.existsSync(scriptPath)) {
      const videoPath = findVideoInDir(dir);
      return { dir, scriptPath, videoPath };
    }
  }
  return { dir: pythonDirFromScript, scriptPath: path.join(pythonDirFromScript, scriptName), videoPath: null };
}

/** Emit "no video" state: no random boxes, clear message for UI. */
function emitNoVideoState() {
  const message =
    lastNoVideoMessage ||
    'Add a video file (e.g. sample.mp4) to backend/python/ for real person detection.';
  eventBus.emit(EVENTS.DETECTION_UPDATE, {
    source: 'simulated',
    noVideo: true,
    count: 0,
    boxes: [],
    fps: 0,
    latencyMs: 0,
    tempC: 0,
    confidence: 0,
    message,
    timestamp: new Date().toISOString(),
  });
}

function startSimulatedInterval() {
  if (detectionInterval) return;
  detectionInterval = setInterval(emitNoVideoState, 2000);
  emitNoVideoState();
}

function stopSimulatedInterval() {
  if (detectionInterval) {
    clearInterval(detectionInterval);
    detectionInterval = null;
  }
}

function tryStartPython(scriptPath, videoPath, pythonDir) {
  if (!fs.existsSync(scriptPath) || !videoPath) return Promise.resolve(false);
  lastNoVideoMessage = null;
  const pyCmd = process.platform === 'win32' ? 'python' : 'python3';
  return new Promise((resolve) => {
    const stderrChunks = [];
    const py = spawn(pyCmd, [scriptPath, videoPath], {
      cwd: pythonDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: process.platform === 'win32', // so 'python' is resolved in PATH on Windows
    });
    let buffer = '';
    py.stdout.on('data', (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const data = JSON.parse(line);
          if (data.simulated || data.no_video) {
            lastNoVideoMessage = data.message || 'No video or YOLO not available.';
            console.warn('[Detection] Python reported no video:', lastNoVideoMessage);
            eventBus.emit(EVENTS.DETECTION_UPDATE, {
              source: 'simulated',
              noVideo: true,
              count: 0,
              boxes: [],
              message: lastNoVideoMessage,
              timestamp: new Date().toISOString(),
            });
            continue;
          }
          lastNoVideoMessage = null; // YOLO is working
          eventBus.emit(EVENTS.DETECTION_UPDATE, {
            source: 'yolo',
            noVideo: false,
            count: data.count ?? (data.boxes?.length ?? 0),
            boxes: (data.boxes ?? []).map((b) => ({
              x: b.x ?? b[0],
              y: b.y ?? b[1],
              w: b.w ?? b[2],
              h: b.h ?? b[3],
              confidence: b.confidence ?? 0.95,
            })),
            fps: data.fps ?? 30,
            latencyMs: data.latency_ms ?? 25,
            tempC: data.temp_c ?? 45,
            confidence: data.confidence ?? 0.95,
            frameJpeg: data.frame_jpeg ?? null,
            timestamp: new Date().toISOString(),
          });
        } catch (_) {}
      }
    });
    py.stderr.on('data', (d) => {
      stderrChunks.push(d);
      process.stderr.write(d);
    });
    py.on('error', (err) => {
      lastNoVideoMessage = `Python not started: ${err.message}`;
      console.warn('[Detection] Python spawn error:', err.message);
      resolve(false);
    });
    py.on('exit', (code) => {
      pythonProcess = null;
      const stderrText = Buffer.concat(stderrChunks).toString().trim();
      if (code !== 0 && code != null) {
        console.warn('[Detection] Python exited with code', code);
        if (stderrText) console.warn('[Detection] Python stderr:', stderrText.slice(0, 500));
      }
      if (!lastNoVideoMessage && stderrText) {
        lastNoVideoMessage = stderrText.slice(0, 120) + (stderrText.length > 120 ? '...' : '');
      }
      startSimulatedInterval();
    });
    pythonProcess = py;
    stopSimulatedInterval();
    resolve(true);
  });
}

export function startDetectionService() {
  const { dir: pythonDir, scriptPath, videoPath } = getPythonDirAndVideo();
  if (videoPath) {
    console.log('[Detection] Found video:', videoPath);
    tryStartPython(scriptPath, videoPath, pythonDir).then((started) => {
      if (!started) {
        console.warn('[Detection] Could not start Python; using no-video state.');
        startSimulatedInterval();
      }
    });
  } else {
    console.log('[Detection] No video in', pythonDir, '(or script not found); using no-video state.');
    startSimulatedInterval();
  }
}

export function stopDetectionService() {
  stopSimulatedInterval();
  if (pythonProcess) pythonProcess.kill();
  pythonProcess = null;
}
