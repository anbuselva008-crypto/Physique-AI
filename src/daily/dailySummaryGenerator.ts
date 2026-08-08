import { DailySummary } from './types';
import { UnifiedTransformationState } from '../intelligence/types';
import { DailyMission } from './types';

/**
 * DailySummaryGenerator
 * Consolidates intelligence state into a high-level briefing report for the user.
 */
export class DailySummaryGenerator {
  /**
   * Generates a comprehensive summary report for today's plan.
   */
  public generateSummary(
    intelligenceState: UnifiedTransformationState,
    mission: DailyMission
  ): DailySummary {
    const { status, workoutPlan, mealPlan, recoveryPlan, coachReport } = intelligenceState;

    const estimatedMins = workoutPlan.estimatedDurationMins;
    const nowHours = new Date().getHours();
    const targetEndHour = Math.min(22, nowHours + 2);
    const expectedCompletionTime = `${targetEndHour > 12 ? targetEndHour - 12 : targetEndHour}:00 ${targetEndHour >= 12 ? 'PM' : 'AM'}`;

    return {
      goodMorningMessage: coachReport.goodMorningGreeting,
      recoveryScore: status.recoveryScore,
      transformationStage: status.currentStage,
      workoutSummary: {
        sessionType: workoutPlan.sessionType,
        targetFocus: workoutPlan.targetFocus,
        exerciseCount: workoutPlan.exercises.length,
        estimatedDurationMins: estimatedMins,
      },
      nutritionSummary: {
        totalCalories: mealPlan.totalCalories,
        totalProtein: mealPlan.totalProtein,
        totalCarbs: mealPlan.totalCarbs,
        totalFats: mealPlan.totalFats,
        waterTargetLiters: mealPlan.hydrationTargetLiters,
      },
      recoverySummary: {
        sleepTargetHours: recoveryPlan.sleepTargetHours,
        recoveryAdvice: recoveryPlan.recoveryAdvice,
      },
      dailyStepGoal: 10000,
      motivationQuote: coachReport.quote,
      todayMissionText: mission.title,
      estimatedWorkoutDurationMins: estimatedMins,
      expectedCompletionTime,
      warnings: coachReport.warnings,
      recoveryNotes: [
        ...recoveryPlan.recoveryAdvice,
        ...recoveryPlan.stressMitigationTips,
      ],
    };
  }
}

export const dailySummaryGenerator = new DailySummaryGenerator();
