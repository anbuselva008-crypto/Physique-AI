import { DailyTransformationPlan } from '../daily/types';
import { UnifiedTransformationState } from '../intelligence/types';
import { VisionReport } from '../vision/types';

export type SystemEventType =
  | 'PROFILE_UPDATED'
  | 'CHECKIN_COMPLETED'
  | 'WORKOUT_COMPLETED'
  | 'MEAL_LOGGED'
  | 'PHOTO_UPLOADED'
  | 'MONTH_FINISHED'
  | 'GOAL_UPDATED'
  | 'RECOVERY_CHANGED'
  | 'MEMORY_UPDATED'
  | 'ROADMAP_UPDATED';

export interface SystemEventPayloadMap {
  PROFILE_UPDATED: { updatedFields: string[]; timestamp: string };
  CHECKIN_COMPLETED: { sleepHours: number; energyLevel: number; soreness: string; timestamp: string };
  WORKOUT_COMPLETED: { sessionType: string; durationMins: number; setsCompleted: number; timestamp: string };
  MEAL_LOGGED: { mealTitle: string; protein: number; calories: number; timestamp: string };
  PHOTO_UPLOADED: { month: string; poseAngle: string; timestamp: string };
  MONTH_FINISHED: { month: string; timestamp: string };
  GOAL_UPDATED: { goalType: string; newTarget: string; timestamp: string };
  RECOVERY_CHANGED: { newRecoveryScore: number; reason: string; timestamp: string };
  MEMORY_UPDATED: { memoryType: string; entryCount: number; timestamp: string };
  ROADMAP_UPDATED: { currentMonth: string; newObjective: string; timestamp: string };
}

export interface SystemEvent<T extends SystemEventType = SystemEventType> {
  type: T;
  payload: SystemEventPayloadMap[T];
  id: string;
  createdAt: string;
}

export type SystemEventHandler<T extends SystemEventType> = (
  event: SystemEvent<T>
) => void | Promise<void>;

export interface MorningPipelineResult {
  dailyPlan: DailyTransformationPlan;
  executedAt: string;
  success: boolean;
}

export interface WorkoutPipelineResult {
  workoutSummary: {
    sessionType: string;
    setsCompleted: number;
    completionPercentage: number;
  };
  updatedIntelligence: UnifiedTransformationState;
  memoryLogged: boolean;
  executedAt: string;
}

export interface NutritionPipelineResult {
  loggedMeal: {
    mealTitle: string;
    protein: number;
    calories: number;
  };
  totalLoggedProtein: number;
  proteinTarget: number;
  hydrationMl: number;
  updatedIntelligence: UnifiedTransformationState;
  executedAt: string;
}

export interface MonthlyPipelineResult {
  month: string;
  visionReport?: VisionReport;
  updatedIntelligence: UnifiedTransformationState;
  roadmapUpdated: boolean;
  executedAt: string;
}

export interface WeeklyPipelineResult {
  weekNumber: number;
  weeklyAdherencePercent: number;
  workoutCount: number;
  summary: string;
  executedAt: string;
}

export type HealthSeverity = 'healthy' | 'degraded' | 'critical';

export interface HealthIssue {
  code: string;
  module: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  suggestedAction: string;
}

export interface SystemHealthDiagnostics {
  status: HealthSeverity;
  issues: HealthIssue[];
  moduleHealth: Record<string, boolean>;
  recommendations: string[];
  lastCheckedAt: string;
}

export interface ScheduledTaskItem {
  id: string;
  name: string;
  targetTime: string; // e.g. "08:00 AM" or "2026-09-01"
  recurrence: 'Daily' | 'Weekly' | 'Monthly' | 'Once';
  description: string;
  actionPipeline: 'morning' | 'workout' | 'nutrition' | 'vision' | 'weekly' | 'monthly';
}

export interface SystemSchedule {
  generatedAt: string;
  dailyTasks: ScheduledTaskItem[];
  weeklyReviewDate: string;
  nextMonthlyPhotoDate: string;
}
