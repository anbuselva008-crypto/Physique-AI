import { CoachingReport, TransformationStatus, DynamicWorkoutPlan, DynamicMealPlan, DynamicRecoveryPlan } from './types';
import { getPersona } from '../persona';
import { MOTIVATION_KNOWLEDGE_DATABASE } from '../knowledge/motivationKnowledge';

/**
 * CoachEngine
 * Synthesizes data across all planners into a cohesive, elite daily Coaching Report.
 * Acts as the head bodybuilding coach, sports scientist, physiotherapist, and habit coach.
 */
export class CoachEngine {
  /**
   * Generates today's comprehensive coaching briefing report.
   */
  public generateReport(
    status: TransformationStatus,
    workoutPlan: DynamicWorkoutPlan,
    mealPlan: DynamicMealPlan,
    recoveryPlan: DynamicRecoveryPlan
  ): CoachingReport {
    const persona = getPersona();
    const name = persona.personal?.name || 'Champion';

    const greeting = `Good morning, ${name}! Ready to conquer today's transformation protocol.`;

    const recoveryStatusSummary =
      status.recoveryScore >= 75
        ? `Recovery Score is high (${status.recoveryScore}/100). Your body is prime for intensive training.`
        : status.recoveryScore >= 55
        ? `Recovery Score is moderate (${status.recoveryScore}/100). Focus on clean execution and proper hydration.`
        : `Recovery Score is low (${status.recoveryScore}/100). Fatigue management is essential today.`;

    const todaysPriority =
      workoutPlan.sessionType === 'Rest Day'
        ? 'Rest & Active Muscle Recovery'
        : `Execute ${workoutPlan.sessionType} Workout (${workoutPlan.targetFocus})`;

    const workoutFocus =
      workoutPlan.sessionType === 'Rest Day'
        ? 'No heavy lifting today. Prioritize 15 minutes of light foam rolling and mobility.'
        : `Perform ${workoutPlan.exercises.length} exercises with RPE ${workoutPlan.intensityLevel === 'High' ? '8-9' : '7-8'}. Focus on deep eccentric control.`;

    const nutritionFocus = `Hit ${mealPlan.totalProtein}g protein target today across 4-5 meals. Hydrate with ${mealPlan.hydrationTargetLiters}L water.`;

    const recoveryFocus = `Target ${recoveryPlan.sleepTargetHours} hours of sleep tonight and perform light stretching for sore muscles.`;

    const mindsetCoaching =
      'Small, disciplined actions repeated consistently every single day create extraordinary physical transformations. Master today.';

    const warnings: string[] = [];
    if (status.detectedRisks.length > 0) {
      warnings.push(...status.detectedRisks.map((r) => `Attention required: ${r}`));
    }
    if (status.plateauDetected) {
      warnings.push('Plateau indicator active. Stay strict on calorie tracking this week.');
    }

    const todaysMission = [
      workoutPlan.sessionType === 'Rest Day'
        ? 'Complete 20-min recovery walking or mobility'
        : `Complete today's ${workoutPlan.sessionType} workout session (${workoutPlan.estimatedDurationMins} mins)`,
      `Log all meals to hit ~${mealPlan.totalProtein}g protein`,
      `Drink ${mealPlan.hydrationTargetLiters}L water`,
      `In bed by 10:30 PM for ${recoveryPlan.sleepTargetHours} hours sleep`,
    ];

    // Pick a motivational quote from database
    const quotes = MOTIVATION_KNOWLEDGE_DATABASE || [];
    const randomQuoteObj = quotes[Math.floor(Math.random() * quotes.length)];
    const quote = randomQuoteObj
      ? `"${randomQuoteObj.quote}" — ${randomQuoteObj.authorOrMindset || 'Physique AI'}`
      : '"Discipline is choosing between what you want now and what you want most." — Anonymous';

    const tomorrowPreview =
      workoutPlan.sessionType === 'Push'
        ? 'Tomorrow: Pull & Back Hypertrophy Session'
        : workoutPlan.sessionType === 'Pull'
        ? 'Tomorrow: Legs & Core Session'
        : 'Tomorrow: Upper Body Strength & Conditioning';

    return {
      goodMorningGreeting: greeting,
      recoveryStatusSummary,
      todaysPriority,
      workoutFocus,
      nutritionFocus,
      recoveryFocus,
      mindsetCoaching,
      warnings,
      todaysMission,
      quote,
      tomorrowPreview,
    };
  }
}

export const coachEngine = new CoachEngine();
