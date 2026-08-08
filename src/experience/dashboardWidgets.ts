import { DashboardWidgets, WidgetModel } from './dashboardState';
import { DailyTransformationPlan } from '../daily/types';
import { UnifiedTransformationState } from '../intelligence/types';
import { confidenceEngine } from '../intelligence/confidenceEngine';
import { roadmapPlanner } from '../intelligence/roadmapPlanner';

/**
 * DashboardWidgets
 * Generates strongly typed, reusable widget data structures for dashboard UI consumption.
 */
export class DashboardWidgetsGenerator {
  /**
   * Generates all 8 core dashboard widget models based on current daily plan and intelligence state.
   */
  public generateWidgets(
    dailyPlan: DailyTransformationPlan,
    intelligence: UnifiedTransformationState
  ): DashboardWidgets {
    const { status, workoutPlan, mealPlan, coachReport } = intelligence;
    const confidence = confidenceEngine.estimateConfidence(status);
    const roadmap = roadmapPlanner.generateRoadmap(status, 1);

    // 1. Recovery Widget
    const recoveryWidget: WidgetModel = {
      id: 'wdg-recovery',
      title: 'Recovery & Readiness',
      widgetType: 'Recovery',
      status: status.recoveryScore >= 70 ? 'good' : status.recoveryScore >= 50 ? 'warning' : 'alert',
      primaryMetric: `${status.recoveryScore}/100`,
      secondaryMetric: `Risk: ${status.riskLevel.toUpperCase()}`,
      summary: `Sleep target: ${dailyPlan.summary.recoverySummary.sleepTargetHours}h. ${dailyPlan.summary.recoverySummary.recoveryAdvice[0] || 'Rest adequately.'}`,
      actionText: 'View Recovery Details',
      actionRoute: '/recovery',
    };

    // 2. Workout Widget
    const workoutWidget: WidgetModel = {
      id: 'wdg-workout',
      title: "Today's Training Protocol",
      widgetType: 'Workout',
      status: workoutPlan.sessionType === 'Rest Day' ? 'info' : 'good',
      primaryMetric: workoutPlan.sessionType,
      secondaryMetric: `${workoutPlan.exercises.length} Exercises (~${workoutPlan.estimatedDurationMins}m)`,
      summary: workoutPlan.targetFocus,
      actionText: workoutPlan.sessionType === 'Rest Day' ? 'View Rest Routine' : 'Start Workout',
      actionRoute: '/workout',
    };

    // 3. Nutrition Widget
    const nutritionWidget: WidgetModel = {
      id: 'wdg-nutrition',
      title: 'Nutrition & Macro Targets',
      widgetType: 'Nutrition',
      status: 'good',
      primaryMetric: `${mealPlan.totalProtein}g Protein`,
      secondaryMetric: `${mealPlan.totalCalories} kcal | ${mealPlan.hydrationTargetLiters}L Water`,
      summary: `Carbs: ${mealPlan.totalCarbs}g | Fats: ${mealPlan.totalFats}g`,
      actionText: 'Log Meal / Water',
      actionRoute: '/nutrition',
    };

    // 4. Transformation Widget
    const transformationWidget: WidgetModel = {
      id: 'wdg-transformation',
      title: 'Transformation Engine Status',
      widgetType: 'Transformation',
      status: status.plateauDetected ? 'warning' : 'good',
      primaryMetric: status.currentStage,
      secondaryMetric: `Score: ${status.transformationScore}/100`,
      summary: status.plateauDetected ? 'Plateau detected! Overload protocol active.' : 'Consistency on track.',
      actionText: 'View Transformation Details',
      actionRoute: '/transformation',
    };

    // 5. Mission Widget
    const missionWidget: WidgetModel = {
      id: 'wdg-mission',
      title: "Today's Mission",
      widgetType: 'Mission',
      status: dailyPlan.mission.isCompleted ? 'good' : 'info',
      primaryMetric: dailyPlan.mission.title,
      secondaryMetric: `Difficulty: ${dailyPlan.mission.difficulty}`,
      summary: dailyPlan.mission.description,
      actionText: 'Complete Mission',
      actionRoute: '/daily',
    };

    // 6. Coach Widget
    const coachWidget: WidgetModel = {
      id: 'wdg-coach',
      title: 'AI Head Coach Briefing',
      widgetType: 'Coach',
      status: 'info',
      primaryMetric: coachReport.todaysPriority,
      secondaryMetric: `Greeting: ${coachReport.goodMorningGreeting.split('.')[0]}`,
      summary: coachReport.quote,
      actionText: 'Chat with Coach',
      actionRoute: '/coach',
    };

    // 7. Roadmap Widget
    const roadmapWidget: WidgetModel = {
      id: 'wdg-roadmap',
      title: 'Master Transformation Roadmap',
      widgetType: 'Roadmap',
      status: 'good',
      primaryMetric: roadmap.currentMonth,
      secondaryMetric: roadmap.currentObjective,
      summary: `Primary Focus: ${roadmap.primaryFocus}`,
      actionText: 'View 12-Month Roadmap',
      actionRoute: '/roadmap',
    };

    // 8. Confidence Widget
    const confidenceWidget: WidgetModel = {
      id: 'wdg-confidence',
      title: 'Goal Success Probability',
      widgetType: 'Confidence',
      status: confidence.confidenceScore >= 75 ? 'good' : 'warning',
      primaryMetric: `${confidence.confidenceScore}%`,
      secondaryMetric: `Score: ${confidence.confidenceScore}/100`,
      summary: `Primary Factor: ${confidence.topPositiveFactors[0] || 'High adherence streak'}`,
      actionText: 'View Goal Confidence',
      actionRoute: '/goals',
    };

    return {
      recoveryWidget,
      workoutWidget,
      nutritionWidget,
      transformationWidget,
      missionWidget,
      coachWidget,
      roadmapWidget,
      confidenceWidget,
    };
  }
}

export const dashboardWidgetsGenerator = new DashboardWidgetsGenerator();
