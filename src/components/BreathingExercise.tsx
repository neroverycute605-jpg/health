import React, { useState, useEffect, useRef } from 'react';
import { Wind, Play, Pause, RotateCcw, Heart, Sparkles, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';

interface BreathingExerciseProps {
  lang: Language;
}

type Phase = 'idle' | 'inhale' | 'hold' | 'exhale';

export const BreathingExercise: React.FC<BreathingExerciseProps> = ({ lang }) => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [countdown, setCountdown] = useState(4);
  const [completedCycles, setCompletedCycles] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startBreathing = () => {
    setIsActive(true);
    setPhase('inhale');
    setCountdown(4);
    setCompletedCycles(0);
  };

  const stopBreathing = () => {
    setIsActive(false);
    setPhase('idle');
    setCountdown(4);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    if (!isActive) return;

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev > 1) return prev - 1;

        // Transition between phases (4 - 7 - 8 technique)
        if (phase === 'inhale') {
          setPhase('hold');
          return 7;
        } else if (phase === 'hold') {
          setPhase('exhale');
          return 8;
        } else if (phase === 'exhale') {
          setCompletedCycles((c) => c + 1);
          setPhase('inhale');
          return 4;
        }
        return 4;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, phase]);

  return (
    <div className="space-y-4 max-w-md mx-auto pb-20 pt-2 px-3">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-6 text-center relative overflow-hidden">
        {/* Glow Background */}
        <div className="absolute -top-24 -left-24 w-60 h-60 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />

        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-xs font-semibold mb-2">
            <Wind className="w-3.5 h-3.5" />
            <span>
              {lang === 'th'
                ? 'เทคนิคการหายใจ 4-7-8 ลดอัตราเต้นหัวใจ'
                : '4-7-8 Heart Calming Exercise'}
            </span>
          </div>
          <h2 className="text-xl font-black text-white">
            {lang === 'th' ? 'ฝึกการหายใจผ่อนคลาย' : 'Breathing Relaxation'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            {lang === 'th'
              ? 'ช่วยปรับจังหวะการเต้นของหัวใจให้ช้าลง ลดความเครียด และช่วยให้หลับสบายขึ้น'
              : 'Calms central nervous system and lowers resting heart rate.'}
          </p>
        </div>

        {/* Central Animated Breathing Sphere */}
        <div className="relative my-8 flex items-center justify-center">
          <div
            className={`w-48 h-48 rounded-full flex flex-col items-center justify-center text-center origin-center transition-all duration-1000 border-4 shadow-2xl ${
              phase === 'inhale'
                ? 'scale-125 border-indigo-400 bg-indigo-950/60 shadow-[0_0_50px_rgba(99,102,241,0.5)]'
                : phase === 'hold'
                ? 'scale-125 border-amber-400 bg-amber-950/60 shadow-[0_0_50px_rgba(245,158,11,0.5)]'
                : phase === 'exhale'
                ? 'scale-90 border-cyan-400 bg-cyan-950/60 shadow-[0_0_30px_rgba(6,182,212,0.4)]'
                : 'scale-100 border-slate-800 bg-slate-950'
            }`}
          >
            <span className="text-4xl font-black text-white tracking-tight">{isActive ? countdown : '4-7-8'}</span>
            <span className="text-xs font-bold uppercase tracking-wider mt-1 text-indigo-300 px-2">
              {phase === 'inhale'
                ? 'หายใจเข้า (Inhale)'
                : phase === 'hold'
                ? 'กลั้นหายใจ (Hold)'
                : phase === 'exhale'
                ? 'ผ่อนหายใจออก (Exhale)'
                : 'พร้อมเริ่ม'}
            </span>
          </div>
        </div>

        {/* Stats & Cycle Counter */}
        <div className="flex items-center justify-center gap-4 text-xs font-medium text-slate-300">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
            {lang === 'th' ? `รอบที่สำเร็จ: ${completedCycles}` : `Cycles Completed: ${completedCycles}`}
          </div>
        </div>

        {/* Main Controls */}
        <div className="pt-2">
          {!isActive ? (
            <button
              onClick={startBreathing}
              className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{lang === 'th' ? 'เริ่มฝึกการหายใจ' : 'Start Breathing Session'}</span>
            </button>
          ) : (
            <button
              onClick={stopBreathing}
              className="w-full py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-sm border border-indigo-500/30 flex items-center justify-center gap-2 transition"
            >
              <Pause className="w-5 h-5" />
              <span>{lang === 'th' ? 'หยุดชั่วคราว / รีเซ็ต' : 'Pause / Reset'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
