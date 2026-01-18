import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff } from 'lucide-react';

interface VideoCallWindowProps {
    isActive: boolean;
    peers: string[];
    onStart: (roomId: string) => Promise<void>;
    onEnd: () => void;
    videoRef: React.RefObject<HTMLVideoElement | null>;
    remoteStreamsRef?: React.MutableRefObject<Map<string, MediaStream>>;
    debugLogs?: string[];
    error?: string | null;
}

export const VideoCallWindow: React.FC<VideoCallWindowProps> = ({
    isActive,
    peers,
    onStart,
    onEnd,
    videoRef,
    remoteStreamsRef,
    debugLogs,
    error,
}) => {
    const [inputRoomId, setInputRoomId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const remoteVideoRef = React.useRef<HTMLVideoElement>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        if (remoteStreamsRef && remoteStreamsRef.current.size > 0) {
            const firstStream = remoteStreamsRef.current.values().next().value;
            if (firstStream) {
                setRemoteStream(firstStream);
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = firstStream;
                }
            }
        }
    }, [peers, remoteStreamsRef]);

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
            {isActive && peers.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                    {/* Local video */}
                    <div>
                        <p className="text-sm text-gray-600 mb-2">You</p>
                        <div className="bg-black rounded-lg overflow-hidden aspect-video">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Remote video */}
                    <div>
                        <p className="text-sm text-gray-600 mb-2">Caller</p>
                        <div className="bg-black rounded-lg overflow-hidden aspect-video">
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-black rounded-lg overflow-hidden aspect-video">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

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

            {/* Debug logs */}
            <div className="bg-gray-900 text-gray-100 rounded-lg p-4 text-xs font-mono max-h-48 overflow-y-auto">
                <p className="text-gray-400 mb-2">📊 Debug Logs:</p>
                {debugLogs && debugLogs.length > 0 ? (
                    <div className="space-y-1">
                        {debugLogs.map((log, idx) => (
                            <div key={idx} className="text-gray-300">
                                {log}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No logs yet...</p>
                )}
            </div>
        </div>
    );
};
