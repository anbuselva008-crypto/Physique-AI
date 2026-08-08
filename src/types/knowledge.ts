export interface ExerciseKnowledgeItem {
  id: string;
  name: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  exerciseType: 'Compound' | 'Isolation';
  movementPattern: 'Push' | 'Pull' | 'Squat' | 'Hinge' | 'Lunge' | 'Carry' | 'Isolation' | 'Core';
  description: string;
  commonMistakes: string[];
  tips: string[];
  alternatives: string[];
}

export interface IndianFoodKnowledgeItem {
  id: string;
  name: string;
  protein: number; // grams
  calories: number; // kcal
  carbs: number; // grams
  fat: number; // grams
  fiber: number; // grams
  mealCategory: string;
  budgetScore: number; // 1 to 5
  muscleGainScore: number; // 1 to 5
  fatLossScore: number; // 1 to 5
  isVegetarian: boolean;
  containsEgg: boolean;
  isChicken: boolean;
  servingSize: string;
}

export interface TrainingScienceConcept {
  id: string;
  title: string;
  summary: string;
  keyPrinciples: string[];
  practicalApplication: string;
  commonMisconceptions: string[];
}

export interface RecoveryTopic {
  id: string;
  topic: string;
  description: string;
  benefits: string[];
  protocol: string[];
  actionableTips: string[];
}

export interface SupplementInfo {
  id: string;
  name: string;
  recommendedDosage: string;
  timing: string;
  primaryBenefits: string[];
  scientificMechanism: string;
  sideEffectsAndSafety: string;
  budgetRating: 'Low' | 'Medium' | 'High';
  evidenceLevel: 'Strong' | 'Moderate' | 'Emerging';
}

export interface MotivationalMessage {
  id: string;
  category: 'Beginner' | 'Plateau' | 'Missed Workout' | 'Consistency' | 'Discipline';
  quote: string;
  authorOrMindset: string;
  actionableAdvice: string;
}
