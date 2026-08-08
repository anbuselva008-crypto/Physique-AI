import { CoachInsightItem, CoachInsightsState } from './dashboardState';
import { UnifiedTransformationState } from '../intelligence/types';
import { checkInService } from '../services/checkInService';
import { nutritionService } from '../services/nutritionService';
import { workoutService } from '../services/workoutService';
import { progressService } from '../services/progressService';

/**
 * CoachInsights
 * Generates timeframe-based insights (Today, Weekly, Monthly) along with top
 * visual body/performance improvements, friction bottlenecks, and recommendations.
 */
export class CoachInsights {
  /**
   * Generates comprehensive coach insights state.
   */
  public generateInsights(intelligence: UnifiedTransformationState): CoachInsightsState {
    const { status, mealPlan, workoutPlan } = intelligence;

    const checkInStats = checkInService.statistics();
    const nutritionData = nutritionService.load();
    const workoutStats = workoutService.statistics();
    const progressData = progressService.load();

    const sleepHours = checkInStats.todaySleepHours || 7.5;
    const mealLogs = nutritionData.mealLogs || [];
    const loggedProtein = mealLogs.reduce((acc, m) => acc + (m.protein || 0), 0);

    // Today's Insight
    const todayInsight: CoachInsightItem = {
      timeframe: 'Today',
      title: 'Recovery Score & Daily Plan Calibration',
      highlight: `Recovery score sitting at ${status.recoveryScore}/100 based on ${sleepHours}h sleep.`,
      metric: `${status.recoveryScore}/100 Recovery`,
      category: 'Daily Protocol',
      actionableRecommendation:
        status.recoveryScore < 50
          ? 'Prioritize 20-min active recovery mobility and sleep by 10:30 PM.'
          : `Execute today's ${workoutPlan.sessionType} workout with high focus and controlled 3s eccentrics.`,
    };

    // Weekly Insight
    const workoutCompletion = workoutStats.completionPercentage || 80;
    const weeklyInsight: CoachInsightItem = {
      timeframe: 'Weekly',
      title: '7-Day Training & Nutrition Adherence',
      highlight: `Workout completion rate is ${workoutCompletion.toFixed(0)}% with ${status.consistencyScore}/100 overall consistency score.`,
      metric: `${workoutCompletion.toFixed(0)}% Weekly Adherence`,
      category: 'Weekly Trend',
      actionableRecommendation: 'Maintain 4-5 high-protein meals daily to support muscular recovery and stay on schedule.',
    };

    // Monthly Insight
    const photos = progressData.photos || [];
    const monthlyInsight: CoachInsightItem = {
      timeframe: 'Monthly',
      title: '30-Day Physical Transformation Progress',
      highlight: `Current stage: ${status.currentStage}. Total progress photos logged: ${photos.length}.`,
      metric: status.currentStage,
      category: 'Roadmap Milestone',
      actionableRecommendation: 'Upload a monthly progress photo for Gemini Vision posture and body composition tracking.',
    };

    // Biggest Improvement
    let biggestImprovement = 'Consistent workout completion and exercise volume retention.';
    if (status.recoveryScore >= 75) {
      biggestImprovement = 'Physiological recovery score optimization (+15% sleep efficiency).';
    } else if (loggedProtein >= mealPlan.totalProtein * 0.8) {
      biggestImprovement = 'High protein target adherence triggering elevated nitrogen balance.';
    }

    // Biggest Weakness
    let biggestWeakness = 'Hydration consistency during late evening hours.';
    if (sleepHours < 6.5) {
      biggestWeakness = 'Sleep duration deficit impacting central nervous system recovery.';
    } else if (loggedProtein < mealPlan.totalProtein * 0.7) {
      biggestWeakness = `Protein intake deficit (${loggedProtein}g vs target ${mealPlan.totalProtein}g).`;
    }

    // Most Important Recommendation
    const mostImportantRecommendation = status.detectedRisks.length > 0
      ? `Address risk: ${status.detectedRisks[0]}. Focus on immediate sleep and hydration adjustment.`
      : `Complete today's ${workoutPlan.sessionType} workout and log all meals to hit ${mealPlan.totalProtein}g protein.`;

    return {
      todayInsight,
      weeklyInsight,
      monthlyInsight,
      biggestImprovement,
      biggestWeakness,
      mostImportantRecommendation,
    };
  }
}

export const coachInsights = new CoachInsights();
