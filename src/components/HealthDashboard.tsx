import React, { useState } from 'react';
import {
  BarChart3,
  Heart,
  Thermometer,
  Trash2,
  Calendar,
  Download,
  Filter,
  Sparkles,
  TrendingUp,
  Activity,
  Flame,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Language, MeasurementRecord } from '../types';

interface HealthDashboardProps {
  logs: MeasurementRecord[];
  onDeleteLog: (id: string) => void;
  lang: Language;
}

export const HealthDashboard: React.FC<HealthDashboardProps> = ({
  logs,
  onDeleteLog,
  lang,
}) => {
  const [filterState, setFilterState] = useState<string>('all');

  // Filter logs based on state
  const filteredLogs = logs.filter((log) => {
    if (filterState === 'all') return true;
    return log.activityState === filterState;
  });

  // Recharts formatted data array
  const chartData = [...logs]
    .reverse()
    .slice(-10)
    .map((log) => ({
      date: new Date(log.timestamp).toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
      }),
      bpm: log.bpm,
      temp: log.temperature,
    }));

  // Summary Metrics
  const avgBpm =
    logs.length > 0
      ? Math.round(logs.reduce((acc, l) => acc + l.bpm, 0) / logs.length)
      : 0;
  const avgTemp =
    logs.length > 0
      ? (logs.reduce((acc, l) => acc + l.temperature, 0) / logs.length).toFixed(1)
      : '0';
  const maxBpm = logs.length > 0 ? Math.max(...logs.map((l) => l.bpm)) : 0;

  // Export logs to JSON
  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `pulsetemp_health_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export logs to CSV (for Excel / Google Sheets / Apple Health / Medical Records)
  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const headers = ['ID', 'Timestamp', 'HeartRate_BPM', 'Temperature_C', 'Activity', 'Symptoms', 'Notes'];
    const rows = logs.map((log) => [
      log.id,
      new Date(log.timestamp).toLocaleString('th-TH'),
      log.bpm,
      log.temperature,
      log.activityState,
      `"${(log.symptoms || []).join('; ')}"`,
      `"${log.notes || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `pulsetemp_health_data_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-4 max-w-md mx-auto pb-20 pt-2 px-3">
      {/* Overview Metric Stats Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Heart className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
              {lang === 'th' ? 'อัตราหัวใจเฉลี่ย' : 'Avg Heart Rate'}
            </span>
            <div className="text-xl font-black text-white leading-tight">
              {avgBpm} <span className="text-xs font-normal text-rose-400">BPM</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
              {lang === 'th' ? 'อุณหภูมิเฉลี่ย' : 'Avg Body Temp'}
            </span>
            <div className="text-xl font-black text-white leading-tight">
              {avgTemp} <span className="text-xs font-normal text-amber-400">°C</span>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Trend Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>{lang === 'th' ? 'แนวโน้มสัญญาณชีพ (10 ครั้งล่าสุด)' : 'Vital Signs Trends'}</span>
          </h3>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExportCSV}
              className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-emerald-400 hover:text-emerald-300 text-xs font-semibold flex items-center gap-1 transition"
              title="ส่งออกเป็นไฟล์ CSV สำหรับ Excel"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
            <button
              onClick={handleExportData}
              className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-cyan-400 hover:text-cyan-300 text-xs font-semibold flex items-center gap-1 transition"
              title="ส่งออกเป็นไฟล์ JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
          </div>
        </div>

        {/* Recharts BPM & Temp Dual Timeline Area Chart */}
        <div className="h-48 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="bpmGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="tempGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[50, 140]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#f8fafc',
                }}
              />

              <Area
                type="monotone"
                dataKey="bpm"
                name="อัตราเต้นหัวใจ (BPM)"
                stroke="#f43f5e"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#bpmGlow)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Log Filter & History List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>{lang === 'th' ? 'ประวัติการวัดบันทึก' : 'Measurement Logs'}</span>
          </h3>

          {/* Activity Filter */}
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-2.5 py-1 focus:outline-none"
          >
            <option value="all">ทั้งหมด (All)</option>
            <option value="resting">พักผ่อน (Resting)</option>
            <option value="post_workout">หลังออกกำลังกาย (Workout)</option>
            <option value="feeling_unwell">ไม่สบาย (Unwell)</option>
          </select>
        </div>

        {/* List of records */}
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {filteredLogs.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">
              {lang === 'th' ? 'ยังไม่มีประวัติบันทึกข้อมูล' : 'No measurement logs available'}
            </p>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex items-center justify-between hover:border-slate-700 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-rose-400 text-sm">{log.bpm} BPM</span>
                    <span className="text-slate-600">•</span>
                    <span className="font-black text-amber-400 text-sm">
                      {log.temperature} °C
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {log.activityState === 'resting'
                        ? 'พักผ่อน'
                        : log.activityState === 'post_workout'
                        ? 'หลังออกกำลังกาย'
                        : 'รู้สึกไม่สบาย'}
                    </span>
                  </div>

                  {log.notes && <p className="text-xs text-slate-400 italic">{log.notes}</p>}

                  <p className="text-[10px] text-slate-500">
                    {new Date(log.timestamp).toLocaleString('th-TH', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <button
                  onClick={() => onDeleteLog(log.id)}
                  className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
                  title="ลบบันทึกนี้"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Device & Software Compatibility Guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-3 text-xs text-slate-300">
        <div className="flex items-center gap-2 text-sm font-bold text-cyan-400">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{lang === 'th' ? 'การใช้งานร่วมกับโปรแกรม & อุปกรณ์อื่น' : 'Software & Device Integration'}</span>
        </div>

        <ul className="space-y-2 text-[11px] leading-relaxed text-slate-400">
          <li className="flex items-start gap-2 bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
            <span className="font-bold text-rose-400">📱 เว็บเบราว์เซอร์มือถือ:</span>
            <span>ใช้งานได้ทันทีบน Safari, Google Chrome, หรือ Edge บนสมาร์ตโฟน iOS และ Android โดยไม่ต้องลงแอปเพิ่ม</span>
          </li>
          <li className="flex items-start gap-2 bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
            <span className="font-bold text-amber-400">📷 กล้อง & แฟลชโทรศัพท์:</span>
            <span>ใช้ตรวจจับการไหลเวียนเลือดปลายนิ้ว (PPG) เพื่อคำนวณ Heart Rate อัตโนมัติ</span>
          </li>
          <li className="flex items-start gap-2 bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
            <span className="font-bold text-emerald-400">📊 Excel & Google Sheets:</span>
            <span>กดปุ่ม <strong className="text-emerald-300">CSV</strong> เพื่อส่งออกไฟล์รายงานสัญญาณชีพ นำไปเปิดบันทึกวิเคราะห์ต่อใน Microsoft Excel หรือส่งให้แพทย์</span>
          </li>
          <li className="flex items-start gap-2 bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
            <span className="font-bold text-indigo-400">🤖 Gemini 3.6 AI Doctor:</span>
            <span>วิเคราะห์ผลร่วมกับโมเดล AI ผ่านคลาวด์เซิร์ฟเวอร์แบบ Real-time พร้อมคำแนะนำสุขภาพรายบุคคล</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
