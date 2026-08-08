import { AIContext, DecisionRule, RuleResult } from './types';

/**
 * Modular Rule Engine for Physique AI
 * Deterministic rules that evaluate the AIContext object.
 * Each rule returns a RuleResult if triggered, or null if not triggered.
 */

// ====================================================
// 1. RECOVERY RULES
// ====================================================

export const poorSleepRule: DecisionRule = {
  id: 'rec_poor_sleep',
  name: 'Poor Sleep Detection',
  category: 'recovery',
  evaluate: (ctx: AIContext): RuleResult | null => {
    const sleepHours = ctx.todayCheckIn.summary.sleepHours;
    if (sleepHours === null) return null;

    if (sleepHours < 5) {
      return {
        id: 'rec_poor_sleep_critical',
        category: 'recovery',
        severity: 'high',
        title: 'Severe Sleep Deprivation (< 5 hours)',
        description: `Logged only ${sleepHours} hours of sleep today. Central nervous system recovery and protein synthesis are compromised.`,
        recommendation: 'Prioritize an afternoon 20-min power nap, lower training volume by 20-30%, and hydrate well.',
        triggered: true,
        metadata: { sleepHours },
      };
    } else if (sleepHours < 6.5) {
      return {
        id: 'rec_poor_sleep_moderate',
        category: 'recovery',
        severity: 'medium',
        title: 'Suboptimal Sleep (< 6.5 hours)',
        description: `Logged ${sleepHours} hours of sleep. Recovery is slightly reduced.`,
        recommendation: 'Focus on warm-ups, maintain good technique, and aim for 8 hours tonight.',
        triggered: true,
        metadata: { sleepHours },
      };
    }
    return null;
  },
};

export const highSorenessRule: DecisionRule = {
  id: 'rec_high_soreness',
  name: 'High Soreness Detection',
  category: 'recovery',
  evaluate: (ctx: AIContext): RuleResult | null => {
    const soreness = ctx.todayCheckIn.summary.soreness;
    if (!soreness) return null;

    const isHigh = ['Severe', 'High', 'Extreme', 'Very Sore'].some((term) =>
      soreness.toLowerCase().includes(term.toLowerCase())
    );

    if (isHigh) {
      return {
        id: 'rec_high_soreness',
        category: 'recovery',
        severity: 'medium',
        title: 'High Muscle Soreness (DOMS)',
        description: `User reports "${soreness}" muscle soreness today.`,
        recommendation: 'Perform active recovery, foam rolling, dynamic stretching, and ensure sufficient protein intake.',
        triggered: true,
        metadata: { soreness },
      };
    }
    return null;
  },
};

export const lowEnergyRule: DecisionRule = {
  id: 'rec_low_energy',
  name: 'Low Energy Level Detection',
  category: 'recovery',
  evaluate: (ctx: AIContext): RuleResult | null => {
    const energy = ctx.todayCheckIn.summary.energyLevel;
    if (energy === null) return null;

    if (energy <= 2) {
      return {
        id: 'rec_low_energy',
        category: 'recovery',
        severity: 'medium',
        title: 'Low Energy State (<= 2/5)',
        description: `Energy level is rated at ${energy}/5. Heavy compound lifts may carry elevated fatigue risk.`,
        recommendation: 'Consume a pre-workout complex carb/electrolyte meal 45 mins before training or reduce set count.',
        triggered: true,
        metadata: { energy },
      };
    }
    return null;
  },
};

export const painAlertRule: DecisionRule = {
  id: 'rec_pain_alert',
  name: 'Joint/Pain Alert',
  category: 'recovery',
  evaluate: (ctx: AIContext): RuleResult | null => {
    const painNotes = ctx.todayCheckIn.summary.painNotes;
    if (!painNotes || painNotes.trim() === '' || painNotes.toLowerCase() === 'none') {
      return null;
    }

    return {
      id: 'rec_pain_alert',
      category: 'recovery',
      severity: 'critical',
      title: 'Active Joint/Muscle Pain Flagged',
      description: `User documented pain/discomfort: "${painNotes}".`,
      recommendation: 'Avoid exercises directly stressing the affected joint/area. Substitute with non-aggravating exercises or consult a specialist.',
      triggered: true,
      metadata: { painNotes },
    };
  },
};

