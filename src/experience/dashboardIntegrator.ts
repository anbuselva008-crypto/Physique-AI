import { DashboardState } from './dashboardState';
import { dailyEngine } from '../daily/dailyEngine';
import { transformationIntelligenceEngine } from '../intelligence';
import { getPersona } from '../persona';
import { coachTimeline } from './coachTimeline';
import { coachMemory } from './coachMemory';
import { coachInsights } from './coachInsights';
import { dashboardWidgetsGenerator } from './dashboardWidgets';

/**
 * DashboardIntegrator
 * Combines intelligence outputs from all underlying engines into one unified DashboardState.
 */
export class DashboardIntegrator {
  /**
   * Integrates all engine outputs into a complete DashboardState object.
   */
  public integrate(
    currentWeek: number = 1,
    currentDay: number = 1
  ): DashboardState {
    const persona = getPersona();

    // 1. Generate Daily Transformation Plan
    const dailyPlan = dailyEngine.generateTodayPlan(currentWeek, currentDay);

    // 2. Fetch full transformation state
    const intelligence = transformationIntelligenceEngine.runFullTransformationLoop(
      currentWeek,
      currentDay
    );

    // 3. Generate Widgets
    const widgets = dashboardWidgetsGenerator.generateWidgets(dailyPlan, intelligence);

    // 4. Generate Insights
    const insights = coachInsights.generateInsights(intelligence);

    // 5. Generate Timeline Events
    const timeline = coachTimeline.generateTimeline();

    // 6. Generate Coach Memories
    const memories = coachMemory.generateMemories();

    return {
      dailyPlan,
      persona,
      intelligence,
      widgets,
      insights,
      timeline,
      memories,
      generatedAt: new Date().toISOString(),
    };
  }
}

export const dashboardIntegrator = new DashboardIntegrator();
