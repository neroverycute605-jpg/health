import { MeasurementRecord, UserProfile } from '../types';

const STORAGE_KEY_LOGS = 'pulsetemp_health_logs_v1';
const STORAGE_KEY_PROFILE = 'pulsetemp_user_profile_v1';

export const defaultUserProfile: UserProfile = {
  name: 'สมชาย สุขภาพดี',
  age: 32,
  gender: 'male',
  weight: 68,
  height: 172,
  targetRestingBpm: 68,
  baselineTemp: 36.6,
  medicalNotes: 'สุขภาพแข็งแรง ออกกำลังกายสัปดาห์ละ 3 วัน',
};

const defaultInitialLogs: MeasurementRecord[] = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 6 * 86400000).toISOString(),
    bpm: 72,
    temperature: 36.5,
    activityState: 'resting',
    notes: 'ตื่นนอนตอนเช้า รู้สึกสดชื่น',
    stressLevel: 'low',
    signalQuality: 95,
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
    bpm: 118,
    temperature: 36.8,
    activityState: 'post_workout',
    notes: 'หลังวิ่งออกกำลังกายเย็น 30 นาที',
    stressLevel: 'moderate',
    signalQuality: 92,
  },
  {
    id: 'log-3',
    timestamp: new Date(Date.now() - 4 * 86400000).toISOString(),
    bpm: 78,
    temperature: 37.4,
    activityState: 'feeling_unwell',
    notes: 'เริ่มมีอาการครั่นเนื้อครั่นตัว ปวดหัวเล็กน้อย',
    stressLevel: 'high',
    signalQuality: 88,
    symptoms: ['ปวดหัว', 'ครั่นเนื้อครั่นตัว'],
  },
  {
    id: 'log-4',
    timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
    bpm: 84,
    temperature: 37.8,
    activityState: 'feeling_unwell',
    notes: 'ไข้ต่ำๆ ทานยาพาราเซตามอลแล้วพักผ่อน',
    stressLevel: 'high',
    signalQuality: 90,
    symptoms: ['มีไข้', 'อ่อนเพลีย'],
  },
  {
    id: 'log-5',
    timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
    bpm: 70,
    temperature: 36.7,
    activityState: 'resting',
    notes: 'ไข้ลดแล้ว รู้สึกดีขึ้นมาก',
    stressLevel: 'low',
    signalQuality: 96,
  },
  {
    id: 'log-6',
    timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
    bpm: 68,
    temperature: 36.6,
    activityState: 'morning',
    notes: 'วัดตอนเช้า ร่างกายเป็นปกติ',
    stressLevel: 'low',
    signalQuality: 98,
  },
];

export function getStoredLogs(): MeasurementRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(defaultInitialLogs));
      return defaultInitialLogs;
    }
    return JSON.parse(raw);
  } catch {
    return defaultInitialLogs;
  }
}

export function saveLogRecord(record: MeasurementRecord): MeasurementRecord[] {
  const current = getStoredLogs();
  const updated = [record, ...current];
  try {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save log to localStorage:', e);
  }
  return updated;
}

export function deleteLogRecord(id: string): MeasurementRecord[] {
  const current = getStoredLogs();
  const updated = current.filter((r) => r.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete log from localStorage:', e);
  }
  return updated;
}

export function getUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(defaultUserProfile));
      return defaultUserProfile;
    }
    return JSON.parse(raw);
  } catch {
    return defaultUserProfile;
  }
}

export function saveUserProfile(profile: UserProfile): UserProfile {
  try {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save user profile:', e);
  }
  return profile;
}
