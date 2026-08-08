import { CheckIn } from '../types';
import {
  getTodayCheckIn,
  getCheckInForDate,
  saveTodayCheckIn,
  hasCompletedTodayCheckIn,
  getTodayDateString,
} from '../utils/checkInStorage';

export const checkInService = {
  load(date?: string): CheckIn | null {
    if (date) {
      return getCheckInForDate(date);
    }
    return getTodayCheckIn();
  },

  save(checkIn: Omit<CheckIn, 'date' | 'timestamp'>): CheckIn {
    return saveTodayCheckIn(checkIn);
  },

  update(checkInPartial: Partial<CheckIn>): CheckIn {
    const today = getTodayDateString();
    const existing = getCheckInForDate(today);
    const checkInToSave: Omit<CheckIn, 'date' | 'timestamp'> = {
      mood: checkInPartial.mood || existing?.mood || 'Good 🙂',
      sleepHours: checkInPartial.sleepHours ?? existing?.sleepHours ?? 7.5,
      weightKg: checkInPartial.weightKg ?? existing?.weightKg ?? 68,
      energyLevel: checkInPartial.energyLevel ?? existing?.energyLevel ?? 7,
      soreness: checkInPartial.soreness || existing?.soreness || 'None',
      waterAfterWaking: checkInPartial.waterAfterWaking ?? existing?.waterAfterWaking ?? true,
      painNotes: checkInPartial.painNotes ?? existing?.painNotes,
    };
    return saveTodayCheckIn(checkInToSave);
  },

  delete(dateStr?: string): void {
    const targetDate = dateStr || getTodayDateString();
    const key = `physique_ai_checkin_${targetDate}`;
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error('Error deleting check-in', e);
      }
    }
  },

  statistics() {
    const todayCheckIn = getTodayCheckIn();
    return {
      hasCheckedInToday: hasCompletedTodayCheckIn(),
      todayMood: todayCheckIn?.mood || null,
      todaySleepHours: todayCheckIn?.sleepHours || null,
      todayEnergyLevel: todayCheckIn?.energyLevel || null,
      todaySoreness: todayCheckIn?.soreness || null,
    };
  },

  // Additional Domain Methods
  getTodayCheckIn(): CheckIn | null {
    return getTodayCheckIn();
  },

  getCheckInForDate(dateStr: string): CheckIn | null {
    return getCheckInForDate(dateStr);
  },

  saveTodayCheckIn(checkIn: Omit<CheckIn, 'date' | 'timestamp'>): CheckIn {
    return saveTodayCheckIn(checkIn);
  },

  hasCompletedTodayCheckIn(): boolean {
    return hasCompletedTodayCheckIn();
  },
};
