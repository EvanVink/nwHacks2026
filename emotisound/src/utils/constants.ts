// API endpoint - modify based on your deployment
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Model URLs for face-api.js
export const MODEL_URL = '/models';

// Face detection settings
export const FACE_DETECTION_OPTIONS = {
    inputSize: 416,
    scoreThreshold: 0.5,
};

// Audio settings
export const AUDIO_SETTINGS = {
    defaultVolume: 0.5,
    maxVolume: 1.0,
    minVolume: 0.0,
    defaultSensitivity: 0.7,
};

// Detection loop settings
export const DETECTION_FPS = 30;
export const DETECTION_INTERVAL = 1000 / DETECTION_FPS;

// Emotion confidence threshold
export const CONFIDENCE_THRESHOLD = 0.2;
