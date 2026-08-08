import { ExperienceState } from './dashboardState';
import { dashboardIntegrator } from './dashboardIntegrator';
import { healthMonitor } from '../system/healthMonitor';

/**
 * ExperienceEngine
 * Master Experience Orchestrator before UI layer.
 * Converts raw multi-engine intelligence into a structured, unified ExperienceState.
 */
export class ExperienceEngine {
  /**
   * Evaluates system state and constructs the complete ExperienceState required by the UI.
   */
  public generateExperience(
    weekNum: number = 1,
    dayNum: number = 1
  ): ExperienceState {
    // 1. Generate full Dashboard State
    const dashboard = dashboardIntegrator.integrate(weekNum, dayNum);

    // 2. Fetch System Health Diagnostics
    const health = healthMonitor.diagnose();

    return {
      dashboard,
      widgets: dashboard.widgets,
      timeline: dashboard.timeline,
      coachMemory: dashboard.memories,
      coachInsights: dashboard.insights,
      systemDiagnostics: {
        healthStatus: health.status,
        issueCount: health.issues.length,
      },
      lastRefreshedAt: new Date().toISOString(),
    };
  }
}

export const experienceEngine = new ExperienceEngine();