// ====================================================
// 2. WORKOUT RULES
// ====================================================

export const workoutCompletedRule: DecisionRule = {
  id: 'wrk_completed',
  name: 'Workout Completion Status',
  category: 'workout',
  evaluate: (ctx: AIContext): RuleResult | null => {
    if (ctx.workout.isWorkoutCompleted) {
      return {
        id: 'wrk_completed',
        category: 'workout',
        severity: 'info',
        title: 'Today Workout Successfully Completed',
        description: `Completed 100% of planned sets for "${ctx.workout.statistics.workoutTitle}".`,
        recommendation: 'Focus on post-workout protein intake (30-40g) and rehydration.',
        triggered: true,
      };
    }
    return null;
  },
};

export const deloadNeededRule: DecisionRule = {
  id: 'wrk_deload_needed',
  name: 'Deload Recommendation',
  category: 'workout',
  evaluate: (ctx: AIContext): RuleResult | null => {
    const sleep = ctx.todayCheckIn.summary.sleepHours;
    const energy = ctx.todayCheckIn.summary.energyLevel;
    const soreness = ctx.todayCheckIn.summary.soreness;

    const isSeverelyFatigued =
      (sleep !== null && sleep < 5) &&
      (energy !== null && energy <= 2) &&
      soreness &&
      ['High', 'Severe'].some((s) => soreness.includes(s));

    if (isSeverelyFatigued) {
      return {
        id: 'wrk_deload_needed',
        category: 'workout',
        severity: 'high',
        title: 'Deload / Reduced Load Strongly Advised',
        description: 'Multiple stress markers coincide (sleep < 5h, energy <= 2, high soreness).',
        recommendation: 'Reduce working loads by 40% or convert today into an active recovery & mobility session.',
        triggered: true,
      };
    }
    return null;
  },
};

export const reduceIntensityRule: DecisionRule = {
  id: 'wrk_reduce_intensity',
  name: 'Reduce Training Intensity',
  category: 'workout',
  evaluate: (ctx: AIContext): RuleResult | null => {
    const sleep = ctx.todayCheckIn.summary.sleepHours;
    const energy = ctx.todayCheckIn.summary.energyLevel;

    if (!ctx.workout.isWorkoutCompleted && ((sleep !== null && sleep < 6) || (energy !== null && energy <= 2))) {
      return {
        id: 'wrk_reduce_intensity',
        category: 'workout',
        severity: 'medium',
        title: 'Moderate Fatigue - Reduce Intensity by 15-20%',
        description: 'Current fatigue metrics suggest avoiding 1RM max attempts or training to failure.',
        recommendation: 'Keep 2-3 Reps in Reserve (RIR) on all heavy compound sets today.',
        triggered: true,
      };
    }
    return null;
  },
};

// ====================================================
// 3. NUTRITION RULES
// ====================================================

export const proteinDeficitRule: DecisionRule = {
  id: 'nut_protein_deficit',
  name: 'Protein Target Deficit',
  category: 'nutrition',
  evaluate: (ctx: AIContext): RuleResult | null => {
    const remaining = ctx.nutrition.remaining.protein;
    const target = ctx.nutrition.goals.targetProtein;
    const consumed = ctx.nutrition.consumed.protein;

    const currentHour = parseInt(ctx.currentTime.split(':')[0], 10) || 12;

    if (target > 0 && remaining > 30 && currentHour >= 16) {
      return {
        id: 'nut_protein_deficit',
        category: 'nutrition',
        severity: currentHour >= 20 ? 'high' : 'medium',
        title: 'Protein Intake Deficit Detected',
        description: `Consumed ${consumed}g / ${target}g protein. Still need ${remaining}g protein today.`,
        recommendation: 'Add a high-protein source (whey, chicken breast, paneer, eggs, or sattu shake) in your next meal.',
        triggered: true,
        metadata: { remaining, target },
      };
    }
    return null;
  },
};

