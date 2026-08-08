export type PoseAngle = 'front' | 'side' | 'back';

export interface ProgressPhotoItem {
  id: string;
  month: string; // YYYY-MM format e.g. "2026-08"
  date: string; // ISO date
  angle: PoseAngle;
  imageBase64: string;
  mimeType: string;
  notes?: string;
  resolution?: { width: number; height: number };
  fileSizeBytes?: number;
}

export interface MonthlyPhotoSessionData {
  date: string;
  weightKg?: number;
  sleepHours?: number;
  energyLevel?: number;
  soreness?: string;
  bodyStage?: number;
  recoveryScore?: number;
  nutritionAdherencePct?: number;
  workoutAdherencePct?: number;
}

export interface MonthlyPhotoSet {
  id: string;
  month: string; // e.g. "2026-08"
  timestamp: string;
  frontPhoto?: ProgressPhotoItem;
  sidePhoto?: ProgressPhotoItem;
  backPhoto?: ProgressPhotoItem;
  sessionData?: MonthlyPhotoSessionData;
}

export interface BodyFatEstimation {
  estimatedPercentage: number; // e.g., 15.5
  confidenceLevel: 'low' | 'medium' | 'high';
  range: [number, number]; // e.g., [14.5, 16.5]
  justification: string;
}

export interface ObservationDetail {
  category: string;
  observed: string; // Visually observed feature
  estimated: string; // Derived / estimated metric
  recommendation: string; // Actionable advice
}

export interface BodyAnalysisResult {
  month: string;
  analyzedAt: string;
  transformationStage?: number;
  bodyFat: BodyFatEstimation;
  postureObservations: string[];
  visibleMuscleDevelopment: {
    chest: string;
    shoulders: string;
    back: string;
    arms: string;
    core: string;
    legs: string;
  };
  muscleImbalances: string[];
  symmetryObservations: string[];
  fatDistribution: string;
  weakAreas: string[];
  strongAreas: string[];
  recommendedPriorities: string[];
  categorizedObservations?: ObservationDetail[];
  disclaimer: string;
}

export type DeltaCategoryStatus = 'improved' | 'unchanged' | 'needs_attention';

export interface CategoryComparisonItem {
  category: string; // e.g., "Chest Development", "Waist & Core", "Body Fat %", "Posture"
  status: DeltaCategoryStatus;
  currentObservation: string;
  previousObservation: string;
  changeSummary: string;
}

export interface ProgressComparisonDelta {
  previousMonth: string;
  currentMonth: string;
  improvements: string[];
  regressions: string[];
  unchangedMetrics: string[];
  bodyFatChangePercentage: number; // negative means fat loss, e.g. -1.2
  visualHypertrophyNotes: string[];
  posturalChanges: string[];
  categoryComparisons?: CategoryComparisonItem[];
}

export interface MonthlyTransformationReport {
  id: string;
  month: string;
  generatedAt: string;
  summary: string;
  photoComparisonSummary: string;
  workoutPerformanceSummary: string;
  nutritionAdherenceSummary: string;
  recoverySummary: string;
  recommendedPriorities: string[];
  nextMonthObjectives: string[];
  achievements?: string[];
  laggingAreas?: string[];
  adherenceMetrics?: {
    workoutQualityPct: number;
    nutritionQualityPct: number;
    recoveryQualityPct: number;
  };
  comparisonDelta?: ProgressComparisonDelta;
}

export interface VisionReport {
  photoSet: MonthlyPhotoSet;
  bodyAnalysis: BodyAnalysisResult;
  comparisonDelta?: ProgressComparisonDelta;
  transformationReport: MonthlyTransformationReport;
  generatedAt: string;
}

