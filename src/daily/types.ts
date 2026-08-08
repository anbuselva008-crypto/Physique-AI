import { UnifiedTransformationState } from '../intelligence/types';

export type MissionCategory = 'Workout' | 'Nutrition' | 'Recovery' | 'Mindset' | 'General';
export type MissionDifficulty = 'Easy' | 'Moderate' | 'Challenging';

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  category: MissionCategory;
  difficulty: MissionDifficulty;
  targetAction: string;
  isCompleted: boolean;
}

export type ChecklistCategory =
  | 'Check-in'
  | 'Hydration'
  | 'Workout'
  | 'Nutrition'
  | 'Cardio'
  | 'Recovery'
  | 'Photos';

export interface DailyChecklistItem {
  id: string;
  title: string;
  category: ChecklistCategory;
  completed: boolean;
  timePreference?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface DailyChecklist {
  date: string;
  items: DailyChecklistItem[];
  completedCount: number;
  totalCount: number;
  progressPercentage: number;
}

export type InsightType = 'positive' | 'warning' | 'info' | 'critical';

export interface DailyInsight {
  id: string;
  type: InsightType;
  title: string;
  message: string;
  metric: string;
  actionableAdvice: string;
}

export interface DailyInsights {
  insights: DailyInsight[];
  topPriorityInsight: DailyInsight | null;
  generatedAt: string;
}

export type NotificationCategory =
  | 'Workout'
  | 'Nutrition'
  | 'Water'
  | 'CheckIn'
  | 'Sleep'
  | 'Photos';

export interface NotificationItem {
  id: string;
  scheduledTime: string; // e.g. "08:00 AM"
  title: string;
  message: string;
  category: NotificationCategory;
  actionUrl?: string;
}

export interface NotificationSchedule {
  date: string;
  notifications: NotificationItem[];
}

export interface DailySummary {
  goodMorningMessage: string;
  recoveryScore: number;
  transformationStage: string;
  workoutSummary: {
    sessionType: string;
    targetFocus: string;
    exerciseCount: number;
    estimatedDurationMins: number;
  };
  nutritionSummary: {
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFats: number;
    waterTargetLiters: number;
  };
  recoverySummary: {
    sleepTargetHours: number;
    recoveryAdvice: string[];
  };
  dailyStepGoal: number;
  motivationQuote: string;
  todayMissionText: string;
  estimatedWorkoutDurationMins: number;
  expectedCompletionTime: string;
  warnings: string[];
  recoveryNotes: string[];
}

export interface DailyTransformationPlan {
  date: string;
  summary: DailySummary;
  mission: DailyMission;
  checklist: DailyChecklist;
  insights: DailyInsights;
  notificationSchedule: NotificationSchedule;
  fullIntelligenceState: UnifiedTransformationState;
}
