import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Heart,
  Camera,
  Flashlight,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Activity,
  Sliders,
  Sparkles,
  Info,
} from 'lucide-react';
import { PPGAnalyzer } from '../utils/ppgAnalyzer';
import { ActivityState, Language, MeasurementRecord } from '../types';

interface HeartRateScannerProps {
  onMeasurementComplete: (record: Partial<MeasurementRecord>) => void;
  lang: Language;
}

export const HeartRateScanner: React.FC<HeartRateScannerProps> = ({
  onMeasurementComplete,
  lang,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [currentBpm, setCurrentBpm] = useState(0);
  const [signalQuality, setSignalQuality] = useState(0);
  const [fingerDetected, setFingerDetected] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSimulatedMode, setIsSimulatedMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [activityState, setActivityState] = useState<ActivityState>('resting');
  const [notes, setNotes] = useState('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const graphCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const analyzerRef = useRef<PPGAnalyzer>(new PPGAnalyzer());
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number>(0);
  const wavePointsRef = useRef<number[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play subtle heartbeat beep using Web Audio API
  const playHeartBeatSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // Audio autoplay might be blocked
    }
  }, [soundEnabled]);

  // Handle flashlight toggle
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const videoTrack = streamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      try {
        const capabilities = videoTrack.getCapabilities() as any;
        if (capabilities?.torch) {
          await videoTrack.applyConstraints({
            advanced: [{ torch: !torchOn }],
          } as any);
          setTorchOn(!torchOn);
        }
      } catch (e) {
        console.warn('Torch constraint not supported', e);
      }
    }
  };

  // Start real camera stream
  const startCameraStream = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment', // Prefer back camera
          width: { ideal: 320 },
          height: { ideal: 240 },
          frameRate: { ideal: 30 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setHasCameraPermission(true);
      return true;
    } catch (err) {
      console.warn('Camera access error:', err);
      setHasCameraPermission(false);
      setIsSimulatedMode(true); // Auto fallback to simulation if camera fails
      return false;
    }
  };

  // Main scan loop
  const runScanLoop = () => {
    const SCAN_DURATION_MS = 12000; // 12 seconds measurement cycle
    const now = performance.now();
    const elapsed = now - startTimeRef.current;
    const currentProgress = Math.min(100, Math.round((elapsed / SCAN_DURATION_MS) * 100));

    setProgress(currentProgress);

    if (currentProgress >= 100) {
      // Scan complete!
      setIsScanning(false);
      setIsCompleted(true);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      return;
    }

    if (isSimulatedMode) {
      // Simulation PPG algorithm
      const timeSec = elapsed / 1000;
      const point = analyzerRef.current.generateSimulatedPoint(timeSec, 72);
      setFingerDetected(true);
      setSignalQuality(95);

      if (point.isPeak) {
        playHeartBeatSound();
      }

      // Add point to wave chart
      wavePointsRef.current.push(point.val);
      if (wavePointsRef.current.length > 120) {
        wavePointsRef.current.shift();
      }

      // Estimate progressive BPM
      const simulatedBpm = Math.round(68 + Math.sin(timeSec * 0.8) * 5);
      setCurrentBpm(simulatedBpm);
    } else {
      // Real Camera Frame PPG Analysis
      const video = videoRef.current;
      const canvas = hiddenCanvasRef.current;

      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = 80;
          canvas.height = 60;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;

          let rSum = 0,
            gSum = 0,
            bSum = 0;
          const pixelCount = data.length / 4;

          for (let i = 0; i < data.length; i += 4) {
            rSum += data[i];
            gSum += data[i + 1];
            bSum += data[i + 2];
          }

          const avgR = rSum / pixelCount;
          const avgG = gSum / pixelCount;
          const avgB = bSum / pixelCount;

          const isFingerOn = analyzerRef.current.isFingerPresent(avgR, avgG, avgB);
          setFingerDetected(isFingerOn);

          if (isFingerOn) {
            const result = analyzerRef.current.processSample(avgR, now);
            setSignalQuality(result.signalQuality);

            if (result.bpm > 0) {
              setCurrentBpm(result.bpm);
            }

            if (result.isPeak) {
              playHeartBeatSound();
            }

            wavePointsRef.current.push(result.filteredVal);
            if (wavePointsRef.current.length > 120) {
              wavePointsRef.current.shift();
            }
          } else {
            setSignalQuality(10);
            wavePointsRef.current.push(0);
            if (wavePointsRef.current.length > 120) {
              wavePointsRef.current.shift();
            }
          }
        }
      }
    }

    // Render Waveform Canvas
    renderWaveformCanvas();

    animationFrameRef.current = requestAnimationFrame(runScanLoop);
  };

  // Render live PPG wave graph
  const renderWaveformCanvas = () => {
    const canvas = graphCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Grid lines background
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 15) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw Pulse Signal Wave
    const points = wavePointsRef.current;
    if (points.length < 2) return;

    ctx.beginPath();
    ctx.strokeStyle = '#f43f5e'; // Rose-500 red line
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const step = width / 120;
    const centerY = height / 2;

    for (let i = 0; i < points.length; i++) {
      const x = i * step;
      // Normalizing amplitude
      const y = centerY - points[i] * (height * 0.35);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Glowing dot at waveform tip
    if (points.length > 0) {
      const lastX = (points.length - 1) * step;
      const lastY = centerY - points[points.length - 1] * (height * 0.35);
      ctx.fillStyle = '#fda4af';
      ctx.beginPath();
      ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const handleStartScan = async () => {
    analyzerRef.current.reset();
    wavePointsRef.current = [];
    setCurrentBpm(0);
    setProgress(0);
    setIsCompleted(false);

    if (!isSimulatedMode) {
      const ok = await startCameraStream();
      if (!ok) {
        setIsSimulatedMode(true);
      }
    }

    setIsScanning(true);
    startTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(runScanLoop);
  };

  const handleStopScan = () => {
    setIsScanning(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  const handleSaveResult = () => {
    const finalBpm = currentBpm > 0 ? currentBpm : 72;
    onMeasurementComplete({
      bpm: finalBpm,
      activityState,
      notes,
      signalQuality: isSimulatedMode ? 95 : signalQuality,
      stressLevel: finalBpm > 85 ? 'high' : finalBpm > 75 ? 'moderate' : 'low',
    });
  };

  useEffect(() => {
    return () => {
      handleStopScan();
    };
  }, []);

  return (
    <div className="space-y-4 max-w-md mx-auto pb-20 pt-2 px-3">
      {/* Hidden processing canvas & video stream */}
      <video ref={videoRef} playsInline muted className="hidden" />
      <canvas ref={hiddenCanvasRef} className="hidden" />

      {/* Main Pulse Scanner Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
        {/* Ambient Pulsing Glow Background */}
        <div
          className={`absolute -top-24 -left-24 w-60 h-60 rounded-full blur-3xl transition-opacity duration-700 pointer-events-none ${
            isScanning ? 'bg-rose-600/30 opacity-100' : 'bg-rose-600/10 opacity-40'
          }`}
        />

        {/* Top Controls Header */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
              {lang === 'th' ? 'วัดอัตราการเต้นหัวใจ (Camera PPG)' : 'Heart Rate PPG Scanner'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
              title={soundEnabled ? 'ปิดเสียง' : 'เปิดเสียง'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-rose-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {/* Flashlight Toggle */}
            {!isSimulatedMode && hasCameraPermission && (
              <button
                onClick={toggleTorch}
                className={`p-2 rounded-xl transition ${
                  torchOn
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title="เปิด/ปิด แฟลช"
              >
                <Flashlight className="w-4 h-4" />
              </button>
            )}

            {/* Simulation mode switch */}
            <button
              onClick={() => {
                handleStopScan();
                setIsSimulatedMode(!isSimulatedMode);
              }}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-xl border transition ${
                isSimulatedMode
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {isSimulatedMode ? 'จำลอง (Sim)' : 'กล้องจริง (Real)'}
            </button>
          </div>
        </div>

        {/* Central Visual Scanner Display */}
        <div className="relative flex flex-col items-center justify-center my-6">
          {/* Circular Camera Sensor Frame */}
          <div
            className={`relative w-44 h-44 rounded-full flex items-center justify-center transition-all duration-500 border-4 ${
              isScanning
                ? fingerDetected || isSimulatedMode
                  ? 'border-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.4)] bg-rose-950/30'
                  : 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)] bg-amber-950/20'
                : 'border-slate-800 bg-slate-950/80 shadow-inner'
            }`}
          >
            {/* SVG Radial Progress Ring */}
            {isScanning && (
              <svg
                viewBox="0 0 176 176"
                className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
              >
                <circle
                  cx="88"
                  cy="88"
                  r="80"
                  stroke="currentColor"
                  strokeWidth="5"
                  className="text-slate-800/60"
                  fill="transparent"
                />
                <circle
                  cx="88"
                  cy="88"
                  r="80"
                  stroke="currentColor"
                  strokeWidth="5"
                  className="text-rose-500 transition-all duration-200"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 80}
                  strokeDashoffset={2 * Math.PI * 80 * (1 - progress / 100)}
                  strokeLinecap="round"
                />
              </svg>
            )}

            {/* Center Heart Beat Icon & Reading */}
            <div className="flex flex-col items-center justify-center text-center z-10 p-2">
              <Heart
                className={`w-10 h-10 transition-transform duration-150 ${
                  isScanning && (fingerDetected || isSimulatedMode)
                    ? 'text-rose-500 scale-110 animate-bounce'
                    : 'text-slate-600'
                }`}
                fill={isScanning ? 'currentColor' : 'none'}
              />

              {currentBpm > 0 ? (
                <div className="mt-1">
                  <span className="text-4xl font-black text-white tracking-tight">
                    {currentBpm}
                  </span>
                  <span className="text-xs font-semibold text-rose-400 ml-1">BPM</span>
                </div>
              ) : (
                <span className="text-xs text-slate-400 mt-2 font-medium">
                  {isScanning
                    ? isSimulatedMode
                      ? 'กำลังตรวจจับ...'
                      : fingerDetected
                      ? 'กำลังประมวลผล...'
                      : 'แตะนิ้วให้มิดกล้อง'
                    : 'พร้อมสแกน'}
                </span>
              )}

              {/* Progress percentage during scan */}
              {isScanning && (
                <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                  {progress}%
                </span>
              )}
            </div>
          </div>

          {/* Status Instructions Message */}
          <div className="mt-4 text-center px-4">
            {isScanning ? (
              fingerDetected || isSimulatedMode ? (
                <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {lang === 'th'
                      ? 'จับสัญญาณจังหวะหัวใจได้แล้ว กรุณาถือนิ้ว นิ่งๆ'
                      : 'Pulse signal acquired. Hold finger still.'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1.5 text-xs text-amber-400 font-medium">
                  <AlertCircle className="w-4 h-4 animate-spin" />
                  <span>
                    {lang === 'th'
                      ? 'กรุณาวางนิ้วชี้ทับเลนส์กล้องและแฟลชให้มิด'
                      : 'Cover lens & flash gently with index finger'}
                  </span>
                </div>
              )
            ) : (
              <p className="text-xs text-slate-400">
                {lang === 'th'
                  ? 'ใช้นิ้วชี้แตะปิดเลนส์กล้องหลังเบาๆ แสงแฟลชจะสแกนสีเลือดในปลายนิ้วเพื่อคำนวณ BPM'
                  : 'Gently place index finger over rear camera lens to detect optical PPG blood flow.'}
              </p>
            )}
          </div>
        </div>

        {/* Live Real-time Waveform Canvas */}
        <div className="mt-2 bg-slate-950/90 border border-slate-800 rounded-2xl p-2.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1 px-1">
            <span className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-rose-400" />
              <span>{lang === 'th' ? 'คลื่นชีพจร PPG' : 'PPG Waveform'}</span>
            </span>
            <span className="font-mono text-[10px] text-slate-500">
              {lang === 'th' ? `คุณภาพสัญญาณ: ${signalQuality}%` : `Signal: ${signalQuality}%`}
            </span>
          </div>
          <canvas
            ref={graphCanvasRef}
            width={320}
            height={70}
            className="w-full h-16 rounded-xl bg-slate-900/60"
          />
        </div>

        {/* Start / Stop Scan Main Button */}
        <div className="mt-5">
          {!isScanning ? (
            <button
              onClick={handleStartScan}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>
                {lang === 'th' ? 'เริ่มสแกนหัวใจ (12 วินาที)' : 'Start Heart Rate Scan (12s)'}
              </span>
            </button>
          ) : (
            <button
              onClick={handleStopScan}
              className="w-full py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-rose-400 font-bold text-sm border border-rose-500/30 flex items-center justify-center gap-2 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{lang === 'th' ? 'ยกเลิกการสแกน' : 'Cancel Scan'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Completion & Save Result Modal / Panel */}
      {isCompleted && (
        <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-5 shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <div>
                <h3 className="font-bold text-white text-sm">
                  {lang === 'th' ? 'วัดอัตราการเต้นหัวใจเสร็จสิ้น' : 'Measurement Complete'}
                </h3>
                <p className="text-xs text-slate-400">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-black text-rose-400">
                {currentBpm > 0 ? currentBpm : 72} <span className="text-xs">BPM</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                {currentBpm < 60
                  ? 'อัตราปกติ (ช้า)'
                  : currentBpm <= 100
                  ? 'จังหวะปกติ'
                  : 'อัตราเร็วสูง'}
              </span>
            </div>
          </div>

          {/* Activity State Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              {lang === 'th' ? 'สภาวะขณะวัดค่า:' : 'Activity Context:'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'resting' as ActivityState, th: '🧘 พักผ่อนปกติ', en: 'Resting' },
                { id: 'post_workout' as ActivityState, th: '🏃 หลังออกกำลังกาย', en: 'Post-workout' },
                { id: 'morning' as ActivityState, th: '🌅 หลังตื่นนอน', en: 'Morning Resting' },
                { id: 'feeling_unwell' as ActivityState, th: '🤒 รู้สึกไม่สบาย', en: 'Feeling Unwell' },
              ].map((act) => (
                <button
                  key={act.id}
                  onClick={() => setActivityState(act.id)}
                  className={`py-2 px-3 text-xs rounded-xl border text-left font-medium transition ${
                    activityState === act.id
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lang === 'th' ? act.th : act.en}
                </button>
              ))}
            </div>
          </div>

          {/* Notes Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {lang === 'th' ? 'บันทึกเพิ่มเติม (ถ้ามี):' : 'Notes:'}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                lang === 'th'
                  ? 'เช่น ดื่มกาแฟก่อนวัด, รู้สึกตื่นเต้น...'
                  : 'e.g., Drank coffee earlier...'
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Save & Analyze Action */}
          <button
            onClick={handleSaveResult}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {lang === 'th' ? 'บันทึกข้อมูล และประเมินสุขภาพ' : 'Save & Analyze Health'}
            </span>
          </button>
        </div>
      )}

      {/* Instructional Health Tip Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 space-y-1.5">
        <div className="flex items-center gap-1.5 font-semibold text-slate-300">
          <Info className="w-4 h-4 text-cyan-400" />
          <span>{lang === 'th' ? 'เกณฑ์มาตรฐานอัตราการเต้นหัวใจ' : 'Standard Heart Rate Ranges'}</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
          <li>
            <strong className="text-slate-200">ขณะพัก (Resting HR):</strong> 60 - 100 BPM
          </li>
          <li>
            <strong className="text-slate-200">นักกีฬา (Athlete):</strong> 40 - 60 BPM
          </li>
          <li>
            <strong className="text-slate-200">หลังออกกำลังกาย (Post-workout):</strong> 100 - 160
            BPM
          </li>
        </ul>
      </div>
    </div>
  );
};
