import {
  profileService,
  nutritionService,
  checkInService,
  workoutService,
  progressService,
} from '../services';

import {
  AIContext,
  AIProfileContext,
  AITodayCheckInContext,
  AINutritionContext,
  AIWorkoutContext,
  AIProgressContext,
  AIStreaksContext,
  AIGoalsContext,
  AIMetaContext,
  ContextBuilderOptions,
} from './types';

/**
 * AI Context Builder
 * Assembles a unified context object from all application services.
 * Strictly adheres to clean architecture principles and delegates data loading exclusively
 * to the service layer without accessing localStorage or components directly.
 */
export class AIContextBuilder {
  /**
   * Builds context asynchronously.
   */
  public async buildContext(options: ContextBuilderOptions = {}): Promise<AIContext> {
    return this.buildContextSync(options);
  }

  /**
   * Builds context synchronously for immediate consumption by AI modules.
   */
  public buildContextSync(options: ContextBuilderOptions = {}): AIContext {
    const now = options.customTime || new Date();
    const currentDate = options.targetDate || this.formatDate(now);
    const currentTime = this.formatTime(now);
    const dayOfWeek = this.getDayOfWeek(now);

    const meta: AIMetaContext = {
      currentDate,
      currentTime,
      dayOfWeek,
      timestampISO: now.toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    };

    const profile = this.buildProfileContext();
    const todayCheckIn = this.buildCheckInContext(currentDate);
    const nutrition = this.buildNutritionContext(currentDate);
    const workout = this.buildWorkoutContext();
    const progress = this.buildProgressContext();
    const streaks = this.buildStreaksContext(todayCheckIn, workout, progress);
    const goals = this.buildGoalsContext(profile, nutrition);

    return {
      profile,
      todayCheckIn,
      nutrition,
      workout,
      progress,
      streaks,
      goals,
      currentDate,
      currentTime,
      dayOfWeek,
      meta,
    };
  }

  private buildProfileContext(): AIProfileContext {
    try {
      const rawProfile = profileService.load();
      const stats = profileService.statistics();
      return { rawProfile, stats };
    } catch (error) {
      console.error('AIContextBuilder: Error constructing profile context', error);
      const rawProfile = profileService.load();
      return {
        rawProfile,
        stats: profileService.statistics(),
      };
    }
  }

  private buildCheckInContext(date: string): AITodayCheckInContext {
    try {
      const checkIn = checkInService.load(date);
      const stats = checkInService.statistics();
      const hasCheckedInToday = checkInService.hasCompletedTodayCheckIn();

      return {
        hasCheckedInToday,
        checkIn,
        summary: {
          mood: checkIn?.mood || stats.todayMood,
          sleepHours: checkIn?.sleepHours ?? stats.todaySleepHours,
          energyLevel: checkIn?.energyLevel ?? stats.todayEnergyLevel,
          soreness: checkIn?.soreness || stats.todaySoreness,
          waterAfterWaking: checkIn?.waterAfterWaking ?? null,
          painNotes: checkIn?.painNotes,
        },
      };
    } catch (error) {
      console.error('AIContextBuilder: Error constructing check-in context', error);
      return {
        hasCheckedInToday: false,
        checkIn: null,
        summary: {
          mood: null,
          sleepHours: null,
          energyLevel: null,
          soreness: null,
          waterAfterWaking: null,
        },
      };
    }
  }

