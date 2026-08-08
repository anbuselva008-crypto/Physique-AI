import { getPersona } from '../persona';
import { recoveryPlanner } from '../intelligence/recoveryPlanner';
import { nutritionPlanner } from '../intelligence/nutritionPlanner';
import { workoutPlanner } from '../intelligence/workoutPlanner';

export interface PersonalizedRecommendationInput {
  category: string;
  userPrompt: string;
  consumedProtein?: number;
  targetProtein?: number;
  consumedCalories?: number;
  targetCalories?: number;
  sleepHours?: number;
  energyScore?: number;
  sorenessScore?: number;
}

export interface PersonalizedRecommendation {
  title: string;
  rationale: string;
  recommendationText: string;
  actionableSteps: string[];
  expectedBenefit: string;
  collegeContextNote?: string;
  budgetContextNote?: string;
}

export class RecommendationEngine {
  public generateRecommendation(
    input: PersonalizedRecommendationInput
  ): PersonalizedRecommendation {
    const persona = getPersona();
    const recovery = recoveryPlanner.generateTodayRecoveryPlan(input.energyScore ? input.energyScore * 10 : 80);
    const nutrition = nutritionPlanner.generateTodayMealPlan();

    const category = input.category;
    const remainingProtein = Math.max(0, (input.targetProtein || 165) - (input.consumedProtein || 120));
    const remainingCalories = Math.max(0, (input.targetCalories || 2400) - (input.consumedCalories || 1800));

    if (category === 'Nutrition' || category === 'Meal Planning' || category === 'Budget') {
      const budgetINR = 250;
      const isHostel = persona.college?.hostelStatus?.toLowerCase().includes('hostel') || true;

      return {
        title: `Targeted Macro Refuel (${remainingProtein}g Protein Remaining)`,
        rationale: `To maintain positive muscle protein synthesis and hit your daily target of ${input.targetProtein || 165}g without exceeding your ₹${budgetINR}/day budget.`,
        recommendationText: `You still need around ${remainingProtein}g of protein today. Since you have access to ${isHostel ? 'the hostel mess, boiled eggs, and local dairy' : 'home meals'}, you can easily reach this target in your remaining meals.`,
        actionableSteps: [
          `Add 3 boiled eggs (18g protein, ~₹21) or 100g paneer (18g protein) to your evening snack.`,
          `Have a 200ml glass of milk with a scoop of whey protein or double curd at dinner (~25g protein).`,
          `Keep dinner calorie-controlled at ~${Math.min(700, remainingCalories)} kcal to maintain your lean bulk balance.`,
        ],
        expectedBenefit: `Prevents nocturnal muscle breakdown (catabolism) and supports optimal recovery from today's strength session.`,
        collegeContextNote: `Fits well between your ${persona.college?.collegeName || 'College'} classes.`,
        budgetContextNote: `Estimated total extra cost: ₹45–₹60, staying well within your ₹${budgetINR}/day cap.`,
      };
    }

    if (category === 'Recovery' || category === 'Exam Period') {
      return {
        title: `Adaptive Recovery & Schedule Realignment`,
        rationale: `Your current recovery plan addresses low sleep (${input.sleepHours || 6} hours) which elevates cortisol and slows central nervous system regeneration.`,
        recommendationText: `Given your ${input.sleepHours || 6} hours of sleep and upcoming college workload, we should modify today's workout intensity to preserve your joint health and cognitive energy for studies.`,
        actionableSteps: [
          `Cap heavy compound sets at RPE 7.5 rather than taking sets to failure.`,
          `Consume 500ml water with a pinch of salt upon waking to replenish electrolyte hydration.`,
          `Aim for a 20-minute power nap or non-sleep deep rest (NSDR) before your evening study session.`,
        ],
        expectedBenefit: `Maintains muscular stimulus without accumulating systemic fatigue that compromises exam performance or sleep quality tonight.`,
        collegeContextNote: `Designed for busy days at ${persona.college?.collegeName || 'college'}.`,
      };
    }

    if (category === 'Workout') {
      const dailyWorkout = workoutPlanner.generateTodayWorkout(80);

      return {
        title: `Hyper-Personalized Training Strategy: ${dailyWorkout.sessionType}`,
        rationale: `Targeting peak mechanical tension in your ${dailyWorkout.sessionType} session while managing fatigue from your recent training volume.`,
        recommendationText: `Focus on progressive overload on your primary compound movements while keeping rest intervals at 2–3 minutes to allow full ATP resynthesis.`,
        actionableSteps: [
          `Execute 3–4 controlled working sets for primary compound lifts at a controlled tempo.`,
          `Log exact working weights and reps in your logbook to track performance velocity.`,
          `Perform a 5-minute dynamic mobility warmup targeting shoulder thoracic mobility and hip openers.`,
        ],
        expectedBenefit: `Maximizes myofibrillar hypertrophy while keeping joint strain minimal.`,
        collegeContextNote: `Fits nicely into a 50–60 minute session at your ${persona.fitness?.availableEquipment ? 'gym' : 'hostel'}.`,
      };
    }

    // Default general recommendation
    return {
      title: `Personalized Coach Guidance`,
      rationale: `Aligning your training, diet, and recovery with your primary target of ${persona.goals?.oneMonth || 'Body Recomposition'}.`,
      recommendationText: `Stay consistent with your daily check-in habits and maintain your baseline protein and hydration targets today.`,
      actionableSteps: [
        `Complete your remaining protein target (${remainingProtein}g).`,
        `Get at least 7.5 hours of restful sleep tonight.`,
        `Log your daily check-in tomorrow morning.`,
      ],
      expectedBenefit: `Sustains long-term momentum toward your goal: ${persona.goals?.twelveMonths || 'Complete Transformation'}.`,
      collegeContextNote: `Synchronized with your daily schedule.`,
      budgetContextNote: `Cost effective and hostel friendly.`,
    };
  }
}

export const recommendationEngine = new RecommendationEngine();
