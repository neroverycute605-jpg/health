import React, { useState } from 'react';
import { X, User, Heart, Thermometer, Save, Scale } from 'lucide-react';
import { UserProfile, Language } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  lang: Language;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
  lang,
}) => {
  const [profile, setProfile] = useState<UserProfile>(userProfile);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-base">
              {lang === 'th' ? 'ข้อมูลสุขภาพส่วนบุคคล' : 'Health Profile Settings'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs text-slate-300">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">
              {lang === 'th' ? 'ชื่อ-นามสกุล / ชื่อเรียก:' : 'Name:'}
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">
                {lang === 'th' ? 'อายุ (ปี):' : 'Age:'}
              </label>
              <input
                type="number"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 25 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">
                {lang === 'th' ? 'เพศ:' : 'Gender:'}
              </label>
              <select
                value={profile.gender}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    gender: e.target.value as 'male' | 'female' | 'other',
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="male">ชาย (Male)</option>
                <option value="female">หญิง (Female)</option>
                <option value="other">อื่นๆ (Other)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">
                {lang === 'th' ? 'น้ำหนัก (กก.):' : 'Weight (kg):'}
              </label>
              <input
                type="number"
                value={profile.weight}
                onChange={(e) =>
                  setProfile({ ...profile, weight: parseFloat(e.target.value) || 60 })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">
                {lang === 'th' ? 'ส่วนสูง (ซม.):' : 'Height (cm):'}
              </label>
              <input
                type="number"
                value={profile.height}
                onChange={(e) =>
                  setProfile({ ...profile, height: parseFloat(e.target.value) || 170 })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">
              {lang === 'th' ? 'ประวัติโรคประจำตัว / ข้อควรระวัง:' : 'Medical Conditions / Notes:'}
            </label>
            <textarea
              rows={2}
              value={profile.medicalNotes || ''}
              onChange={(e) => setProfile({ ...profile, medicalNotes: e.target.value })}
              placeholder={
                lang === 'th'
                  ? 'เช่น ความดันโลหิตสูง, โรคหอบหืด...'
                  : 'e.g., Hypertension, asthma...'
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition"
          >
            <Save className="w-4 h-4" />
            <span>{lang === 'th' ? 'บันทึกข้อมูลส่วนตัว' : 'Save Profile Changes'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
