import {
  AIContext,
  DecisionReport,
  DecisionRule,
  RuleResult,
  WorkoutDecision,
  RecoveryAnalysis,
  NutritionAnalysis,
  ConsistencyAnalysis,
  RiskAnalysis,
  ScheduleAnalysis,
  PrioritizedAction,
  RuleSeverity,
} from './types';
import { ALL_DECISION_RULES } from './rules';

/**
 * AI Decision Engine
 * Performs purely deterministic analysis on the AIContext object.
 * NEVER calls LLMs (Groq, Gemini, etc.).
 * Generates a comprehensive, structured DecisionReport.
 */
export class AIDecisionEngine {
  private rules: DecisionRule[];

  constructor(customRules?: DecisionRule[]) {
    this.rules = customRules || ALL_DECISION_RULES;
  }

  /**
   * Register an additional custom rule.
   */
  public registerRule(rule: DecisionRule): void {
    this.rules.push(rule);
  }

  /**
   * Main entry point to analyze AIContext and produce a DecisionReport.
   */
  public evaluate(context: AIContext): DecisionReport {
    const triggeredRules = this.evaluateRules(context);
    const recovery = this.analyzeRecovery(context, triggeredRules);
    const workout = this.analyzeWorkout(context, triggeredRules, recovery);
    const nutrition = this.analyzeNutrition(context, triggeredRules);
    const consistency = this.analyzeConsistency(context, triggeredRules);
    const risk = this.analyzeRisk(context, triggeredRules);
    const schedule = this.analyzeSchedule(context, triggeredRules);
    const prioritizedActions = this.buildPrioritizedActions(triggeredRules);
    const summary = this.buildSummary(workout, recovery, nutrition, risk);

    return {
      timestamp: new Date().toISOString(),
      workout,
      recovery,
      nutrition,
      consistency,
      risk,
      schedule,
      triggeredRules,
      prioritizedActions,
      summary,
    };
  }

  private evaluateRules(context: AIContext): RuleResult[] {
    const results: RuleResult[] = [];
    for (const rule of this.rules) {
      try {
        const result = rule.evaluate(context);
        if (result && result.triggered) {
          results.push(result);
        }
      } catch (err) {
        console.error(`DecisionEngine: Rule "${rule.name}" failed evaluation`, err);
      }
    }
    return results;
  }

  private analyzeRecovery(context: AIContext, rules: RuleResult[]): RecoveryAnalysis {
    const checkIn = context.todayCheckIn;
    const summary = checkIn.summary;

    const poorSleepDetected = rules.some((r) => r.id.startsWith('rec_poor_sleep'));
    const highSorenessDetected = rules.some((r) => r.id === 'rec_high_soreness');
    const lowEnergyDetected = rules.some((r) => r.id === 'rec_low_energy');
    const painAlert = rules.some((r) => r.id === 'rec_pain_alert');

    // Calculate score (100 baseline)
    let score = 100;

    const sleep = summary.sleepHours;
    if (sleep !== null) {
      if (sleep < 5) score -= 35;
      else if (sleep < 6.5) score -= 20;
      else if (sleep < 7.5) score -= 10;
    } else {
      score -= 10; // penalty for unlogged sleep
    }

    const energy = summary.energyLevel;
    if (energy !== null) {
      score -= (5 - energy) * 6; // e.g. energy 2 -> -18
    }

    const soreness = summary.soreness;
    if (soreness) {
      if (soreness.includes('Severe') || soreness.includes('High')) score -= 25;
      else if (soreness.includes('Moderate')) score -= 10;
    }

    if (painAlert) score -= 30;

    score = Math.max(0, Math.min(100, Math.round(score)));

    let status: RecoveryAnalysis['status'] = 'optimal';
    if (score < 40) status = 'critical';
    else if (score < 60) status = 'poor';
    else if (score < 80) status = 'moderate';

    const factors: string[] = [];
    if (sleep !== null) factors.push(`Sleep: ${sleep}h`);
    if (energy !== null) factors.push(`Energy: ${energy}/5`);
    if (soreness) factors.push(`Soreness: ${soreness}`);
    if (summary.painNotes) factors.push(`Pain notes: ${summary.painNotes}`);

    return {
      score,
      status,
      poorSleepDetected,
      highSorenessDetected,
      lowEnergyDetected,
      painAlert,
      factors,
    };
  }

