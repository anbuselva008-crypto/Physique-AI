import { MealLogItem, WaterLog, DailyNutritionGoals } from '../types';
import { nutritionService } from '../services/nutritionService';
import { workoutService } from '../services/workoutService';
import { progressService } from '../services/progressService';
import { nutritionCoachEngine, EndOfDayAnalysis } from '../intelligence/nutritionCoachEngine';
import { nutritionLearningEngine } from '../utils/nutritionLearningEngine';
import { eventBus } from '../system/eventBus';
import { stateSynchronizer } from '../integration/stateSynchronizer';
import { getAvailableLocalFoods } from '../knowledge/localFoodDatabase';

const DAILY_HISTORY_KEY = 'physique_ai_daily_history_records';
const LOCKED_DAYS_KEY = 'physique_ai_locked_days';

export interface CoachReview {
  overallScore: number;
  scores: {
    workout: number;
    nutrition: number;
    hydration: number;
    recovery: number;
    discipline: number;
  };
  biggestWin: string;
  biggestMistake: string;
  tomorrowMission: string;
}

export interface TomorrowWorkoutPlan {
  title: string;
  category: string;
  durationMinutes: number;
  difficulty: string;
  primaryGoal: string;
  exercisesCount: number;
  exercisesSummary: string[];
}

export interface TomorrowDietPlan {
  breakfast: string;
  lunch: string;
  snack: string;
  dinner: string;
  totalCalories: number;
  totalProtein: number;
  estimatedBudgetInr: number;
  adjustmentReasoning: string;
}

export interface DailyHistoryRecord {
  date: string; // e.g. "2026-08-08"
  completedAt: string;
  isCompleted: boolean;
  isLocked: boolean;

  // Nutrition
  nutrition: {
    breakfastLogged: boolean;
    lunchLogged: boolean;
    dinnerLogged: boolean;
    snacksLogged: boolean;
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    totalWaterMl: number;
    totalCostInr: number;
    mealsCount: number;
    meals: MealLogItem[];
  };

  // Nutrition Analysis Report (Part 3)
  analysisReport: {
    protein: { actual: number; target: number; status: string; text: string };
    carbs: { actual: number; target: number; missing: number; suggestion: string };
    fat: { actual: number; target: number; exceededBy: number; suggestion: string };
    water: { actual: number; target: number; missing: number; suggestion: string };
    budget: { spent: number; cap: number; status: string; tip: string };
  };

  // Coach Review (Part 4)
  coachReview: CoachReview;

  // Workout
  workout: {
    title: string;
    completed: boolean;
    durationMinutes: number;
    totalVolumeKg: number;
  };

  // Progress Snapshot
  progress: {
    weightKg: number;
    completionPercentage: number;
  };

  // Generated Tomorrow (Part 7 & Part 8)
  nextDayPlan: {
    workout: TomorrowWorkoutPlan;
    diet: TomorrowDietPlan;
  };
}

export class DailyTransformationService {
  /**
   * Checks if Breakfast, Lunch, and Dinner are logged for the given date.
   */
  public checkCanCompleteDay(dateStr: string): {
    canComplete: boolean;
    missingMeals: ('Breakfast' | 'Lunch' | 'Dinner')[];
    hasBreakfast: boolean;
    hasLunch: boolean;
    hasDinner: boolean;
  } {
    const meals = nutritionService.getMealLogsForDate(dateStr);
    const hasBreakfast = meals.some((m) => m.mealType === 'Breakfast');
    const hasLunch = meals.some((m) => m.mealType === 'Lunch');
    const hasDinner = meals.some((m) => m.mealType === 'Dinner');

    const missingMeals: ('Breakfast' | 'Lunch' | 'Dinner')[] = [];
    if (!hasBreakfast) missingMeals.push('Breakfast');
    if (!hasLunch) missingMeals.push('Lunch');
    if (!hasDinner) missingMeals.push('Dinner');

    return {
      canComplete: hasBreakfast && hasLunch && hasDinner,
      missingMeals,
      hasBreakfast,
      hasLunch,
      hasDinner,
    };
  }

