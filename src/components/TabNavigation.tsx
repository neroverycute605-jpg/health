import React from 'react';
import { Heart, Thermometer, Sparkles, BarChart3, Wind } from 'lucide-react';
import { HealthTab, Language } from '../types';

interface TabNavigationProps {
  activeTab: HealthTab;
  onChangeTab: (tab: HealthTab) => void;
  lang: Language;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onChangeTab,
  lang,
}) => {
  const tabs = [
    {
      id: 'scan' as HealthTab,
      labelTh: 'วัดอัตราการเต้นหัวใจ',
      labelEn: 'Heart Scan',
      icon: Heart,
      color: 'text-rose-500',
      activeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    },
    {
      id: 'temp' as HealthTab,
      labelTh: 'วัดอุณหภูมิ',
      labelEn: 'Body Temp',
      icon: Thermometer,
      color: 'text-amber-500',
      activeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    },
    {
      id: 'ai' as HealthTab,
      labelTh: 'หมอ AI',
      labelEn: 'AI Doctor',
      icon: Sparkles,
      color: 'text-cyan-400',
      activeBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    },
    {
      id: 'dashboard' as HealthTab,
      labelTh: 'ประวัติ/สถิติ',
      labelEn: 'Dashboard',
      icon: BarChart3,
      color: 'text-emerald-400',
      activeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'breathing' as HealthTab,
      labelTh: 'ฝึกหายใจ',
      labelEn: 'Breathe',
      icon: Wind,
      color: 'text-indigo-400',
      activeBg: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-2">
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all border ${
                isActive
                  ? `${tab.activeBg} font-semibold shadow-inner scale-105`
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? '' : 'opacity-80'}`} />
                {tab.id === 'ai' && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 truncate max-w-full leading-none">
                {lang === 'th' ? tab.labelTh : tab.labelEn}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
