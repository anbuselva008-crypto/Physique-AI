import { DailyTransformationPlan } from './types';
import { transformationIntelligenceEngine } from '../intelligence';
import { dailyMissionGenerator } from './dailyMissionGenerator';
import { dailySummaryGenerator } from './dailySummaryGenerator';
import { dailyChecklistGenerator } from './dailyChecklistGenerator';
import { dailyInsightsGenerator } from './dailyInsightsGenerator';
import { dailyNotifications } from './dailyNotifications';

/**
 * DailyEngine
 * Central orchestration engine for the Daily Transformation System.
 * Automatically generates Today's Transformation Plan proactively upon application startup.
 */
export class DailyEngine {
  /**
   * Generates Today's complete, end-to-end Daily Transformation Plan.
   * Runs without AI chat or user prompting.
   */
  public generateTodayPlan(
    currentWeek: number = 1,
    currentDay: number = 1
  ): DailyTransformationPlan {
    const currentDateStr = new Date().toISOString().split('T')[0];

    // 1. Run full underlying transformation intelligence engine loop
    const fullIntelligenceState = transformationIntelligenceEngine.runFullTransformationLoop(
      currentWeek,
      currentDay
    );

    // 2. Generate Daily Mission
    const mission = dailyMissionGenerator.generateMission(fullIntelligenceState);

    // 3. Generate Daily Summary / Today's Report
    const summary = dailySummaryGenerator.generateSummary(fullIntelligenceState, mission);

    // 4. Generate Daily Checklist
    const checklist = dailyChecklistGenerator.generateChecklist(
      fullIntelligenceState,
      currentDateStr
    );

    // 5. Generate Daily Insights
    const insights = dailyInsightsGenerator.generateInsights(fullIntelligenceState);

    // 6. Generate Notification Schedule
    const notificationSchedule = dailyNotifications.generateNotificationSchedule(
      fullIntelligenceState,
      currentDateStr
    );

    return {
      date: currentDateStr,
      summary,
      mission,
      checklist,
      insights,
      notificationSchedule,
      fullIntelligenceState,
    };
  }
}

export const dailyEngine = new DailyEngine();
