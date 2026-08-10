import { VisionReport, MonthlyTransformationReport } from './types';

const MONTHLY_REPORTS_KEY = 'physique_ai_monthly_progress_reports';

export interface StoredMonthlyReport {
  id: string;
  month: string; // YYYY-MM e.g. "2026-08"
  analyzedAt: string;
  bodyFatPercentage: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  confidenceReasons: string[];
  observedFeatures: string[];
  estimatedFeatures: string[];
  notDeterminableFeatures: string[];
  weakAreas: string[];
  strongAreas: string[];
  adaptiveWorkoutAdjustments: string[];
  adaptiveNutritionAdjustments: string[];
  recoveryAdjustments: string[];
  coachSummary: string;
  nextMonthObjectives: string[];
  fullReport: VisionReport;
}

export class MonthlyReportStorage {
  private reportsMap: Map<string, StoredMonthlyReport> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(MONTHLY_REPORTS_KEY);
      if (raw) {
        const parsed: StoredMonthlyReport[] = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((report) => {
            if (report && report.month) {
              this.reportsMap.set(report.month, report);
            }
          });
        }
      }
    } catch (e) {
      console.warn('[MonthlyReportStorage] Failed to load monthly reports from storage:', e);
    }
  }

  private persist(): void {
    try {
      const list = Array.from(this.reportsMap.values());
      localStorage.setItem(MONTHLY_REPORTS_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('[MonthlyReportStorage] Failed to persist monthly reports:', e);
    }
  }

  public saveReport(visionReport: VisionReport): StoredMonthlyReport {
    const { bodyAnalysis, transformationReport } = visionReport;
    const month = bodyAnalysis.month;

    const confidenceReasons: string[] = [];
    if (bodyAnalysis.confidenceReasons && bodyAnalysis.confidenceReasons.length > 0) {
      confidenceReasons.push(...bodyAnalysis.confidenceReasons);
    } else {
      if (bodyAnalysis.bodyFat.confidenceLevel === 'low') {
        confidenceReasons.push('Sub-optimal lighting or missing side/back profile views.');
      } else if (bodyAnalysis.bodyFat.confidenceLevel === 'medium') {
        confidenceReasons.push('Standard lighting with 2-angle pose coverage.');
      } else {
        confidenceReasons.push('Full 3-angle pose set captured with clear anatomical definition.');
      }
    }

    const observedFeatures = bodyAnalysis.observedFeatures || [
      `Chest Fullness: ${bodyAnalysis.visibleMuscleDevelopment.chest}`,
      `Shoulder Width: ${bodyAnalysis.visibleMuscleDevelopment.shoulders}`,
      `Back Width: ${bodyAnalysis.visibleMuscleDevelopment.back}`,
      `Waist & Core Alignment: ${bodyAnalysis.visibleMuscleDevelopment.core}`,
      `Posture Alignment: ${bodyAnalysis.postureObservations[0] || 'Neutral posture'}`,
    ];

    const estimatedFeatures = bodyAnalysis.estimatedFeatures || [
      `Estimated Body Fat: ${bodyAnalysis.bodyFat.estimatedPercentage}% (${bodyAnalysis.bodyFat.range[0]}% - ${bodyAnalysis.bodyFat.range[1]}%)`,
      `Transformation Stage: Stage ${bodyAnalysis.transformationStage || 2}`,
      `Primary Muscle Mass Index: Moderate Hypertrophy Rate`,
    ];

    const notDeterminableFeatures = bodyAnalysis.notDeterminableFeatures || [
      'Bench press 1RM max strength: Cannot determine confidently from available images.',
      'Circulating testosterone & cortisol hormone levels: Cannot determine confidently from available images.',
      'Visceral fat thickness vs subcutaneous fat layer: Cannot determine confidently from available images.',
      'Subcutaneous water retention percentage: Cannot determine confidently from available images.',
      'Bone density & internal organ weight: Cannot determine confidently from available images.',
    ];

    const adaptiveWorkoutAdjustments = bodyAnalysis.adaptiveWorkoutAdjustments || [
      `Increased volume on weak areas: ${bodyAnalysis.weakAreas.join(', ')}`,
      'Injected 30-degree incline dumbbell press & low cable flyes',
      'Added high-frequency face pulls for scapular balance',
    ];

    const adaptiveNutritionAdjustments = bodyAnalysis.adaptiveNutritionAdjustments || [
      `Adjusted daily protein target to 2.0g/kg based on current lean mass`,
      `Calorie target calibrated to ${transformationReport.adherenceMetrics?.nutritionQualityPct ? 'maintain steady recomposition' : 'optimize recovery'}`,
    ];

    const recoveryAdjustments = [
      `Sleep target: 8.0 hours for optimal central nervous system recovery`,
      `Daily hydration protocol: Minimum 3.5 Liters`,
    ];

    const storedReport: StoredMonthlyReport = {
      id: `stored_report_${month}_${Date.now()}`,
      month,
      analyzedAt: bodyAnalysis.analyzedAt || new Date().toISOString(),
      bodyFatPercentage: bodyAnalysis.bodyFat.estimatedPercentage,
      confidenceLevel: bodyAnalysis.bodyFat.confidenceLevel,
      confidenceReasons,
      observedFeatures,
      estimatedFeatures,
      notDeterminableFeatures,
      weakAreas: bodyAnalysis.weakAreas,
      strongAreas: bodyAnalysis.strongAreas,
      adaptiveWorkoutAdjustments,
      adaptiveNutritionAdjustments,
      recoveryAdjustments,
      coachSummary: transformationReport.summary,
      nextMonthObjectives: transformationReport.nextMonthObjectives,
      fullReport: visionReport,
    };

    this.reportsMap.set(month, storedReport);
    this.persist();
    return storedReport;
  }

  public getReportByMonth(month: string): StoredMonthlyReport | undefined {
    return this.reportsMap.get(month);
  }

  public getAllReports(): StoredMonthlyReport[] {
    return Array.from(this.reportsMap.values()).sort((a, b) => a.month.localeCompare(b.month));
  }

  public deleteReport(month: string): void {
    this.reportsMap.delete(month);
    this.persist();
  }
}

export const monthlyReportStorage = new MonthlyReportStorage();
