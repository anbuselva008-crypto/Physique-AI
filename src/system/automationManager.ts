import { getPersona } from '../persona';
import { checkInService } from '../services/checkInService';
import { progressService } from '../services/progressService';
import { workoutService } from '../services/workoutService';

export interface AutomationTriggers {
  isRoadmapUpdateRequired: boolean;
  isMonthlyPhotoReminderDue: boolean;
  isConfidenceRecalculationRequired: boolean;
  isStageRecalculationRequired: boolean;
  isWeeklyReviewDue: boolean;
  isCheckInNeeded: boolean;
  reasons: string[];
}

/**
 * AutomationManager
 * Evaluates system state to determine whether background automation tasks or recalculations
 * should be triggered automatically.
 */
export class AutomationManager {
  /**
   * Evaluates system state and returns active automation triggers.
   */
  public evaluateTriggers(): AutomationTriggers {
    const persona = getPersona();
    const checkInStats = checkInService.statistics();
    const progressData = progressService.load();
    const workoutStats = workoutService.statistics();

    const reasons: string[] = [];

    // 1. Check-in status
    const isCheckInNeeded = !checkInStats.hasCheckedInToday;
    if (isCheckInNeeded) {
      reasons.push('Today\'s check-in has not been logged yet.');
    }

    // 2. Monthly photo reminder
    const today = new Date();
    const isFirstDayOfMonth = today.getDate() === 1;
    const isSunday = today.getDay() === 0;
    const photos = progressData.photos || [];
    const lastPhotoDate = photos.length > 0 ? photos[photos.length - 1].date : null;

    let isMonthlyPhotoReminderDue = false;
    if (isFirstDayOfMonth || (isSunday && photos.length === 0)) {
      isMonthlyPhotoReminderDue = true;
      reasons.push('Monthly progress photo update is due for visual body composition analysis.');
    } else if (lastPhotoDate) {
      const daysSincePhoto = Math.floor(
        (today.getTime() - new Date(lastPhotoDate).getTime()) / (1000 * 3600 * 24)
      );
      if (daysSincePhoto >= 28) {
        isMonthlyPhotoReminderDue = true;
        reasons.push(`28+ days (${daysSincePhoto} days) since last progress photo log.`);
      }
    }

    // 3. Weekly review due
    const isWeeklyReviewDue = isSunday;
    if (isWeeklyReviewDue) {
      reasons.push('Sunday weekly review milestone active.');
    }

    // 4. Roadmap & Stage recalculation
    const weights = progressData.weights || [];
    const isStageRecalculationRequired =
      weights.length > 0 && weights.length % 7 === 0;
    if (isStageRecalculationRequired) {
      reasons.push('7 new scale weight entries logged — recalculating transformation stage.');
    }

    const isRoadmapUpdateRequired = isFirstDayOfMonth || isStageRecalculationRequired;
    if (isRoadmapUpdateRequired && !reasons.includes('Monthly roadmap recalculation active.')) {
      reasons.push('Monthly roadmap recalculation active.');
    }

    // 5. Confidence recalculation
    const isConfidenceRecalculationRequired =
      workoutStats.completionPercentage < 60 || workoutStats.completionPercentage > 85;
    if (isConfidenceRecalculationRequired) {
      reasons.push('Workout adherence variance detected — recalculating 12-month goal confidence.');
    }

    return {
      isRoadmapUpdateRequired,
      isMonthlyPhotoReminderDue,
      isConfidenceRecalculationRequired,
      isStageRecalculationRequired,
      isWeeklyReviewDue,
      isCheckInNeeded,
      reasons,
    };
  }
}

export const automationManager = new AutomationManager();
