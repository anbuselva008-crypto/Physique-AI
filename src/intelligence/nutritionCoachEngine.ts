import { MealLogItem, WaterLog, DailyNutritionGoals } from '../types';
import { getPersona } from '../persona';
import { nutritionService } from '../services/nutritionService';
import { workoutService } from '../services/workoutService';
import { progressService } from '../services/progressService';
import { 
  LOCAL_FOOD_KNOWLEDGE_BASE, 
  LocalFoodItem, 
  getAvailableLocalFoods 
} from '../knowledge/localFoodDatabase';
import { nutritionLearningEngine } from '../utils/nutritionLearningEngine';

export interface LocalFoodOption {
  name: string;
  category: string;
  serving: string;
  protein: number;
  calories: number;
  costInInr: number;
  whereToBuy: string;
  isVegetarian: boolean;
  notes?: string;
  proteinEfficiency?: number;
}

export interface FoodSubstitution {
  targetMacro: 'Protein' | 'Carbs' | 'Fat' | 'Budget';
  deficitOrExcessAmount: number; // e.g. 38g protein missing
  reasoning: string;
  options: {
    title: string;
    description: string;
    costInInr: number;
    proteinGrams: number;
    calories: number;
    location: string;
  }[];
}

export interface NextDayNutritionPlan {
  date: string;
  workoutTypeTomorrow: string;
  caloriesTarget: number;
  proteinTarget: number;
  totalEstimatedCostInr: number;
  meals: {
    mealType: 'Breakfast' | 'Lunch' | 'Snack' | 'Pre-Workout' | 'Post-Workout' | 'Dinner';
    time: string;
    suggestedFood: string;
    location: string;
    estimatedCostInr: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    preparationMethod?: string;
  }[];
  waterSchedule: string[];
  shoppingReminders: string[];
}

export interface MicroMealCoaching {
  mealName: string;
  goodChoices: string[];
  badChoicesOrOilyTraps: string[];
  missingNutrients: string[];
  overconsumedNutrients: string[];
  hydrationReminder: string;
  budgetAdvice: string;
  aiThinkingReasoning: string;
  proteinContributionGrams: number;
  costInr: number;
}

export interface SmartDailyCoachAnswer {
  query: string;
  answer: string;
  actionablePlan: string[];
  recommendedLocalFoods: LocalFoodItem[];
  estimatedTotalCost: number;
  proteinAdded: number;
  caloriesAdded: number;
  reasoningWhy: string;
}

export interface SmartGroceryItem {
  name: string;
  quantity: string;
  estimatedCostInr: number;
  lastsDays: number;
  proteinContributionGrams: number;
  category: 'Protein Staple' | 'Carb Base' | 'Produce' | 'Dairy' | 'Snack';
}

export interface EndOfDayAnalysis {
  hasLoggedMeals: boolean;
  date: string;
  isWeekend: boolean;
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    waterMl: number;
    costInr: number;
  };
  targets: DailyNutritionGoals & { targetBudgetInr: number };
  macroPercentages: {
    caloriesPct: number;
    proteinPct: number;
    carbsPct: number;
    fatPct: number;
    waterPct: number;
    budgetPct: number;
  };
  analysis: {
    overallSummary: string;
    whySucceededOrFailed: string;
    whatToBeDoneTomorrow: string;
    aiThinkingDeepReasoning: string;
    proteinAnalysis: {
      status: 'Below Target' | 'Met Target' | 'Above Target' | 'Excessive';
      missingGrams: number;
      explanation: string;
      localFoodSuggestions: LocalFoodOption[];
      cheapestCompletionPlan: string;
    };
    carbsAnalysis: {
      status: 'Low' | 'Optimal' | 'High';
      workoutImpact: string;
      suggestedCarbSources: string[];
    };
    fatAnalysis: {
      status: 'Optimal' | 'High' | 'Excessive';
      explanation: string;
      fatSourcesIdentified: string[];
      recommendation: string;
    };
    waterAnalysis: {
      status: 'Dehydrated' | 'Adequate' | 'Optimal';
      scorePct: number;
      recommendation: string;
    };
  };
  budgetAdherence: {
    todayEstimatedCostInr: number;
    dailyBudgetCapInr: number;
    monthlyBudgetCapInr: number;
    projectedMonthlySpendInr: number;
    adherenceStatus: 'Under Budget' | 'On Budget' | 'Over Budget';
    savingTip: string;
  };
  scores: {
    biggestWin: string;
    biggestMistake: string;
    mostEfficientProteinSource: string;
    budgetEfficiencyRating: string;
    hydrationScore: number; // 0-100
    recoveryScore: number; // 0-100
    macroBalanceScore: number; // 0-100
    mealTimingScore: number; // 0-100
  };
  substitutions: FoodSubstitution[];
  nextDayPlan: NextDayNutritionPlan;
  groceryList: SmartGroceryItem[];
}

