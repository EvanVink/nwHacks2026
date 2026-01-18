import { useState, useEffect, useRef, useCallback } from 'react';

export function useCamera() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [isActive, setIsActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);

    const startCamera = useCallback(async () => {
        try {
            setError(null);

            // Check browser support
            const constraints = { video: { facingMode: 'user' }, audio: false };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            setHasPermission(true);
            setIsActive(true);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to access camera';

            if (message.includes('NotAllowedError') || message.includes('Permission denied')) {
                setHasPermission(false);
            }

            setError(message);
            setIsActive(false);
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setIsActive(false);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, [stopCamera]);

    return {
        videoRef,
        isActive,
        error,
        hasPermission,
        startCamera,
        stopCamera,
    };
}
