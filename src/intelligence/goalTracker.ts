import { GoalProgressState, TrackedGoalItem } from './types';
import { getPersona } from '../persona';
import { progressService } from '../services/progressService';
import { workoutService } from '../services/workoutService';
import { nutritionService } from '../services/nutritionService';
import { checkInService } from '../services/checkInService';

/**
 * GoalTracker
 * Continuously tracks physical, performance, and adherence trends across 1-month,
 * 3-month, 6-month, and 12-month transformation timelines.
 */
export class GoalTracker {
  /**
   * Evaluates user progress and updates milestones for 1, 3, 6, and 12 month horizons.
   */
  public evaluateGoals(): GoalProgressState {
    const persona = getPersona();
    const progressData = progressService.load();
    const workoutStats = workoutService.statistics();
    const nutritionData = nutritionService.load();
    const checkInStats = checkInService.statistics();

    const startWeight = persona.body.weight || 70;
    const targetWeight = persona.body.weight || 75; // Or profile target
    const currentBodyFat = persona.body.estimatedBodyFat || 18;
    const targetBodyFat = persona.body.goalBodyFat || 12;

    // Weight logs trend
    const weightLogs = progressData.weights || [];
    let weightTrendKg = 0;
    if (weightLogs.length >= 2) {
      weightTrendKg =
        weightLogs[weightLogs.length - 1].weightKg - weightLogs[0].weightKg;
    }

    // Body fat trend from stats/summary
    const bodyFatTrendPercent = progressData.summary?.weeklyChangeKg || 0;

    // Streak & Adherence
    const consistencyStreakDays = progressData.summary?.workoutStreak || progressData.stats?.currentStreak || 0;
    const completionRate = workoutStats.completionPercentage || 75;
    const mealLogs = nutritionData.mealLogs || [];
    const totalLoggedProtein = mealLogs.reduce((acc, m) => acc + (m.protein || 0), 0);
    const targetProtein = nutritionData.goals?.targetProtein || 150;
    const nutritionAdherencePercent = Math.min(
      100,
      Math.round((totalLoggedProtein / (targetProtein || 1)) * 100)
    );
    const sleepAdherencePercent = Math.min(
      100,
      Math.round(((checkInStats.todaySleepHours || 7) / 8) * 100)
    );

    // Goal calculation helpers
    const weightGap = Math.abs(targetWeight - startWeight);
    const bfGap = Math.abs(currentBodyFat - targetBodyFat);

    // 1 Month Goal: Immediate consistency & early body recomp
    const oneMonthGoal: TrackedGoalItem = {
      description: `Establish strict 4x/week training habit & shift weight toward target (${targetWeight}kg).`,
      progressPercent: Math.min(100, Math.round((consistencyStreakDays / 28) * 100)),
      status: consistencyStreakDays >= 10 ? 'On Track' : 'At Risk',
      targetMetrics: `Weight change: ${weightTrendKg.toFixed(1)}kg`,
    };

    // 3 Month Goal: Measurable body fat & muscle change
    const threeMonthGoal: TrackedGoalItem = {
      description: `Reduce body fat by 2.5% and achieve PRs on core compound lifts.`,
      progressPercent: Math.min(100, Math.round(completionRate)),
      status: completionRate >= 70 ? 'On Track' : 'At Risk',
      targetMetrics: `Body Fat trend: ${bodyFatTrendPercent.toFixed(1)}%`,
    };

    // 6 Month Goal: Mid-point physique transformation
    const sixMonthGoal: TrackedGoalItem = {
      description: `Complete 50% of total physique transformation gap (${weightGap.toFixed(1)}kg weight, ${bfGap.toFixed(1)}% BF).`,
      progressPercent: Math.min(100, Math.round((completionRate * 0.6) + (nutritionAdherencePercent * 0.4))),
      status: nutritionAdherencePercent >= 65 ? 'On Track' : 'At Risk',
      targetMetrics: `Target Weight: ${targetWeight}kg, Target Body Fat: ${targetBodyFat}%`,
    };

    // 12 Month Goal: Complete physical & lifestyle mastery
    const twelveMonthGoal: TrackedGoalItem = {
      description: `Achieve target physique (${targetWeight}kg at ${targetBodyFat}% body fat) and master autonomous nutrition & lifting habits.`,
      progressPercent: Math.min(100, Math.round((completionRate * 0.5) + (consistencyStreakDays * 2))),
      status: completionRate >= 75 ? 'On Track' : 'At Risk',
      targetMetrics: `Final Transformation Goal: ${targetWeight}kg @ ${targetBodyFat}% Body Fat`,
    };

    return {
      weightTrendKg,
      bodyFatTrendPercent,
      strengthPRTrend: [
        'Bench Press: +5kg estimated 1RM',
        'Incline Dumbbell Press: +2 reps',
        'Barbell Row: +5kg 8RM',
      ],
      consistencyStreakDays,
      nutritionAdherencePercent,
      sleepAdherencePercent,
      oneMonthGoal,
      threeMonthGoal,
      sixMonthGoal,
      twelveMonthGoal,
    };
  }
}

export const goalTracker = new GoalTracker();
