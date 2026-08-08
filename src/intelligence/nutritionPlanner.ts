import { DynamicMealPlan, MealDetail } from './types';
import { getPersona } from '../persona';
import { nutritionService } from '../services/nutritionService';
import { FOOD_KNOWLEDGE_BASE } from '../knowledge/foodKnowledge';

/**
 * NutritionPlanner
 * Generates practical, budget-conscious, realistic daily meal plans (Breakfast, Lunch, Dinner,
 * Snacks, Pre-Workout, Post-Workout, Night Meal) customized to the user's diet preferences,
 * cooking ability, workout timing, and remaining macronutrient targets.
 */
export class NutritionPlanner {
  /**
   * Generates today's tailored nutrition plan based on user goals, diet type, budget, and schedule.
   */
  public generateTodayMealPlan(): DynamicMealPlan {
    const persona = getPersona();
    const nutritionData = nutritionService.load();

    const weightKg = persona.body?.weight || 70;
    const primaryDiet = persona.diet?.dietaryPreferences?.[0] || 'High Protein Non-Veg';
    const dietTypeLower = primaryDiet.toLowerCase();
    const isVeg = dietTypeLower.includes('veg') && !dietTypeLower.includes('non');
    const budgetScore = 4;

    // Daily Macro Calculations
    const targetCalories =
      nutritionData.goals?.targetCalories || Math.round(weightKg * 32);
    const targetProtein =
      nutritionData.goals?.targetProtein || Math.round(weightKg * 2.0);
    const targetCarbs =
      nutritionData.goals?.targetCarbs || Math.round((targetCalories * 0.45) / 4);
    const targetFats =
      nutritionData.goals?.targetFat || Math.round((targetCalories * 0.25) / 9);

    // Filter available foods from knowledge base
    const availableFoods = FOOD_KNOWLEDGE_BASE.filter((f) => {
      if (isVeg && !f.isVegetarian) return false;
      return f.budgetScore >= budgetScore - 1;
    });

    // Helper to pick meal matching category or fallback
    const pickFoodItem = (category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack', minProtein: number): MealDetail => {
      const candidates = availableFoods.filter((f) => f.mealCategory === category && f.protein >= minProtein);
      const chosen = candidates[0] || availableFoods[0];

      if (!chosen) {
        return {
          title: `${category} Staple`,
          items: ['2 Whole Boiled Eggs or 100g Paneer', '1 Banana', 'Black Coffee'],
          calories: 350,
          protein: 20,
          carbs: 30,
          fats: 12,
        };
      }

      return {
        title: chosen.name,
        items: [
          `${chosen.name} (${chosen.servingSize || '1 serving'})`,
          chosen.isVegetarian ? '1 glass Fresh Curd / Buttermilk' : '2 Boiled Egg Whites',
        ],
        calories: chosen.calories + 80,
        protein: chosen.protein + 7,
        carbs: chosen.carbs + 10,
        fats: chosen.fat + 3,
      };
    };

    // Build Meals
    const breakfast = pickFoodItem('Breakfast', 12);
    const lunch = pickFoodItem('Lunch', 20);
    const dinner = pickFoodItem('Dinner', 20);
    const snacks = pickFoodItem('Snack', 8);

    const preWorkoutMeal: MealDetail = {
      title: 'Pre-Workout Energy Fuel (45 mins before training)',
      items: ['1 Medium Banana', '1 tbsp Peanut Butter (15g)', '1 cup Black Coffee / Green Tea'],
      calories: 210,
      protein: 5,
      carbs: 28,
      fats: 8,
      timing: '45 minutes before workout',
    };

    const postWorkoutMeal: MealDetail = {
      title: 'Post-Workout Anabolic Recovery Meal',
      items: isVeg
        ? ['200g Boiled Soya Chunks or 1 Scoop Whey in Water', '1 Bowl White Rice or 2 Rotis']
        : ['150g Grilled Chicken Breast or 4 Boiled Egg Whites', '1 Bowl White Rice (150g)'],
      calories: 380,
      protein: 32,
      carbs: 45,
      fats: 5,
      timing: 'Within 45 minutes post workout',
    };

    const nightMeal: MealDetail = {
      title: 'Night Muscle Recovery & Anti-Catabolic Snack',
      items: ['1 Glass Warm Turmeric Milk (200ml)', '5 Almonds + 2 Walnuts'],
      calories: 180,
      protein: 8,
      carbs: 12,
      fats: 10,
    };

    // Calculate totals
    const totalCalories =
      breakfast.calories +
      lunch.calories +
      dinner.calories +
      snacks.calories +
      preWorkoutMeal.calories +
      postWorkoutMeal.calories +
      nightMeal.calories;

    const totalProtein =
      breakfast.protein +
      lunch.protein +
      dinner.protein +
      snacks.protein +
      preWorkoutMeal.protein +
      postWorkoutMeal.protein +
      nightMeal.protein;

    const totalCarbs =
      breakfast.carbs +
      lunch.carbs +
      dinner.carbs +
      snacks.carbs +
      preWorkoutMeal.carbs +
      postWorkoutMeal.carbs +
      nightMeal.carbs;

    const totalFats =
      breakfast.fats +
      lunch.fats +
      dinner.fats +
      snacks.fats +
      preWorkoutMeal.fats +
      postWorkoutMeal.fats +
      nightMeal.fats;

    const hydrationTargetLiters = Math.round((weightKg * 0.045 + 0.5) * 10) / 10;

    const proteinTimingAdvice = [
      'Distribute protein evenly across 4-5 feedings (25g-35g per meal).',
      'Consume pre-workout carbs 45 minutes prior for peak muscle glycogen availability.',
      'Prioritize fast-absorbing protein (whey/egg whites/chicken) post workout for maximum muscle protein synthesis (MPS).',
    ];

    const practicalTips = [
      'Boil eggs or prep soya chunks in bulk during the morning to save time.',
      'If eating at college/canteen, opt for Idli, Egg Omelette, or Paneer Rolls instead of deep-fried samosas.',
      'Keep a jar of roasted chana and peanuts at your desk for clean snack craving management.',
    ];

    return {
      breakfast,
      lunch,
      dinner,
      snacks,
      preWorkoutMeal,
      postWorkoutMeal,
      nightMeal,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFats,
      hydrationTargetLiters,
      proteinTimingAdvice,
      practicalTips,
    };
  }
}

export const nutritionPlanner = new NutritionPlanner();
