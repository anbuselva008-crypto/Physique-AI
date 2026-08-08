import {
  MorningPipelineResult,
  MonthlyPipelineResult,
  NutritionPipelineResult,
  SystemHealthDiagnostics,
  SystemSchedule,
  WeeklyPipelineResult,
  WorkoutPipelineResult,
} from './types';
import { getPersona } from '../persona';
import { memoryEngine } from '../ai/memoryEngine';
import { dailyEngine } from '../daily/dailyEngine';
import { checkInService } from '../services/checkInService';
import { automationManager, AutomationTriggers } from './automationManager';
import { healthMonitor } from './healthMonitor';
import { pipeline } from './pipeline';
import { scheduler } from './scheduler';
import { eventBus, SystemEventBus } from './eventBus';

export interface SystemInitializationReport {
  initializedAt: string;
  personaLoaded: boolean;
  userName: string;
  memoryItemCount: number;
  todayCheckInCompleted: boolean;
  activeAutomationTriggers: AutomationTriggers;
  schedule: SystemSchedule;
  health: SystemHealthDiagnostics;
}

/**
 * SystemController
 * Master coordinator of the AI Operating System (AIOS).
 * Manages life cycle initialization, routine triggers, diagnostic monitoring,
 * and automated inter-engine orchestration.
 */
export class SystemController {
  private isInitialized: boolean = false;

  /**
   * Initializes the application life cycle.
   * Loads Persona, Memory, Daily Plan state, checks Check-in & Vision requirements,
   * and runs initial diagnostic checks.
   */
  public initialize(): SystemInitializationReport {
    // 1. Load Persona
    const persona = getPersona();

    // 2. Load Memory summary
    const memorySummary = memoryEngine.summarize();

    // 3. Check today's Check-in
    const checkInStats = checkInService.statistics();

    // 4. Evaluate Automation Triggers
    const activeAutomationTriggers = automationManager.evaluateTriggers();

    // 5. Generate System Schedule
    const schedule = scheduler.generateSchedule();

    // 6. Run System Health Diagnostics
    const health = healthMonitor.diagnose();

    this.isInitialized = true;

    return {
      initializedAt: new Date().toISOString(),
      personaLoaded: !!persona,
      userName: persona.personal?.name || 'User',
      memoryItemCount: memorySummary.totalMemories,
      todayCheckInCompleted: checkInStats.hasCheckedInToday,
      activeAutomationTriggers,
      schedule,
      health,
    };
  }

  /**
   * Runs the complete Morning Routine pipeline.
   */
  public async runMorningRoutine(
    weekNum: number = 1,
    dayNum: number = 1
  ): Promise<MorningPipelineResult> {
    if (!this.isInitialized) {
      this.initialize();
    }
    return pipeline.runMorningPipeline(weekNum, dayNum);
  }

  /**
   * Runs the Workout completion pipeline.
   */
  public async runWorkoutPipeline(params?: {
    sessionType?: string;
    durationMins?: number;
    setsCompleted?: number;
  }): Promise<WorkoutPipelineResult> {
    if (!this.isInitialized) {
      this.initialize();
    }
    return pipeline.runWorkoutPipeline(params);
  }

  /**
   * Runs the Nutrition logging pipeline.
   */
  public async runNutritionPipeline(mealData?: {
    title: string;
    protein: number;
    calories: number;
    carbs?: number;
    fats?: number;
  }): Promise<NutritionPipelineResult> {
    if (!this.isInitialized) {
      this.initialize();
    }
    return pipeline.runNutritionPipeline(mealData);
  }

  /**
   * Runs the Gemini Vision progress photo pipeline.
   */
  public async runVisionPipeline(month: string = 'Month 1'): Promise<MonthlyPipelineResult> {
    if (!this.isInitialized) {
      this.initialize();
    }
    return pipeline.runVisionPipeline(month);
  }

  /**
   * Runs the Monthly Review pipeline.
   */
  public async runMonthlyReview(month: string = 'Month 1'): Promise<MonthlyPipelineResult> {
    if (!this.isInitialized) {
      this.initialize();
    }
    return pipeline.runMonthlyReview(month);
  }

  /**
   * Runs the Weekly Review pipeline.
   */
  public async runWeeklyReview(): Promise<WeeklyPipelineResult> {
    if (!this.isInitialized) {
      this.initialize();
    }
    return pipeline.runWeeklyReview();
  }

  /**
   * Runs comprehensive system diagnostics.
   */
  public runSystemDiagnostics(): SystemHealthDiagnostics {
    return healthMonitor.diagnose();
  }

  /**
   * Access the underlying event bus for subscribing to system events.
   */
  public getEventBus(): SystemEventBus {
    return eventBus;
  }
}

export const systemController = new SystemController();
