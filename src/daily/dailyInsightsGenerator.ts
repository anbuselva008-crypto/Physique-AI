import { DailyInsight, DailyInsights } from './types';
import { UnifiedTransformationState } from '../intelligence/types';
import { checkInService } from '../services/checkInService';
import { nutritionService } from '../services/nutritionService';
import { workoutService } from '../services/workoutService';
import { progressService } from '../services/progressService';

/**
 * DailyInsightsGenerator
 * Analyzes multi-day trends across workouts, nutrition, check-ins, and body composition
 * to generate actionable intelligence cards.
 */
export class DailyInsightsGenerator {
  /**
   * Generates actionable insights derived from current intelligence state and historical records.
   */
  public generateInsights(
    intelligenceState: UnifiedTransformationState
  ): DailyInsights {
    const { status, mealPlan } = intelligenceState;

    const checkInStats = checkInService.statistics();
    const nutritionData = nutritionService.load();
    const workoutStats = workoutService.statistics();
    const progressData = progressService.load();

    const insights: DailyInsight[] = [];

    // 1. Protein trend insight
    const mealLogs = nutritionData.mealLogs || [];
    const totalProtein = mealLogs.reduce((acc, m) => acc + (m.protein || 0), 0);
    if (totalProtein < mealPlan.totalProtein * 0.75) {
      insights.push({
        id: 'ins-protein-low',
        type: 'warning',
        title: 'Protein Intake Below Target',
        message: `Your current logged protein is ${totalProtein}g vs target ${mealPlan.totalProtein}g.`,
        metric: `${totalProtein}/${mealPlan.totalProtein}g`,
        actionableAdvice: 'Add a high-protein snack like Greek yogurt, boiled eggs, or a whey scoop before bed.',
      });
    } else {
      insights.push({
        id: 'ins-protein-good',
        type: 'positive',
        title: 'Protein Target On Track',
        message: 'Your high protein consistency is accelerating muscle protein synthesis.',
        metric: `${totalProtein}g protein`,
        actionableAdvice: 'Keep maintaining 4-5 protein feedings throughout the day.',
      });
    }

    // 2. Recovery / Sleep insight
    const sleepHours = checkInStats.todaySleepHours || 7.5;
    if (status.recoveryScore < 50 || sleepHours < 6.5) {
      insights.push({
        id: 'ins-recovery-poor',
        type: 'critical',
        title: 'Recovery Score Deficit',
        message: `Recovery score is ${status.recoveryScore}/100 with ${sleepHours}h sleep.`,
        metric: `${status.recoveryScore}/100 Recovery`,
        actionableAdvice: 'Prioritize an early bedtime tonight and consider taking a 20-minute power nap midday.',
      });
    } else {
      insights.push({
        id: 'ins-sleep-improving',
        type: 'positive',
        title: 'Sleep & Recovery Improving',
        message: `Sleep average is ${sleepHours}h with a solid ${status.recoveryScore}/100 recovery score.`,
        metric: `${sleepHours}h Sleep`,
        actionableAdvice: 'Maintain your current bedtime wind-down routine.',
      });
    }

    // 3. Workout Consistency insight
    const workoutCompletion = workoutStats.completionPercentage || 75;
    if (workoutCompletion >= 80) {
      insights.push({
        id: 'ins-workout-excellent',
        type: 'positive',
        title: 'Workout Consistency Excellent',
        message: `Workout completion rate is at ${workoutCompletion.toFixed(0)}%.`,
        metric: `${workoutCompletion.toFixed(0)}% Completion`,
        actionableAdvice: 'You are building exceptional physical momentum. Keep hitting working sets with intent.',
      });
    } else {
      insights.push({
        id: 'ins-workout-warning',
        type: 'warning',
        title: 'Workout Adherence Gap',
        message: `Workout completion is currently at ${workoutCompletion.toFixed(0)}%.`,
        metric: `${workoutCompletion.toFixed(0)}% Completion`,
        actionableAdvice: 'Focus on hitting at least 3-4 structured gym sessions per week.',
      });
    }

    // 4. Hydration trend
    const waterLog = nutritionData.waterLog;
    const waterMl = waterLog?.ml || 0;
    if (waterMl < 2000) {
      insights.push({
        id: 'ins-water-decreasing',
        type: 'warning',
        title: 'Hydration Decreasing',
        message: `Logged water is ${waterMl / 1000}L vs ${mealPlan.hydrationTargetLiters}L daily target.`,
        metric: `${(waterMl / 1000).toFixed(1)}L / ${mealPlan.hydrationTargetLiters}L`,
        actionableAdvice: 'Keep a 1L water bottle at your desk and sip consistently every hour.',
      });
    }

    // 5. Weight & Waist trend
    const weights = progressData.weights || [];
    if (weights.length >= 2) {
      const diff = weights[weights.length - 1].weightKg - weights[0].weightKg;
      if (Math.abs(diff) < 0.3) {
        insights.push({
          id: 'ins-weight-stable',
          type: 'info',
          title: 'Weight Trend Stable',
          message: 'Body weight variance is under 0.3kg, indicating steady metabolic equilibrium.',
          metric: `${weights[weights.length - 1].weightKg.toFixed(1)} kg`,
          actionableAdvice: 'If recomposition is the goal, steady weight with strength gains means muscle hypertrophy.',
        });
      }
    }

    const topPriorityInsight =
      insights.find((i) => i.type === 'critical') ||
      insights.find((i) => i.type === 'warning') ||
      insights[0] ||
      null;

    return {
      insights,
      topPriorityInsight,
      generatedAt: new Date().toISOString(),
    };
  }
}

export const dailyInsightsGenerator = new DailyInsightsGenerator();
