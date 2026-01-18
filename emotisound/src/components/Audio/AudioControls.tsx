import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface AudioControlsProps {
    volume: number;
    onVolumeChange: (volume: number) => void;
    isMuted: boolean;
    onMuteToggle: () => void;
    disabled?: boolean;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
    volume,
    onVolumeChange,
    isMuted,
    onMuteToggle,
    disabled = false,
}) => {
    return (
        <div className="flex items-center gap-4">
            <button
                onClick={onMuteToggle}
                disabled={disabled}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition"
                aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
            >
                {isMuted ? (
                    <VolumeX size={24} className="text-red-500" />
                ) : (
                    <Volume2 size={24} className="text-blue-500" />
                )}
            </button>

            <div className="flex-1">
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume * 100}
                    onChange={e => onVolumeChange(parseFloat(e.target.value) / 100)}
                    disabled={disabled}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                    aria-label="Volume level"
                />
            </div>

            <span className="text-sm text-gray-600 w-12 text-right">
                {Math.round(volume * 100)}%
            </span>
        </div>
    );
};