export const calorieDeficitAlertRule: DecisionRule = {
  id: 'nut_calorie_under',
  name: 'Calorie Underfueling Alert',
  category: 'nutrition',
  evaluate: (ctx: AIContext): RuleResult | null => {
    const consumed = ctx.nutrition.consumed.calories;
    const target = ctx.nutrition.goals.targetCalories;
    const currentHour = parseInt(ctx.currentTime.split(':')[0], 10) || 12;

    if (target > 0 && consumed < target * 0.4 && currentHour >= 18) {
      return {
        id: 'nut_calorie_under',
        category: 'nutrition',
        severity: 'high',
        title: 'Severe Underfueling Alert',
        description: `Logged only ${consumed} kcal out of ${target} kcal target by late evening.`,
        recommendation: 'Eat a calorie and macro-dense meal (e.g. rice, dal, chicken/paneer, nuts) to prevent muscle breakdown.',
        triggered: true,
        metadata: { consumed, target },
      };
    }
    return null;
  },
};

export const hydrationDeficitRule: DecisionRule = {
  id: 'nut_hydration_deficit',
  name: 'Hydration Target Deficit',
  category: 'nutrition',
  evaluate: (ctx: AIContext): RuleResult | null => {
    const consumedMl = ctx.nutrition.todayWater.ml;
    const targetMl = ctx.nutrition.goals.targetWaterMl;
    const currentHour = parseInt(ctx.currentTime.split(':')[0], 10) || 12;

    if (targetMl > 0 && consumedMl < targetMl * 0.5 && currentHour >= 15) {
      const deficitLiters = ((targetMl - consumedMl) / 1000).toFixed(1);
      return {
        id: 'nut_hydration_deficit',
        category: 'nutrition',
        severity: 'medium',
        title: 'Low Hydration Intake',
        description: `Logged ${consumedMl}ml out of ${targetMl}ml water target. Need ~${deficitLiters}L more today.`,
        recommendation: 'Drink 500ml of water immediately and keep a filled water bottle nearby.',
        triggered: true,
        metadata: { consumedMl, targetMl },
      };
    }
    return null;
  },
};

// ====================================================
// 4. CONSISTENCY RULES
// ====================================================

export const missingCheckInRule: DecisionRule = {
  id: 'con_missing_checkin',
  name: 'Daily Check-In Missing',
  category: 'consistency',
  evaluate: (ctx: AIContext): RuleResult | null => {
    if (!ctx.todayCheckIn.hasCheckedInToday) {
      return {
        id: 'con_missing_checkin',
        category: 'consistency',
        severity: 'medium',
        title: 'Daily Check-In Pending',
        description: 'Today check-in (sleep, energy, mood, soreness) has not been logged.',
        recommendation: 'Complete your 30-second daily check-in so Physique AI can calibrate your workout & recovery scores.',
        triggered: true,
      };
    }
    return null;
  },
};

export const streakAtRiskRule: DecisionRule = {
  id: 'con_streak_risk',
  name: 'Streak Preservation Notice',
  category: 'consistency',
  evaluate: (ctx: AIContext): RuleResult | null => {
    const currentHour = parseInt(ctx.currentTime.split(':')[0], 10) || 12;
    const checkInStreak = ctx.streaks.checkInStreakDays;

    if (!ctx.todayCheckIn.hasCheckedInToday && checkInStreak >= 3 && currentHour >= 19) {
      return {
        id: 'con_streak_risk',
        category: 'consistency',
        severity: 'high',
        title: `${checkInStreak}-Day Check-In Streak at Risk!`,
        description: `You have a ${checkInStreak}-day check-in streak. Log today before midnight to maintain it.`,
        recommendation: 'Tap the Daily Check-In button on the Home tab now.',
        triggered: true,
      };
    }
    return null;
  },
};

// ====================================================
// 5. RISK DETECTION RULES
// ====================================================

