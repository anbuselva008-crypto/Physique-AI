import { nutritionPlanner } from '../intelligence/nutritionPlanner';
import { nutritionService } from '../services/nutritionService';
import { getPersona } from '../persona';
import { transformationIntelligenceEngine } from '../intelligence';
import { systemController } from '../system/systemController';

export interface NutritionScreenData {
  todayMealPlan: ReturnType<typeof nutritionPlanner.generateTodayMealPlan>;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  consumedCalories: number;
  consumedProtein: number;
  consumedCarbs: number;
  consumedFat: number;
  remainingCalories: number;
  remainingProtein: number;
  waterCurrentLiters: number;
  waterTargetLiters: number;
  dailyBudgetINR: number;
  suggestedMeals: {
    mealTitle: string;
    items: string[];
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  }[];
}

/**
 * NutritionConnector
 * Connects Nutrition Planner & Service to supply live macro data and remaining targets.
 */
export class NutritionConnector {
  /**
   * Retrieves today's live Nutrition screen data.
   */
  public getTodayNutritionData(): NutritionScreenData {
    const persona = getPersona();
    const intelState = transformationIntelligenceEngine.runFullTransformationLoop(1, 1);
    const plan = nutritionPlanner.generateTodayMealPlan();

    const nutritionData = nutritionService.load();
    const mealLogs = nutritionData.mealLogs || [];

    const consumedCalories = mealLogs.reduce((sum, m) => sum + (m.calories || 0), 0);
    const consumedProtein = mealLogs.reduce((sum, m) => sum + (m.protein || 0), 0);
    const consumedCarbs = mealLogs.reduce((sum, m) => sum + (m.carbs || 0), 0);
    const consumedFat = mealLogs.reduce((sum, m) => sum + (m.fat || 0), 0);

    const remainingCalories = Math.max(0, plan.totalCalories - consumedCalories);
    const remainingProtein = Math.max(0, plan.totalProtein - consumedProtein);

    const waterCurrentLiters = +((nutritionData.waterLog?.ml || 2500) / 1000).toFixed(2);

    const suggestedMeals = [
      plan.breakfast,
      plan.lunch,
      plan.dinner,
      plan.snacks,
      plan.preWorkoutMeal,
      plan.postWorkoutMeal,
      plan.nightMeal,
    ].map((m) => ({
      mealTitle: m.title,
      items: m.items,
      calories: m.calories,
      protein: m.protein,
      carbs: m.carbs,
      fats: m.fats,
    }));

    return {
      todayMealPlan: plan,
      targetCalories: plan.totalCalories,
      targetProtein: plan.totalProtein,
      targetCarbs: plan.totalCarbs,
      targetFat: plan.totalFats,
      consumedCalories,
      consumedProtein,
      consumedCarbs,
      consumedFat,
      remainingCalories,
      remainingProtein,
      waterCurrentLiters,
      waterTargetLiters: plan.hydrationTargetLiters,
      dailyBudgetINR: 250,
      suggestedMeals,
    };
  }

  /**
   * Logs a meal and executes the Nutrition Pipeline.
   */
  public async logMeal(mealData: {
    title: string;
    protein: number;
    calories: number;
    carbs?: number;
    fats?: number;
  }): Promise<void> {
    await systemController.runNutritionPipeline(mealData);
  }

  /**
   * Logs water intake.
   */
  public logWater(additionalMl: number): void {
    const todayStr = new Date().toISOString().split('T')[0];
    nutritionService.addWaterIntake(todayStr, additionalMl);
  }
}

export const nutritionConnector = new NutritionConnector();
