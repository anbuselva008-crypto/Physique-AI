import { systemController } from '../system/systemController';
import { experienceEngine } from '../experience/experienceEngine';
import { ExperienceState } from '../experience/dashboardState';
import { transformationIntelligenceEngine } from '../intelligence';
import { UnifiedTransformationState } from '../intelligence/types';
import { dailyEngine } from '../daily/dailyEngine';
import { DailyTransformationPlan } from '../daily/types';
import { getPersona, personaEngineManager, UnifiedUserPersona } from '../persona';
import { healthMonitor } from '../system/healthMonitor';
import { SystemHealthDiagnostics } from '../system/types';

/**
 * EngineConnector
 * Connects AIOS system controller, experience engine, transformation engine,
 * decision engine, persona engine, daily engine, and health monitor.
 * Provides resilient fallback handling to prevent application crashes under any data state.
 */
export class EngineConnector {
  /**
   * Fetches unified ExperienceState from ExperienceEngine with full fallback object safety.
   */
  public getExperienceState(weekNum: number = 1, dayNum: number = 1): ExperienceState {
    try {
      return experienceEngine.generateExperience(weekNum, dayNum);
    } catch (error) {
      console.error('EngineConnector: Error generating experience state, returning safe fallback', error);
      return this.createFallbackExperienceState(weekNum, dayNum);
    }
  }

  /**
   * Fetches unified transformation intelligence state.
   */
  public getTransformationState(weekNum: number = 1, dayNum: number = 1): UnifiedTransformationState {
    try {
      return transformationIntelligenceEngine.runFullTransformationLoop(weekNum, dayNum);
    } catch (error) {
      console.error('EngineConnector: Error generating transformation state', error);
      return transformationIntelligenceEngine.runFullTransformationLoop(1, 1);
    }
  }

  /**
   * Fetches current daily transformation plan.
   */
  public getDailyPlan(weekNum: number = 1, dayNum: number = 1): DailyTransformationPlan {
    try {
      return dailyEngine.generateTodayPlan(weekNum, dayNum);
    } catch (error) {
      console.error('EngineConnector: Error generating daily plan', error);
      return dailyEngine.generateTodayPlan(1, 1);
    }
  }

  /**
   * Fetches user persona safely.
   */
  public getPersona(): UnifiedUserPersona {
    try {
      return getPersona();
    } catch (error) {
      console.error('EngineConnector: Error loading persona', error);
      return personaEngineManager.buildPersona();
    }
  }

