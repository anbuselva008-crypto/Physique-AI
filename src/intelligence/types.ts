export type TransformationStage =
  | 'Skinny Fat'
  | 'Beginner Fat Loss'
  | 'Lean Building'
  | 'Muscle Gain'
  | 'Maintenance'
  | 'Recomposition';

export type RiskFactor =
  | 'Rapid Weight Loss'
  | 'Rapid Fat Gain'
  | 'Overtraining Risk'
  | 'Undertraining'
  | 'Poor Nutrition Adherence'
  | 'High Stress & Sleep Deficit'
  | 'Hydration Deficit'
  | 'Muscle Imbalance'
  | 'Weight Loss Plateau';

export interface TransformationStatus {
  currentStage: TransformationStage;
  recoveryScore: number; // 0 to 100
  transformationScore: number; // 0 to 100
  riskLevel: 'low' | 'moderate' | 'high';
  strengthLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Elite';
  nutritionQualityScore: number; // 0 to 100
  consistencyScore: number; // 0 to 100
  detectedRisks: RiskFactor[];
  plateauDetected: boolean;
  notes: string[];
}

export interface PlannedExercise {
  id: string;
  name: string;
  targetMuscle: string;
  sets: number;
  reps: string;
  tempo: string; // e.g. "3-0-1-0"
  restSeconds: number;
  targetRPE: number; // Rate of Perceived Exertion (1-10)
  targetRIR: number; // Reps In Reserve (0-4)
  notes?: string;
}

export interface DynamicWorkoutPlan {
  sessionType:
    | 'Rest Day'
    | 'Push'
    | 'Pull'
    | 'Legs'
    | 'Upper'
    | 'Lower'
    | 'Full Body'
    | 'Cardio'
    | 'Mobility'
    | 'Recovery Session';
  targetFocus: string;
  estimatedDurationMins: number;
  warmup: string[];
  exercises: PlannedExercise[];
  cooldown: string[];
  intensityLevel: 'Low' | 'Moderate' | 'High' | 'Deload';
  trainingNotes: string[];
}

export interface MealDetail {
  title: string;
  items: string[];
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  timing?: string;
}

export interface DynamicMealPlan {
  breakfast: MealDetail;
  lunch: MealDetail;
  dinner: MealDetail;
  snacks: MealDetail;
  preWorkoutMeal?: MealDetail;
  postWorkoutMeal?: MealDetail;
  nightMeal?: MealDetail;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  hydrationTargetLiters: number;
  proteinTimingAdvice: string[];
  practicalTips: string[];
}

export interface DynamicRecoveryPlan {
  todayRecoveryScore: number; // 0-100
  sleepTargetHours: number;
  waterTargetLiters: number;
  recommendedStretches: string[];
  mobilityProtocol: string[];
  recoveryAdvice: string[];
  stressMitigationTips: string[];
}

export interface TrackedGoalItem {
  description: string;
  progressPercent: number; // 0 to 100
  status: 'On Track' | 'At Risk' | 'Completed';
  targetMetrics: string;
}

export interface GoalProgressState {
  weightTrendKg: number;
  bodyFatTrendPercent: number;
  strengthPRTrend: string[];
  consistencyStreakDays: number;
  nutritionAdherencePercent: number;
  sleepAdherencePercent: number;
  oneMonthGoal: TrackedGoalItem;
  threeMonthGoal: TrackedGoalItem;
  sixMonthGoal: TrackedGoalItem;
  twelveMonthGoal: TrackedGoalItem;
}

export interface DynamicRoadmap {
  currentMonth: string;
  currentObjective: string;
  primaryFocus: string;
  secondaryFocus: string;
  expectedResults: string[];
  estimatedConfidence: number; // 0-100
  potentialRisks: string[];
  weeklyMilestones: string[];
  monthlyMilestones: string[];
}

export interface GoalConfidenceEstimate {
  confidenceScore: number; // 0-100
  reasoning: string;
  topLimitingFactors: string[];
  topPositiveFactors: string[];
  suggestionsToImproveConfidence: string[];
}

export interface CoachingReport {
  goodMorningGreeting: string;
  recoveryStatusSummary: string;
  todaysPriority: string;
  workoutFocus: string;
  nutritionFocus: string;
  recoveryFocus: string;
  mindsetCoaching: string;
  warnings: string[];
  todaysMission: string[];
  quote: string;
  tomorrowPreview: string;
}

export interface UnifiedTransformationState {
  status: TransformationStatus;
  workoutPlan: DynamicWorkoutPlan;
  mealPlan: DynamicMealPlan;
  recoveryPlan: DynamicRecoveryPlan;
  goalProgress: GoalProgressState;
  roadmap: DynamicRoadmap;
  confidence: GoalConfidenceEstimate;
  coachReport: CoachingReport;
  lastEvaluatedAt: string;
}
