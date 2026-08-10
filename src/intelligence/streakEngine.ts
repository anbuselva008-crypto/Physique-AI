import { workoutService } from '../services/workoutService';
import { checkInService } from '../services/checkInService';
import { nutritionService } from '../services/nutritionService';

export interface StreakMetrics {
  currentStreak: number;
  longestStreak: number;
  weeklyCompletionRate: number; // percentage 0-100
  monthlyCompletionRate: number; // percentage 0-100
  workoutCompletionRate: number; // percentage 0-100
  exerciseCompletionRate: number; // percentage 0-100
  missedDaysThisMonth: number;
  hydrationStreak: number;
  sleepStreak: number;
  perfectWeeksCount: number;
  perfectMonthsCount: number;
}

export const streakEngine = {
  calculateMetrics(): StreakMetrics {
    const history = workoutService.getCompletedWorkouts();
    const todayStr = new Date().toISOString().split('T')[0];

    // Map of dates with completed workouts
    const completedDates = new Set<string>();
    let totalCompletedExercises = 0;
    let totalTargetExercises = 0;

    history.forEach((w) => {
      const date = w.date || todayStr;
      completedDates.add(date);

      if (w.exercises) {
        w.exercises.forEach((ex) => {
          totalTargetExercises++;
          if (ex.sets && ex.sets.every((s) => s.completed)) {
            totalCompletedExercises++;
          }
        });
      }
    });

    // Calculate current & longest streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const daysToCheck = 60;
    const now = new Date();

    for (let i = daysToCheck; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      if (completedDates.has(dateStr)) {
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        // If it's today and not completed yet, don't reset current streak from yesterday
        if (i === 0) {
          // today not finished yet
        } else {
          tempStreak = 0;
        }
      }
    }

    currentStreak = tempStreak;

    // Calculate last 7 days completion rate
    let completedLast7 = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      if (completedDates.has(dateStr)) completedLast7++;
    }
    const weeklyCompletionRate = Math.min(100, Math.round((completedLast7 / 5) * 100)); // Target 5 workouts/week

    // Calculate last 30 days
    let completedLast30 = 0;
    let missedLast30 = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      if (completedDates.has(dateStr)) {
        completedLast30++;
      } else if (i > 0) {
        // missed day
        missedLast30++;
      }
    }
    const monthlyCompletionRate = Math.min(100, Math.round((completedLast30 / 20) * 100)); // Target 20 workouts/month

    const workoutCompletionRate = history.length > 0 ? Math.round((completedLast30 / Math.max(1, history.length)) * 100) : 0;
    const exerciseCompletionRate = totalTargetExercises > 0
      ? Math.round((totalCompletedExercises / totalTargetExercises) * 100)
      : 100;

    // Hydration Streak (days meeting > 2000ml)
    let hydrationStreak = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const log = nutritionService.getWaterForDate(dateStr);
      if (log && log.ml >= 2000) {
        hydrationStreak++;
      } else if (i > 0) {
        break;
      }
    }

    // Sleep Streak (days sleep >= 7h)
    let sleepStreak = 0;
    const checkIn = checkInService.load();
    if (checkIn && checkIn.sleepHours >= 7) {
      sleepStreak = 1;
    }

    const perfectWeeksCount = Math.floor(completedLast30 / 5);
    const perfectMonthsCount = completedLast30 >= 20 ? 1 : 0;

    return {
      currentStreak,
      longestStreak: Math.max(currentStreak, longestStreak),
      weeklyCompletionRate,
      monthlyCompletionRate,
      workoutCompletionRate,
      exerciseCompletionRate,
      missedDaysThisMonth: Math.max(0, 20 - completedLast30),
      hydrationStreak,
      sleepStreak,
      perfectWeeksCount,
      perfectMonthsCount,
    };
  },
};