  private buildNutritionContext(date: string): AINutritionContext {
    try {
      const data = nutritionService.load(date);
      const weeklyStats = nutritionService.statistics();

      const todayMealLogs = data.mealLogs;
      const todayWater = data.waterLog;
      const goals = data.goals;

      const consumed = todayMealLogs.reduce(
        (acc, item) => ({
          calories: acc.calories + item.calories,
          protein: acc.protein + item.protein,
          carbs: acc.carbs + item.carbs,
          fat: acc.fat + item.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      const remaining = {
        calories: Math.max(0, goals.targetCalories - consumed.calories),
        protein: Math.max(0, goals.targetProtein - consumed.protein),
        carbs: Math.max(0, goals.targetCarbs - consumed.carbs),
        fat: Math.max(0, goals.targetFat - consumed.fat),
        waterMl: Math.max(0, goals.targetWaterMl - todayWater.ml),
      };

      return {
        todayMealLogs,
        todayWater,
        goals,
        consumed,
        remaining,
        weeklyStats,
      };
    } catch (error) {
      console.error('AIContextBuilder: Error constructing nutrition context', error);
      const goals = nutritionService.getNutritionGoals();
      return {
        todayMealLogs: [],
        todayWater: { date, ml: 0, targetMl: goals.targetWaterMl },
        goals,
        consumed: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        remaining: {
          calories: goals.targetCalories,
          protein: goals.targetProtein,
          carbs: goals.targetCarbs,
          fat: goals.targetFat,
          waterMl: goals.targetWaterMl,
        },
        weeklyStats: {
          days: [],
          avgCalories: 0,
          avgProtein: 0,
          avgWaterLiters: 0,
        },
      };
    }
  }

  private buildWorkoutContext(): AIWorkoutContext {
    try {
      const todayWorkout = workoutService.load();
      const stats = workoutService.statistics();

      return {
        todayWorkout,
        statistics: stats,
        isWorkoutCompleted: stats.completionPercentage === 100,
      };
    } catch (error) {
      console.error('AIContextBuilder: Error constructing workout context', error);
      return {
        todayWorkout: workoutService.getTodayWorkout(),
        statistics: {
          workoutTitle: 'Today Workout',
          durationMinutes: 45,
          totalExercises: 0,
          totalSets: 0,
          completedSets: 0,
          completionPercentage: 0,
        },
        isWorkoutCompleted: false,
      };
    }
  }

  private buildProgressContext(): AIProgressContext {
    try {
      const data = progressService.load();
      const latestWeight = data.weights.length > 0 ? data.weights[data.weights.length - 1].weightKg : null;

      return {
        latestWeightKg: latestWeight,
        weightHistory: data.weights,
        measurements: data.measurements,
        personalRecords: data.prs,
        stats: data.stats,
        summary: data.summary,
      };
    } catch (error) {
      console.error('AIContextBuilder: Error constructing progress context', error);
      const summary = progressService.getProgressSummary();
      const stats = progressService.getProgressStats();
      return {
        latestWeightKg: null,
        weightHistory: [],
        measurements: [],
        personalRecords: [],
        stats,
        summary,
      };
    }
  }

  private buildStreaksContext(
    checkInContext: AITodayCheckInContext,
    workoutContext: AIWorkoutContext,
    progressContext: AIProgressContext
  ): AIStreaksContext {
    return {
      checkInStreakDays: progressContext.stats.currentStreak,
      workoutStreakDays: progressContext.summary.workoutStreak,
      weeklyWorkoutAdherence: workoutContext.statistics.completionPercentage,
      hasCompletedCheckInToday: checkInContext.hasCheckedInToday,
      hasCompletedWorkoutToday: workoutContext.isWorkoutCompleted,
    };
  }

  private buildGoalsContext(
    profileContext: AIProfileContext,
    nutritionContext: AINutritionContext
  ): AIGoalsContext {
    const rawP = profileContext.rawProfile;
    const goals = nutritionContext.goals;

    return {
      primaryGoal: rawP.fitnessGoal,
      targetWeightKg: rawP.targetWeightKg,
      currentWeightKg: rawP.currentWeightKg,
      weightDeltaKg: +(rawP.targetWeightKg - rawP.currentWeightKg).toFixed(1),
      dailyCalorieTarget: goals.targetCalories,
      dailyProteinTarget: goals.targetProtein,
      dailyCarbTarget: goals.targetCarbs,
      dailyFatTarget: goals.targetFat,
      dailyWaterTargetMl: goals.targetWaterMl,
    };
  }

  private formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private getDayOfWeek(date: Date): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }
}

export const contextBuilder = new AIContextBuilder();

export const buildAIContext = (options?: ContextBuilderOptions): AIContext => {
  return contextBuilder.buildContextSync(options);
};
