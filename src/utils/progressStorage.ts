import {
  WeightEntry,
  BodyMeasurements,
  ProgressPhoto,
  ExercisePR,
  ProgressStats,
  ProgressSummary,
} from '../types';

const WEIGHT_KEY = 'physique_ai_weight_history';
const MEASUREMENTS_KEY = 'physique_ai_measurements';
const PHOTOS_KEY = 'physique_ai_photos';
const PRS_KEY = 'physique_ai_prs';

// Helper to format YYYY-MM-DD
export const getFormattedDate = (offsetDays: number = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Seed initial default weight data
const DEFAULT_WEIGHTS: WeightEntry[] = [
  { date: getFormattedDate(28), weightKg: 70.5, note: 'Initial weigh-in' },
  { date: getFormattedDate(21), weightKg: 69.8 },
  { date: getFormattedDate(14), weightKg: 69.2 },
  { date: getFormattedDate(7), weightKg: 68.6 },
  { date: getFormattedDate(0), weightKg: 68.0, note: 'Morning weigh-in' },
];

const DEFAULT_MEASUREMENTS: BodyMeasurements[] = [
  {
    id: 'm-1',
    date: getFormattedDate(28),
    chestCm: 98,
    waistCm: 82,
    shouldersCm: 114,
    armsCm: 35,
    forearmsCm: 29,
    thighsCm: 56,
    calvesCm: 37,
    neckCm: 38,
    hipCm: 92,
  },
  {
    id: 'm-2',
    date: getFormattedDate(0),
    chestCm: 100,
    waistCm: 80,
    shouldersCm: 116,
    armsCm: 36,
    forearmsCm: 30,
    thighsCm: 57,
    calvesCm: 37.5,
    neckCm: 38,
    hipCm: 91,
  },
];

const DEFAULT_PRS: ExercisePR[] = [
  {
    id: 'pr-1',
    exerciseName: 'Bench Press',
    currentPRWeightKg: 85,
    previousPRWeightKg: 80,
    reps: 5,
    date: getFormattedDate(5),
  },
  {
    id: 'pr-2',
    exerciseName: 'Squat',
    currentPRWeightKg: 110,
    previousPRWeightKg: 100,
    reps: 5,
    date: getFormattedDate(12),
  },
  {
    id: 'pr-3',
    exerciseName: 'Deadlift',
    currentPRWeightKg: 135,
    previousPRWeightKg: 125,
    reps: 3,
    date: getFormattedDate(8),
  },
  {
    id: 'pr-4',
    exerciseName: 'Shoulder Press',
    currentPRWeightKg: 55,
    previousPRWeightKg: 50,
    reps: 6,
    date: getFormattedDate(3),
  },
  {
    id: 'pr-5',
    exerciseName: 'Pull-up',
    currentPRWeightKg: 15, // bodyweight + 15kg
    previousPRWeightKg: 10,
    reps: 8,
    date: getFormattedDate(15),
  },
];

// --- Weight Storage ---
export const getWeightHistory = (): WeightEntry[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(WEIGHT_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading weight history', err);
  }
  return [];
};

export const addWeightEntry = (entry: WeightEntry): WeightEntry[] => {
  const history = getWeightHistory();
  // Filter out any entry for same date to replace or update
  const filtered = history.filter((e) => e.date !== entry.date);
  const updated = [...filtered, entry].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  if (typeof window !== 'undefined') {
    localStorage.setItem(WEIGHT_KEY, JSON.stringify(updated));
  }
  return updated;
};

// --- Body Measurements Storage ---
export const getMeasurements = (): BodyMeasurements[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MEASUREMENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading measurements', err);
  }
  return [];
};

export const addMeasurementEntry = (entry: Omit<BodyMeasurements, 'id'>): BodyMeasurements[] => {
  const list = getMeasurements();
  const newRecord: BodyMeasurements = {
    ...entry,
    id: `m-${Date.now()}`,
  };
  const updated = [newRecord, ...list];
  if (typeof window !== 'undefined') {
    localStorage.setItem(MEASUREMENTS_KEY, JSON.stringify(updated));
  }
  return updated;
};

// --- Progress Photos Storage ---
export const getProgressPhotos = (): ProgressPhoto[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PHOTOS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading progress photos', err);
  }
  return [];
};

export const addProgressPhoto = (photo: Omit<ProgressPhoto, 'id'>): ProgressPhoto[] => {
  const photos = getProgressPhotos();
  const newPhoto: ProgressPhoto = {
    ...photo,
    id: `photo-${Date.now()}`,
  };
  const updated = [newPhoto, ...photos];
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(PHOTOS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Storage quota exceeded for photos base64 in LocalStorage', e);
    }
  }
  return updated;
};

export const deleteProgressPhoto = (id: string): ProgressPhoto[] => {
  const photos = getProgressPhotos().filter((p) => p.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(PHOTOS_KEY, JSON.stringify(photos));
  }
  return photos;
};

