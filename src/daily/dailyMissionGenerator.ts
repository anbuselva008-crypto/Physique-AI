import { DailyMission } from './types';
import { UnifiedTransformationState } from '../intelligence/types';

/**
 * DailyMissionGenerator
 * Creates today's singular, high-impact focus mission tailored to current recovery,
 * training goals, and nutrition targets.
 */
export class DailyMissionGenerator {
  /**
   * Generates today's singular focus mission based on current intelligence state.
   */
  public generateMission(intelligenceState: UnifiedTransformationState): DailyMission {
    const { status, workoutPlan, mealPlan } = intelligenceState;

    if (workoutPlan.sessionType === 'Rest Day' || status.recoveryScore < 40) {
      return {
        id: 'mission-rest-01',
        title: 'Master Physiological Restoration',
        description: 'Complete 20 minutes of light mobility/foam rolling and sleep before 10:30 PM.',
        category: 'Recovery',
        difficulty: 'Easy',
        targetAction: 'Sleep 8.0+ hours and drink 3.5L water',
        isCompleted: false,
      };
    }

    if (status.detectedRisks.includes('Poor Nutrition Adherence') || status.nutritionQualityScore < 60) {
      return {
        id: 'mission-nutr-01',
        title: `Hit ${mealPlan.totalProtein}g Protein Goal`,
        description: 'Distribute your protein intake across 4 clean meals to trigger maximum muscle protein synthesis.',
        category: 'Nutrition',
        difficulty: 'Moderate',
        targetAction: `Log all meals and reach ${mealPlan.totalProtein}g protein`,
        isCompleted: false,
      };
    }

    if (status.plateauDetected) {
      return {
        id: 'mission-plat-01',
        title: 'Precision Overload & Zero Deficit Leaks',
        description: 'Record every working set weight and log all food items to break through weight plateau.',
        category: 'Workout',
        difficulty: 'Challenging',
        targetAction: 'Log 100% of workout weights and food items',
        isCompleted: false,
      };
    }

    return {
      id: 'mission-work-01',
      title: 'Execute Every Set With Strict Controlled Form',
      description: `Complete today's ${workoutPlan.sessionType} workout with 3-second eccentric control on every rep.`,
      category: 'Workout',
      difficulty: 'Moderate',
      targetAction: `Finish all ${workoutPlan.exercises.length} exercises in ${workoutPlan.estimatedDurationMins} mins`,
      isCompleted: false,
    };
  }
}

export const dailyMissionGenerator = new DailyMissionGenerator();
