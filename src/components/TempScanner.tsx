import React, { useState, useEffect, useRef } from 'react';
import {
  Thermometer,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Info,
  Sliders,
  Activity,
  Fingerprint,
} from 'lucide-react';
import { Language, MeasurementRecord } from '../types';

interface TempScannerProps {
  onMeasurementComplete: (record: Partial<MeasurementRecord>) => void;
  lang: Language;
}

export const TempScanner: React.FC<TempScannerProps> = ({
  onMeasurementComplete,
  lang,
}) => {
  const [temperature, setTemperature] = useState<number>(36.6);
  const [isMeasuring, setIsMeasuring] = useState<boolean>(false);
  const [touchProgress, setTouchProgress] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [inputMode, setInputMode] = useState<'touch' | 'manual'>('touch');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Temperature status calculation
  const getTempStatus = (temp: number) => {
    if (temp < 36.0) {
      return {
        labelTh: 'อุณหภูมิต่ำกว่าปกติ',
        labelEn: 'Subnormal Temp',
        color: 'text-cyan-400',
        badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
        descTh: 'อุณหภูมิกายต่ำกว่าเกณฑ์ ควรห่มผ้าหรือทำร่างกายให้อบอุ่น',
      };
    } else if (temp <= 37.2) {
      return {
        labelTh: 'อุณหภูมิร่างกายปกติ',
        labelEn: 'Normal Body Temp',
        color: 'text-emerald-400',
        badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        descTh: 'อุณหภูมิร่างกายอยู่ในเกณฑ์ปกติ สุขภาพสมบูรณ์ดี',
      };
    } else if (temp <= 38.0) {
      return {
        labelTh: 'มีไข้ต่ำๆ (Mild Fever)',
        labelEn: 'Mild Fever',
        color: 'text-amber-400',
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        descTh: 'เริ่มมีไข้ต่ำ ควรดื่มน้ำมากๆ พักผ่อน และเช็ดตัวลดไข้',
      };
    } else {
      return {
        labelTh: 'มีไข้สูง (High Fever)',
        labelEn: 'High Fever Alert',
        color: 'text-rose-400',
        badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        descTh: 'อุณหภูมิสูงเกินเกณฑ์ ควรทานยาลดไข้ เช็ดตัว หรือพบแพทย์',
      };
    }
  };

  const status = getTempStatus(temperature);

  // Handle Touch Contact Scanner Hold
  const handleTouchStart = () => {
    setIsMeasuring(true);
    setTouchProgress(0);
    setIsCompleted(false);

    let current = 0;
    // Simulated progressive thermal reading
    const startTemp = 35.2;
    const targetTemp = Number((36.4 + Math.random() * 1.2).toFixed(1));

    timerRef.current = setInterval(() => {
      current += 4;
      setTouchProgress(current);

      const computed = Number((startTemp + (targetTemp - startTemp) * (current / 100)).toFixed(1));
      setTemperature(computed);

      if (current >= 100) {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsMeasuring(false);
        setIsCompleted(true);
      }
    }, 120);
  };

  const handleTouchEnd = () => {
    if (touchProgress < 100 && isMeasuring) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsMeasuring(false);
      setTouchProgress(0);
    }
  };

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleSaveResult = () => {
    onMeasurementComplete({
      temperature,
      bpm: 72, // default resting fallback if not scanned yet
      activityState: temperature > 37.3 ? 'feeling_unwell' : 'resting',
      notes,
      symptoms: selectedSymptoms,
      stressLevel: temperature > 37.8 ? 'high' : 'low',
    });
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="space-y-4 max-w-md mx-auto pb-20 pt-2 px-3">
      {/* Main Temperature Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
        {/* Glow Background Effect */}
        <div
          className={`absolute -top-24 -right-24 w-60 h-60 rounded-full blur-3xl transition-opacity duration-700 pointer-events-none ${
            temperature > 37.3
              ? 'bg-amber-600/30 opacity-100'
              : 'bg-emerald-600/20 opacity-50'
          }`}
        />

        {/* Mode Switch Header */}
        <div className="flex items-center justify-between mb-5 relative z-10">
          <div className="flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              {lang === 'th' ? 'วัดอุณหภูมิร่างกาย' : 'Body Temperature'}
            </span>
          </div>

          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-[11px]">
            <button
              onClick={() => setInputMode('touch')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                inputMode === 'touch'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lang === 'th' ? 'สแกนสัมผัส' : 'Touch Scanner'}
            </button>
            <button
              onClick={() => setInputMode('manual')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                inputMode === 'manual'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lang === 'th' ? 'ป้อนค่าปรอท' : 'Manual Input'}
            </button>
          </div>
        </div>

        {/* Temperature Reading Big Display */}
        <div className="text-center my-4">
          <div className="inline-flex items-baseline justify-center gap-1">
            <span className={`text-6xl font-black tracking-tight ${status.color}`}>
              {temperature.toFixed(1)}
            </span>
            <span className="text-2xl font-bold text-slate-400">°C</span>
          </div>

          <div className="mt-2">
            <span
              className={`inline-block text-xs px-3 py-1 rounded-full border font-semibold ${status.badgeBg}`}
            >
              {lang === 'th' ? status.labelTh : status.labelEn}
            </span>
          </div>
        </div>

        {/* Mode 1: Interactive Touch Contact Scanner */}
        {inputMode === 'touch' ? (
          <div className="my-6 flex flex-col items-center">
            <button
              onMouseDown={handleTouchStart}
              onMouseUp={handleTouchEnd}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className={`relative w-40 h-40 rounded-full flex flex-col items-center justify-center transition-all border-4 shadow-xl select-none cursor-pointer ${
                isMeasuring
                  ? 'border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.5)] bg-amber-950/40 scale-105'
                  : 'border-slate-800 bg-slate-950 hover:border-slate-700'
              }`}
            >
              <Fingerprint
                className={`w-14 h-14 transition-colors ${
                  isMeasuring ? 'text-amber-400 animate-pulse' : 'text-slate-600'
                }`}
              />
              <span className="text-[11px] font-semibold text-slate-300 mt-2">
                {isMeasuring
                  ? `${touchProgress}%`
                  : lang === 'th'
                  ? 'กดค้างที่นี่เพื่อสแกน'
                  : 'Press & Hold to Scan'}
              </span>

              {/* Expanding Touch Ring */}
              {isMeasuring && (
                <svg
                  viewBox="0 0 160 160"
                  className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
                >
                  <circle
                    cx="80"
                    cy="80"
                    r="72"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-amber-500 transition-all duration-100"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 72}
                    strokeDashoffset={2 * Math.PI * 72 * (1 - touchProgress / 100)}
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
            <p className="text-[11px] text-slate-400 text-center mt-3">
              {lang === 'th'
                ? 'กดค้างไว้อย่างน้อย 3 วินาที เพื่อประเมินอุณหภูมิพื้นผิวร่างกาย'
                : 'Press & hold for 3 seconds to measure thermal body contact.'}
            </p>
          </div>
        ) : (
          /* Mode 2: Precision Slider / Direct Input */
          <div className="my-6 space-y-4 px-2">
            <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
              <span>35.0 °C (ต่ำ)</span>
              <span>37.0 °C (ปกติ)</span>
              <span>40.0 °C (ไข้สูง)</span>
            </div>

            <input
              type="range"
              min={35.0}
              max={40.5}
              step={0.1}
              value={temperature}
              onChange={(e) => {
                setTemperature(parseFloat(e.target.value));
                setIsCompleted(true);
              }}
              className="w-full h-3 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500 border border-slate-800"
            />

            <div className="flex justify-center gap-2">
              {[36.2, 36.6, 37.0, 37.5, 38.2, 39.0].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTemperature(t);
                    setIsCompleted(true);
                  }}
                  className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition ${
                    temperature === t
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {t}°C
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Temperature Insight Advice */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 text-xs text-slate-300 space-y-1">
          <div className="font-semibold text-amber-300 flex items-center gap-1.5">
            <Flame className="w-4 h-4" />
            <span>{lang === 'th' ? 'ข้อแนะนำอุณหภูมิ' : 'Thermal Guidance'}</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">{status.descTh}</p>
        </div>
      </div>

      {/* Symptoms Checklist & Save Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
        <div>
          <h4 className="text-xs font-bold text-slate-200 mb-2.5 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>
              {lang === 'th' ? 'ระบุอาการร่วม (ถ้ามี):' : 'Select Symptoms (if any):'}
            </span>
          </h4>

          <div className="flex flex-wrap gap-2">
            {[
              'ปวดศีรษะ / ปวดหัว',
              'หนาวสั่น',
              'อ่อนเพลีย',
              'เจ็บคอ / ไอ',
              'ปวดเมื่อยกล้ามเนื้อ',
              'คัดจมูก / มีน้ำมูก',
            ].map((symptom) => {
              const isSelected = selectedSymptoms.includes(symptom);
              return (
                <button
                  key={symptom}
                  onClick={() => toggleSymptom(symptom)}
                  className={`px-3 py-1.5 text-xs rounded-xl border transition font-medium ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {symptom}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              lang === 'th'
                ? 'บันทึกเพิ่มเติม เช่น ทานยาแล้ว, เพิ่งวัดตอนเย็น...'
                : 'Additional notes...'
            }
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Save button */}
        <button
          onClick={handleSaveResult}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          <span>
            {lang === 'th' ? 'บันทึกอุณหภูมิ & วิเคราะห์ AI' : 'Save Temp & Get AI Analysis'}
          </span>
        </button>
      </div>
    </div>
  );
};
