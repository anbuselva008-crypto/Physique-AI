import {
  UserProfile,
  CheckIn,
  MealLogItem,
  WaterLog,
  DailyNutritionGoals,
  WeeklyNutritionDayStats,
  WorkoutData,
  WeightEntry,
  BodyMeasurements,
  ExercisePR,
  ProgressStats,
  ProgressSummary,
} from '../types';

export interface AIProfileContext {
  rawProfile: UserProfile;
  stats: {
    name: string;
    age: number;
    heightCm: number;
    currentWeightKg: number;
    targetWeightKg: number;
    weightToGoalKg: number;
    bmi: number;
    fitnessGoal: string;
    experience: string;
    location: string;
    diet: string;
    city: string;
  };
}

export interface AITodayCheckInContext {
  hasCheckedInToday: boolean;
  checkIn: CheckIn | null;
  summary: {
    mood: string | null;
    sleepHours: number | null;
    energyLevel: number | null;
    soreness: string | null;
    waterAfterWaking: boolean | null;
    painNotes?: string;
  };
}

export interface AINutritionWeeklyStats {
  days: WeeklyNutritionDayStats[];
  avgCalories: number;
  avgProtein: number;
  avgWaterLiters: number;
}

export interface AINutritionContext {
  todayMealLogs: MealLogItem[];
  todayWater: WaterLog;
  goals: DailyNutritionGoals;
  consumed: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  remaining: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    waterMl: number;
  };
  weeklyStats: AINutritionWeeklyStats;
}

export interface AIWorkoutContext {
  todayWorkout: WorkoutData;
  statistics: {
    workoutTitle: string;
    durationMinutes: number;
    totalExercises: number;
    totalSets: number;
    completedSets: number;
    completionPercentage: number;
  };
  isWorkoutCompleted: boolean;
}

export interface AIProgressContext {
  latestWeightKg: number | null;
  weightHistory: WeightEntry[];
  measurements: BodyMeasurements[];
  personalRecords: ExercisePR[];
  stats: ProgressStats;
  summary: ProgressSummary;
}

export interface AIStreaksContext {
  checkInStreakDays: number;
  workoutStreakDays: number;
  weeklyWorkoutAdherence: number;
  hasCompletedCheckInToday: boolean;
  hasCompletedWorkoutToday: boolean;
}

export interface AIGoalsContext {
  primaryGoal: string;
  targetWeightKg: number;
  currentWeightKg: number;
  weightDeltaKg: number;
  dailyCalorieTarget: number;
  dailyProteinTarget: number;
  dailyCarbTarget: number;
  dailyFatTarget: number;
  dailyWaterTargetMl: number;
}

export interface AIMetaContext {
  currentDate: string;
  currentTime: string;
  dayOfWeek: string;
  timestampISO: string;
  timezone: string;
}

export interface AIContext {
  profile: AIProfileContext;
  todayCheckIn: AITodayCheckInContext;
  nutrition: AINutritionContext;
  workout: AIWorkoutContext;
  progress: AIProgressContext;
  streaks: AIStreaksContext;
  goals: AIGoalsContext;
  currentDate: string;
  currentTime: string;
  dayOfWeek: string;
  meta: AIMetaContext;
}

export interface ContextBuilderOptions {
  targetDate?: string;
  customTime?: Date;
}

// ====================================================
// AI Decision Engine & Rule Types
// ====================================================

export type RuleSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type RuleCategory =
  | 'workout'
  | 'recovery'
  | 'nutrition'
  | 'consistency'
  | 'risk'
  | 'schedule';

export interface RuleResult {
  id: string;
  category: RuleCategory;
  severity: RuleSeverity;
  title: string;
  description: string;
  recommendation: string;
  triggered: boolean;
  metadata?: Record<string, unknown>;
}

export interface DecisionRule {
  id: string;
  name: string;
  category: RuleCategory;
  evaluate: (context: AIContext) => RuleResult | null;
}

export interface WorkoutDecision {
  recommendation: 'proceed' | 'reduce_intensity' | 'deload' | 'rest_day' | 'modify_focus';
  shouldWorkoutToday: boolean;
  isRestDay: boolean;
  isDeloadRecommended: boolean;
  intensityAdjustmentPercentage: number;
  reasoning: string[];
}

export interface RecoveryAnalysis {
  score: number; // 0 - 100
  status: 'optimal' | 'moderate' | 'poor' | 'critical';
  poorSleepDetected: boolean;
  highSorenessDetected: boolean;
  lowEnergyDetected: boolean;
  painAlert: boolean;
  factors: string[];
}

export interface NutritionAnalysis {
  caloriesRemaining: number;
  proteinRemaining: number;
  waterRemainingMl: number;
  calorieStatus: 'deficit' | 'on_track' | 'surplus' | 'severely_under';
  proteinStatus: 'met' | 'close' | 'deficient' | 'severely_deficient';
  hydrationStatus: 'dehydrated' | 'adequate' | 'optimal';
  mealReminders: string[];
}

