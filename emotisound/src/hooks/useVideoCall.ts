import { useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// const WEBSOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL || 'http://localhost:3002';
const WEBSOCKET_URL = 'wss://testnw.onrender.com/'

export function useVideoCall(videoRef: React.RefObject<HTMLVideoElement | null>) {
    const [isCallActive, setIsCallActive] = useState(false);
    const [peers, setPeers] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());

    const initializeWebSocket = useCallback(() => {
        socketRef.current = io(WEBSOCKET_URL, {
            transports: ['websocket'],
        });

        socketRef.current.on('connect', () => {
            console.log('WebSocket connected');
        });

        socketRef.current.on('peer-joined', (peerId: string) => {
            setPeers(prev => Array.from(new Set([...prev, peerId])));
        });

        socketRef.current.on('peer-left', (peerId: string) => {
            setPeers(prev => prev.filter(id => id !== peerId));
            const peerConn = peerConnectionsRef.current.get(peerId);
            if (peerConn) {
                peerConn.close();
                peerConnectionsRef.current.delete(peerId);
            }
        });

        socketRef.current.on('error', (err) => {
            setError(err.message || 'WebSocket error occurred');
        });
    }, []);

    const startCall = useCallback(async (roomId: string) => {
        try {
            setError(null);

            if (!socketRef.current) {
                initializeWebSocket();
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
                audio: true,
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            socketRef.current?.emit('join-room', { roomId });
            setIsCallActive(true);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to start call';
            setError(message);
        }
    }, [videoRef, initializeWebSocket]);

    const endCall = useCallback(() => {
        peerConnectionsRef.current.forEach(pc => pc.close());
        peerConnectionsRef.current.clear();

        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }

        socketRef.current?.emit('leave-room');
        socketRef.current?.disconnect();
        socketRef.current = null;
        setIsCallActive(false);
        setPeers([]);
    }, [videoRef]);

    return {
        isCallActive,
        peers,
        error,
        startCall,
        endCall,
        socketRef,
    };
}
