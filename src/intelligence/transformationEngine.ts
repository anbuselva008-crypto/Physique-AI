import { TransformationStatus, TransformationStage, RiskFactor } from './types';
import { getPersona } from '../persona';
import { checkInService } from '../services/checkInService';
import { workoutService } from '../services/workoutService';
import { nutritionService } from '../services/nutritionService';
import { progressService } from '../services/progressService';

/**
 * TransformationEngine
 * Evaluates core physical metrics, training frequency, recovery scores, and progress trends
 * to determine the user's active Transformation Stage, Risk Level, and Plateau Indicators.
 */
export class TransformationEngine {
  /**
   * Evaluates current user state and returns a comprehensive TransformationStatus object.
   */
  public evaluateStatus(): TransformationStatus {
    const persona = getPersona();
    const checkInStats = checkInService.statistics();
    const workoutStats = workoutService.statistics();
    const nutritionData = nutritionService.load();
    const progressData = progressService.load();

    const bodyFat = persona.body?.estimatedBodyFat || 18;
    const goal = persona.fitness?.goal || 'Build Muscle';

    // Calculate Recovery Score (0-100)
    const sleepHours = checkInStats.todaySleepHours || persona.lifestyle?.averageSleep || 7.5;
    const sleepScore = Math.min(100, Math.round((sleepHours / 8) * 100));

    const soreness = checkInStats.todaySoreness || 'None';
    let sorenessPenalty = 0;
    if (soreness === 'Heavy') sorenessPenalty = 30;
    else if (soreness === 'Medium') sorenessPenalty = 15;
    else if (soreness === 'Light') sorenessPenalty = 5;

    const energyLevel = checkInStats.todayEnergyLevel || 7;
    const energyScore = Math.min(100, energyLevel * 10);

    const recoveryScore = Math.max(
      10,
      Math.min(100, Math.round(sleepScore * 0.4 + energyScore * 0.4 + (20 - sorenessPenalty)))
    );

    // Calculate Consistency Score (0-100)
    const workoutCompletion = workoutStats.completionPercentage || 75;
    const streakDays = progressData.summary?.workoutStreak || progressData.stats?.currentStreak || 0;

    const mealLogs = nutritionData.mealLogs || [];
    const totalProtein = mealLogs.reduce((acc, m) => acc + (m.protein || 0), 0);
    const targetProtein = nutritionData.goals?.targetProtein || 150;
    const proteinScore = targetProtein > 0 ? Math.min(100, Math.round((totalProtein / targetProtein) * 100)) : 70;

    const consistencyScore = Math.min(
      100,
      Math.round(workoutCompletion * 0.5 + proteinScore * 0.3 + Math.min(20, streakDays * 3))
    );

    // Determine Stage
    let currentStage: TransformationStage = 'Skinny Fat';
    if (bodyFat > 22) {
      currentStage = 'Beginner Fat Loss';
    } else if (bodyFat >= 14 && bodyFat <= 22) {
      if (goal.toLowerCase().includes('cut') || goal.toLowerCase().includes('lose')) {
        currentStage = 'Beginner Fat Loss';
      } else {
        currentStage = 'Skinny Fat';
      }
    } else if (bodyFat >= 10 && bodyFat < 14) {
      currentStage = 'Lean Building';
    } else {
      currentStage = 'Maintenance';
    }

    // Detected Risks
    const detectedRisks: RiskFactor[] = [];
    if (sleepHours < 6) {
      detectedRisks.push('High Stress & Sleep Deficit');
    }
    if (soreness === 'Heavy') {
      detectedRisks.push('Overtraining Risk');
    }
    const waterLog = nutritionData.waterLog;
    if (waterLog && waterLog.ml < 1500) {
      detectedRisks.push('Hydration Deficit');
    }

    // Risk Level
    let riskLevel: 'low' | 'moderate' | 'high' = 'low';
    if (detectedRisks.length >= 2 || recoveryScore < 40) {
      riskLevel = 'high';
    } else if (detectedRisks.length === 1 || recoveryScore < 60) {
      riskLevel = 'moderate';
    }

    // Plateau Detection
    const weights = progressData.weights || [];
    let plateauDetected = false;
    if (weights.length >= 7) {
      const recent = weights.slice(-7);
      const firstWeight = recent[0].weightKg;
      const lastWeight = recent[recent.length - 1].weightKg;
      if (Math.abs(lastWeight - firstWeight) < 0.2 && consistencyScore > 75) {
        plateauDetected = true;
        if (!detectedRisks.includes('Weight Loss Plateau')) {
          detectedRisks.push('Weight Loss Plateau');
        }
      }
    }

    const transformationScore = Math.round(consistencyScore * 0.6 + recoveryScore * 0.4);

    return {
      currentStage,
      recoveryScore,
      transformationScore,
      riskLevel,
      strengthLevel: 'Intermediate',
      nutritionQualityScore: proteinScore,
      consistencyScore,
      detectedRisks,
      plateauDetected,
      notes: [
        `Active stage: ${currentStage}`,
        `Recovery score: ${recoveryScore}/100`,
        `Consistency score: ${consistencyScore}/100`,
      ],
    };
  }
}

export const transformationEngine = new TransformationEngine();
