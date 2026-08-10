import { WorkoutData } from '../types';
import { TODAY_WORKOUT } from '../data/defaultWorkout';

const WORKOUT_STORAGE_KEY = 'physique_ai_current_workout';
const COMPLETED_WORKOUTS_KEY = 'physique_ai_completed_workouts';

export interface WeeklyScheduleItem {
  date: string;
  dayName: string;
  dayNumber: number;
  title: string;
  focus: string;
  durationMinutes: number;
  isRest: boolean;
  isToday: boolean;
  isCompleted: boolean;
  isPast: boolean;
}

export interface CompletedWorkoutRecord extends WorkoutData {
  date: string; // YYYY-MM-DD
  timestamp: number;
  rpe?: number;
  caloriesBurned?: number;
  notes?: string;
  coachNotes?: string[];
  completedSetsCount: number;
  totalSetsCount: number;
  completionPercentage: number;
}

export const workoutService = {
  load(): WorkoutData {
    if (typeof window === 'undefined') return TODAY_WORKOUT;
    try {
      const raw = localStorage.getItem(WORKOUT_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error('Error loading current workout', e);
    }
    return TODAY_WORKOUT;
  },

  save(workout: WorkoutData): WorkoutData {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(WORKOUT_STORAGE_KEY, JSON.stringify(workout));
      } catch (e) {
        console.error('Error saving workout', e);
      }
    }
    return workout;
  },

  update(exerciseIndex: number, setIndex: number): WorkoutData {
    const currentWorkout = this.load();
    const updatedExercises = currentWorkout.exercises.map((ex, exIdx) => {
      if (exIdx !== exerciseIndex) return ex;
      const updatedSets = ex.sets.map((s, sIdx) => {
        if (sIdx !== setIndex) return s;
        return { ...s, completed: !s.completed };
      });
      return { ...ex, sets: updatedSets };
    });

    const updatedWorkout: WorkoutData = {
      ...currentWorkout,
      exercises: updatedExercises,
    };

    return this.save(updatedWorkout);
  },

  delete(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(WORKOUT_STORAGE_KEY);
      } catch (e) {
        console.error('Error resetting workout', e);
      }
    }
  },

  statistics() {
    const workout = this.load();
    const totalExercises = workout.exercises.length;
    let completedSets = 0;
    let totalSets = 0;

    workout.exercises.forEach((ex) => {
      ex.sets.forEach((s) => {
        totalSets++;
        if (s.completed) completedSets++;
      });
    });

    const completionPercentage = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

    return {
      workoutTitle: workout.title,
      durationMinutes: workout.durationMinutes,
      totalExercises,
      totalSets,
      completedSets,
      completionPercentage,
    };
  },

  // Domain Methods
  getTodayWorkout(): WorkoutData {
    return this.load();
  },

  getCompletedWorkouts(): CompletedWorkoutRecord[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(COMPLETED_WORKOUTS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error('Error loading completed workouts history', e);
    }
    return [];
  },

  getWorkoutForDate(dateStr: string): CompletedWorkoutRecord | null {
    const history = this.getCompletedWorkouts();
    return history.find((w) => w.date === dateStr) || null;
  },

  saveCompletedWorkout(workout: WorkoutData, meta?: { rpe?: number; notes?: string; caloriesBurned?: number }): void {
    if (typeof window === 'undefined') return;
    try {
      const history = this.getCompletedWorkouts();
      const todayStr = new Date().toISOString().split('T')[0];

      let completedSets = 0;
      let totalSets = 0;
      workout.exercises.forEach((ex) => {
        ex.sets.forEach((s) => {
          totalSets++;
          if (s.completed) completedSets++;
        });
      });

      const record: CompletedWorkoutRecord = {
        ...workout,
        id: `completed-${Date.now()}`,
        date: todayStr,
        timestamp: Date.now(),
        rpe: meta?.rpe || 8.5,
        caloriesBurned: meta?.caloriesBurned || Math.round((workout.durationMinutes || 45) * 8.5),
        notes: meta?.notes || 'Solid session execution.',
        coachNotes: [
          'High progressive overload tension achieved.',
          'Great tempo control across compound working sets.',
        ],
        completedSetsCount: completedSets,
        totalSetsCount: totalSets,
        completionPercentage: totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 100,
      };

      // Filter out existing record for today if re-saving
      const filtered = history.filter((w) => w.date !== todayStr);
      filtered.push(record);

      localStorage.setItem(COMPLETED_WORKOUTS_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.error('Error saving completed workout to history', e);
    }
  },

  getTomorrowWorkout(): {
    title: string;
    focus: string;
    durationMinutes: number;
    recoveryRequired: string;
    equipment: string;
    coachFocus: string;
  } {
    const today = this.load();
    const isPush = today.title.toLowerCase().includes('chest') || today.title.toLowerCase().includes('push');

    if (isPush) {
      return {
        title: 'Back + Biceps (Pull Hypertrophy)',
        focus: 'Lat Width & Upper Back Density',
        durationMinutes: 50,
        recoveryRequired: 'Normal',
        equipment: 'Barbell, Cable & Dumbbell',
        coachFocus: 'Improve Pull-Up & Row Strength with 3s eccentric control',
      };
    }

    return {
      title: 'Legs + Core (Lower Strength)',
      focus: 'Quad Overload & Posterior Chain',
      durationMinutes: 55,
      recoveryRequired: 'High',
      equipment: 'Squat Rack & Leg Press',
      coachFocus: 'Focus on full depth and hamstring tension',
    };
  },

  getWeeklySchedule() {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const todayIndex = now.getDay();

    const splits = [
      { title: 'Chest + Triceps', focus: 'Push Strength', duration: 45, isRest: false },
      { title: 'Back + Biceps', focus: 'Pull Width', duration: 50, isRest: false },
      { title: 'Legs + Abs', focus: 'Lower Hypertrophy', duration: 55, isRest: false },
      { title: 'Active Recovery', focus: 'CNS Mobility & Foam Roll', duration: 25, isRest: true },
      { title: 'Shoulders + Arms', focus: 'Deltoid Density', duration: 45, isRest: false },
      { title: 'Upper Body Overload', focus: 'Compound Overload', duration: 50, isRest: false },
      { title: 'Rest & Restoration', focus: 'Full CNS Reset', duration: 0, isRest: true },
    ];

    const history = this.getCompletedWorkouts();
    const historyDates = new Set(history.map((h) => h.date));

    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - todayIndex + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = daysOfWeek[d.getDay()];
      const isToday = d.toDateString() === now.toDateString();

      const split = splits[i % splits.length];
      const isCompleted = historyDates.has(dateStr);

      return {
        date: dateStr,
        dayName,
        dayNumber: d.getDate(),
        title: split.title,
        focus: split.focus,
        durationMinutes: split.duration,
        isRest: split.isRest,
        isToday,
        isCompleted,
        isPast: d < now && !isToday,
      };
    });
  },
};
