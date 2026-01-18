import * as Tone from 'tone';
import { Emotion } from '../types';
import { EMOTION_FREQUENCIES } from '../utils/emotionMapper';

class EmotionSynth {
    private synth: Tone.PolySynth<Tone.Synth> | null = null;
    private _isInitialized = false;
    private currentEmotion: Emotion | null = null;
    private currentOscillator: Tone.Oscillator | null = null;
    private currentGain: Tone.Gain | null = null;

    constructor() {
        // Will initialize on first use
    }

    async initialize(): Promise<void> {
        if (this._isInitialized) return;

        // Initialize Tone.js context
        await Tone.start();

        // Create synth
        this.synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'triangle' },
            envelope: {
                attack: 0.005,
                decay: 0.1,
                sustain: 0.3,
                release: 0.5,
            },
        }).toDestination();

        this._isInitialized = true;
    }

    async playEmotion(emotion: Emotion, confidence: number): Promise<void> {
        if (!this._isInitialized) {
            await this.initialize();
        }

        // Don't play if already playing same emotion
        if (this.currentEmotion === emotion) {
            return;
        }

        // Stop current sound
        if (this.currentOscillator) {
            this.currentOscillator.stop();
        }

        this.currentEmotion = emotion;
        const frequency = EMOTION_FREQUENCIES[emotion];
        const velocity = Math.max(0.1, Math.min(1, confidence));

        // Play based on emotion type
        switch (emotion) {
            case 'happy':
                this.playHappy(frequency, velocity);
                break;
            case 'sad':
                this.playSad(frequency, velocity);
                break;
            case 'angry':
                this.playAngry(frequency, velocity);
                break;
            case 'neutral':
                this.playNeutral(frequency, velocity);
                break;
        }
    }

    private playHappy(frequency: number, velocity: number): void {
        if (!this.synth) return;
        // Bright, ascending arpeggio, major chord
        const now = Tone.now();
        this.synth.triggerAttackRelease('C4', '8n', now, velocity);
        this.synth.triggerAttackRelease('E4', '8n', now + 0.1, velocity * 0.8);
        this.synth.triggerAttackRelease('G4', '8n', now + 0.2, velocity * 0.6);
    }

    private playSad(frequency: number, velocity: number): void {
        if (!this.synth) return;
        // Deep, descending tone, minor chords
        const now = Tone.now();
        this.synth.triggerAttackRelease(frequency, '4n', now, velocity);
        this.synth.triggerAttackRelease(frequency * 0.89, '8n', now + 0.3, velocity * 0.7);
    }

    private playAngry(frequency: number, velocity: number): void {
        if (!this.synth) return;
        // Sharp, staccato, dissonant intervals
        const now = Tone.now();
        this.synth.triggerAttackRelease(frequency, '16n', now, velocity);
        this.synth.triggerAttackRelease(frequency * 1.1, '16n', now + 0.05, velocity * 0.9);
        this.synth.triggerAttackRelease(frequency, '16n', now + 0.1, velocity);
    }

    private playNeutral(frequency: number, velocity: number): void {
        if (!this.synth) return;
        // Pure sine wave, steady tone
        const now = Tone.now();
        this.synth.triggerAttackRelease(frequency, '2n', now, velocity * 0.5);
    }

    setVolume(level: number): void {
        if (this.synth && this.synth.volume) {
            // Convert 0-1 to dB scale (-40 to 0)
            const db = (level - 1) * 40;
            this.synth.volume.value = db;
        }
    }

    stop(): void {
        if (this.synth) {
            this.synth.triggerRelease([]);
        }
        this.currentEmotion = null;
    }

    isInitialized(): boolean {
        return this._isInitialized;
    }

    getCurrentEmotion(): Emotion | null {
        return this.currentEmotion;
    }
}

export default new EmotionSynth();
