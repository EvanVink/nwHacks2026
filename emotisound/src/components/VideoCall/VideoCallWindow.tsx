import React, { useState } from 'react';
import { Phone, PhoneOff } from 'lucide-react';

interface VideoCallWindowProps {
    isActive: boolean;
    peers: string[];
    onStart: (roomId: string) => Promise<void>;
    onEnd: () => void;
    videoRef: React.RefObject<HTMLVideoElement | null>;
    error?: string | null;
}

export const VideoCallWindow: React.FC<VideoCallWindowProps> = ({
    isActive,
    peers,
    onStart,
    onEnd,
    videoRef,
    error,
}) => {
    const [inputRoomId, setInputRoomId] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleStartCall = async () => {
        if (!inputRoomId.trim()) {
            return;
        }
        setIsLoading(true);
        try {
            await onStart(inputRoomId);
        } finally {
            setIsLoading(false);
        }
    };

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium">Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="bg-black rounded-lg overflow-hidden aspect-video">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                />
            </div>

            {!isActive ? (
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputRoomId}
                        onChange={(e) => setInputRoomId(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleStartCall()}
                        placeholder="Enter room ID"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleStartCall}
                        disabled={isLoading || !inputRoomId.trim()}
                        className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                    >
                        <Phone size={20} />
                        {isLoading ? 'Connecting...' : 'Start Call'}
                    </button>
                </div>
            ) : (
                <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
                    <div>
                        <p className="text-gray-700 font-medium">Call Active</p>
                        <p className="text-sm text-gray-600">Connected peers: {peers.length}</p>
                    </div>
                    <button
                        onClick={onEnd}
                        className="flex items-center gap-2 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                        <PhoneOff size={20} />
                        End Call
                    </button>
                </div>
            )}
        </div>
    );
};
