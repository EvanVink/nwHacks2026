import { useState, useEffect, useRef, useCallback } from 'react';
import { Emotion, EmotionDetection } from '../types';
import faceDetectionService from '../services/faceDetection';
import audioEngine from '../services/audioEngine';
import apiClient from '../services/apiClient';
import { DETECTION_INTERVAL, CONFIDENCE_THRESHOLD } from '../utils/constants';
import { smoothConfidence } from '../utils/emotionMapper';

export function useEmotionDetection(videoRef: React.RefObject<HTMLVideoElement | null>, enabled: boolean) {
    const [currentEmotion, setCurrentEmotion] = useState<Emotion | null>(null);
    const [confidence, setConfidence] = useState(0);
    const [isDetecting, setIsDetecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastDetectionRef = useRef<number>(0);
    const smoothConfidenceRef = useRef<number>(0);

    // Initialize face detection models
    useEffect(() => {
        const initModels = async () => {
            try {
                await faceDetectionService.loadModels();
                setIsDetecting(true);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load models');
            }
        };

        initModels();
    }, []);

    // Emotion detection loop
    useEffect(() => {
        if (!enabled || !videoRef.current || !isDetecting) return;

        const detectEmotion = async () => {
            try {
                const result = await faceDetectionService.detectSingleFace(videoRef.current!);

                if (result && result.confidence >= CONFIDENCE_THRESHOLD) {
                    const now = Date.now();
                    lastDetectionRef.current = now;

                    // Smooth confidence transitions
                    smoothConfidenceRef.current = smoothConfidence(
                        smoothConfidenceRef.current,
                        result.confidence,
                        0.3
                    );

                    setCurrentEmotion(result.emotion);
                    setConfidence(smoothConfidenceRef.current);

                    // Play audio if enabled
                    if (audioEnabled) {
                        // Initialize audio engine if not already done
                        if (!audioEngine.isInitialized()) {
                            try {
                                await audioEngine.initialize();
                            } catch (err) {
                                console.error('Failed to initialize audio:', err);
                            }
                        }

                        if (audioEngine.isInitialized()) {
                            await audioEngine.playEmotion(result.emotion, smoothConfidenceRef.current);
                        }
                    }

                    // Log emotion event (debounced)
                    if (now - lastDetectionRef.current > 5000) {
                        // Log every 5 seconds
                        apiClient.logEmotionEvent(result.emotion, smoothConfidenceRef.current).catch(err => {
                            console.error('Failed to log emotion:', err);
                        });
                    }
                } else {
                    setConfidence(0);
                    setCurrentEmotion(null);
                    if (audioEngine.isInitialized()) {
                        audioEngine.stop();
                    }
                }
            } catch (err) {
                console.error('Detection error:', err);
            }
        };

        detectionIntervalRef.current = setInterval(detectEmotion, DETECTION_INTERVAL);

        return () => {
            if (detectionIntervalRef.current) {
                clearInterval(detectionIntervalRef.current);
            }
        };
    }, [enabled, isDetecting, audioEnabled, videoRef]);

    const toggleAudio = useCallback(() => {
        setAudioEnabled(prev => {
            const newState = !prev;
            if (!newState) {
                audioEngine.stop();
            }
            return newState;
        });
    }, []);

    return {
        currentEmotion,
        confidence,
        isDetecting,
        error,
        audioEnabled,
        toggleAudio,
    };
}
