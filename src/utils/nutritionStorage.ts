import {
  FoodItem,
  MealLogItem,
  MealType,
  FoodCategory,
  WaterLog,
  DailyNutritionGoals,
  WeeklyNutritionDayStats,
} from '../types';
import { INDIAN_FOOD_DATABASE } from './foodDatabase';
import { LOCAL_FOOD_KNOWLEDGE_BASE } from '../knowledge/localFoodDatabase';

const localFoodsAsFoodItems: FoodItem[] = LOCAL_FOOD_KNOWLEDGE_BASE.map((item) => ({
  id: item.id,
  name: item.name,
  calories: item.calories,
  protein: item.protein,
  carbs: item.carbs,
  fat: item.fat,
  servingSize: item.servingSize,
  category: (item.category === 'Biryani & Rice'
    ? 'Rice'
    : item.category === 'Eggs & Chicken' || item.category === 'Vegetarian Protein'
    ? 'Protein'
    : item.category === 'Budget Snack'
    ? 'Snack'
    : 'South Indian') as FoodCategory,
}));

const MEALS_KEY = 'physique_ai_meal_logs';
const WATER_KEY = 'physique_ai_water_logs';
const CUSTOM_FOODS_KEY = 'physique_ai_custom_foods';
const GOALS_KEY = 'physique_ai_nutrition_goals';

export const getFormattedDate = (offsetDays: number = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const DEFAULT_GOALS: DailyNutritionGoals = {
  targetCalories: 2200,
  targetProtein: 140, // g
  targetCarbs: 250, // g
  targetFat: 65, // g
  targetWaterMl: 3000, // ml
};

// Seed sample meals if today has none
const getSeedMeals = (): MealLogItem[] => {
  const today = getFormattedDate(0);
  const yesterday = getFormattedDate(1);
  const day2 = getFormattedDate(2);

  return [
    {
      id: 'm-1',
      foodId: 'f-3',
      foodName: 'Idli',
      mealType: 'Breakfast',
      quantity: 3,
      calories: 195,
      protein: 6,
      carbs: 36,
      fat: 1.5,
      servingSize: '3 Pieces',
      date: today,
    },
    {
      id: 'm-2',
      foodId: 'f-11',
      foodName: 'Sambar',
      mealType: 'Breakfast',
      quantity: 1,
      calories: 85,
      protein: 4,
      carbs: 14,
      fat: 1.5,
      servingSize: '1 Katori (150ml)',
      date: today,
    },
    {
      id: 'm-3',
      foodId: 'f-65',
      foodName: 'Whey Protein Scoop (1 Scoop)',
      mealType: 'Breakfast',
      quantity: 1,
      calories: 120,
      protein: 24,
      carbs: 2,
      fat: 1.5,
      servingSize: '1 Scoop (30g)',
      date: today,
    },
    {
      id: 'm-4',
      foodId: 'f-45',
      foodName: 'Chicken Biryani',
      mealType: 'Lunch',
      quantity: 1,
      calories: 420,
      protein: 24,
      carbs: 52,
      fat: 14,
      servingSize: '1 Plate (300g)',
      date: today,
    },
    {
      id: 'm-5',
      foodId: 'f-71',
      foodName: 'Greek Yogurt (Plain)',
      mealType: 'Snacks',
      quantity: 1,
      calories: 95,
      protein: 10,
      carbs: 5,
      fat: 4,
      servingSize: '1 Cup (150g)',
      date: today,
    },
    // Yesterday
    {
      id: 'm-prev-1',
      foodId: 'f-23',
      foodName: 'Aloo Paratha',
      mealType: 'Breakfast',
      quantity: 2,
      calories: 580,
      protein: 12,
      carbs: 90,
      fat: 20,
      servingSize: '2 Parathas',
      date: yesterday,
    },
    {
      id: 'm-prev-2',
      foodId: 'f-63',
      foodName: 'Grilled Chicken Breast',
      mealType: 'Lunch',
      quantity: 1.5,
      calories: 247,
      protein: 46.5,
      carbs: 0,
      fat: 5.4,
      servingSize: '150g',
      date: yesterday,
    },
    {
      id: 'm-prev-3',
      foodId: 'f-41',
      foodName: 'Steamed White Rice',
      mealType: 'Lunch',
      quantity: 1.5,
      calories: 270,
      protein: 5.25,
      carbs: 60,
      fat: 0.75,
      servingSize: '225g',
      date: yesterday,
    },
    // Day 2
    {
      id: 'm-prev-4',
      foodId: 'f-2',
      foodName: 'Masala Dosa',
      mealType: 'Breakfast',
      quantity: 2,
      calories: 500,
      protein: 10,
      carbs: 80,
      fat: 16,
      servingSize: '2 Dosas',
      date: day2,
    },
    {
      id: 'm-prev-5',
      foodId: 'f-28',
      foodName: 'Dal Tadka',
      mealType: 'Lunch',
      quantity: 2,
      calories: 300,
      protein: 14,
      carbs: 40,
      fat: 10,
      servingSize: '2 Katoris',
      date: day2,
    },
  ];
};

// --- Food Database Search & Storage ---
export const getAllFoods = (): FoodItem[] => {
  const base = [...localFoodsAsFoodItems, ...INDIAN_FOOD_DATABASE];
  if (typeof window === 'undefined') return base;
  try {
    const raw = localStorage.getItem(CUSTOM_FOODS_KEY);
    if (raw) {
      const customItems: FoodItem[] = JSON.parse(raw);
      return [...customItems, ...base];
    }
  } catch (err) {
    console.error('Error loading custom foods', err);
  }
  return base;
};

export const addCustomFood = (food: Omit<FoodItem, 'id'>): FoodItem[] => {
  const customItem: FoodItem = {
    ...food,
    id: `custom-${Date.now()}`,
  };

  try {
    const raw = localStorage.getItem(CUSTOM_FOODS_KEY);
    const existing: FoodItem[] = raw ? JSON.parse(raw) : [];
    const updated = [customItem, ...existing];
    localStorage.setItem(CUSTOM_FOODS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving custom food', err);
  }

  return getAllFoods();
};

// --- Nutrition Goals Storage ---
export const getNutritionGoals = (): DailyNutritionGoals => {
  if (typeof window === 'undefined') return DEFAULT_GOALS;
  try {
    const raw = localStorage.getItem(GOALS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading nutrition goals', e);
  }
  localStorage.setItem(GOALS_KEY, JSON.stringify(DEFAULT_GOALS));
  return DEFAULT_GOALS;
};

export const saveNutritionGoals = (goals: DailyNutritionGoals): DailyNutritionGoals => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  }
  return goals;
};

// --- Meal Logs Storage ---
export const getAllMealLogs = (): MealLogItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MEALS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading meal logs', err);
  }
  return [];
};

