import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Heart,
  Thermometer,
  Activity,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  Brain,
  MessageSquare,
  Lightbulb,
} from 'lucide-react';
import {
  AIAnalysisResult,
  Language,
  MeasurementRecord,
  UserProfile,
} from '../types';

interface AIHealthAdvisorProps {
  latestRecord: MeasurementRecord | null;
  recordsHistory: MeasurementRecord[];
  userProfile: UserProfile;
  lang: Language;
}

export const AIHealthAdvisor: React.FC<AIHealthAdvisorProps> = ({
  latestRecord,
  recordsHistory,
  userProfile,
  lang,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [customQuestion, setCustomQuestion] = useState<string>('');

  const fetchAIAnalysis = async (userQuestion?: string) => {
    setLoading(true);
    setErrorMsg(null);

    const bpm = latestRecord ? latestRecord.bpm : 72;
    const temperature = latestRecord ? latestRecord.temperature : 36.6;
    const activityState = latestRecord ? latestRecord.activityState : 'resting';
    const symptoms = latestRecord?.symptoms || [];

    try {
      const response = await fetch('/api/health-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bpm,
          temperature,
          activityState,
          userProfile,
          symptoms,
          question: userQuestion || customQuestion || undefined,
          history: recordsHistory,
        }),
      });

      const resData = await response.json();
      if (resData.success && resData.data) {
        setAnalysisResult(resData.data);
      } else {
        throw new Error(resData.error || 'Failed to analyze');
      }
    } catch (err: any) {
      console.error('AI Analysis Error:', err);
      setErrorMsg(
        lang === 'th'
          ? 'ไม่สามารถติดต่อ AI ได้ชั่วคราว โปรดลองใหม่อีกครั้ง'
          : 'Failed to connect to AI Health Advisor'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIAnalysis();
  }, [latestRecord]);

  const handleAskQuestion = (q?: string) => {
    const questionToAsk = q || customQuestion;
    if (!questionToAsk.trim()) return;
    fetchAIAnalysis(questionToAsk);
    setCustomQuestion('');
  };

  return (
    <div className="space-y-4 max-w-md mx-auto pb-20 pt-2 px-3">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-inner">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="font-bold text-white text-base flex items-center gap-2">
              <span>PulseTemp AI Doctor</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                Gemini 3.6
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'th'
                ? 'ระบบประเมินสัญญาณชีพ & ให้คำแนะนำสุขภาพด้วย AI'
                : 'AI-Powered Vital Signs & Medical Wellness Advisor'}
            </p>
          </div>
        </div>

        {/* Current Metrics Snapshot */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" />
            <div>
              <span className="text-slate-400 text-[10px] block">
                {lang === 'th' ? 'อัตราหัวใจเต้น' : 'Heart Rate'}
              </span>
              <span className="font-bold text-white text-sm">
                {latestRecord?.bpm || 72} BPM
              </span>
            </div>
          </div>

          <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800 flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-amber-500" />
            <div>
              <span className="text-slate-400 text-[10px] block">
                {lang === 'th' ? 'อุณหภูมิร่างกาย' : 'Body Temp'}
              </span>
              <span className="font-bold text-white text-sm">
                {latestRecord?.temperature || 36.6} °C
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Analysis Main Result Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
            <Brain className="w-4 h-4 text-indigo-400" />
            <span>{lang === 'th' ? 'ผลประเมินสุขภาพ AI' : 'AI Doctor Assessment'}</span>
          </h3>

          <button
            onClick={() => fetchAIAnalysis()}
            disabled={loading}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>{lang === 'th' ? 'ประเมินใหม่' : 'Re-analyze'}</span>
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-medium">
              {lang === 'th'
                ? 'กำลังประมวลผลข้อมูลสัญญาณชีพด้วย Gemini AI...'
                : 'Analyzing vital signs with Gemini AI...'}
            </p>
          </div>
        ) : errorMsg ? (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        ) : analysisResult ? (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Overall Summary Banner */}
            <div
              className={`p-4 rounded-2xl border ${
                analysisResult.statusLevel === 'alert'
                  ? 'bg-rose-500/10 border-rose-500/40 text-rose-200'
                  : analysisResult.statusLevel === 'warning'
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                  : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {analysisResult.statusLevel === 'alert' ? (
                  <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider mb-1">
                    {lang === 'th' ? 'สรุปภาพรวมสุขภาพ' : 'Health Summary'}
                  </h4>
                  <p className="text-xs leading-relaxed font-medium">
                    {analysisResult.overallAssessment}
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Analysis Breakdown */}
            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl">
                <span className="font-semibold text-rose-400 block mb-1">
                  ❤️ {lang === 'th' ? 'วิเคราะห์อัตราหัวใจเต้น:' : 'Heart Rate Analysis:'}
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {analysisResult.heartRateAnalysis}
                </p>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl">
                <span className="font-semibold text-amber-400 block mb-1">
                  🌡️ {lang === 'th' ? 'วิเคราะห์อุณหภูมิร่างกาย:' : 'Body Temp Analysis:'}
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {analysisResult.temperatureAnalysis}
                </p>
              </div>

              {analysisResult.stressAndHrvIndex && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <span className="font-semibold text-indigo-400">
                    🧠 {lang === 'th' ? 'ดัชนีความเครียด/HRV:' : 'Stress Index:'}
                  </span>
                  <span className="font-bold text-slate-200">
                    {analysisResult.stressAndHrvIndex}
                  </span>
                </div>
              )}
            </div>

            {/* Recommendations List */}
            {analysisResult.recommendations && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-cyan-400" />
                  <span>
                    {lang === 'th' ? 'ข้อแนะนำการดูแลตัวเอง:' : 'Personalized Health Tips:'}
                  </span>
                </h4>
                <ul className="space-y-1.5">
                  {analysisResult.recommendations.map((tip, idx) => (
                    <li
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-start gap-2"
                    >
                      <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Detailed Explanation text */}
            {analysisResult.detailedExplanation && (
              <p className="text-[11px] text-slate-400 italic bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
                {analysisResult.detailedExplanation}
              </p>
            )}
          </div>
        ) : null}
      </div>

      {/* Ask Question to AI Doctor */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-3">
        <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <span>
            {lang === 'th' ? 'ถามคำถามหมอ AI เพิ่มเติม' : 'Ask AI Doctor Anything'}
          </span>
        </h4>

        {/* Suggested Quick Questions */}
        <div className="flex flex-wrap gap-1.5">
          {[
            'วัดอัตราเต้นหัวใจให้แม่นยำทำอย่างไร?',
            'มีไข้ต่ำๆ ควรปฐมพยาบาลอย่างไร?',
            'หัวใจเต้นเร็วขณะพัก เกิดจากอะไร?',
          ].map((q, i) => (
            <button
              key={i}
              onClick={() => handleAskQuestion(q)}
              className="text-[11px] py-1 px-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition"
            >
              💬 {q}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
            placeholder={
              lang === 'th'
                ? 'พิมพ์คำถามสุขภาพ เช่น ทำไมหัวใจเต้นแรง...'
                : 'Ask health questions...'
            }
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={() => handleAskQuestion()}
            disabled={loading || !customQuestion.trim()}
            className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-bold transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
