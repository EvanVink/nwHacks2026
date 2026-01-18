import React, { useState, useEffect } from 'react';
import { LogOut, Home, BarChart3, Phone } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useCamera } from './hooks/useCamera';
import { useEmotionDetection } from './hooks/useEmotionDetection';
import { useVideoCall } from './hooks/useVideoCall';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import { VideoPreview } from './components/Camera/VideoPreview';
import { EmotionDisplay } from './components/UI/EmotionDisplay';
import { AudioControls } from './components/Audio/AudioControls';
import { Analytics } from './components/Analytics/Dashboard';
import { VideoCallWindow } from './components/VideoCall/VideoCallWindow';
import audioEngine from './services/audioEngine';

type View = 'login' | 'register' | 'app';

function App() {
  const { user, loading: authLoading, login, register, logout, isAuthenticated } = useAuth();
  const { videoRef, isActive, error: cameraError, hasPermission, startCamera, stopCamera } = useCamera();
  const [view, setView] = useState<View>('login');
  const [currentPage, setCurrentPage] = useState<'home' | 'analytics' | 'videocall'>('home');
  const [volume, setVolume] = useState(0.5);
  const [sensitivity, setSensitivity] = useState(0.7);

  // Video call hook
  const videoCallRef = React.useRef<HTMLVideoElement>(null);
  const { isCallActive, peers, error: callError, debugLogs, startCall, endCall, remoteStreamsRef, remoteStreamsVersion } = useVideoCall(videoCallRef);

  // Emotion detection hook - use appropriate video ref based on current page
  const activeVideoRef = currentPage === 'videocall' ? videoCallRef : videoRef;
  const shouldDetectEmotion = currentPage === 'videocall' ? isCallActive : isActive;
  const { currentEmotion, confidence, audioEnabled, toggleAudio, error: detectionError } = useEmotionDetection(
    activeVideoRef,
    shouldDetectEmotion
  );

  // Initialize audio engine on app load
  useEffect(() => {
    const initAudio = async () => {
      try {
        await audioEngine.initialize();
        audioEngine.setVolume(volume);
      } catch (err) {
        console.error('Failed to initialize audio:', err);
      }
    };
    initAudio();
  }, []);

  // Update audio volume when slider changes
  useEffect(() => {
    if (audioEngine.isInitialized && audioEngine.isInitialized()) {
      audioEngine.setVolume(volume);
    }
  }, [volume]);

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    setView('app');
  };

  const handleRegister = async (email: string, password: string) => {
    await register(email, password);
    setView('app');
  };

  const handleLogout = async () => {
    if (isActive) {
      stopCamera();
    }
    if (isCallActive) {
      endCall();
    }
    await logout();
    setView('login');
    setCurrentPage('home');
  };

  // Auth screens
  if (!isAuthenticated && authLoading === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
              🎵 EmotiSound
            </h1>
            <p className="text-gray-600 mt-2">Translate emotions into sound</p>
          </div>

          {view === 'login' ? (
            <>
              <Login onLogin={handleLogin} />
              <p className="text-center text-sm text-gray-600 mt-6">
                Don't have an account?{' '}
                <button
                  onClick={() => setView('register')}
                  className="text-blue-500 hover:text-blue-600 font-medium"
                >
                  Sign up
                </button>
              </p>
            </>
          ) : (
            <>
              <Register onRegister={handleRegister} />
              <p className="text-center text-sm text-gray-600 mt-6">
                Already have an account?{' '}
                <button
                  onClick={() => setView('login')}
                  className="text-blue-500 hover:text-blue-600 font-medium"
                >
                  Log in
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  // Main app
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              🎵 EmotiSound
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentPage('home')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${currentPage === 'home'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
                aria-label="Home"
              >
                <Home size={20} />
                <span className="hidden sm:inline">Home</span>
              </button>
              <button
                onClick={() => setCurrentPage('videocall')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${currentPage === 'videocall'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
                aria-label="Video Call"
              >
                <Phone size={20} />
                <span className="hidden sm:inline">Video Call</span>
              </button>
              <button
                onClick={() => setCurrentPage('analytics')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${currentPage === 'analytics'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
                aria-label="Analytics"
              >
                <BarChart3 size={20} />
                <span className="hidden sm:inline">Analytics</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                aria-label="Logout"
              >
                <LogOut size={20} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          {currentPage === 'home' ? (
            <div className="grid md:grid-cols-3 gap-8">
              {/* Video and controls */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Camera</h2>
                  <VideoPreview
                    videoRef={videoRef}
                    isActive={isActive}
                    onStart={startCamera}
                    onStop={stopCamera}
                    error={cameraError}
                    hasPermission={hasPermission}
                  />
                </div>

                {/* Controls */}
                <div className="bg-white rounded-lg shadow p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Audio</h3>
                    <AudioControls
                      volume={volume}
                      onVolumeChange={setVolume}
                      isMuted={!audioEnabled}
                      onMuteToggle={toggleAudio}
                      disabled={!isActive}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Sensitivity</h3>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={sensitivity * 100}
                        onChange={e => setSensitivity(parseFloat(e.target.value) / 100)}
                        disabled={!isActive}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                        aria-label="Detection sensitivity"
                      />
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {Math.round(sensitivity * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emotion display */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Emotion Detection</h2>
                <EmotionDisplay emotion={currentEmotion} confidence={confidence} />
              </div>
            </div>
          ) : currentPage === 'videocall' ? (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Video Call with Emotion Detection</h2>
              <VideoCallWindow
                isActive={isCallActive}
                peers={peers}
                onStart={startCall}
                onEnd={endCall}
                videoRef={videoCallRef}
                remoteStreamsRef={remoteStreamsRef}
                remoteStreamsVersion={remoteStreamsVersion}
                debugLogs={debugLogs}
                error={callError}
              />
              {isCallActive && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Emotion Detection (Video Call)</h3>
                  <EmotionDisplay emotion={currentEmotion} confidence={confidence} />
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Analytics</h2>
              <Analytics />
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-12 py-6">
          <div className="max-w-6xl mx-auto px-4 text-center text-gray-600 text-sm">
            <p>
              EmotiSound - Privacy-first accessibility tool. Your facial data is never stored.{' '}
              <a href="#privacy" className="text-blue-500 hover:text-blue-600">
                Privacy Policy
              </a>
            </p>
          </div>
        </footer>
      </div>
    );
  }

  // Loading state
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
        <p className="text-gray-600">Loading EmotiSound...</p>
      </div>
    </div>
  );
}

export default App;
