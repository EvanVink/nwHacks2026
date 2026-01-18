import React from 'react';
import { Camera, CameraOff, AlertCircle } from 'lucide-react';

interface VideoPreviewProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    isActive: boolean;
    onStart: () => void;
    onStop: () => void;
    error?: string | null;
    hasPermission?: boolean | null;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({
    videoRef,
    isActive,
    onStart,
    onStop,
    error,
    hasPermission,
}) => {
    return (
        <div className="flex flex-col gap-4">
            <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    aria-label="Camera video feed"
                />

                {!isActive && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <CameraOff size={64} className="text-white opacity-50" />
                    </div>
                )}

                {isActive && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        Camera Active
                    </div>
                )}
            </div>

            {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                    <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="font-medium">Camera Error</p>
                        <p>{error}</p>
                        {hasPermission === false && (
                            <p className="mt-2 text-xs">
                                Please enable camera permissions in your browser settings and reload the page.
                            </p>
                        )}
                    </div>
                </div>
            )}

            <button
                onClick={isActive ? onStop : onStart}
                className={`w-full py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${isActive
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                aria-label={isActive ? 'Stop camera' : 'Start camera'}
            >
                {isActive ? (
                    <>
                        <CameraOff size={20} />
                        Stop Camera
                    </>
                ) : (
                    <>
                        <Camera size={20} />
                        Start Camera
                    </>
                )}
            </button>
        </div>
    );
};