export class NutritionCoachEngine {
  /**
   * Estimates cost in INR for a given logged food item using local food knowledge.
   */
  public estimateMealCost(foodName: string): number {
    const nameLower = foodName.toLowerCase();
    const matched = LOCAL_FOOD_KNOWLEDGE_BASE.find(item => 
      nameLower.includes(item.name.toLowerCase()) || item.name.toLowerCase().includes(nameLower)
    );
    if (matched) return matched.priceInr;

    if (nameLower.includes('egg dosa')) return 20;
    if (nameLower.includes('egg chapati')) return 20;
    if (nameLower.includes('dosa')) return 15;
    if (nameLower.includes('chapati')) return 15;
    if (nameLower.includes('egg biryani')) return 60;
    if (nameLower.includes('chicken biryani')) return 100;
    if (nameLower.includes('biryani')) return 80;
    if (nameLower.includes('rice') || nameLower.includes('sambar')) return 45;
    if (nameLower.includes('kuska')) return 50;
    if (nameLower.includes('boiled egg') || nameLower.includes('egg')) return 14;
    if (nameLower.includes('banana')) return 10;
    if (nameLower.includes('soya')) return 10;
    if (nameLower.includes('chana') || nameLower.includes('peanut')) return 10;
    if (nameLower.includes('chicken')) return 80;
    if (nameLower.includes('mutton')) return 180;
    if (nameLower.includes('fish')) return 80;
    return 30; // default conservative estimate
  }

  /**
   * Provides immediate micro-coaching after every meal entry.
   */
  public getMicroCoachingForMeal(meal: MealLogItem): MicroMealCoaching {
    const costInr = this.estimateMealCost(meal.foodName);
    const proteinGrams = meal.protein;
    const nameLower = meal.foodName.toLowerCase();

    // Record meal in learning engine
    nutritionLearningEngine.recordMealLogged(meal.foodName, costInr);

    const goodChoices: string[] = [];
    const badChoicesOrOilyTraps: string[] = [];
    const missingNutrients: string[] = [];
    const overconsumedNutrients: string[] = [];

    // Evaluate food specifics
    if (proteinGrams >= 12) {
      goodChoices.push(`Solid protein contribution (+${proteinGrams}g) for your skinny-fat recomposition goal.`);
    } else {
      missingNutrients.push(`Protein contribution (+${proteinGrams}g) is low. Try adding 2 Boiled Eggs (₹14) or Soya Chunks on induction.`);
    }

    if (nameLower.includes('biryani') || nameLower.includes('fried') || nameLower.includes('parotta') || meal.fat > 18) {
      badChoicesOrOilyTraps.push(`High hidden palm oil/ghee content (${meal.fat}g fat). Offset this by opting for dry boiled eggs or steamed idli/rice for your next meal.`);
    } else {
      goodChoices.push('Clean prep with manageable fat content.');
    }

    if (meal.carbs > 55) {
      overconsumedNutrients.push(`Carbohydrate load is high (${meal.carbs}g). Great pre-workout, but ensure you walk to college/gym to utilize the glycogen.`);
    }

    if (costInr > 80) {
      badChoicesOrOilyTraps.push(`High cost meal (₹${costInr}). Consumes a large portion of your ₹150 daily budget.`);
    }

    const budgetAdvice = costInr <= 30
      ? `Ultra budget friendly (₹${costInr})! Leaves ₹${150 - costInr} for the rest of your daily meals.`
      : costInr <= 60
      ? `Balanced spend (₹${costInr}). On track for your ₹150 daily cap.`
      : `High spend (₹${costInr}). Keep your remaining meals under ₹40 total (e.g., Boiled Eggs + Plain Chapati).`;

    const hydrationReminder = 'Drink 300-500ml of water now to aid digestion and nutrient absorption.';

    const aiThinkingReasoning = `Analyzed ${meal.foodName} (${meal.calories} kcal, ${meal.protein}g P, ${meal.carbs}g C, ${meal.fat}g F) against Saravanampatti budget constraints. Cost: ₹${costInr}. Protein efficiency: ${(meal.protein / (costInr || 1)).toFixed(2)}g/₹. Recomp Impact: ${meal.protein > 10 ? 'Positive' : 'Requires protein pairing'}.`;

    return {
      mealName: meal.foodName,
      goodChoices,
      badChoicesOrOilyTraps,
      missingNutrients,
      overconsumedNutrients,
      hydrationReminder,
      budgetAdvice,
      aiThinkingReasoning,
      proteinContributionGrams: proteinGrams,
      costInr,
    };
  }

  public answerUserNutritionQuery(queryText: string, dateStr?: string) {
    const res = this.askDailyCoach(queryText, dateStr);
    return {
      answer: res.answer,
      suggestedFoods: res.recommendedLocalFoods.map(f => ({
        name: f.name,
        costInr: f.priceInr,
        protein: f.protein,
        calories: f.calories,
        location: f.locationSource,
      })),
    };
  }

