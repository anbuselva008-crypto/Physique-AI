import { AIContext, DecisionReport } from './types';

export type MemoryCategory =
  | 'workout_preference'
  | 'nutrition_habit'
  | 'recovery_pattern'
  | 'lifestyle_routine'
  | 'goal_milestone'
  | 'user_feedback'
  | 'general';

export type MemoryImportance = 'critical' | 'high' | 'medium' | 'low';

export interface MemoryItem {
  id: string;
  category: MemoryCategory;
  importance: MemoryImportance;
  key: string;
  value: string | number | boolean | Record<string, unknown> | Array<unknown>;
  confidence: number; // 0.0 to 1.0
  source: 'auto_learned' | 'user_explicit' | 'decision_engine';
  firstObservedAt: string;
  lastUpdatedAt: string;
  accessCount: number;
  metadata?: Record<string, unknown>;
}

export interface MemoryQueryOptions {
  category?: MemoryCategory;
  importance?: MemoryImportance;
  minConfidence?: number;
  searchTerm?: string;
  limit?: number;
}

export interface MemorySummary {
  totalMemories: number;
  preferredWorkoutTime: string | null;
  favoriteExercises: string[];
  skippedExercises: string[];
  favoriteFoods: string[];
  typicalProteinIntakeG: number | null;
  typicalCalorieIntakeKcal: number | null;
  typicalSleepHours: number | null;
  averageRecoveryScore: number | null;
  collegeOrWorkRoutine: string | null;
  budgetPreference: string | null;
  activeGoal: string | null;
  keyInsights: string[];
  lastLearnedAt: string;
}
