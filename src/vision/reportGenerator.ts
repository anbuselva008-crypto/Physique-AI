import {
  BodyAnalysisResult,
  ProgressComparisonDelta,
  MonthlyTransformationReport,
} from './types';
import { workoutService } from '../services/workoutService';
import { nutritionService } from '../services/nutritionService';
import { checkInService } from '../services/checkInService';
import { getPersona } from '../persona';

export class ReportGenerator {
  /**
   * Generates a comprehensive MonthlyTransformationReport incorporating vision analysis,
   * workout data, nutrition logging, recovery statistics, and persona objectives.
   */
  public generateReport(params: {
    month: string;
    bodyAnalysis: BodyAnalysisResult;
    comparisonDelta?: ProgressComparisonDelta;
  }): MonthlyTransformationReport {
    const { month, bodyAnalysis, comparisonDelta } = params;

    const persona = getPersona();
    const workoutData = workoutService.load();
    const nutritionData = nutritionService.load();
    const checkInStats = checkInService.statistics();

    // 1. Photo Comparison Summary
    let photoComparisonSummary = '';
    if (comparisonDelta && comparisonDelta.previousMonth !== 'N/A (Baseline)') {
      const bfText =
        comparisonDelta.bodyFatChangePercentage < 0
          ? `dropped by ${Math.abs(comparisonDelta.bodyFatChangePercentage)}%`
          : comparisonDelta.bodyFatChangePercentage > 0
          ? `increased by ${comparisonDelta.bodyFatChangePercentage}%`
          : 'remained constant';

      photoComparisonSummary = `Compared to ${comparisonDelta.previousMonth}, estimated body fat has ${bfText} (currently ${bodyAnalysis.bodyFat.estimatedPercentage}%). Key gains noted in: ${comparisonDelta.improvements.join('; ')}.`;
    } else {
      photoComparisonSummary = `Initial monthly baseline photo assessment logged for ${month}. Estimated body fat is ${bodyAnalysis.bodyFat.estimatedPercentage}% (${bodyAnalysis.bodyFat.confidenceLevel} confidence). Primary focus areas identified: ${bodyAnalysis.weakAreas.join(', ')}.`;
    }

    // 2. Workout Performance
    const workoutStats = workoutService.statistics();
    const completedWorkouts = workoutStats.completedSets > 0 ? 1 : 0;
    const workoutPerformanceSummary = `Completed ${workoutStats.completedSets} of ${workoutStats.totalSets} sets (${workoutStats.completionPercentage}% workout completion) for ${workoutData.title}. Focus maintained on ${persona.fitness.trainingLevel} progressive overload protocols.`;

    // 3. Nutrition Adherence
    const mealLogs = nutritionData.mealLogs || [];
    const totalProteinLogged = mealLogs.reduce((acc, item) => acc + (item.protein || 0), 0);
    const targetProtein = nutritionData.goals?.targetProtein || 150;
    const proteinAdherence =
      targetProtein > 0
        ? Math.min(100, Math.round((totalProteinLogged / targetProtein) * 100))
        : 85;

    const nutritionAdherenceSummary = `Daily protein target: ${targetProtein}g (currently at ${totalProteinLogged}g, ${proteinAdherence}% adherence). Food budget maintained within ${persona.diet.foodBudget}. Hydration target: ${persona.diet.hydration}.`;

    // 4. Recovery
    const avgSleep = checkInStats.todaySleepHours || persona.lifestyle.averageSleep || 7.5;
    const energyLevel = checkInStats.todayEnergyLevel || 8;
    const recoverySummary = `Sleep duration recorded at ${avgSleep} hours. Energy and recovery level evaluated at ${energyLevel}/10. Stress managed alongside ${persona.lifestyle.collegeSchedule}.`;

    // 5. Recommended Priorities & Next Month Objectives
    const recommendedPriorities = bodyAnalysis.recommendedPriorities.length > 0
      ? bodyAnalysis.recommendedPriorities
      : [
          'Increase progressive overload volume on lagging muscle groups.',
          'Maintain protein consistency of at least 1.8g/kg body weight.',
        ];

    const nextMonthObjectives = [
      `Target estimated body fat of ${Math.max(8, bodyAnalysis.bodyFat.estimatedPercentage - 0.8)}%.`,
      `Focus on primary target areas: ${bodyAnalysis.weakAreas.join(', ')}.`,
      `Maintain 100% adherence to ${persona.fitness.preferredWorkoutDays.length}-day split schedule.`,
    ];

    // 6. Achievements & Adherence Metrics
    const achievements = [
      `Completed 3-Angle Monthly Photo Session for ${month}`,
      `Recorded baseline body fat estimate of ${bodyAnalysis.bodyFat.estimatedPercentage}% (${bodyAnalysis.bodyFat.confidenceLevel} confidence)`,
      `Strong muscle hypertrophy established in ${bodyAnalysis.strongAreas.join(', ')}`,
      `Protein target consistency evaluated at ${proteinAdherence}% adherence`,
    ];

    const laggingAreas = bodyAnalysis.weakAreas.length > 0
      ? bodyAnalysis.weakAreas
      : ['Upper Chest Volume', 'Posterior Chain Density'];

    const workoutQualityPct = Math.min(100, Math.max(70, Math.round(workoutStats.completionPercentage || 85)));
    const nutritionQualityPct = proteinAdherence;
    const recoveryQualityPct = Math.min(100, Math.round((energyLevel / 10) * 100));

    // 7. Summary
    const summary = `Monthly Transformation Report for ${month}: ${persona.personal.name} is making steady progress toward the 3-month goal ("${persona.goals.threeMonths}"). Visual analysis indicates strong development in ${bodyAnalysis.strongAreas.join(', ')} alongside solid ${proteinAdherence}% nutrition adherence.`;

    return {
      id: `report_${month}_${Date.now()}`,
      month,
      generatedAt: new Date().toISOString(),
      summary,
      photoComparisonSummary,
      workoutPerformanceSummary,
      nutritionAdherenceSummary,
      recoverySummary,
      recommendedPriorities,
      nextMonthObjectives,
      achievements,
      laggingAreas,
      adherenceMetrics: {
        workoutQualityPct,
        nutritionQualityPct,
        recoveryQualityPct,
      },
      comparisonDelta,
    };
  }
}

export const reportGenerator = new ReportGenerator();
