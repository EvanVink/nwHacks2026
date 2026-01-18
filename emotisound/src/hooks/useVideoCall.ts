import { useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const WEBSOCKET_URL = 'wss://testnw.onrender.com/';

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

export function useVideoCall(videoRef: React.RefObject<HTMLVideoElement | null>) {
    const [isCallActive, setIsCallActive] = useState(false);
    const [peers, setPeers] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [debugLogs, setDebugLogs] = useState<string[]>([]);
    const socketRef = useRef<Socket | null>(null);
    const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map());

    const addDebugLog = useCallback((message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        const logMessage = `[${timestamp}] ${message}`;
        console.log(logMessage);
        setDebugLogs(prev => [...prev.slice(-9), logMessage]); // Keep last 10 logs
    }, []);

    const createPeerConnection = useCallback((peerId: string) => {
        const peerConnection = new RTCPeerConnection({ iceServers: ICE_SERVERS.iceServers });

        // Add local stream tracks to peer connection
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStreamRef.current!);
            });
        }

        // Handle remote stream
        peerConnection.ontrack = (event) => {
            addDebugLog(`✅ Received remote track: ${event.track.kind} from ${peerId}`);
            console.log('Track event:', event);
            remoteStreamsRef.current.set(peerId, event.streams[0]);
            addDebugLog(`Stream stored for peer ${peerId}, total streams: ${remoteStreamsRef.current.size}`);
        };

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socketRef.current?.emit('ice-candidate', {
                    to: peerId,
                    candidate: event.candidate,
                });
            }
        };

        // Handle connection state changes
        peerConnection.onconnectionstatechange = () => {
            console.log(`Connection state with ${peerId}: ${peerConnection.connectionState}`);
            if (peerConnection.connectionState === 'failed' || peerConnection.connectionState === 'disconnected') {
                peerConnection.close();
                peerConnectionsRef.current.delete(peerId);
                setPeers(prev => prev.filter(id => id !== peerId));
            }
        };

        peerConnectionsRef.current.set(peerId, peerConnection);
        return peerConnection;
    }, []);

    const initializeWebSocket = useCallback(() => {
        addDebugLog('Initializing WebSocket...');
        socketRef.current = io(WEBSOCKET_URL, {
            transports: ['websocket'],
        });

        socketRef.current.on('connect', () => {
            addDebugLog('✅ WebSocket connected');
        });

        socketRef.current.on('peer-joined', async (peerId: string) => {
            addDebugLog(`👤 Peer joined: ${peerId}`);
            setPeers(prev => Array.from(new Set([...prev, peerId])));

            // Create peer connection and send offer
            addDebugLog(`Creating peer connection for ${peerId}`);
            const peerConnection = createPeerConnection(peerId);
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            addDebugLog(`Sending offer to ${peerId}`);

            socketRef.current?.emit('signal', {
                to: peerId,
                signal: offer,
            });
        });

        socketRef.current.on('signal', async (data: any) => {
            addDebugLog(`📡 Received signal: ${data.signal.type} from ${data.from}`);
            const { from, signal } = data;

            let peerConnection = peerConnectionsRef.current.get(from);
            if (!peerConnection) {
                addDebugLog(`No peer connection found, creating new one for ${from}`);
                peerConnection = createPeerConnection(from);
                setPeers(prev => Array.from(new Set([...prev, from])));
            }

            if (signal.type === 'offer') {
                addDebugLog(`Processing offer from ${from}`);
                await peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);
                addDebugLog(`Sending answer to ${from}`);

                socketRef.current?.emit('signal', {
                    to: from,
                    signal: answer,
                });
            } else if (signal.type === 'answer') {
                addDebugLog(`Processing answer from ${from}`);
                await peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
            }
        });

        socketRef.current.on('ice-candidate', async (data: any) => {
            addDebugLog(`🧊 Received ICE candidate from ${data.from}`);
            const { from, candidate } = data;
            const peerConnection = peerConnectionsRef.current.get(from);

            if (peerConnection) {
                try {
                    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (err) {
                    addDebugLog(`❌ Error adding ICE candidate: ${err}`);
                }
            }
        });

        socketRef.current.on('peer-left', (peerId: string) => {
            addDebugLog(`👋 Peer left: ${peerId}`);
            setPeers(prev => prev.filter(id => id !== peerId));
            const peerConn = peerConnectionsRef.current.get(peerId);
            if (peerConn) {
                peerConn.close();
                peerConnectionsRef.current.delete(peerId);
            }
        });

        socketRef.current.on('error', (err) => {
            addDebugLog(`❌ Socket error: ${err.message}`);
            setError(err.message || 'WebSocket error occurred');
        });
    }, [createPeerConnection, addDebugLog]);

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

            localStreamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            socketRef.current?.emit('join-room', { roomId });
            setIsCallActive(true);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to start call';
            console.error('Start call error:', message);
            setError(message);
        }
    }, [videoRef, initializeWebSocket]);

    const endCall = useCallback(() => {
        // Close all peer connections
        peerConnectionsRef.current.forEach(pc => pc.close());
        peerConnectionsRef.current.clear();

        // Stop local stream
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }

        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }

        // Clean up remote streams
        remoteStreamsRef.current.clear();

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
        debugLogs,
        startCall,
        endCall,
        remoteStreamsRef,
    };
}
