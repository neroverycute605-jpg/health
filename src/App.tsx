/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { TabNavigation } from './components/TabNavigation';
import { HeartRateScanner } from './components/HeartRateScanner';
import { TempScanner } from './components/TempScanner';
import { AIHealthAdvisor } from './components/AIHealthAdvisor';
import { HealthDashboard } from './components/HealthDashboard';
import { BreathingExercise } from './components/BreathingExercise';
import { ProfileModal } from './components/ProfileModal';
import {
  getStoredLogs,
  saveLogRecord,
  deleteLogRecord,
  getUserProfile,
  saveUserProfile,
} from './utils/storage';
import {
  HealthTab,
  Language,
  MeasurementRecord,
  UserProfile,
} from './types';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<HealthTab>('scan');
  const [lang, setLang] = useState<Language>('th');
  const [logs, setLogs] = useState<MeasurementRecord[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(getUserProfile());
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    setLogs(getStoredLogs());
    setUserProfile(getUserProfile());
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 3500);
  };

  const handleMeasurementComplete = (recordData: Partial<MeasurementRecord>) => {
    const newRecord: MeasurementRecord = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      bpm: recordData.bpm || 72,
      temperature: recordData.temperature || 36.6,
      activityState: recordData.activityState || 'resting',
      notes: recordData.notes || '',
      symptoms: recordData.symptoms || [],
      stressLevel: recordData.stressLevel || 'low',
      signalQuality: recordData.signalQuality || 90,
    };

    const updated = saveLogRecord(newRecord);
    setLogs(updated);

    showToast(
      lang === 'th'
        ? `บันทึกสัญญาณชีพแล้ว! (${newRecord.bpm} BPM / ${newRecord.temperature} °C)`
        : `Saved measurement! (${newRecord.bpm} BPM / ${newRecord.temperature} °C)`
    );

    // Auto navigate to AI Health Doctor tab to show immediate insights
    setActiveTab('ai');
  };

  const handleDeleteLog = (id: string) => {
    const updated = deleteLogRecord(id);
    setLogs(updated);
    showToast(lang === 'th' ? 'ลบบันทึกแล้ว' : 'Record deleted');
  };

  const handleSaveProfile = (updatedProfile: UserProfile) => {
    saveUserProfile(updatedProfile);
    setUserProfile(updatedProfile);
    showToast(lang === 'th' ? 'บันทึกข้อมูลส่วนตัวเรียบร้อย' : 'Profile updated');
  };

  const latestRecord = logs.length > 0 ? logs[0] : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col selection:bg-rose-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        userProfile={userProfile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        lang={lang}
        onToggleLang={() => setLang((prev) => (prev === 'th' ? 'en' : 'th'))}
      />

      {/* Main Tab Content View */}
      <main className="flex-1 max-w-md w-full mx-auto pb-24">
        {activeTab === 'scan' && (
          <HeartRateScanner
            onMeasurementComplete={handleMeasurementComplete}
            lang={lang}
          />
        )}

        {activeTab === 'temp' && (
          <TempScanner
            onMeasurementComplete={handleMeasurementComplete}
            lang={lang}
          />
        )}

        {activeTab === 'ai' && (
          <AIHealthAdvisor
            latestRecord={latestRecord}
            recordsHistory={logs}
            userProfile={userProfile}
            lang={lang}
          />
        )}

        {activeTab === 'dashboard' && (
          <HealthDashboard
            logs={logs}
            onDeleteLog={handleDeleteLog}
            lang={lang}
          />
        )}

        {activeTab === 'breathing' && <BreathingExercise lang={lang} />}
      </main>

      {/* Toast Notification Popup */}
      {toastMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Profile Settings Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={userProfile}
        onSaveProfile={handleSaveProfile}
        lang={lang}
      />

      {/* Bottom Mobile Tab Bar */}
      <TabNavigation activeTab={activeTab} onChangeTab={setActiveTab} lang={lang} />
    </div>
  );
}
