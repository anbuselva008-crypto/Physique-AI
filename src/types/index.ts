export type TabType = 'dashboard' | 'workout' | 'nutrition' | 'progress' | 'profile' | 'knowledge' | 'ai_coach';

export interface DailySchedule {
  wakeUpTime: string;
  collegeStart: string;
  collegeEnd: string;
  gymTime: string;
  sleepTime: string;
}

export type FitnessGoal = 'Lose Fat' | 'Build Muscle' | 'Body Recomposition' | 'Maintain';
export type TrainingExperience = 'Beginner' | 'Intermediate' | 'Advanced';
export type WorkoutLocation = 'Home' | 'Gym';
export type DietType = 'Vegetarian' | 'Egg' | 'Chicken' | 'Everything';

export interface UserProfile {
  name: string;
  age: number;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  gender: 'Male' | 'Female' | 'Other';
  fitnessGoal: FitnessGoal;
  trainingExperience: TrainingExperience;
  workoutLocation: WorkoutLocation;
  equipment: string[];
  schedule: DailySchedule;
  diet: DietType;
  monthlyBudget: string;
  medicalNotes?: string;
  city: string;
  state: string;
  country: string;
}

export interface WorkoutOverview {
  title: string;
  focus: string;
  durationMinutes: number;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface WaterOverview {
  currentLiters: number;
  targetLiters: number;
}

export interface NutritionOverview {
  consumedCalories: number;
  targetCalories: number;
  proteinGrams: number;
  targetProteinGrams: number;
}

export interface ExerciseSet {
  setNumber: number;
  targetReps: number;
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
}

export interface WorkoutData {
  id: string;
  title: string;
  durationMinutes: number;
  exercises: Exercise[];
}

export type WorkoutStage = 'list' | 'session' | 'complete';

export type MoodType = 'Excellent 😄' | 'Good 🙂' | 'Normal 😐' | 'Tired 😴' | 'Exhausted 😫';
export type SorenessType = 'None' | 'Light' | 'Medium' | 'Heavy';

export interface CheckIn {
  date: string; // YYYY-MM-DD
  mood: MoodType;
  sleepHours: number;
  weightKg: number;
  energyLevel: number; // 1-10
  soreness: SorenessType;
  waterAfterWaking: boolean;
  painNotes?: string;
  timestamp: number;
}

export interface WeightEntry {
  date: string; // YYYY-MM-DD
  weightKg: number;
  note?: string;
}

export interface BodyMeasurements {
  id: string;
  date: string; // YYYY-MM-DD
  chestCm?: number;
  waistCm?: number;
  shouldersCm?: number;
  armsCm?: number;
  forearmsCm?: number;
  thighsCm?: number;
  calvesCm?: number;
  neckCm?: number;
  hipCm?: number;
}

export type PhotoPose = 'Front' | 'Side' | 'Back';

export interface ProgressPhoto {
  id: string;
  date: string; // YYYY-MM-DD
  pose: PhotoPose;
  imageDataUrl: string;
}

export interface ExercisePR {
  id: string;
  exerciseName: string;
  currentPRWeightKg: number;
  previousPRWeightKg: number;
  reps: number;
  date: string;
}

export interface ProgressStats {
  workoutDays: number;
  currentStreak: number;
  longestStreak: number;
  completedWorkouts: number;
  avgSleep: number;
  avgWater: number;
  avgEnergy: number;
  avgWeight: number;
}

export interface ProgressSummary {
  currentWeightKg: number;
  weeklyChangeKg: number;
  workoutStreak: number;
  lastWorkoutDate: string;
  latestPR?: {
    exerciseName: string;
    weightKg: number;
    reps: number;
    improvementKg: number;
  };
}

// --- Nutrition Engine Types ---
export type FoodCategory =
  | 'Breakfast'
  | 'Lunch'
  | 'Dinner'
  | 'Snack'
  | 'Fruit'
  | 'Drink'
  | 'Protein'
  | 'Vegetable'
  | 'Rice'
  | 'South Indian'
  | 'North Indian'
  | 'Fast Food';

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  servingSize: string;
  category: FoodCategory;
}

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';

export interface MealLogItem {
  id: string;
  foodId: string;
  foodName: string;
  mealType: MealType;
  quantity: number; // number of servings
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  date: string; // YYYY-MM-DD
}

export interface WaterLog {
  date: string; // YYYY-MM-DD
  ml: number;
  targetMl: number;
}

export interface DailyNutritionGoals {
  targetCalories: number;
  targetProtein: number; // grams
  targetCarbs: number; // grams
  targetFat: number; // grams
  targetWaterMl: number; // ml
}

export interface WeeklyNutritionDayStats {
  date: string; // YYYY-MM-DD
  dayLabel: string; // e.g. "Mon"
  calories: number;
  protein: number;
  waterMl: number;
}

export * from './knowledge';


