import { DailyTransformationPlan } from '../daily/types';
import { UnifiedTransformationState } from '../intelligence/types';
import { UnifiedUserPersona } from '../persona';

export type TimelineCategory =
  | 'Milestone'
  | 'Workout'
  | 'Checkin'
  | 'Nutrition'
  | 'Vision'
  | 'PR'
  | 'Roadmap';

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  category: TimelineCategory;
  importance: 'high' | 'medium' | 'low';
}

export interface CoachMemoryItem {
  id: string;
  key: string;
  learnedFact: string;
  category: string;
  learnedAt: string;
  confidenceLevel: number;
}

export interface CoachInsightItem {
  timeframe: 'Today' | 'Weekly' | 'Monthly';
  title: string;
  highlight: string;
  metric: string;
  category: string;
  actionableRecommendation: string;
}

export interface CoachInsightsState {
  todayInsight: CoachInsightItem;
  weeklyInsight: CoachInsightItem;
  monthlyInsight: CoachInsightItem;
  biggestImprovement: string;
  biggestWeakness: string;
  mostImportantRecommendation: string;
}

export type WidgetType =
  | 'Recovery'
  | 'Workout'
  | 'Nutrition'
  | 'Transformation'
  | 'Mission'
  | 'Coach'
  | 'Roadmap'
  | 'Confidence';

export interface WidgetModel {
  id: string;
  title: string;
  widgetType: WidgetType;
  status: 'good' | 'warning' | 'alert' | 'info';
  primaryMetric: string;
  secondaryMetric: string;
  summary: string;
  actionText: string;
  actionRoute: string;
}

export interface DashboardWidgets {
  recoveryWidget: WidgetModel;
  workoutWidget: WidgetModel;
  nutritionWidget: WidgetModel;
  transformationWidget: WidgetModel;
  missionWidget: WidgetModel;
  coachWidget: WidgetModel;
  roadmapWidget: WidgetModel;
  confidenceWidget: WidgetModel;
}

export interface DashboardState {
  dailyPlan: DailyTransformationPlan;
  persona: UnifiedUserPersona;
  intelligence: UnifiedTransformationState;
  widgets: DashboardWidgets;
  insights: CoachInsightsState;
  timeline: TimelineEvent[];
  memories: CoachMemoryItem[];
  generatedAt: string;
}

export interface ExperienceState {
  dashboard: DashboardState;
  widgets: DashboardWidgets;
  timeline: TimelineEvent[];
  coachMemory: CoachMemoryItem[];
  coachInsights: CoachInsightsState;
  systemDiagnostics: {
    healthStatus: string;
    issueCount: number;
  };
  lastRefreshedAt: string;
}