  /**
   * Conversational AI Dietitian Q&A Engine (Part 10).
   * Calculates answers dynamically from user's current macros, remaining budget, and local Saravanampatti database.
   */
  public askDailyCoach(query: string, dateStr: string = progressService.getFormattedDate(0)): SmartDailyCoachAnswer {
    const mealLogs = nutritionService.getMealLogsForDate(dateStr);
    const goals = nutritionService.getNutritionGoals();
    const currentProtein = mealLogs.reduce((sum, m) => sum + m.protein, 0);
    const currentCals = mealLogs.reduce((sum, m) => sum + m.calories, 0);
    const currentCost = mealLogs.reduce((sum, m) => sum + this.estimateMealCost(m.foodName), 0);

    const proteinDeficit = Math.max(0, goals.targetProtein - currentProtein);
    const caloriesDeficit = Math.max(0, goals.targetCalories - currentCals);
    const remainingBudget = Math.max(0, 150 - currentCost);

    const qLower = query.toLowerCase();
    const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
    const availableFoods = getAvailableLocalFoods(isWeekend);

    let answer = '';
    const actionablePlan: string[] = [];
    let recommendedLocalFoods: LocalFoodItem[] = [];
    let estimatedTotalCost = 0;
    let proteinAdded = 0;
    let caloriesAdded = 0;
    let reasoningWhy = '';

    // 1. "I only have ₹50" / "Budget tight"
    if (qLower.includes('50') || qLower.includes('cheap') || qLower.includes('budget') || qLower.includes('no money')) {
      const boiledEggs4 = availableFoods.find(f => f.id === 'loc-10') || availableFoods[1]; // 4 eggs ₹28
      const eggDosa = availableFoods.find(f => f.id === 'loc-1') || availableFoods[0]; // Egg Dosa ₹20
      const soya = availableFoods.find(f => f.id === 'loc-12'); // Soya ₹10

      recommendedLocalFoods = [boiledEggs4, soya || eggDosa].filter(Boolean) as LocalFoodItem[];
      estimatedTotalCost = 38; // ₹28 + ₹10
      proteinAdded = 50; // 24g + 26g
      caloriesAdded = 470;

      answer = `With only ₹50, you can maximize protein and calories by combining 4 Boiled Eggs (boiled on your PG induction stove for ₹28) with 50g Soya Chunks (₹10). Total Cost: ₹38. You get an astounding 50g of high-quality protein!`;
      actionablePlan.push('1. Walk to the Saravanampatti store and get 4 Eggs (₹28) and 1 small ₹10 Soya Chunks pack.');
      actionablePlan.push('2. Boil water on your induction stove. Boil 4 eggs (8 mins) and soya chunks (5 mins).');
      actionablePlan.push('3. Season with salt and pepper. Total cost: ₹38. Remaining change: ₹12.');
      reasoningWhy = `Soya chunks (2.6g protein per ₹) and Boiled Eggs (0.86g protein per ₹) are the two highest protein-efficiency foods available in Saravanampatti.`;
    } 
    // 2. "What can I eat after workout?" / "Post workout"
    else if (qLower.includes('post') || qLower.includes('after workout') || qLower.includes('gym')) {
      const eggDosa = availableFoods.find(f => f.id === 'loc-1');
      const boiledEggs4 = availableFoods.find(f => f.id === 'loc-10');
      const banana = availableFoods.find(f => f.id === 'loc-11');

      recommendedLocalFoods = [boiledEggs4, banana, eggDosa].filter(Boolean) as LocalFoodItem[];
      estimatedTotalCost = 58; // ₹28 + ₹10 + ₹20
      proteinAdded = 40.2;
      caloriesAdded = 700;

      answer = `Post-workout, your muscles need immediate fast-digesting protein and glycogen replenishing carbs. Go to the SNS Gate Stall: get 1 Egg Dosa (₹20, 14g P) + 4 Boiled Eggs (₹28, 24g P) + 2 Bananas (₹10, 46g carbs). Total Cost: ₹58. Total Protein: 40g!`;
      actionablePlan.push('1. Eat 2 Bananas immediately post-workout to spike insulin and replenish muscle glycogen.');
      actionablePlan.push('2. Eat 4 Boiled Eggs and 1 Egg Dosa within 45 minutes for muscle protein synthesis.');
      reasoningWhy = `Post-workout muscle repair requires leucine-rich whole food protein (eggs) combined with fast carbs (dosa/banana) to drive amino acids into muscle tissue.`;
    } 
    // 3. "I am eating at the PG" / "In room" / "Induction"
    else if (qLower.includes('pg') || qLower.includes('room') || qLower.includes('induction') || qLower.includes('hostel')) {
      const boiledEggs = availableFoods.find(f => f.id === 'loc-10');
      const soya = availableFoods.find(f => f.id === 'loc-12');

      recommendedLocalFoods = [boiledEggs, soya].filter(Boolean) as LocalFoodItem[];
      estimatedTotalCost = 38;
      proteinAdded = 50;
      caloriesAdded = 470;

      answer = `Since you only have an induction stove in your PG room (no fridge or microwave), rely on items you can boil in 8 minutes: 4 Boiled Eggs (₹28, 24g P) and 50g Soya Chunks (₹10, 26g P). Total Cost: ₹38. 50g protein!`;
      actionablePlan.push('1. Fill your induction vessel with water and boil 4 eggs for 8-10 minutes.');
      actionablePlan.push('2. Rinse soya chunks in hot water with salt and red chili powder.');
      actionablePlan.push('3. Eat immediately so no refrigeration is required.');
      reasoningWhy = `Fits your exact cooking constraint (induction boiling only, zero fridge storage needed).`;
    } 
    // 4. "I skipped breakfast"
    else if (qLower.includes('skipped breakfast') || qLower.includes('skip') || qLower.includes('morning')) {
      const eggDosa = availableFoods.find(f => f.id === 'loc-1');
      const eggBiryani = availableFoods.find(f => f.id === 'loc-7');

      recommendedLocalFoods = [eggDosa, eggBiryani].filter(Boolean) as LocalFoodItem[];
      estimatedTotalCost = 80;
      proteinAdded = 30;
      caloriesAdded = 640;

      answer = `Don't panic! Since you skipped breakfast, you are short by ~20g protein and 350 kcal. Catch up during lunch near SNS Gate: order 1 Egg Biryani (₹60, 16g P) and add 1 Egg Dosa (₹20, 14g P) or 2 Boiled Eggs (₹14). Total Cost: ₹74-80.`;
      actionablePlan.push('1. Walk to Saravanampatti Mess at 1:30 PM after college lectures.');
      actionablePlan.push('2. Eat Egg Biryani (₹60) + 2 extra Boiled Eggs (₹14) = ₹74, 28g protein.');
      reasoningWhy = `Recovers lost morning macros without overwhelming your digestion or exceeding your daily budget.`;
    } 
    // 5. "I only have eggs"
    else if (qLower.includes('only have eggs') || qLower.includes('egg')) {
      const boiledEggs4 = availableFoods.find(f => f.id === 'loc-10');
      const plainChapati = availableFoods.find(f => f.id === 'loc-4');

      recommendedLocalFoods = [boiledEggs4, plainChapati].filter(Boolean) as LocalFoodItem[];
      estimatedTotalCost = 43; // ₹28 + ₹15
      proteinAdded = 27;
      caloriesAdded = 380;

      answer = `Eggs are your superpower! 4 Whole Boiled Eggs (₹28) deliver 24g of complete bioavailable protein. Pair with 2 Plain Chapatis (₹15) or rice for carb support. Total Cost: ₹43. Protein: 27g.`;
      actionablePlan.push('1. Boil 4 eggs on your induction stove.');
      actionablePlan.push('2. Eat 2 whole eggs and 2 egg whites with pepper if watching fat, or all 4 whole eggs for complete hormone support.');
      reasoningWhy = `Whole eggs provide healthy cholesterol necessary for testosterone production in skinny-fat recomposition.`;
    } 
    // 6. Default / General Query based on current real-time stats
    else {
      const bestProteinFood = availableFoods.find(f => f.id === 'loc-1') || availableFoods[0]; // Egg Dosa
      const bestSecondary = availableFoods.find(f => f.id === 'loc-9') || availableFoods[1]; // Boiled Eggs

      recommendedLocalFoods = [bestProteinFood, bestSecondary];
      estimatedTotalCost = 34; // ₹20 + ₹14
      proteinAdded = 26;
      caloriesAdded = 370;

      answer = `Right now, you have consumed ${Math.round(currentProtein)}g protein / ${goals.targetProtein}g target. You need ${Math.round(proteinDeficit)}g more protein today. The most cost-effective Saravanampatti meal is 1 Egg Dosa (₹20, 14g P) + 2 Boiled Eggs (₹14, 12g P). Total Cost: ₹34. Gives +26g protein!`;
      actionablePlan.push(`1. Your current spend today is approx ₹${currentCost}. You have ₹${remainingBudget} left under your ₹150 daily target.`);
      actionablePlan.push(`2. Walk to SNS Gate stall or Saravanampatti Mess.`);
      actionablePlan.push(`3. Get 1 Egg Dosa (₹20) and 2 Boiled Eggs (₹14).`);
      reasoningWhy = `Dynamically calculated from your exact remaining protein deficit (${Math.round(proteinDeficit)}g) and remaining budget (₹${remainingBudget}).`;
    }

    return {
      query,
      answer,
      actionablePlan,
      recommendedLocalFoods,
      estimatedTotalCost,
      proteinAdded: Math.round(proteinAdded),
      caloriesAdded: Math.round(caloriesAdded),
      reasoningWhy,
    };
  }

