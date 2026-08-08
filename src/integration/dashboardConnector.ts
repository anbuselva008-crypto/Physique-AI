import { DashboardState, DashboardWidgets, WidgetModel } from '../experience/dashboardState';
import { engineConnector } from './engineConnector';
import { checkInService } from '../services/checkInService';
import { nutritionService } from '../services/nutritionService';
import { workoutService } from '../services/workoutService';

export interface DashboardLiveData {
  dashboardState: DashboardState;
  recoveryScore: number;
  todayWorkoutTitle: string;
  workoutDurationMins: number;
  consumedCalories: number;
  targetCalories: number;
  consumedProtein: number;
  targetProtein: number;
  waterCurrentLiters: number;
  waterTargetLiters: number;
  transformationScore: number;
  transformationStage: string;
  confidenceScore: number;
  cityName: string;
  gymTime: string;
  fitnessGoal: string;
  missionTitle: string;
  missionDescription: string;
  isCheckInDone: boolean;
}

/**
 * DashboardConnector
 * Connects Dashboard Integrator, Dashboard Widgets, Daily Summary,
 * Recovery Score, and Checklist to provide unified live data for the Dashboard screen.
 */
export class DashboardConnector {
  /**
   * Retrieves comprehensive live dashboard data with fallback values.
   */
  public getDashboardData(weekNum: number = 1, dayNum: number = 1): DashboardLiveData {
    const expState = engineConnector.getExperienceState(weekNum, dayNum);
    const dbState = expState.dashboard;

    const checkInStats = checkInService.statistics();
    const nutritionData = nutritionService.load();
    const workoutStats = workoutService.statistics();

    const mealLogs = nutritionData.mealLogs || [];
    const consumedCalories = mealLogs.reduce((sum, m) => sum + (m.calories || 0), 0);
    const consumedProtein = mealLogs.reduce((sum, m) => sum + (m.protein || 0), 0);
    const waterCurrentLiters = +( (nutritionData.waterLog?.ml || 2500) / 1000 ).toFixed(2);

    const workoutPlan = dbState.intelligence.workoutPlan;
    const mealPlan = dbState.intelligence.mealPlan;
    const persona = dbState.persona;

    return {
      dashboardState: dbState,
      recoveryScore: dbState.intelligence.status.recoveryScore,
      todayWorkoutTitle: workoutPlan.sessionType || workoutStats.workoutTitle || 'Hypertrophy Session',
      workoutDurationMins: workoutPlan.estimatedDurationMins || 45,
      consumedCalories,
      targetCalories: mealPlan.totalCalories || 2400,
      consumedProtein,
      targetProtein: mealPlan.totalProtein || 160,
      waterCurrentLiters,
      waterTargetLiters: mealPlan.hydrationTargetLiters || 4.0,
      transformationScore: dbState.intelligence.status.transformationScore,
      transformationStage: dbState.intelligence.status.currentStage,
      confidenceScore: dbState.widgets.confidenceWidget.primaryMetric
        ? parseInt(dbState.widgets.confidenceWidget.primaryMetric, 10) || 85
        : 85,
      cityName: persona.personal?.city || 'Coimbatore',
      gymTime: persona.fitness?.preferredWorkoutTime || '18:00',
      fitnessGoal: persona.fitness?.goal || 'Build Muscle',
      missionTitle: dbState.dailyPlan.mission.title,
      missionDescription: dbState.dailyPlan.mission.description,
      isCheckInDone: checkInStats.hasCheckedInToday,
    };
  }

  /**
   * Returns reusable widget models for rendering on the Dashboard.
   */
  public getWidgets(weekNum: number = 1, dayNum: number = 1): DashboardWidgets {
    return engineConnector.getExperienceState(weekNum, dayNum).widgets;
  }
}

export const dashboardConnector = new DashboardConnector();