export const getMealLogsForDate = (date: string): MealLogItem[] => {
  return getAllMealLogs().filter((m) => m.date === date);
};

export const addMealLog = (item: Omit<MealLogItem, 'id'>): MealLogItem[] => {
  const allLogs = getAllMealLogs();
  const newLog: MealLogItem = {
    ...item,
    id: `meal-${Date.now()}`,
  };
  const updated = [newLog, ...allLogs];
  if (typeof window !== 'undefined') {
    localStorage.setItem(MEALS_KEY, JSON.stringify(updated));
  }
  return updated;
};

export const deleteMealLog = (id: string): MealLogItem[] => {
  const updated = getAllMealLogs().filter((m) => m.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(MEALS_KEY, JSON.stringify(updated));
  }
  return updated;
};

// --- Water Tracker Storage ---
export const getWaterLogs = (): Record<string, WaterLog> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(WATER_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading water logs', e);
  }
  return {};
};

export const getWaterForDate = (date: string): WaterLog => {
  const logs = getWaterLogs();
  return logs[date] || { date, ml: 0, targetMl: 3000 };
};

export const addWaterIntake = (date: string, addMl: number): WaterLog => {
  const logs = getWaterLogs();
  const current = logs[date] || { date, ml: 0, targetMl: 3000 };
  const updated: WaterLog = {
    ...current,
    ml: Math.max(0, current.ml + addMl),
  };
  logs[date] = updated;

  if (typeof window !== 'undefined') {
    localStorage.setItem(WATER_KEY, JSON.stringify(logs));
  }
  return updated;
};

// --- Statistics Calculation ---
export const getWeeklyStats = (): {
  days: WeeklyNutritionDayStats[];
  avgCalories: number;
  avgProtein: number;
  avgWaterLiters: number;
} => {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const allMeals = getAllMealLogs();
  const waterLogs = getWaterLogs();

  const days: WeeklyNutritionDayStats[] = [];
  let totalCal = 0;
  let totalProtein = 0;
  let totalWater = 0;

  for (let i = 6; i >= 0; i--) {
    const dateStr = getFormattedDate(i);
    const d = new Date(dateStr);
    const dayLabel = dayNames[d.getDay()];

    const dayMeals = allMeals.filter((m) => m.date === dateStr);
    const dayCalories = Math.round(dayMeals.reduce((sum, m) => sum + m.calories, 0));
    const dayProtein = Math.round(dayMeals.reduce((sum, m) => sum + m.protein, 0));
    const dayWater = waterLogs[dateStr]?.ml || 0;

    days.push({
      date: dateStr,
      dayLabel,
      calories: dayCalories,
      protein: dayProtein,
      waterMl: dayWater,
    });

    totalCal += dayCalories;
    totalProtein += dayProtein;
    totalWater += dayWater;
  }

  return {
    days,
    avgCalories: Math.round(totalCal / 7),
    avgProtein: Math.round(totalProtein / 7),
    avgWaterLiters: +(totalWater / 7 / 1000).toFixed(1),
  };
};
