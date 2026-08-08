import { DailyChecklist, DailyChecklistItem } from './types';
import { UnifiedTransformationState } from '../intelligence/types';
import { checkInService } from '../services/checkInService';
import { nutritionService } from '../services/nutritionService';
import { workoutService } from '../services/workoutService';

/**
 * DailyChecklistGenerator
 * Automatically generates actionable, priority-ordered daily checklist items.
 */
export class DailyChecklistGenerator {
  /**
   * Generates today's checklist with real-time completion state from services.
   */
  public generateChecklist(
    intelligenceState: UnifiedTransformationState,
    currentDateStr: string = new Date().toISOString().split('T')[0]
  ): DailyChecklist {
    const { workoutPlan, mealPlan, recoveryPlan } = intelligenceState;

    const checkInStats = checkInService.statistics();
    const nutritionData = nutritionService.load();
    const workoutStats = workoutService.statistics();

    const isCheckInCompleted = checkInStats.hasCheckedInToday;
    const isWaterStarted = (nutritionData.waterLog?.ml || 0) >= 500;
    const isWorkoutCompleted = workoutStats.completionPercentage >= 100;

    const mealLogs = nutritionData.mealLogs || [];
    const totalProtein = mealLogs.reduce((acc, m) => acc + (m.protein || 0), 0);
    const isProteinHit = totalProtein >= mealPlan.totalProtein * 0.9;

    const items: DailyChecklistItem[] = [
      {
        id: 'chk-checkin',
        title: 'Complete Morning Check-in (Sleep, Soreness, Energy)',
        category: 'Check-in',
        completed: isCheckInCompleted,
        timePreference: '07:30 AM',
        priority: 'high',
      },
      {
        id: 'chk-water-start',
        title: 'Drink first 500ml water upon waking',
        category: 'Hydration',
        completed: isWaterStarted,
        timePreference: '08:00 AM',
        priority: 'high',
      },
      {
        id: 'chk-workout',
        title:
          workoutPlan.sessionType === 'Rest Day'
            ? 'Complete 20-min recovery walking or mobility'
            : `Complete ${workoutPlan.sessionType} Workout (${workoutPlan.exercises.length} exercises)`,
        category: 'Workout',
        completed: isWorkoutCompleted,
        timePreference: '05:30 PM',
        priority: 'high',
      },
      {
        id: 'chk-protein',
        title: `Hit Daily Protein Goal (~${mealPlan.totalProtein}g)`,
        category: 'Nutrition',
        completed: isProteinHit,
        timePreference: '08:30 PM',
        priority: 'high',
      },
      {
        id: 'chk-walk',
        title: 'Hit 10,000 Daily Steps Goal',
        category: 'Cardio',
        completed: false,
        timePreference: '07:00 PM',
        priority: 'medium',
      },
      {
        id: 'chk-sleep',
        title: `Sleep before 10:30 PM (${recoveryPlan.sleepTargetHours}h target)`,
        category: 'Recovery',
        completed: false,
        timePreference: '10:30 PM',
        priority: 'high',
      },
    ];

    // If day is start of month or scheduled for photos, add progress photo task
    const isPhotoScheduled = new Date().getDate() === 1 || new Date().getDay() === 0;
    if (isPhotoScheduled) {
      items.push({
        id: 'chk-photos',
        title: 'Upload Monthly Physique Progress Photo for AI Analysis',
        category: 'Photos',
        completed: false,
        timePreference: '09:00 AM',
        priority: 'medium',
      });
    }

    const completedCount = items.filter((i) => i.completed).length;
    const totalCount = items.length;
    const progressPercentage = Math.round((completedCount / totalCount) * 100);

    return {
      date: currentDateStr,
      items,
      completedCount,
      totalCount,
      progressPercentage,
    };
  }
}

export const dailyChecklistGenerator = new DailyChecklistGenerator();
