import {
  MorningPipelineResult,
  WorkoutPipelineResult,
  NutritionPipelineResult,
  MonthlyPipelineResult,
  WeeklyPipelineResult,
} from './types';
import { getPersona } from '../persona';
import { memoryEngine } from '../ai/memoryEngine';
import { checkInService } from '../services/checkInService';
import { workoutService } from '../services/workoutService';
import { nutritionService } from '../services/nutritionService';
import { transformationIntelligenceEngine } from '../intelligence';
import { dailyEngine } from '../daily/dailyEngine';
import { goalTracker } from '../intelligence/goalTracker';
import { roadmapPlanner } from '../intelligence/roadmapPlanner';
import { visionEngine } from '../vision/visionEngine';
import { eventBus } from './eventBus';

/**
 * SystemPipeline
 * Coordinates exact step-by-step execution flows across all underlying domain engines.
 */
export class SystemPipeline {
  /**
   * Morning Pipeline:
   * Persona -> Memory -> Check-in -> Transformation -> Daily Plan -> Coach Report
   */
  public async runMorningPipeline(
    weekNum: number = 1,
    dayNum: number = 1
  ): Promise<MorningPipelineResult> {
    const persona = getPersona();
    const checkInStats = checkInService.statistics();

    // 1. Memory Learn from current state
    memoryEngine.learn(undefined, undefined, {
      key: 'last_morning_run',
      value: new Date().toISOString(),
      category: 'lifestyle_routine',
    });

    // 2. Transformation & Daily Plan generation
    const dailyPlan = dailyEngine.generateTodayPlan(weekNum, dayNum);

    // 3. Emit Event
    await eventBus.emit('CHECKIN_COMPLETED', {
      sleepHours: checkInStats.todaySleepHours || persona.lifestyle?.averageSleep || 7.5,
      energyLevel: checkInStats.todayEnergyLevel || 8,
      soreness: checkInStats.todaySoreness || 'None',
      timestamp: new Date().toISOString(),
    });

    return {
      dailyPlan,
      executedAt: new Date().toISOString(),
      success: true,
    };
  }

  /**
   * Workout Pipeline:
   * Workout Complete -> Recovery Update -> Nutrition Update -> Goal Update -> Memory Update
   */
  public async runWorkoutPipeline(params?: {
    sessionType?: string;
    durationMins?: number;
    setsCompleted?: number;
  }): Promise<WorkoutPipelineResult> {
    const sessionType = params?.sessionType || 'Push';
    const durationMins = params?.durationMins || 45;
    const setsCompleted = params?.setsCompleted || 12;

    // 1. Record workout log
    workoutService.saveCompletedWorkout({
      id: `workout-${Date.now()}`,
      title: `${sessionType} Workout`,
      durationMinutes: durationMins,
      exercises: [],
    });

    // 2. Run Transformation Engine
    const updatedIntelligence = transformationIntelligenceEngine.runFullTransformationLoop(1, 1);

    // 3. Update Memory
    memoryEngine.learn(undefined, undefined, {
      key: 'last_completed_workout',
      value: `${sessionType} - ${setsCompleted} sets`,
      category: 'workout_preference',
      importance: 'high',
    });

    // 4. Update Goal Progress
    goalTracker.evaluateGoals();

    // 5. Emit Events
    await eventBus.emit('WORKOUT_COMPLETED', {
      sessionType,
      durationMins,
      setsCompleted,
      timestamp: new Date().toISOString(),
    });

    await eventBus.emit('RECOVERY_CHANGED', {
      newRecoveryScore: updatedIntelligence.status.recoveryScore,
      reason: 'Post-workout physical fatigue adjustment',
      timestamp: new Date().toISOString(),
    });

    await eventBus.emit('MEMORY_UPDATED', {
      memoryType: 'workout_preference',
      entryCount: memoryEngine.exportMemories().length,
      timestamp: new Date().toISOString(),
    });

    return {
      workoutSummary: {
        sessionType,
        setsCompleted,
        completionPercentage: 100,
      },
      updatedIntelligence,
      memoryLogged: true,
      executedAt: new Date().toISOString(),
    };
  }

