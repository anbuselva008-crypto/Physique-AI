import { MealLogItem, WaterLog } from '../types';

export interface UserNutritionHabits {
  favoriteMealIds: string[];
  frequentlyLoggedFoods: { [foodName: string]: number };
  skippedMealCounts: { Breakfast: number; Lunch: number; Dinner: number; Snacks: number };
  averageDailySpendInr: number;
  totalDaysTracked: number;
  proteinDeficitFrequency: number;
  hydrationComplianceRate: number; // 0 to 1
  weekendSplurgeTendency: 'High' | 'Moderate' | 'Frugal';
  preferredProteinSource: 'Eggs' | 'Soya Chunks' | 'Chicken' | 'Balanced';
  lastUpdated: string;
}

const LEARNING_ENGINE_STORAGE_KEY = 'physique_ai_nutrition_learning_habits';

const DEFAULT_HABITS: UserNutritionHabits = {
  favoriteMealIds: ['Egg Dosa', 'Boiled Eggs (4 Whole Eggs)', 'White Rice + Sambar', 'Soya Chunks (50g dry - Boiled)'],
  frequentlyLoggedFoods: {
    'Egg Dosa': 12,
    'Boiled Eggs (2 Whole Eggs)': 15,
    'White Rice + Sambar': 10,
    'Egg Chapati': 8,
  },
  skippedMealCounts: { Breakfast: 2, Lunch: 0, Dinner: 0, Snacks: 1 },
  averageDailySpendInr: 140,
  totalDaysTracked: 14,
  proteinDeficitFrequency: 0.3,
  hydrationComplianceRate: 0.85,
  weekendSplurgeTendency: 'Moderate',
  preferredProteinSource: 'Eggs',
  lastUpdated: new Date().toISOString(),
};

export class NutritionLearningEngine {
  private habits: UserNutritionHabits;

  constructor() {
    this.habits = this.loadHabits();
  }

  private loadHabits(): UserNutritionHabits {
    if (typeof window === 'undefined') return DEFAULT_HABITS;
    try {
      const raw = localStorage.getItem(LEARNING_ENGINE_STORAGE_KEY);
      if (raw) {
        return { ...DEFAULT_HABITS, ...JSON.parse(raw) };
      }
    } catch (e) {
      console.error('Error loading nutrition habits from storage:', e);
    }
    return DEFAULT_HABITS;
  }

  private saveHabits() {
    if (typeof window === 'undefined') return;
    try {
      this.habits.lastUpdated = new Date().toISOString();
      localStorage.setItem(LEARNING_ENGINE_STORAGE_KEY, JSON.stringify(this.habits));
    } catch (e) {
      console.error('Error saving nutrition habits to storage:', e);
    }
  }

  public getHabits(): UserNutritionHabits {
    return { ...this.habits };
  }

  public recordMealLogged(foodName: string, estimatedCostInr: number) {
    const currentCount = this.habits.frequentlyLoggedFoods[foodName] || 0;
    this.habits.frequentlyLoggedFoods[foodName] = currentCount + 1;

    // Track favorite if logged > 5 times
    if (currentCount + 1 >= 5 && !this.habits.favoriteMealIds.includes(foodName)) {
      this.habits.favoriteMealIds.push(foodName);
    }

    // Update average spend estimate
    const oldAvg = this.habits.averageDailySpendInr || 140;
    this.habits.averageDailySpendInr = Math.round(oldAvg * 0.9 + estimatedCostInr * 0.1);

    this.saveHabits();
  }

  public recordSkippedMeal(mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks') {
    this.habits.skippedMealCounts[mealType] = (this.habits.skippedMealCounts[mealType] || 0) + 1;
    this.saveHabits();
  }

  public recordDailyAnalysis(dailyProteinPct: number, dailySpendInr: number, waterPct: number) {
    this.habits.totalDaysTracked += 1;
    
    // Protein deficit tracking
    if (dailyProteinPct < 0.9) {
      this.habits.proteinDeficitFrequency = +(
        (this.habits.proteinDeficitFrequency * 0.8) + 0.2
      ).toFixed(2);
    } else {
      this.habits.proteinDeficitFrequency = +(
        (this.habits.proteinDeficitFrequency * 0.8)
      ).toFixed(2);
    }

    // Hydration compliance rate
    this.habits.hydrationComplianceRate = +(
      (this.habits.hydrationComplianceRate * 0.8) + (Math.min(1, waterPct) * 0.2)
    ).toFixed(2);

    // Spend tracking
    this.habits.averageDailySpendInr = Math.round(
      (this.habits.averageDailySpendInr * 0.8) + (dailySpendInr * 0.2)
    );

    this.saveHabits();
  }

  /**
   * Generates a adaptive prompt modifier based on user habits.
   */
  public generateHabitBasedInsights(): string {
    const insights: string[] = [];
    const h = this.habits;

    if (h.skippedMealCounts.Breakfast > 3) {
      insights.push('⚠️ You frequently skip breakfast. Consider 2 quick Boiled Eggs or Egg Dosa at SNS gate before 9 AM.');
    }

    if (h.proteinDeficitFrequency > 0.4) {
      insights.push('💡 You often hit protein deficits in the evening. Adding a ₹10 Soya Chunks boil (26g protein) or 2 Boiled Eggs (12g) at 5 PM will easily close this gap.');
    }

    if (h.averageDailySpendInr > 160) {
      insights.push('💰 Spending trend is slightly above the ₹150/day target. Swap ₹100 Chicken Biryani for ₹60 Egg Biryani or ₹20 Egg Dosa + ₹14 Boiled Eggs to stay under budget.');
    } else {
      insights.push('✅ Excellent budget discipline! Average spend (~₹' + h.averageDailySpendInr + '/day) is well within the ₹4500/month limit.');
    }

    return insights.join(' ');
  }
}

export const nutritionLearningEngine = new NutritionLearningEngine();
