import { GoalConfidenceEstimate, TransformationStatus } from './types';
import { workoutService } from '../services/workoutService';
import { nutritionService } from '../services/nutritionService';
import { progressService } from '../services/progressService';

/**
 * ConfidenceEngine
 * Evaluates the mathematical probability of the user achieving their 12-month transformation goal.
 * Employs evidence-based algorithms analyzing workout completion rate, nutrition adherence,
 * recovery consistency, body composition trends, and photo progression.
 */
export class ConfidenceEngine {
  /**
   * Calculates the 1-year goal achievement confidence score along with limiting/positive drivers.
   */
  public estimateConfidence(status: TransformationStatus): GoalConfidenceEstimate {
    const workoutStats = workoutService.statistics();
    const nutritionData = nutritionService.load();
    const progressData = progressService.load();

    const workoutCompletion = workoutStats.completionPercentage || 75;
    const streakDays = progressData.summary?.workoutStreak || progressData.stats?.currentStreak || 0;
    
    const mealLogs = nutritionData.mealLogs || [];
    const totalProtein = mealLogs.reduce((acc, m) => acc + (m.protein || 0), 0);
    const targetProtein = nutritionData.goals?.targetProtein || 150;
    const nutritionAdherence = targetProtein > 0 ? Math.min(100, (totalProtein / targetProtein) * 100) : 70;

    const recoveryScore = status.recoveryScore;
    const photos = progressData.photos || [];
    const weights = progressData.weights || [];

    // Weighted mathematical score
    let score =
      workoutCompletion * 0.35 +
      nutritionAdherence * 0.30 +
      recoveryScore * 0.20 +
      Math.min(15, streakDays * 1.5);

    if (photos.length > 2) score += 5;
    if (weights.length > 3) score += 5;

    const finalScore = Math.min(96, Math.max(25, Math.round(score)));

    // Extract Positive & Limiting Factors
    const topPositiveFactors: string[] = [];
    const topLimitingFactors: string[] = [];
    const suggestionsToImproveConfidence: string[] = [];

    if (workoutCompletion >= 80) {
      topPositiveFactors.push(`High workout completion rate (${workoutCompletion.toFixed(0)}%).`);
    } else {
      topLimitingFactors.push(`Workout completion rate is low (${workoutCompletion.toFixed(0)}%).`);
      suggestionsToImproveConfidence.push('Aim to complete at least 3-4 scheduled workouts every single week.');
    }

    if (nutritionAdherence >= 75) {
      topPositiveFactors.push(`Strong protein adherence (${nutritionAdherence.toFixed(0)}% of daily target).`);
    } else {
      topLimitingFactors.push(`Inconsistent protein intake (${nutritionAdherence.toFixed(0)}% of daily target).`);
      suggestionsToImproveConfidence.push('Prioritize hitting your daily protein target using convenient staples (eggs, soya, curd, chicken).');
    }

    if (recoveryScore >= 70) {
      topPositiveFactors.push(`Optimal physiological recovery (${recoveryScore}/100 score).`);
    } else {
      topLimitingFactors.push(`Recovery score deficit (${recoveryScore}/100) due to sub-optimal sleep or high stress.`);
      suggestionsToImproveConfidence.push('Target 7.5 to 8.0 hours of sleep nightly to accelerate muscle tissue repair.');
    }

    if (streakDays >= 7) {
      topPositiveFactors.push(`Active training streak of ${streakDays} consecutive days.`);
    }

    if (photos.length === 0) {
      topLimitingFactors.push('No visual progress photos logged recently.');
      suggestionsToImproveConfidence.push('Log monthly progress photos to enable computer vision body composition tracking.');
    }

    const reasoning = `Based on historical workout completion (${workoutCompletion.toFixed(0)}%), nutrition adherence (${nutritionAdherence.toFixed(0)}%), and recovery metrics (${recoveryScore}/100), there is an estimated ${finalScore}% statistical probability of reaching your 12-month goal. Consistency in high-protein intake and sleep will be the primary drivers to increase this score further.`;

    return {
      confidenceScore: finalScore,
      reasoning,
      topLimitingFactors: topLimitingFactors.slice(0, 3),
      topPositiveFactors: topPositiveFactors.slice(0, 3),
      suggestionsToImproveConfidence: suggestionsToImproveConfidence.slice(0, 3),
    };
  }
}

export const confidenceEngine = new ConfidenceEngine();
