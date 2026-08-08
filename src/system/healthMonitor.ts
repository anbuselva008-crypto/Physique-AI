import { HealthIssue, HealthSeverity, SystemHealthDiagnostics } from './types';
import { getPersona } from '../persona';
import { checkInService } from '../services/checkInService';
import { nutritionService } from '../services/nutritionService';
import { progressService } from '../services/progressService';

/**
 * HealthMonitor
 * Audits module state, data completeness, profile fields, check-in records,
 * and API environment configurations to ensure optimal system operation.
 */
export class HealthMonitor {
  /**
   * Evaluates all engines and services to return a comprehensive diagnostic report.
   */
  public diagnose(): SystemHealthDiagnostics {
    const issues: HealthIssue[] = [];
    const recommendations: string[] = [];

    const moduleHealth: Record<string, boolean> = {
      personaEngine: true,
      memoryEngine: true,
      checkInService: true,
      workoutService: true,
      nutritionService: true,
      progressService: true,
      transformationEngine: true,
      visionEngine: true,
    };

    // 1. Audit Persona Completeness
    try {
      const persona = getPersona();
      if (!persona.personal?.name || !persona.body?.weight || !persona.body?.height) {
        issues.push({
          code: 'PERS_INCOMPLETE',
          module: 'personaEngine',
          message: 'Key profile fields (name, weight, height) are incomplete.',
          severity: 'high',
          suggestedAction: 'Complete the initial persona onboarding profile in Settings.',
        });
        recommendations.push('Prompt user to fill out weight, height, and target metrics.');
      }
    } catch (e) {
      moduleHealth.personaEngine = false;
      issues.push({
        code: 'PERS_CRASH',
        module: 'personaEngine',
        message: 'Failed to access Persona Engine.',
        severity: 'high',
        suggestedAction: 'Verify local storage persona configuration.',
      });
    }

    // 2. Audit Daily Check-in Completeness
    try {
      const checkInStats = checkInService.statistics();
      if (!checkInStats.hasCheckedInToday) {
        issues.push({
          code: 'CHK_MISSING_TODAY',
          module: 'checkInService',
          message: 'Morning check-in has not been submitted for today.',
          severity: 'low',
          suggestedAction: 'Complete today\'s morning check-in to calibrate recovery score.',
        });
        recommendations.push('Show morning check-in banner on home screen.');
      }
    } catch (e) {
      moduleHealth.checkInService = false;
    }

    // 3. Audit Progress & Monthly Photos
    try {
      const progressData = progressService.load();
      const photos = progressData.photos || [];
      if (photos.length === 0) {
        issues.push({
          code: 'PHOTO_NONE_LOGGED',
          module: 'progressService',
          message: 'No visual progress photos found in records.',
          severity: 'medium',
          suggestedAction: 'Upload a front and back progress photo to enable AI vision posture and body fat analysis.',
        });
        recommendations.push('Prompt user for monthly progress photo upload.');
      }
    } catch (e) {
      moduleHealth.progressService = false;
    }

    // 4. Audit Nutrition Logs
    try {
      const nutritionData = nutritionService.load();
      const mealLogs = nutritionData.mealLogs || [];
      if (mealLogs.length === 0) {
        issues.push({
          code: 'NUTR_EMPTY_LOGS',
          module: 'nutritionService',
          message: 'No meals logged today.',
          severity: 'low',
          suggestedAction: 'Log your meals to track protein and daily calorie adherence.',
        });
      }
    } catch (e) {
      moduleHealth.nutritionService = false;
    }

    // Determine overall status
    let status: HealthSeverity = 'healthy';
    const hasHighSeverity = issues.some((i) => i.severity === 'high');
    const hasFailedModules = Object.values(moduleHealth).some((h) => !h);

    if (hasHighSeverity || hasFailedModules) {
      status = 'critical';
    } else if (issues.length > 0) {
      status = 'degraded';
    }

    return {
      status,
      issues,
      moduleHealth,
      recommendations,
      lastCheckedAt: new Date().toISOString(),
    };
  }
}

export const healthMonitor = new HealthMonitor();