  /**
   * Nutrition Pipeline:
   * Meal Logged -> Nutrition Planner -> Recovery -> Coach Update
   */
  public async runNutritionPipeline(mealData?: {
    title: string;
    protein: number;
    calories: number;
    carbs?: number;
    fats?: number;
  }): Promise<NutritionPipelineResult> {
    const title = mealData?.title || 'High Protein Lunch';
    const protein = mealData?.protein || 45;
    const calories = mealData?.calories || 650;
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Save meal log in nutrition service
    nutritionService.addMealLog({
      foodId: `food-${Date.now()}`,
      foodName: title,
      mealType: 'Lunch',
      quantity: 1,
      calories,
      protein,
      carbs: mealData?.carbs || 60,
      fat: mealData?.fats || 18,
      servingSize: '1 serving',
      date: todayStr,
    });

    // 2. Re-run Transformation loop
    const updatedIntelligence = transformationIntelligenceEngine.runFullTransformationLoop(1, 1);

    const nutritionData = nutritionService.load();
    const totalLoggedProtein = nutritionData.mealLogs.reduce((acc, m) => acc + (m.protein || 0), 0);
    const waterMl = nutritionData.waterLog?.ml || 0;

    // 3. Emit Events
    await eventBus.emit('MEAL_LOGGED', {
      mealTitle: title,
      protein,
      calories,
      timestamp: new Date().toISOString(),
    });

    return {
      loggedMeal: {
        mealTitle: title,
        protein,
        calories,
      },
      totalLoggedProtein,
      proteinTarget: updatedIntelligence.mealPlan.totalProtein,
      hydrationMl: waterMl,
      updatedIntelligence,
      executedAt: new Date().toISOString(),
    };
  }

  /**
   * Vision & Monthly Pipeline:
   * New Photos -> Gemini Vision -> Body Analyzer -> Comparison -> Transformation Engine -> Roadmap Update -> Goal Tracker -> Coach Report
   */
  public async runVisionPipeline(month: string = 'Month 1'): Promise<MonthlyPipelineResult> {
    // 1. Analyze photos via Vision Engine
    const visionReport = await visionEngine.analyzeAndGenerateReport(month);

    // 2. Re-evaluate Transformation Engine with updated body fat & muscle priorities
    const updatedIntelligence = transformationIntelligenceEngine.runFullTransformationLoop(1, 1);

    // 3. Update Roadmap & Goals
    const updatedRoadmap = roadmapPlanner.generateRoadmap(updatedIntelligence.status, 1);

    goalTracker.evaluateGoals();

    // 4. Emit Events
    await eventBus.emit('PHOTO_UPLOADED', {
      month,
      poseAngle: 'Front',
      timestamp: new Date().toISOString(),
    });

    await eventBus.emit('ROADMAP_UPDATED', {
      currentMonth: month,
      newObjective: updatedRoadmap.currentObjective,
      timestamp: new Date().toISOString(),
    });

    return {
      month,
      visionReport,
      updatedIntelligence,
      roadmapUpdated: true,
      executedAt: new Date().toISOString(),
    };
  }

  /**
   * Monthly Review execution pipeline.
   */
  public async runMonthlyReview(month: string = 'Month 1'): Promise<MonthlyPipelineResult> {
    const res = await this.runVisionPipeline(month);

    await eventBus.emit('MONTH_FINISHED', {
      month,
      timestamp: new Date().toISOString(),
    });

    return res;
  }

  /**
   * Weekly Review execution pipeline.
   */
  public async runWeeklyReview(): Promise<WeeklyPipelineResult> {
    const workoutStats = workoutService.statistics();

    const adherencePercent = workoutStats.completionPercentage || 80;
    const summary = `Weekly workout completion rate at ${adherencePercent.toFixed(0)}%.`;

    goalTracker.evaluateGoals();

    await eventBus.emit('GOAL_UPDATED', {
      goalType: 'Weekly Adherence',
      newTarget: `${adherencePercent.toFixed(0)}%`,
      timestamp: new Date().toISOString(),
    });

    return {
      weekNumber: 1,
      weeklyAdherencePercent: adherencePercent,
      workoutCount: workoutStats.completedSets,
      summary,
      executedAt: new Date().toISOString(),
    };
  }
}

export const pipeline = new SystemPipeline();
