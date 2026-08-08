import { CheckIn } from '../types';

const STORAGE_KEY_PREFIX = 'physique_ai_checkin_';

export const getTodayDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTodayCheckIn = (): CheckIn | null => {
  const today = getTodayDateString();
  return getCheckInForDate(today);
};

export const getCheckInForDate = (dateStr: string): CheckIn | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${dateStr}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading check-in from localStorage:', err);
  }
  return null;
};

export const saveTodayCheckIn = (checkIn: Omit<CheckIn, 'date' | 'timestamp'>): CheckIn => {
  const today = getTodayDateString();
  const fullRecord: CheckIn = {
    ...checkIn,
    date: today,
    timestamp: Date.now(),
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${today}`, JSON.stringify(fullRecord));
    } catch (err) {
      console.error('Error saving check-in to localStorage:', err);
    }
  }

  return fullRecord;
};

export const hasCompletedTodayCheckIn = (): boolean => {
  return getTodayCheckIn() !== null;
};
