import React from 'react';
import { Activity, Thermometer, Heart, User, ShieldCheck, Sparkles } from 'lucide-react';
import { UserProfile, Language } from '../types';

interface NavbarProps {
  userProfile: UserProfile;
  onOpenProfile: () => void;
  lang: Language;
  onToggleLang: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userProfile,
  onOpenProfile,
  lang,
  onToggleLang,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white px-4 py-3 shadow-md">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 shadow-lg shadow-rose-500/20">
            <Heart className="w-5 h-5 text-white animate-pulse" />
            <div className="absolute -bottom-1 -right-1 bg-cyan-500 text-[9px] font-bold px-1 rounded text-slate-950">
              AI
            </div>
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight leading-tight flex items-center gap-1.5">
              <span>PulseTemp</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-medium border border-rose-500/30">
                Health
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-normal">
              {lang === 'th' ? 'วัดหัวใจ & อุณหภูมิด้วย AI' : 'Camera PPG & Temp AI'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <button
            onClick={onToggleLang}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="สลับภาษา / Toggle Language"
          >
            {lang === 'th' ? '🇹🇭 TH' : '🇺🇸 EN'}
          </button>

          {/* User Profile Trigger */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shadow-sm"
          >
            <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
              {userProfile.name ? userProfile.name.charAt(0) : 'U'}
            </div>
            <span className="hidden sm:inline truncate max-w-[80px]">
              {userProfile.name.split(' ')[0]}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
