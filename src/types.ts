export type ActivityState = 'resting' | 'post_workout' | 'feeling_unwell' | 'morning' | 'night';

export type StressLevel = 'low' | 'moderate' | 'high';

export interface MeasurementRecord {
  id: string;
  timestamp: string; // ISO String
  bpm: number;
  temperature: number; // in Celsius
  activityState: ActivityState;
  notes?: string;
  stressLevel: StressLevel;
  signalQuality?: number; // 0-100%
  symptoms?: string[];
}

export interface UserProfile {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  weight: number; // kg
  height: number; // cm
  targetRestingBpm: number;
  baselineTemp: number; // 36.5
  medicalNotes?: string;
}

export interface AIAnalysisResult {
  overallAssessment: string;
  statusLevel: 'normal' | 'warning' | 'alert';
  heartRateAnalysis: string;
  temperatureAnalysis: string;
  stressAndHrvIndex: string;
  recommendations: string[];
  emergencyAdvice?: string | null;
  detailedExplanation: string;
}

export interface PPGPoint {
  time: number;
  val: number;
  isPeak: boolean;
}

export type HealthTab = 'scan' | 'temp' | 'ai' | 'dashboard' | 'breathing' | 'settings';

export type Language = 'th' | 'en';