  /**
   * Lock/Unlock state check
   */
  public isDayLocked(dateStr: string): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const raw = localStorage.getItem(LOCKED_DAYS_KEY);
      if (raw) {
        const map = JSON.parse(raw);
        return Boolean(map[dateStr]);
      }
    } catch (e) {
      console.error('Error reading locked days', e);
    }
    return false;
  }

  public setDayLock(dateStr: string, locked: boolean): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(LOCKED_DAYS_KEY);
      const map = raw ? JSON.parse(raw) : {};
      map[dateStr] = locked;
      localStorage.setItem(LOCKED_DAYS_KEY, JSON.stringify(map));
    } catch (e) {
      console.error('Error setting day lock', e);
    }
  }

  /**
   * Core Pipeline: Executes Complete Today's Transformation Loop.
   */
  public executeCompleteDayPipeline(dateStr: string): DailyHistoryRecord {
    // 1. Lock the day's food log
    this.setDayLock(dateStr, true);

    // 2. Fetch today's actual data
    const mealLogs = nutritionService.getMealLogsForDate(dateStr);
    const waterLog = nutritionService.getWaterForDate(dateStr);
    const goals = nutritionService.getNutritionGoals();
    const todayWorkout = workoutService.getTodayWorkout();
    const eodAnalysis = nutritionCoachEngine.generateAnalysis(dateStr);

    let checkIn: any = null;
    try {
      const raw = localStorage.getItem('physique_ai_today_checkin');
      if (raw) checkIn = JSON.parse(raw);
    } catch (e) {}

    const hasBreakfast = mealLogs.some((m) => m.mealType === 'Breakfast');
    const hasLunch = mealLogs.some((m) => m.mealType === 'Lunch');
    const hasDinner = mealLogs.some((m) => m.mealType === 'Dinner');
    const hasSnacks = mealLogs.some((m) => m.mealType === 'Snacks');

    const totalCals = mealLogs.reduce((sum, m) => sum + m.calories, 0);
    const totalProt = Math.round(mealLogs.reduce((sum, m) => sum + m.protein, 0));
    const totalCarbs = Math.round(mealLogs.reduce((sum, m) => sum + m.carbs, 0));
    const totalFat = Math.round(mealLogs.reduce((sum, m) => sum + m.fat, 0));
    const totalCostInr = mealLogs.reduce(
      (sum, m) => sum + nutritionCoachEngine.estimateMealCost(m.foodName),
      0
    );

    // 3. Part 3: AI Nutrition Analysis
    const missingCarbs = Math.max(0, goals.targetCarbs - totalCarbs);
    const excessFat = Math.max(0, totalFat - goals.targetFat);
    const missingWater = Math.max(0, (goals.targetWaterMl - (waterLog.ml || 0)) / 1000);

    const analysisReport = {
      protein: {
        actual: totalProt,
        target: goals.targetProtein,
        status:
          totalProt >= goals.targetProtein
            ? 'Excellent'
            : totalProt >= goals.targetProtein - 15
            ? 'Good'
            : 'Needs Focus',
        text:
          totalProt >= goals.targetProtein
            ? `Achieved ${totalProt}g protein against ${goals.targetProtein}g target. Excellent muscle stimulus!`
            : `Achieved ${totalProt}g / ${goals.targetProtein}g. Short by ${
                goals.targetProtein - totalProt
              }g protein.`,
      },
      carbs: {
        actual: totalCarbs,
        target: goals.targetCarbs,
        missing: missingCarbs,
        suggestion:
          missingCarbs > 30
            ? 'Increase rice, dosa or chapati tomorrow to restore muscle glycogen.'
            : 'Carbohydrates were well aligned with your daily expenditure.',
      },
      fat: {
        actual: totalFat,
        target: goals.targetFat,
        exceededBy: excessFat,
        suggestion:
          excessFat > 10
            ? 'Reduce oily mess foods or deep-fried gravies tomorrow.'
            : 'Fat intake was optimal for hormone production.',
      },
      water: {
        actual: +((waterLog.ml || 0) / 1000).toFixed(1),
        target: +(goals.targetWaterMl / 1000).toFixed(1),
        missing: +missingWater.toFixed(1),
        suggestion:
          missingWater > 0.5
            ? 'Carry a water bottle during college lectures to hit 3L.'
            : 'Hydration target achieved! Great cellular volume.',
      },
      budget: {
        spent: totalCostInr,
        cap: 150,
        status: totalCostInr <= 150 ? 'Within Budget' : 'Exceeded Daily Cap',
        tip:
          totalCostInr <= 150
            ? `Spent ₹${totalCostInr} / ₹150 cap. Great student budget discipline!`
            : `Exceeded by ₹${totalCostInr - 150}. Swap restaurant biryani for ₹60 Egg Biryani + ₹14 Boiled Eggs.`,
      },
    };

    // 4. Part 4: AI Coach Review
    const isWorkoutCompleted =
      todayWorkout.exercises &&
      todayWorkout.exercises.length > 0 &&
      todayWorkout.exercises.every((ex) => ex.sets && ex.sets.every((s) => s.completed));

    const workoutScore = isWorkoutCompleted ? 95 : 60;
    const nutritionScore = Math.min(
      100,
      Math.round((totalProt / goals.targetProtein) * 60 + (totalCals / goals.targetCalories) * 40)
    );
    const hydrationScore = Math.min(100, Math.round(((waterLog.ml || 0) / goals.targetWaterMl) * 100));
    const recoveryScore = eodAnalysis.scores.recoveryScore || 85;
    const disciplineScore = Math.round((workoutScore + nutritionScore + hydrationScore) / 3);

    const overallScore = Math.round(
      workoutScore * 0.3 +
        nutritionScore * 0.35 +
        hydrationScore * 0.15 +
        recoveryScore * 0.1 +
        disciplineScore * 0.1
    );

    const biggestWin =
      totalProt >= goals.targetProtein
        ? `Exceeded ${goals.targetProtein}g protein target on a student budget (₹${totalCostInr})!`
        : isWorkoutCompleted
        ? `Completed entire ${todayWorkout.title} workout session with full intensity!`
        : `Logged full nutrition day with ₹${totalCostInr} spend!`;

    const biggestMistake =
      missingWater > 1.0
        ? `Water intake was short by ${missingWater.toFixed(1)}L (${((waterLog.ml || 0) / 1000).toFixed(1)}L logged).`
        : excessFat > 15
        ? `Oily food preparation added +${excessFat}g excess fat.`
        : totalProt < goals.targetProtein
        ? `Missed protein target by ${goals.targetProtein - totalProt}g.`
        : 'Slight deviation in meal timing during college hours.';

    const tomorrowMission =
      missingCarbs > 40
        ? 'Fuel tomorrow\'s workout with +2 Bananas and 2 Egg Dosas before 5 PM.'
        : 'Attack tomorrow\'s Back + Biceps session with maximum progressive overload!';

    const coachReview: CoachReview = {
      overallScore,
      scores: {
        workout: workoutScore,
        nutrition: nutritionScore,
        hydration: hydrationScore,
        recovery: recoveryScore,
        discipline: disciplineScore,
      },
      biggestWin,
      biggestMistake,
      tomorrowMission,
    };

    // 5. Part 7: Generate Tomorrow's Workout
    const tomorrowWorkout: TomorrowWorkoutPlan = {
      title: 'Back + Biceps Hypertrophy',
      category: 'Upper Body Width & Thickness',
      durationMinutes: 50,
      difficulty: 'Intermediate',
      primaryGoal: 'Lat Width, Rear Delt & Bicep Density',
      exercisesCount: 5,
      exercisesSummary: [
        'Lat Pulldowns (4 sets x 10-12 reps)',
        'Seated Cable Rows (4 sets x 10-12 reps)',
        'Dumbbell Rows (3 sets x 10 reps)',
        'Face Pulls (3 sets x 15 reps)',
        'Incline Dumbbell Bicep Curls (4 sets x 12 reps)',
      ],
    };

    // 6. Part 8: Generate Tomorrow's Meal Plan
    const isCarbsLow = missingCarbs > 30;
    const tomorrowDiet: TomorrowDietPlan = {
      breakfast: isCarbsLow ? '2 Egg Dosas + 2 Boiled Eggs (₹40, 28g P)' : '2 Egg Dosas (₹40, 28g P)',
      lunch: isCarbsLow ? 'Rice + Sambar + 2 Boiled Eggs (₹59, 19g P)' : 'Egg Biryani (₹60, 16g P)',
      snack: '2 Bananas + 50g Roasted Chana (₹20, 13g P)',
      dinner: '2 Egg Chapatis + 200g Curd (₹40, 31g P)',
      totalCalories: 2200,
      totalProtein: 145,
      estimatedBudgetInr: 145,
      adjustmentReasoning: isCarbsLow
        ? 'Today\'s carbs were low. Added 2 Egg Dosas + Rice & Sambar tomorrow to restore glycogen for Back + Biceps.'
        : 'Tomorrow\'s diet calibrated for peak recovery and ₹145 budget cap.',
    };

    // 7. Assemble Record
    const latestWeight = progressService.getWeightHistory()[0]?.weightKg || 68;
    const historyRecord: DailyHistoryRecord = {
      date: dateStr,
      completedAt: new Date().toISOString(),
      isCompleted: true,
      isLocked: true,
      nutrition: {
        breakfastLogged: hasBreakfast,
        lunchLogged: hasLunch,
        dinnerLogged: hasDinner,
        snacksLogged: hasSnacks,
        totalCalories: totalCals,
        totalProtein: totalProt,
        totalCarbs,
        totalFat,
        totalWaterMl: waterLog.ml || 0,
        totalCostInr,
        mealsCount: mealLogs.length,
        meals: mealLogs,
      },
      analysisReport,
      coachReview,
      workout: {
        title: todayWorkout.title || 'Resistance Training',
        completed: isWorkoutCompleted,
        durationMinutes: 45,
        totalVolumeKg: isWorkoutCompleted ? 3850 : 0,
      },
      progress: {
        weightKg: latestWeight,
        completionPercentage: overallScore,
      },
      nextDayPlan: {
        workout: tomorrowWorkout,
        diet: tomorrowDiet,
      },
    };

    // 8. Save Record to Database Storage
    this.saveDailyHistoryRecord(historyRecord);

    // 9. Update Memory Engine & Event Bus
    nutritionLearningEngine.recordDailyAnalysis(
      totalProt / goals.targetProtein,
      totalCostInr,
      (waterLog.ml || 0) / goals.targetWaterMl
    );

    eventBus.emit('CHECKIN_COMPLETED', {
      sleepHours: checkIn?.sleepHours || 7,
      energyLevel: checkIn?.energyLevel || 8,
      soreness: checkIn?.soreness || 'None',
      timestamp: new Date().toISOString(),
    });

    eventBus.emit('MEAL_LOGGED', {
      mealTitle: 'Full Day Nutrition Completed',
      protein: totalProt,
      calories: totalCals,
      timestamp: new Date().toISOString(),
    });

    eventBus.emit('ROADMAP_UPDATED', {
      currentMonth: 'Month 1',
      newObjective: 'Adaptive Nutrition & Recovery Protocol Synced',
      timestamp: new Date().toISOString(),
    });

    stateSynchronizer.syncAllState();

    return historyRecord;
  }

  /**
   * Save / Retrieve history records
   */
  public saveDailyHistoryRecord(record: DailyHistoryRecord): void {
    if (typeof window === 'undefined') return;
    try {
      const allRecords = this.getAllDailyHistoryRecords();
      const existingIdx = allRecords.findIndex((r) => r.date === record.date);
      if (existingIdx >= 0) {
        allRecords[existingIdx] = record;
      } else {
        allRecords.unshift(record);
      }
      localStorage.setItem(DAILY_HISTORY_KEY, JSON.stringify(allRecords));
    } catch (e) {
      console.error('Error saving daily history record', e);
    }
  }

  public getDailyHistoryRecord(dateStr: string): DailyHistoryRecord | null {
    const all = this.getAllDailyHistoryRecords();
    return all.find((r) => r.date === dateStr) || null;
  }

  public getAllDailyHistoryRecords(): DailyHistoryRecord[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(DAILY_HISTORY_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error('Error reading daily history records', e);
    }
    return [];
  }
}

export const dailyTransformationService = new DailyTransformationService();