export interface ConsistencyAnalysis {
  checkInCompletedToday: boolean;
  workoutCompletedToday: boolean;
  checkInStreakDays: number;
  workoutStreakDays: number;
  weeklyAdherencePercentage: number;
  consistencyScore: number; // 0 - 100
  statusNotes: string[];
}

export interface RiskAnalysis {
  consecutivePoorSleep: boolean;
  weightLossTooFast: boolean;
  weightGainTooFast: boolean;
  plateauDetected: boolean;
  injuryRiskHigh: boolean;
  activeRisks: string[];
}

export interface ScheduleAnalysis {
  isWeekend: boolean;
  dayOfWeek: string;
  estimatedWorkoutTimeWindow: string;
  contextualScheduleNotes: string[];
}

export interface PrioritizedAction {
  id: string;
  priority: number; // 1 = highest priority
  category: RuleCategory;
  severity: RuleSeverity;
  title: string;
  description: string;
  actionItem: string;
}

export interface DecisionReport {
  timestamp: string;
  workout: WorkoutDecision;
  recovery: RecoveryAnalysis;
  nutrition: NutritionAnalysis;
  consistency: ConsistencyAnalysis;
  risk: RiskAnalysis;
  schedule: ScheduleAnalysis;
  triggeredRules: RuleResult[];
  prioritizedActions: PrioritizedAction[];
  summary: string;
}

// ====================================================
// AI Orchestrator & Task Types
// ====================================================

export type AITaskType =
  | 'workout_advice'
  | 'nutrition_advice'
  | 'recovery'
  | 'motivation'
  | 'progress_analysis'
  | 'weekly_review'
  | 'monthly_review'
  | 'photo_analysis'
  | 'question_answering'
  | 'general_chat';

export type AIExecutionProvider = 'rule_engine' | 'knowledge_base' | 'groq' | 'gemini';

export interface UserRequest {
  prompt: string;
  intent?: AITaskType;
  imageUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface AIExecutionPlan {
  taskType: AITaskType;
  provider: AIExecutionProvider;
  reason: string;
  contextRequired: string[];
  estimatedTokens: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  canAnswerByRuleEngine: boolean;
  canAnswerByKnowledgeBase: boolean;
  shouldCallGroq: boolean;
  shouldCallGemini: boolean;
  directResponse?: string;
}

// ====================================================
// AI Prompt Builder Types
// ====================================================

export type AIPromptType =
  | 'daily_coach'
  | 'workout_coach'
  | 'nutrition_coach'
  | 'recovery_coach'
  | 'motivation'
  | 'weekly_review'
  | 'monthly_review'
  | 'photo_analysis'
  | 'general_chat';

export interface BuiltPrompt {
  promptType: AIPromptType;
  provider: 'groq' | 'gemini' | 'universal';
  systemPrompt: string;
  context: string;
  decisionSummary: string;
  relevantKnowledge: string;
  userRequest: string;
  outputFormat: string;
  fullFormattedPrompt: string;
  metadata?: Record<string, unknown>;
}

// ====================================================
// Groq Client Types
// ====================================================

export interface GroqClientConfig {
  apiKey?: string;
  defaultModel?: string;
  temperature?: number;
  maxTokens?: number;
  maxRetries?: number;
  retryDelayMs?: number;
  timeoutMs?: number;
}

export interface GroqResponse {
  success: boolean;
  content: string;
  model: string;
  latencyMs: number;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  error?: string;
  raw?: unknown;
}

// ====================================================
// Gemini Client Types
// ====================================================

export interface GeminiClientConfig {
  apiKey?: string;
  defaultModel?: string;
  temperature?: number;
  maxTokens?: number;
  maxRetries?: number;
  retryDelayMs?: number;
  timeoutMs?: number;
}

export interface GeminiResponse {
  success: boolean;
  content: string;
  model: string;
  latencyMs: number;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  error?: string;
  raw?: unknown;
}

export type PhysiquePhotoAngle = 'front' | 'side' | 'back' | 'posture' | 'comparison';

export interface PhysiqueAnalysisOptions {
  imageBase64: string;
  mimeType?: string;
  angle: PhysiquePhotoAngle;
  comparisonImageBase64?: string;
  comparisonMimeType?: string;
  additionalNotes?: string;
  modelOverride?: string;
}

// ====================================================
// AI Provider Manager Types
// ====================================================

export interface UnifiedAIResponse {
  success: boolean;
  content: string;
  provider: 'groq' | 'gemini' | 'rule_engine' | 'knowledge_base';
  model: string;
  latencyMs: number;
  fallbackUsed?: boolean;
  fallbackProvider?: 'groq' | 'gemini';
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  error?: string;
  raw?: unknown;
}