  /**
   * Evaluates system health.
   */
  public diagnoseSystem(): SystemHealthDiagnostics {
    try {
      return healthMonitor.diagnose();
    } catch (error) {
      return {
        status: 'degraded',
        issues: [
          {
            code: 'DIAG_FAIL',
            module: 'system',
            message: 'System diagnostics encountered an error.',
            severity: 'medium',
            suggestedAction: 'Refresh application state.',
          },
        ],
        moduleHealth: {},
        recommendations: ['Refresh application.'],
        lastCheckedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Creates a safe fallback ExperienceState if engines fail.
   */
  private createFallbackExperienceState(weekNum: number, dayNum: number): ExperienceState {
    const fallbackPersona = personaEngineManager.buildPersona();
    const fallbackDailyPlan = dailyEngine.generateTodayPlan(weekNum, dayNum);
    const fallbackIntelligence = transformationIntelligenceEngine.runFullTransformationLoop(1, 1);

    return {
      dashboard: {
        dailyPlan: fallbackDailyPlan,
        persona: fallbackPersona,
        intelligence: fallbackIntelligence,
        widgets: {
          recoveryWidget: {
            id: 'wdg-rec',
            title: 'Recovery & Readiness',
            widgetType: 'Recovery',
            status: 'good',
            primaryMetric: '85/100',
            secondaryMetric: 'LOW RISK',
            summary: 'Optimal readiness.',
            actionText: 'View Recovery',
            actionRoute: '/recovery',
          },
          workoutWidget: {
            id: 'wdg-wrk',
            title: "Today's Training",
            widgetType: 'Workout',
            status: 'good',
            primaryMetric: fallbackIntelligence.workoutPlan.sessionType,
            secondaryMetric: '4 Exercises',
            summary: 'Hypertrophy session ready.',
            actionText: 'Start Workout',
            actionRoute: '/workout',
          },
          nutritionWidget: {
            id: 'wdg-nutr',
            title: 'Nutrition',
            widgetType: 'Nutrition',
            status: 'good',
            primaryMetric: `${fallbackIntelligence.mealPlan.totalProtein}g Protein`,
            secondaryMetric: `${fallbackIntelligence.mealPlan.totalCalories} kcal`,
            summary: 'Macro targets active.',
            actionText: 'Log Meal',
            actionRoute: '/nutrition',
          },
          transformationWidget: {
            id: 'wdg-trf',
            title: 'Transformation Score',
            widgetType: 'Transformation',
            status: 'good',
            primaryMetric: 'Stage 1',
            secondaryMetric: '80/100',
            summary: 'Progressing nicely.',
            actionText: 'View Progress',
            actionRoute: '/transformation',
          },
          missionWidget: {
            id: 'wdg-msn',
            title: "Today's Mission",
            widgetType: 'Mission',
            status: 'info',
            primaryMetric: 'Execute Hypertrophy Training',
            secondaryMetric: 'Standard',
            summary: 'Complete all sets with 3s eccentric controls.',
            actionText: 'Complete',
            actionRoute: '/daily',
          },
          coachWidget: {
            id: 'wdg-cch',
            title: 'Coach Briefing',
            widgetType: 'Coach',
            status: 'info',
            primaryMetric: 'High Focus',
            secondaryMetric: 'Good Morning!',
            summary: 'Stay consistent on protein and hydration.',
            actionText: 'Ask Coach',
            actionRoute: '/coach',
          },
          roadmapWidget: {
            id: 'wdg-rdm',
            title: 'Transformation Roadmap',
            widgetType: 'Roadmap',
            status: 'good',
            primaryMetric: 'Month 1 of 12',
            secondaryMetric: 'Foundational Muscle Recomposition',
            summary: 'Phase 1 active.',
            actionText: 'View Roadmap',
            actionRoute: '/roadmap',
          },
          confidenceWidget: {
            id: 'wdg-cnf',
            title: 'Goal Success Probability',
            widgetType: 'Confidence',
            status: 'good',
            primaryMetric: '88%',
            secondaryMetric: '88/100',
            summary: 'High consistency streak.',
            actionText: 'View Goals',
            actionRoute: '/goals',
          },
        },
        insights: {
          todayInsight: {
            timeframe: 'Today',
            title: 'Recovery & Daily Focus',
            highlight: 'Recovery score sitting at 85/100.',
            metric: '85/100',
            category: 'Daily Protocol',
            actionableRecommendation: 'Execute planned workout and log protein.',
          },
          weeklyInsight: {
            timeframe: 'Weekly',
            title: '7-Day Adherence',
            highlight: 'Workout adherence at 85%.',
            metric: '85%',
            category: 'Weekly Trend',
            actionableRecommendation: 'Maintain 4-5 high protein meals daily.',
          },
          monthlyInsight: {
            timeframe: 'Monthly',
            title: '30-Day Recomposition',
            highlight: 'Foundational Phase in progress.',
            metric: 'Stage 1',
            category: 'Roadmap',
            actionableRecommendation: 'Upload monthly progress photo.',
          },
          biggestImprovement: 'Consistent workout execution.',
          biggestWeakness: 'Evening hydration target.',
          mostImportantRecommendation: 'Hit daily protein target of 150g.',
        },
        timeline: [],
        memories: [],
        generatedAt: new Date().toISOString(),
      },
      widgets: {
        recoveryWidget: {
          id: 'wdg-rec',
          title: 'Recovery & Readiness',
          widgetType: 'Recovery',
          status: 'good',
          primaryMetric: '85/100',
          secondaryMetric: 'LOW RISK',
          summary: 'Optimal readiness.',
          actionText: 'View Recovery',
          actionRoute: '/recovery',
        },
        workoutWidget: {
          id: 'wdg-wrk',
          title: "Today's Training",
          widgetType: 'Workout',
          status: 'good',
          primaryMetric: 'Push Session',
          secondaryMetric: '4 Exercises',
          summary: 'Hypertrophy session ready.',
          actionText: 'Start Workout',
          actionRoute: '/workout',
        },
        nutritionWidget: {
          id: 'wdg-nutr',
          title: 'Nutrition',
          widgetType: 'Nutrition',
          status: 'good',
          primaryMetric: '160g Protein',
          secondaryMetric: '2400 kcal',
          summary: 'Macro targets active.',
          actionText: 'Log Meal',
          actionRoute: '/nutrition',
        },
        transformationWidget: {
          id: 'wdg-trf',
          title: 'Transformation Score',
          widgetType: 'Transformation',
          status: 'good',
          primaryMetric: 'Stage 1',
          secondaryMetric: '80/100',
          summary: 'Progressing nicely.',
          actionText: 'View Progress',
          actionRoute: '/transformation',
        },
        missionWidget: {
          id: 'wdg-msn',
          title: "Today's Mission",
          widgetType: 'Mission',
          status: 'info',
          primaryMetric: 'Execute Hypertrophy Training',
          secondaryMetric: 'Standard',
          summary: 'Complete all sets with 3s eccentric controls.',
          actionText: 'Complete',
          actionRoute: '/daily',
        },
        coachWidget: {
          id: 'wdg-cch',
          title: 'Coach Briefing',
          widgetType: 'Coach',
          status: 'info',
          primaryMetric: 'High Focus',
          secondaryMetric: 'Good Morning!',
          summary: 'Stay consistent on protein and hydration.',
          actionText: 'Ask Coach',
          actionRoute: '/coach',
        },
        roadmapWidget: {
          id: 'wdg-rdm',
          title: 'Transformation Roadmap',
          widgetType: 'Roadmap',
          status: 'good',
          primaryMetric: 'Month 1 of 12',
          secondaryMetric: 'Foundational Muscle Recomposition',
          summary: 'Phase 1 active.',
          actionText: 'View Roadmap',
          actionRoute: '/roadmap',
        },
        confidenceWidget: {
          id: 'wdg-cnf',
          title: 'Goal Success Probability',
          widgetType: 'Confidence',
          status: 'good',
          primaryMetric: '88%',
          secondaryMetric: '88/100',
          summary: 'High consistency streak.',
          actionText: 'View Goals',
          actionRoute: '/goals',
        },
      },
      timeline: [],
      coachMemory: [],
      coachInsights: {
        todayInsight: {
          timeframe: 'Today',
          title: 'Recovery & Daily Focus',
          highlight: 'Recovery score sitting at 85/100.',
          metric: '85/100',
          category: 'Daily Protocol',
          actionableRecommendation: 'Execute planned workout and log protein.',
        },
        weeklyInsight: {
          timeframe: 'Weekly',
          title: '7-Day Adherence',
          highlight: 'Workout adherence at 85%.',
          metric: '85%',
          category: 'Weekly Trend',
          actionableRecommendation: 'Maintain 4-5 high protein meals daily.',
        },
        monthlyInsight: {
          timeframe: 'Monthly',
          title: '30-Day Recomposition',
          highlight: 'Foundational Phase in progress.',
          metric: 'Stage 1',
          category: 'Roadmap',
          actionableRecommendation: 'Upload monthly progress photo.',
        },
        biggestImprovement: 'Consistent workout execution.',
        biggestWeakness: 'Evening hydration target.',
        mostImportantRecommendation: 'Hit daily protein target of 150g.',
      },
      systemDiagnostics: {
        healthStatus: 'degraded',
        issueCount: 1,
      },
      lastRefreshedAt: new Date().toISOString(),
    };
  }
}

export const engineConnector = new EngineConnector();