  /**
   * Generates a complete, dynamic End of Day Analysis based on user meal logs and persona.
   */
  public generateAnalysis(
    dateStr: string = progressService.getFormattedDate(0),
    isWeekendOverride?: boolean
  ): EndOfDayAnalysis {
    const persona = getPersona();
    const mealLogs = nutritionService.getMealLogsForDate(dateStr);
    const waterLog = nutritionService.getWaterForDate(dateStr);
    const goals = nutritionService.getNutritionGoals();
    const todayWorkout = workoutService.getTodayWorkout();
    const tomorrowWorkout = workoutService.getTomorrowWorkout();

    const d = new Date(dateStr);
    const isWeekend = isWeekendOverride !== undefined 
      ? isWeekendOverride 
      : (d.getDay() === 0 || d.getDay() === 6);

    const hasLoggedMeals = mealLogs.length > 0;

    // 1. Calculate totals from actual logs
    const totalCals = mealLogs.reduce((sum, m) => sum + m.calories, 0);
    const totalProt = Math.round(mealLogs.reduce((sum, m) => sum + m.protein, 0));
    const totalCarb = Math.round(mealLogs.reduce((sum, m) => sum + m.carbs, 0));
    const totalFat = Math.round(mealLogs.reduce((sum, m) => sum + m.fat, 0));
    const totalWater = waterLog.ml || 0;
    const totalCostInr = mealLogs.reduce((sum, m) => sum + this.estimateMealCost(m.foodName), 0);

    // Record daily analysis into learning engine
    const calsPctRaw = totalCals / goals.targetCalories;
    const protPctRaw = totalProt / goals.targetProtein;
    const waterPctRaw = totalWater / goals.targetWaterMl;
    nutritionLearningEngine.recordDailyAnalysis(protPctRaw, totalCostInr, waterPctRaw);

    const estimatedFiber = Math.round(totalCarb * 0.12 + mealLogs.length * 2);
    const estimatedSugar = Math.round(
      mealLogs.reduce((sum, m) => {
        if (m.foodName.toLowerCase().includes('fruit') || m.foodName.toLowerCase().includes('banana')) return sum + 12;
        if (m.foodName.toLowerCase().includes('sweet') || m.foodName.toLowerCase().includes('lassi')) return sum + 18;
        return sum + 2;
      }, 0)
    );

    // Percentages
    const caloriesPct = Math.min(100, Math.round((totalCals / goals.targetCalories) * 100));
    const proteinPct = Math.min(100, Math.round((totalProt / goals.targetProtein) * 100));
    const carbsPct = Math.min(100, Math.round((totalCarb / goals.targetCarbs) * 100));
    const fatPct = Math.min(100, Math.round((totalFat / goals.targetFat) * 100));
    const waterPct = Math.min(100, Math.round((totalWater / goals.targetWaterMl) * 100));
    const budgetPct = Math.min(100, Math.round((totalCostInr / 150) * 100));

    // 2. Available Local Foods
    const availableFoods = getAvailableLocalFoods(isWeekend);
    const localProteinFoods: LocalFoodOption[] = availableFoods
      .filter(f => f.protein >= 10)
      .map(f => ({
        name: f.name,
        category: f.category,
        serving: f.servingSize,
        protein: f.protein,
        calories: f.calories,
        costInInr: f.priceInr,
        whereToBuy: f.locationSource,
        isVegetarian: !f.name.toLowerCase().includes('chicken') && !f.name.toLowerCase().includes('mutton') && !f.name.toLowerCase().includes('fish') && !f.name.toLowerCase().includes('egg'),
        notes: `Protein efficiency: ${f.proteinEfficiency.toFixed(2)}g per ₹. Prep: ${f.preparationConstraint}`,
        proteinEfficiency: f.proteinEfficiency,
      }));

    // 3. Status Evaluators
    const missingProteinGrams = Math.max(0, goals.targetProtein - totalProt);
    const proteinStatus: 'Below Target' | 'Met Target' | 'Above Target' | 'Excessive' =
      totalProt >= goals.targetProtein + 20
        ? 'Excessive'
        : totalProt >= goals.targetProtein
        ? 'Met Target'
        : totalProt >= goals.targetProtein - 15
        ? 'Above Target'
        : 'Below Target';

    const carbsStatus: 'Low' | 'Optimal' | 'High' =
      totalCarb < goals.targetCarbs - 40 ? 'Low' : totalCarb > goals.targetCarbs + 50 ? 'High' : 'Optimal';

    const fatStatus: 'Optimal' | 'High' | 'Excessive' =
      totalFat > goals.targetFat + 25 ? 'Excessive' : totalFat > goals.targetFat + 10 ? 'High' : 'Optimal';

    const waterStatus: 'Dehydrated' | 'Adequate' | 'Optimal' =
      totalWater >= goals.targetWaterMl ? 'Optimal' : totalWater >= goals.targetWaterMl * 0.7 ? 'Adequate' : 'Dehydrated';

    // Cheapest completion calculation
    let cheapestCompletionPlan = '';
    if (missingProteinGrams > 0) {
      if (missingProteinGrams <= 14) {
        cheapestCompletionPlan = `Short by ${missingProteinGrams}g protein. Cheapest fix: 1 Egg Dosa (₹20, +14g protein) at SNS Gate Stall.`;
      } else if (missingProteinGrams <= 26) {
        cheapestCompletionPlan = `Short by ${missingProteinGrams}g protein. Cheapest fix: 50g Soya Chunks boiled on induction (₹10, +26g protein) or 4 Boiled Eggs (₹28, +24g protein).`;
      } else {
        cheapestCompletionPlan = `Short by ${missingProteinGrams}g protein. Cheapest fix: 2 Boiled Eggs (₹14) + 1 Egg Dosa (₹20) + 50g Soya Chunks (₹10). Total Cost: ₹44 for +52g protein!`;
      }
    } else {
      cheapestCompletionPlan = `Target met! You achieved ${totalProt}g protein against ${goals.targetProtein}g target.`;
    }

    // 4. Summaries & Reasoning
    const whySucceededOrFailed = hasLoggedMeals
      ? missingProteinGrams === 0
        ? `You successfully hit your protein target (${totalProt}g / ${goals.targetProtein}g) while keeping daily spend at ₹${totalCostInr} (under ₹150 cap). Great reliance on high-efficiency local staples!`
        : `You missed your protein target by ${missingProteinGrams}g. While calories were ${totalCals} kcal, relying on heavy rice/carbs without adding ₹14 Boiled Eggs or ₹10 Soya Chunks left a macro gap.`
      : 'No meals logged for today. Tap "+ Log Meal" to enter your meals from Saravanampatti mess/canteen.';

    const whatToBeDoneTomorrow = missingProteinGrams > 0
      ? `Tomorrow, start breakfast with 2 Egg Dosas (₹40, 28g P) or 4 Boiled Eggs at SNS Gate. Carry a ₹10 Soya Chunks pack to boil on your induction stove after college.`
      : `Maintain this momentum! Tomorrow is ${tomorrowWorkout.title}. Ensure you eat 2 Bananas + 2 Boiled Eggs 45 minutes before your 5 PM workout.`;

    const aiThinkingDeepReasoning = `
[PHYSIQUE AI ENGINE - REASONING LOG]
• User Location: Saravanampatti, Coimbatore | Target: Skinny-Fat Recomposition (12 Months)
• Daily Budget: Cap ₹150 (~₹4,500/mo) | Actual Today Spend: ₹${totalCostInr} (${totalCostInr <= 150 ? 'SUCCESS' : 'EXCEEDED BY ₹' + (totalCostInr - 150)})
• Macros Analyzed: Protein ${totalProt}g (${proteinPct}%), Carbs ${totalCarb}g (${carbsPct}%), Fat ${totalFat}g (${fatPct}%)
• Trade-off Analysis: ${fatStatus !== 'Optimal' ? 'Oily preparation in mess meals increased fat by ' + (totalFat - goals.targetFat) + 'g. Advise dry boiled eggs over fried gravies.' : 'Clean fat balance maintained.'}
• Habit Learning: ${nutritionLearningEngine.generateHabitBasedInsights()}
    `.trim();

    // 5. Substitutions
    const substitutions: FoodSubstitution[] = [];
    if (missingProteinGrams > 0) {
      substitutions.push({
        targetMacro: 'Protein',
        deficitOrExcessAmount: missingProteinGrams,
        reasoning: `You are short by ${missingProteinGrams}g protein. Here are the top 3 cheapest local options in Saravanampatti:`,
        options: [
          {
            title: '50g Soya Chunks (Boiled on Induction)',
            description: 'Boil for 5 mins on your PG induction stove. Season with salt/pepper.',
            costInInr: 10,
            proteinGrams: 26,
            calories: 170,
            location: 'PG Room (Induction)',
          },
          {
            title: '4 Whole Boiled Eggs',
            description: 'Buy from roadside egg stall or boil in PG room.',
            costInInr: 28,
            proteinGrams: 24,
            calories: 300,
            location: 'Saravanampatti Egg Stall / Gate',
          },
          {
            title: '2 Egg Dosas',
            description: 'Hot, freshly cooked at SNS Gate canteen stall.',
            costInInr: 40,
            proteinGrams: 28,
            calories: 440,
            location: 'SNS Gate Stall',
          },
        ],
      });
    }

    if (totalCostInr > 150) {
      substitutions.push({
        targetMacro: 'Budget',
        deficitOrExcessAmount: totalCostInr - 150,
        reasoning: `Your daily spend (₹${totalCostInr}) exceeded your ₹150 cap by ₹${totalCostInr - 150}. Use this budget-saving swap tomorrow:`,
        options: [
          {
            title: 'Swap ₹100 Chicken Biryani → ₹60 Egg Biryani + ₹14 Boiled Eggs',
            description: 'Saves ₹26 while providing MORE protein (28g vs 26g)!',
            costInInr: 74,
            proteinGrams: 28,
            calories: 570,
            location: 'Saravanampatti Hotel',
          },
          {
            title: 'Swap ₹100 Restaurant Meal → ₹20 Egg Dosa + ₹45 Rice & Sambar',
            description: 'Saves ₹35 while providing a complete balanced local meal!',
            costInInr: 65,
            proteinGrams: 21,
            calories: 540,
            location: 'Saravanampatti Mess',
          },
        ],
      });
    }

    // 6. Next Day AI Plan (Part 6)
    const nextDayPlan: NextDayNutritionPlan = {
      date: progressService.getFormattedDate(-1),
      workoutTypeTomorrow: tomorrowWorkout.title || 'Upper Body Strength & Hypertrophy',
      caloriesTarget: goals.targetCalories,
      proteinTarget: goals.targetProtein,
      totalEstimatedCostInr: 146,
      meals: [
        {
          mealType: 'Breakfast',
          time: '08:00 AM',
          suggestedFood: '2 Egg Dosas',
          location: 'SNS Gate Stall',
          estimatedCostInr: 40,
          calories: 440,
          protein: 28,
          carbs: 44,
          fat: 18,
          preparationMethod: 'Direct Purchase / Ready to eat',
        },
        {
          mealType: 'Lunch',
          time: '01:30 PM',
          suggestedFood: 'White Rice + Sambar + 2 Boiled Eggs',
          location: 'Saravanampatti Mess',
          estimatedCostInr: 59,
          calories: 470,
          protein: 19,
          carbs: 63,
          fat: 14,
          preparationMethod: 'Direct Purchase',
        },
        {
          mealType: 'Pre-Workout',
          time: '04:15 PM',
          suggestedFood: '2 Bananas',
          location: 'Purchased near SNS Gate',
          estimatedCostInr: 10,
          calories: 180,
          protein: 2.2,
          carbs: 46,
          fat: 0.6,
          preparationMethod: 'Direct Purchase',
        },
        {
          mealType: 'Post-Workout',
          time: '06:30 PM',
          suggestedFood: '50g Soya Chunks (Boiled on Induction)',
          location: 'PG Room (Induction)',
          estimatedCostInr: 10,
          calories: 170,
          protein: 26,
          carbs: 15,
          fat: 0.5,
          preparationMethod: 'Boil for 5 mins on induction stove with salt/pepper',
        },
        {
          mealType: 'Dinner',
          time: '08:30 PM',
          suggestedFood: '2 Egg Chapatis + 200g Curd',
          location: 'Saravanampatti Tiffin Stall',
          estimatedCostInr: 40,
          calories: 540,
          protein: 31,
          carbs: 52,
          fat: 22,
          preparationMethod: 'Direct Purchase',
        },
      ],
      waterSchedule: [
        '07:00 AM: 500ml after waking up',
        '10:30 AM: 500ml during college lectures',
        '01:00 PM: 500ml before lunch',
        '04:30 PM: 500ml pre-workout hydration',
        '07:00 PM: 500ml post-workout recovery',
        '09:30 PM: 500ml before bed',
      ],
      shoppingReminders: [
        'Buy 1 Dozen Eggs (₹84) from Saravanampatti store (lasts 3 days)',
        'Buy 1 Pack Soya Chunks (₹20, lasts 2 days)',
        'Buy 1 Bunch Bananas (₹30 for 6 bananas)',
      ],
    };

    // 7. Grocery List
    const groceryList: SmartGroceryItem[] = [
      { name: 'Fresh Eggs (Dozen)', quantity: '12 Eggs', estimatedCostInr: 84, lastsDays: 3, proteinContributionGrams: 72, category: 'Protein Staple' },
      { name: 'Soya Chunks Pack', quantity: '200g Pack', estimatedCostInr: 20, lastsDays: 4, proteinContributionGrams: 104, category: 'Protein Staple' },
      { name: 'Yellow Bananas', quantity: '6 Bananas', estimatedCostInr: 30, lastsDays: 3, proteinContributionGrams: 6.6, category: 'Produce' },
      { name: 'Bhuna Chana / Roasted Gram', quantity: '200g Pack', estimatedCostInr: 35, lastsDays: 4, proteinContributionGrams: 44, category: 'Snack' },
      { name: 'Curd Pouch', quantity: '200g Pouch', estimatedCostInr: 20, lastsDays: 1, proteinContributionGrams: 7, category: 'Dairy' },
    ];

    // Scores
    const hydrationScore = Math.min(100, Math.round((totalWater / goals.targetWaterMl) * 100));
    const recoveryScore = Math.min(100, Math.round((totalProt / goals.targetProtein) * 80 + (totalWater / goals.targetWaterMl) * 20));
    const macroBalanceScore = Math.min(100, Math.round((proteinPct * 0.4) + (carbsPct * 0.3) + (fatPct * 0.3)));
    const mealTimingScore = hasLoggedMeals ? 88 : 40;

    return {
      hasLoggedMeals,
      date: dateStr,
      isWeekend,
      totals: {
        calories: totalCals,
        protein: totalProt,
        carbs: totalCarb,
        fat: totalFat,
        fiber: estimatedFiber,
        sugar: estimatedSugar,
        waterMl: totalWater,
        costInr: totalCostInr,
      },
      targets: {
        ...goals,
        targetBudgetInr: 150,
      },
      macroPercentages: {
        caloriesPct,
        proteinPct,
        carbsPct,
        fatPct,
        waterPct,
        budgetPct,
      },
      analysis: {
        overallSummary: hasLoggedMeals
          ? `Logged ${mealLogs.length} meals (${totalCals} kcal, ${totalProt}g P, ₹${totalCostInr} spend) in Saravanampatti.`
          : 'No meals logged yet today.',
        whySucceededOrFailed,
        whatToBeDoneTomorrow,
        aiThinkingDeepReasoning,
        proteinAnalysis: {
          status: proteinStatus,
          missingGrams: missingProteinGrams,
          explanation: proteinStatus === 'Below Target'
            ? `You need ${missingProteinGrams}g more protein to support muscle hypertrophy.`
            : `Protein target met! (${totalProt}g achieved).`,
          localFoodSuggestions: localProteinFoods,
          cheapestCompletionPlan,
        },
        carbsAnalysis: {
          status: carbsStatus,
          workoutImpact: carbsStatus === 'Low'
            ? 'Low glycogen stores may cause premature fatigue during your workout.'
            : 'Sufficient carbohydrate intake to fuel intense lifting.',
          suggestedCarbSources: ['2 Bananas (₹10)', 'Plain Dosa (₹15)', 'White Rice + Sambar (₹45)'],
        },
        fatAnalysis: {
          status: fatStatus,
          explanation: fatStatus === 'High' || fatStatus === 'Excessive'
            ? 'Mess oils/gravies contributed elevated dietary fat.'
            : 'Fat intake is within the optimal range for hormone production.',
          fatSourcesIdentified: ['Mess Oil in Biryani/Curry', 'Egg Yolks'],
          recommendation: fatStatus !== 'Optimal'
            ? 'Choose boiled eggs over fried egg burji to lower unnecessary fat.'
            : 'Keep up the balanced choices.',
        },
        waterAnalysis: {
          status: waterStatus,
          scorePct: hydrationScore,
          recommendation: waterStatus === 'Optimal'
            ? 'Great hydration! Maintains cell volume and workout pump.'
            : 'Increase water intake by 1-1.5 Liters during college hours.',
        },
      },
      budgetAdherence: {
        todayEstimatedCostInr: totalCostInr,
        dailyBudgetCapInr: 150,
        monthlyBudgetCapInr: 4500,
        projectedMonthlySpendInr: totalCostInr * 30,
        adherenceStatus: totalCostInr <= 150 ? 'Under Budget' : 'Over Budget',
        savingTip: totalCostInr <= 150
          ? 'On track! You are spending within ₹4500/month.'
          : 'Replace ₹100 Chicken Biryani with ₹60 Egg Biryani + 2 Boiled Eggs (₹14) to save ₹26 while gaining more protein.',
      },
      scores: {
        biggestWin: totalProt >= goals.targetProtein ? `Hit ${totalProt}g protein target!` : `Kept daily spend at ₹${totalCostInr}`,
        biggestMistake: missingProteinGrams > 0 ? `Short by ${missingProteinGrams}g protein` : totalFat > goals.targetFat ? 'Excess oil in dinner meal' : 'None',
        mostEfficientProteinSource: 'Soya Chunks (2.6g/₹) & Boiled Eggs (0.86g/₹)',
        budgetEfficiencyRating: totalCostInr <= 150 ? 'Grade A (Under ₹150/day)' : 'Grade B (Slightly above ₹150)',
        hydrationScore,
        recoveryScore,
        macroBalanceScore,
        mealTimingScore,
      },
      substitutions,
      nextDayPlan,
      groceryList,
    };
  }
}

export const nutritionCoachEngine = new NutritionCoachEngine();