// --- Strength PRs Storage ---
export const getPRs = (): ExercisePR[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PRS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading PRs', err);
  }
  return [];
};

export const addOrUpdatePR = (
  exerciseName: string,
  newWeightKg: number,
  reps: number,
  date: string = getFormattedDate(0)
): ExercisePR[] => {
  const prs = getPRs();
  const existingIndex = prs.findIndex(
    (p) => p.exerciseName.toLowerCase() === exerciseName.toLowerCase()
  );

  let updated: ExercisePR[];
  if (existingIndex >= 0) {
    const existing = prs[existingIndex];
    const updatedPR: ExercisePR = {
      ...existing,
      previousPRWeightKg: existing.currentPRWeightKg,
      currentPRWeightKg: newWeightKg,
      reps,
      date,
    };
    updated = [...prs];
    updated[existingIndex] = updatedPR;
  } else {
    const newPR: ExercisePR = {
      id: `pr-${Date.now()}`,
      exerciseName,
      currentPRWeightKg: newWeightKg,
      previousPRWeightKg: 0,
      reps,
      date,
    };
    updated = [newPR, ...prs];
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(PRS_KEY, JSON.stringify(updated));
  }
  return updated;
};

// --- Computed Stats & Summary ---
export const getProgressStats = (): ProgressStats => {
  const weights = getWeightHistory();
  const avgWeight = weights.length
    ? +(weights.reduce((sum, w) => sum + w.weightKg, 0) / weights.length).toFixed(1)
    : 0;

  // Completed workouts count
  let completedWorkouts = 0;
  let workoutDays = 0;
  if (typeof window !== 'undefined') {
    try {
      const rawComp = localStorage.getItem('physique_ai_completed_workouts');
      if (rawComp) {
        const history: any[] = JSON.parse(rawComp);
        completedWorkouts = history.length;
        const uniqueDates = new Set(history.map((h) => h.date || getFormattedDate(0)));
        workoutDays = uniqueDates.size;
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Calculate check-in averages if available
  let avgSleep = 0;
  let avgEnergy = 0;
  if (typeof window !== 'undefined') {
    try {
      const rawCheck = localStorage.getItem('physique_ai_today_checkin');
      if (rawCheck) {
        const checkin = JSON.parse(rawCheck);
        if (checkin.sleepHours) avgSleep = checkin.sleepHours;
        if (checkin.energyLevel) avgEnergy = checkin.energyLevel;
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Calculate water average if available
  let avgWater = 0;
  if (typeof window !== 'undefined') {
    try {
      const rawWater = localStorage.getItem('physique_ai_water_logs');
      if (rawWater) {
        const logs: Record<string, { ml: number }> = JSON.parse(rawWater);
        const entries = Object.values(logs);
        if (entries.length > 0) {
          const totalMl = entries.reduce((s, e) => s + (e.ml || 0), 0);
          avgWater = +(totalMl / entries.length / 1000).toFixed(1);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  const streak = completedWorkouts > 0 ? Math.min(completedWorkouts, 30) : 0;

  return {
    workoutDays,
    currentStreak: streak,
    longestStreak: streak,
    completedWorkouts,
    avgSleep,
    avgWater,
    avgEnergy,
    avgWeight,
  };
};

export const getProgressSummary = (): ProgressSummary => {
  const weights = getWeightHistory();
  const prs = getPRs();

  const currentWeight = weights.length ? weights[weights.length - 1].weightKg : 0;
  const previousWeight = weights.length >= 2 ? weights[weights.length - 2].weightKg : currentWeight;
  const weeklyChangeKg = currentWeight && previousWeight ? +(currentWeight - previousWeight).toFixed(1) : 0;

  // Latest PR
  const latestPRRecord = prs.length
    ? prs.reduce((prev, curr) => (new Date(curr.date) > new Date(prev.date) ? curr : prev))
    : undefined;

  let lastWorkoutDate = 'No workouts yet';
  let workoutStreak = 0;
  if (typeof window !== 'undefined') {
    try {
      const rawComp = localStorage.getItem('physique_ai_completed_workouts');
      if (rawComp) {
        const history: any[] = JSON.parse(rawComp);
        if (history.length > 0) {
          lastWorkoutDate = 'Today';
          workoutStreak = history.length;
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  return {
    currentWeightKg: currentWeight,
    weeklyChangeKg,
    workoutStreak,
    lastWorkoutDate,
    latestPR: latestPRRecord
      ? {
          exerciseName: latestPRRecord.exerciseName,
          weightKg: latestPRRecord.currentPRWeightKg,
          reps: latestPRRecord.reps,
          improvementKg: latestPRRecord.currentPRWeightKg - latestPRRecord.previousPRWeightKg,
        }
      : undefined,
  };
};