  private analyzeWorkout(
    context: AIContext,
    rules: RuleResult[],
    recovery: RecoveryAnalysis
  ): WorkoutDecision {
    const isCompleted = context.workout.isWorkoutCompleted;
    const isRestDay = context.dayOfWeek === 'Sunday' || recovery.score < 30;
    const isDeloadRecommended = rules.some((r) => r.id === 'wrk_deload_needed');
    const reduceIntensityRule = rules.some((r) => r.id === 'wrk_reduce_intensity');

    const reasoning: string[] = [];

    if (isCompleted) {
      reasoning.push('Today workout is already 100% completed.');
      return {
        recommendation: 'proceed',
        shouldWorkoutToday: false,
        isRestDay,
        isDeloadRecommended: false,
        intensityAdjustmentPercentage: 100,
        reasoning,
      };
    }

    let recommendation: WorkoutDecision['recommendation'] = 'proceed';
    let intensityAdjustmentPercentage = 100;
    let shouldWorkoutToday = true;

    if (isRestDay) {
      recommendation = 'rest_day';
      shouldWorkoutToday = false;
      intensityAdjustmentPercentage = 0;
      reasoning.push(
        recovery.score < 30
          ? 'Recovery score is critically low (< 30). Rest is mandatory.'
          : 'Sunday designated active rest day.'
      );
    } else if (isDeloadRecommended) {
      recommendation = 'deload';
      intensityAdjustmentPercentage = 50;
      reasoning.push('Deload recommended due to cumulative fatigue and low recovery markers.');
    } else if (reduceIntensityRule || recovery.status === 'poor') {
      recommendation = 'reduce_intensity';
      intensityAdjustmentPercentage = 80;
      reasoning.push('Reduce training load/intensity by 20% due to moderate fatigue.');
    } else {
      reasoning.push('Recovery status is adequate. Proceed with standard scheduled workout intensity.');
    }

    return {
      recommendation,
      shouldWorkoutToday,
      isRestDay,
      isDeloadRecommended,
      intensityAdjustmentPercentage,
      reasoning,
    };
  }

  private analyzeNutrition(context: AIContext, rules: RuleResult[]): NutritionAnalysis {
    const remaining = context.nutrition.remaining;
    const goals = context.nutrition.goals;
    const consumed = context.nutrition.consumed;

    const caloriesRemaining = remaining.calories;
    const proteinRemaining = remaining.protein;
    const waterRemainingMl = remaining.waterMl;

    let calorieStatus: NutritionAnalysis['calorieStatus'] = 'on_track';
    if (consumed.calories < goals.targetCalories * 0.5) calorieStatus = 'severely_under';
    else if (consumed.calories < goals.targetCalories) calorieStatus = 'deficit';
    else if (consumed.calories > goals.targetCalories + 200) calorieStatus = 'surplus';

    let proteinStatus: NutritionAnalysis['proteinStatus'] = 'met';
    if (proteinRemaining > 50) proteinStatus = 'severely_deficient';
    else if (proteinRemaining > 20) proteinStatus = 'deficient';
    else if (proteinRemaining > 0) proteinStatus = 'close';

    let hydrationStatus: NutritionAnalysis['hydrationStatus'] = 'optimal';
    if (waterRemainingMl > goals.targetWaterMl * 0.5) hydrationStatus = 'dehydrated';
    else if (waterRemainingMl > 0) hydrationStatus = 'adequate';

    const mealReminders: string[] = [];
    if (proteinRemaining > 30) {
      mealReminders.push(`Consume ${proteinRemaining}g more protein to hit daily muscle synthesis threshold.`);
    }
    if (waterRemainingMl > 500) {
      mealReminders.push(`Drink ${Math.round(waterRemainingMl)}ml more water before bed.`);
    }

    return {
      caloriesRemaining,
      proteinRemaining,
      waterRemainingMl,
      calorieStatus,
      proteinStatus,
      hydrationStatus,
      mealReminders,
    };
  }

  private analyzeConsistency(context: AIContext, rules: RuleResult[]): ConsistencyAnalysis {
    const checkInCompletedToday = context.todayCheckIn.hasCheckedInToday;
    const workoutCompletedToday = context.workout.isWorkoutCompleted;
    const checkInStreakDays = context.streaks.checkInStreakDays;
    const workoutStreakDays = context.streaks.workoutStreakDays;
    const weeklyAdherencePercentage = context.streaks.weeklyWorkoutAdherence;

    let consistencyScore = 70;
    if (checkInCompletedToday) consistencyScore += 15;
    if (workoutCompletedToday) consistencyScore += 15;
    if (checkInStreakDays > 5) consistencyScore += 10;
    consistencyScore = Math.min(100, consistencyScore);

    const statusNotes: string[] = [];
    if (checkInCompletedToday) statusNotes.push('Daily check-in logged.');
    else statusNotes.push('Daily check-in pending.');

    if (workoutCompletedToday) statusNotes.push('Today workout completed.');
    else statusNotes.push('Today workout pending.');

    return {
      checkInCompletedToday,
      workoutCompletedToday,
      checkInStreakDays,
      workoutStreakDays,
      weeklyAdherencePercentage,
      consistencyScore,
      statusNotes,
    };
  }

