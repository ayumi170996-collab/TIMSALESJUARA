/**
 * Audio processing utilities for Gemini Live API and TTS
 */

/**
 * Converts Float32Array PCM samples (-1.0 to 1.0) into base64 encoded 16-bit linear PCM (little-endian)
 */
export function float32ToInt16Base64(inputData: Float32Array): string {
  const buffer = new ArrayBuffer(inputData.length * 2);
  const view = new DataView(buffer);
  let offset = 0;

  for (let i = 0; i < inputData.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, inputData[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Decodes base64 string into Float32Array PCM buffer (assuming 16-bit signed PCM little-endian)
 */
export function base64ToFloat32Array(base64: string): Float32Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const int16Array = new Int16Array(bytes.buffer);
  const float32Array = new Float32Array(int16Array.length);

  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / 32768.0;
  }

  return float32Array;
}

/**
 * Calculates Root Mean Square (RMS) volume level between 0.0 and 1.0
 */
export function calculateRMS(data: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i] * data[i];
  }
  const rms = Math.sqrt(sum / data.length);
  // Scale dynamically for voice sensitivity
  return Math.min(1, rms * 4.5);
}

/**
 * Audio Queue Manager for jitter-free gapless playback of 24kHz PCM chunks
 */
export class LiveAudioPlayer {
  private audioCtx: AudioContext | null = null;
  private nextStartTime: number = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  private onLevelUpdate?: (level: number) => void;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;

  constructor(onLevelUpdate?: (level: number) => void) {
    this.onLevelUpdate = onLevelUpdate;
  }

  private initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass({ sampleRate: 24000 });
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.connect(this.audioCtx.destination);
      this.startLevelMonitoring();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  private startLevelMonitoring() {
    if (!this.analyser || !this.onLevelUpdate) return;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const checkLevel = () => {
      if (this.analyser && this.onLevelUpdate) {
        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length / 255;
        this.onLevelUpdate(avg);
      }
      this.animFrameId = requestAnimationFrame(checkLevel);
    };

    this.animFrameId = requestAnimationFrame(checkLevel);
  }

  public enqueueChunk(base64Chunk: string) {
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const float32Samples = base64ToFloat32Array(base64Chunk);
      if (float32Samples.length === 0) return;

      const audioBuffer = this.audioCtx.createBuffer(1, float32Samples.length, 24000);
      audioBuffer.getChannelData(0).set(float32Samples);

      const source = this.audioCtx.createBufferSource();
      source.buffer = audioBuffer;

      if (this.analyser) {
        source.connect(this.analyser);
      } else {
        source.connect(this.audioCtx.destination);
      }

      const currentTime = this.audioCtx.currentTime;
      if (this.nextStartTime < currentTime) {
        this.nextStartTime = currentTime + 0.025; // 25ms jitter buffer
      }

      source.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;

      this.activeSources.push(source);

      source.onended = () => {
        const idx = this.activeSources.indexOf(source);
        if (idx !== -1) {
          this.activeSources.splice(idx, 1);
        }
      };
    } catch (e) {
      console.error('[LiveAudioPlayer] Playback error:', e);
    }
  }

  public interrupt() {
    // Stop all active sources immediately
    for (const source of this.activeSources) {
      try {
        source.stop();
        source.disconnect();
      } catch (e) {
        // Source might have already finished
      }
    }
    this.activeSources = [];
    if (this.audioCtx) {
      this.nextStartTime = this.audioCtx.currentTime;
    }
    if (this.onLevelUpdate) {
      this.onLevelUpdate(0);
    }
  }

  public stop() {
    this.interrupt();
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}

/**
 * Plays a single base64 WAV sound clip (e.g. from TTS)
 */
export function playWavClip(base64Wav: string): HTMLAudioElement {
  const audio = new Audio(`data:audio/wav;base64,${base64Wav}`);
  audio.play().catch((err) => {
    console.warn('Playback error for WAV clip:', err);
  });
  return audio;
}