export const plateauRiskRule: DecisionRule = {
  id: 'rsk_plateau_detected',
  name: 'Weight/Strength Plateau Risk',
  category: 'risk',
  evaluate: (ctx: AIContext): RuleResult | null => {
    const weightHistory = ctx.progress.weightHistory;
    if (weightHistory.length < 3) return null;

    const recentWeights = weightHistory.slice(-3).map((w) => w.weightKg);
    const maxW = Math.max(...recentWeights);
    const minW = Math.min(...recentWeights);

    // If weight variation is < 0.2kg across last 3 entries
    if (maxW - minW < 0.2) {
      return {
        id: 'rsk_plateau_detected',
        category: 'risk',
        severity: 'low',
        title: 'Potential Weight Plateau Detected',
        description: `Weight has remained stagnant (~${recentWeights[recentWeights.length - 1]}kg) across recent log entries.`,
        recommendation: 'Verify calorie tracking precision or adjust target daily intake by 100-150 kcal.',
        triggered: true,
      };
    }
    return null;
  },
};

export const rapidWeightChangeRule: DecisionRule = {
  id: 'rsk_rapid_weight_change',
  name: 'Rapid Weight Fluctuation Detection',
  category: 'risk',
  evaluate: (ctx: AIContext): RuleResult | null => {
    const weights = ctx.progress.weightHistory;
    if (weights.length < 2) return null;

    const latest = weights[weights.length - 1].weightKg;
    const previous = weights[weights.length - 2].weightKg;
    const diff = latest - previous;

    if (diff < -2.0) {
      return {
        id: 'rsk_rapid_weight_loss',
        category: 'risk',
        severity: 'medium',
        title: 'Rapid Weight Drop (> 2.0kg)',
        description: `Weight decreased by ${Math.abs(diff).toFixed(1)}kg since last entry. Likely water/glycogen loss.`,
        recommendation: 'Ensure adequate sodium and water intake to maintain muscle fullness and blood volume.',
        triggered: true,
      };
    } else if (diff > 2.0) {
      return {
        id: 'rsk_rapid_weight_gain',
        category: 'risk',
        severity: 'medium',
        title: 'Rapid Weight Spike (> 2.0kg)',
        description: `Weight increased by ${diff.toFixed(1)}kg since last entry. Likely sodium retention or digestive volume.`,
        recommendation: 'Do not panic or slash calories dramatically. Continue consistent tracking.',
        triggered: true,
      };
    }
    return null;
  },
};

// ====================================================
// 6. SCHEDULE RULES
// ====================================================

export const scheduleContextRule: DecisionRule = {
  id: 'sch_schedule_window',
  name: 'Schedule & Time Window Analysis',
  category: 'schedule',
  evaluate: (ctx: AIContext): RuleResult | null => {
    const isWeekend = ctx.dayOfWeek === 'Saturday' || ctx.dayOfWeek === 'Sunday';
    const schedule = ctx.profile.rawProfile.schedule;

    if (isWeekend) {
      return {
        id: 'sch_weekend_window',
        category: 'schedule',
        severity: 'info',
        title: 'Weekend Schedule Active',
        description: 'More flexible training time window available on weekends.',
        recommendation: 'Schedule your workout during peak energy hours (10 AM - 12 PM or 5 PM - 7 PM).',
        triggered: true,
      };
    } else if (schedule) {
      return {
        id: 'sch_weekday_window',
        category: 'schedule',
        severity: 'info',
        title: `Weekday Schedule (Wake up: ${schedule.wakeUpTime})`,
        description: `College/Work timing (${schedule.collegeStart} - ${schedule.collegeEnd}). Planned workout window: ${schedule.gymTime}.`,
        recommendation: `Target training at ${schedule.gymTime} to maintain daily routine adherence.`,
        triggered: true,
      };
    }
    return null;
  },
};


/**
 * Full master list of decision rules.
 */
export const ALL_DECISION_RULES: DecisionRule[] = [
  poorSleepRule,
  highSorenessRule,
  lowEnergyRule,
  painAlertRule,
  workoutCompletedRule,
  deloadNeededRule,
  reduceIntensityRule,
  proteinDeficitRule,
  calorieDeficitAlertRule,
  hydrationDeficitRule,
  missingCheckInRule,
  streakAtRiskRule,
  plateauRiskRule,
  rapidWeightChangeRule,
  scheduleContextRule,
];