  private analyzeRisk(context: AIContext, rules: RuleResult[]): RiskAnalysis {
    const consecutivePoorSleep = rules.some((r) => r.id === 'rec_poor_sleep_critical');
    const weightLossTooFast = rules.some((r) => r.id === 'rsk_rapid_weight_loss');
    const weightGainTooFast = rules.some((r) => r.id === 'rsk_rapid_weight_gain');
    const plateauDetected = rules.some((r) => r.id === 'rsk_plateau_detected');
    const injuryRiskHigh = rules.some((r) => r.id === 'rec_pain_alert');

    const activeRisks: string[] = [];
    if (consecutivePoorSleep) activeRisks.push('Severe Sleep Deprivation');
    if (weightLossTooFast) activeRisks.push('Rapid Weight Loss');
    if (weightGainTooFast) activeRisks.push('Rapid Weight Gain');
    if (plateauDetected) activeRisks.push('Weight Plateau');
    if (injuryRiskHigh) activeRisks.push('Active Joint/Muscle Pain');

    return {
      consecutivePoorSleep,
      weightLossTooFast,
      weightGainTooFast,
      plateauDetected,
      injuryRiskHigh,
      activeRisks,
    };
  }

  private analyzeSchedule(context: AIContext, rules: RuleResult[]): ScheduleAnalysis {
    const isWeekend = context.dayOfWeek === 'Saturday' || context.dayOfWeek === 'Sunday';
    const dayOfWeek = context.dayOfWeek;
    const profileSched = context.profile.rawProfile.schedule;

    const estimatedWorkoutTimeWindow = profileSched
      ? profileSched.gymTime
      : isWeekend
      ? 'Flexible (10 AM - 6 PM)'
      : 'Evening (6 PM - 8 PM)';

    const contextualScheduleNotes: string[] = [];
    if (profileSched) {
      contextualScheduleNotes.push(
        `College/Work: ${profileSched.collegeStart} - ${profileSched.collegeEnd}`
      );
      contextualScheduleNotes.push(`Preferred Workout Window: ${profileSched.gymTime}`);
    } else {
      contextualScheduleNotes.push(`Day: ${dayOfWeek}`);
    }

    return {
      isWeekend,
      dayOfWeek,
      estimatedWorkoutTimeWindow,
      contextualScheduleNotes,
    };
  }


  private buildPrioritizedActions(rules: RuleResult[]): PrioritizedAction[] {
    const severityWeight: Record<RuleSeverity, number> = {
      critical: 1,
      high: 2,
      medium: 3,
      low: 4,
      info: 5,
    };

    const sortedRules = [...rules].sort(
      (a, b) => severityWeight[a.severity] - severityWeight[b.severity]
    );

    return sortedRules.map((rule, idx) => ({
      id: rule.id,
      priority: idx + 1,
      category: rule.category,
      severity: rule.severity,
      title: rule.title,
      description: rule.description,
      actionItem: rule.recommendation,
    }));
  }

  private buildSummary(
    workout: WorkoutDecision,
    recovery: RecoveryAnalysis,
    nutrition: NutritionAnalysis,
    risk: RiskAnalysis
  ): string {
    const statusParts: string[] = [];

    statusParts.push(`Recovery score is ${recovery.score}/100 (${recovery.status.toUpperCase()}).`);

    if (workout.recommendation === 'rest_day') {
      statusParts.push('Today is evaluated as a rest day.');
    } else if (workout.recommendation === 'reduce_intensity') {
      statusParts.push('Workout intensity should be reduced by 20%.');
    } else if (workout.recommendation === 'deload') {
      statusParts.push('Deload protocol recommended today.');
    } else {
      statusParts.push('Cleared for full workout session.');
    }

    if (nutrition.proteinRemaining > 20) {
      statusParts.push(`Still require ${nutrition.proteinRemaining}g protein.`);
    }

    if (risk.activeRisks.length > 0) {
      statusParts.push(`Active alerts: ${risk.activeRisks.join(', ')}.`);
    }

    return statusParts.join(' ');
  }
}

export const decisionEngine = new AIDecisionEngine();

export const analyzeAIContext = (context: AIContext): DecisionReport => {
  return decisionEngine.evaluate(context);
};
