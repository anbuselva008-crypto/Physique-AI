export * from './types';
export { TransformationEngine, transformationEngine } from './transformationEngine';
export { WorkoutPlanner, workoutPlanner } from './workoutPlanner';
export { NutritionPlanner, nutritionPlanner } from './nutritionPlanner';
export { RecoveryPlanner, recoveryPlanner } from './recoveryPlanner';
export { GoalTracker, goalTracker } from './goalTracker';
export { RoadmapPlanner, roadmapPlanner } from './roadmapPlanner';
export { ConfidenceEngine, confidenceEngine } from './confidenceEngine';
export { CoachEngine, coachEngine } from './coachEngine';

import { transformationEngine } from './transformationEngine';
import { workoutPlanner } from './workoutPlanner';
import { nutritionPlanner } from './nutritionPlanner';
import { recoveryPlanner } from './recoveryPlanner';
import { goalTracker } from './goalTracker';
import { roadmapPlanner } from './roadmapPlanner';
import { confidenceEngine } from './confidenceEngine';
import { coachEngine } from './coachEngine';
import { UnifiedTransformationState } from './types';

/**
 * TransformationIntelligenceEngine
 * Central orchestration brain of Physique AI.
 * Runs the full end-to-end transformation intelligence loop continuously updating
 * workout, nutrition, recovery, roadmap, goal tracking, and daily coaching briefing.
 */
export class TransformationIntelligenceEngine {
  /**
   * Executes the full transformation loop and returns a unified state object.
   */
  public runFullTransformationLoop(
    currentWeek: number = 1,
    currentDay: number = 1
  ): UnifiedTransformationState {
    // 1. Analyze current condition & status
    const status = transformationEngine.evaluateStatus();

    // 2. Generate dynamic workout plan
    const workoutPlan = workoutPlanner.generateTodayWorkout(
      status.recoveryScore,
      currentWeek,
      currentDay
    );

    // 3. Generate dynamic nutrition plan
    const mealPlan = nutritionPlanner.generateTodayMealPlan();

    // 4. Generate recovery plan
    const recoveryPlan = recoveryPlanner.generateTodayRecoveryPlan(status.recoveryScore);

    // 5. Evaluate goal tracking
    const goalProgress = goalTracker.evaluateGoals();

    // 6. Generate dynamic transformation roadmap
    const roadmap = roadmapPlanner.generateRoadmap(status, currentWeek);

    // 7. Estimate 1-year goal confidence
    const confidence = confidenceEngine.estimateConfidence(status);

    // 8. Generate daily coaching briefing report
    const coachReport = coachEngine.generateReport(
      status,
      workoutPlan,
      mealPlan,
      recoveryPlan
    );

    return {
      status,
      workoutPlan,
      mealPlan,
      recoveryPlan,
      goalProgress,
      roadmap,
      confidence,
      coachReport,
      lastEvaluatedAt: new Date().toISOString(),
    };
  }
}

export const transformationIntelligenceEngine = new TransformationIntelligenceEngine();
