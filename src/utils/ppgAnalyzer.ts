import { PPGPoint } from '../types';

export class PPGAnalyzer {
  private buffer: number[] = [];
  private timestamps: number[] = [];
  private peaks: number[] = [];
  private maxBufferSize = 150; // ~5 seconds at 30fps
  private lastBpm: number = 72;
  private bpmHistory: number[] = [];

  public reset() {
    this.buffer = [];
    this.timestamps = [];
    this.peaks = [];
    this.bpmHistory = [];
    this.lastBpm = 72;
  }

  /**
   * Evaluates if a finger is properly covering the camera lens
   */
  public isFingerPresent(r: number, g: number, b: number): boolean {
    // Red channel should dominate heavily
    const avgOther = (g + b) / 2 + 1;
    const redRatio = r / avgOther;
    return r > 100 && redRatio > 1.8;
  }

  /**
   * Processes a single raw brightness frame value (Red intensity)
   */
  public processSample(rawVal: number, now: number): {
    filteredVal: number;
    bpm: number;
    isPeak: boolean;
    signalQuality: number;
  } {
    this.buffer.push(rawVal);
    this.timestamps.push(now);

    if (this.buffer.length > this.maxBufferSize) {
      this.buffer.shift();
      this.timestamps.shift();
    }

    if (this.buffer.length < 15) {
      return { filteredVal: 0, bpm: 0, isPeak: false, signalQuality: 30 };
    }

    // 1. Calculate rolling mean & standard deviation for AC signal extraction
    const mean = this.buffer.reduce((a, b) => a + b, 0) / this.buffer.length;
    const variance =
      this.buffer.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
      this.buffer.length;
    const stdDev = Math.sqrt(variance);

    // Filtered value (detrended AC signal)
    const filteredVal = rawVal - mean;

    // Signal quality estimate based on signal-to-noise ratio
    const signalQuality = Math.min(100, Math.max(10, Math.round(stdDev * 8)));

    // 2. Peak Detection Logic
    let isPeak = false;
    const threshold = stdDev * 0.45;

    const len = this.buffer.length;
    if (len >= 3) {
      const prev2 = this.buffer[len - 3] - mean;
      const prev1 = this.buffer[len - 2] - mean;
      const curr = filteredVal;

      // Local maximum check
      if (prev1 > threshold && prev1 > prev2 && prev1 > curr) {
        const peakTime = this.timestamps[len - 2];
        const lastPeakTime = this.peaks[this.peaks.length - 1] || 0;
        const timeDiff = peakTime - lastPeakTime;

        // Minimum time between beats: 300ms (200 BPM) to 1500ms (40 BPM)
        if (timeDiff > 320 && timeDiff < 1500) {
          isPeak = true;
          this.peaks.push(peakTime);

          const instantBpm = Math.round(60000 / timeDiff);
          if (instantBpm >= 45 && instantBpm <= 180) {
            this.bpmHistory.push(instantBpm);
            if (this.bpmHistory.length > 6) {
              this.bpmHistory.shift();
            }

            // Median/average filtering for stable BPM
            const sorted = [...this.bpmHistory].sort((a, b) => a - b);
            const medianBpm = sorted[Math.floor(sorted.length / 2)];
            this.lastBpm = medianBpm;
          }
        }
      }
    }

    return {
      filteredVal,
      bpm: this.lastBpm,
      isPeak,
      signalQuality,
    };
  }

  /**
   * Generates a realistic simulated pulse point for simulation/testing mode
   */
  public generateSimulatedPoint(
    timeSeconds: number,
    targetBpm: number = 72
  ): PPGPoint {
    const freq = targetBpm / 60; // Hz
    const period = 1 / freq;
    const phase = (timeSeconds % period) / period;

    // Cardiac pulse waveform shape (systolic peak + dicrotic notch)
    let val = Math.exp(-Math.pow((phase - 0.2) * 8, 2)) * 1.0;
    val += Math.exp(-Math.pow((phase - 0.45) * 12, 2)) * 0.35; // Dicrotic notch

    // Add tiny biological micro-variations
    const jitter = (Math.random() - 0.5) * 0.05;
    val += jitter;

    const isPeak = phase > 0.18 && phase < 0.22;

    return {
      time: timeSeconds,
      val,
      isPeak,
    };
  }
}
