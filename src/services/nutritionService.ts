import {
  FoodItem,
  MealLogItem,
  WaterLog,
  DailyNutritionGoals,
  WeeklyNutritionDayStats,
} from '../types';
import {
  getAllFoods,
  getMealLogsForDate,
  addMealLog,
  deleteMealLog,
  getWaterForDate,
  addWaterIntake,
  getNutritionGoals,
  saveNutritionGoals,
  getWeeklyStats,
  addCustomFood,
  getAllMealLogs,
  getFormattedDate,
} from '../utils/nutritionStorage';

export const nutritionService = {
  load(date: string = getFormattedDate(0)) {
    return {
      mealLogs: getMealLogsForDate(date),
      waterLog: getWaterForDate(date),
      goals: getNutritionGoals(),
      foods: getAllFoods(),
    };
  },

  save(mealItem: Omit<MealLogItem, 'id'>): MealLogItem[] {
    return addMealLog(mealItem);
  },

  update(goals: Partial<DailyNutritionGoals>): DailyNutritionGoals {
    const current = getNutritionGoals();
    const updated = { ...current, ...goals };
    return saveNutritionGoals(updated);
  },

  delete(mealLogId: string): MealLogItem[] {
    return deleteMealLog(mealLogId);
  },

  statistics() {
    return getWeeklyStats();
  },

  // Additional Domain Methods
  getAllFoods(): FoodItem[] {
    return getAllFoods();
  },

  getMealLogsForDate(date: string): MealLogItem[] {
    return getMealLogsForDate(date);
  },

  addMealLog(item: Omit<MealLogItem, 'id'>): MealLogItem[] {
    return addMealLog(item);
  },

  deleteMealLog(id: string): MealLogItem[] {
    return deleteMealLog(id);
  },

  getWaterForDate(date: string): WaterLog {
    return getWaterForDate(date);
  },

  addWaterIntake(date: string, addMl: number): WaterLog {
    return addWaterIntake(date, addMl);
  },

  getNutritionGoals(): DailyNutritionGoals {
    return getNutritionGoals();
  },

  saveNutritionGoals(goals: DailyNutritionGoals): DailyNutritionGoals {
    return saveNutritionGoals(goals);
  },

  addCustomFood(food: Omit<FoodItem, 'id'>): FoodItem[] {
    return addCustomFood(food);
  },

  getWeeklyStats() {
    return getWeeklyStats();
  },
};
