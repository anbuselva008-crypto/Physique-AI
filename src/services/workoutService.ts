import { WorkoutData } from '../types';
import { TODAY_WORKOUT } from '../data/defaultWorkout';

const WORKOUT_STORAGE_KEY = 'physique_ai_current_workout';
const COMPLETED_WORKOUTS_KEY = 'physique_ai_completed_workouts';

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

  saveCompletedWorkout(workout: WorkoutData): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(COMPLETED_WORKOUTS_KEY);
      const history: WorkoutData[] = raw ? JSON.parse(raw) : [];
      history.push({ ...workout, id: `completed-${Date.now()}` });
      localStorage.setItem(COMPLETED_WORKOUTS_KEY, JSON.stringify(history));
    } catch (e) {
      console.error('Error saving completed workout to history', e);
    }
  },
};
