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

export type QualitativeDevelopmentLevel =
  | 'Very Limited'
  | 'Limited'
  | 'Moderate'
  | 'Well Developed'
  | 'Advanced'
  | 'Elite';

export interface ScientificMuscleGroupAnalysis {
  muscleGroup: string; // e.g. "Upper Chest", "Deltoids & Shoulders", "Lat Width & Back", "Waistline & Core", "Quads & Hamstrings", "Arms (Biceps & Triceps)"
  developmentLevel: QualitativeDevelopmentLevel;
  confidence: 'high' | 'medium' | 'low';
  observations: string[]; // Specific visible landmarks observed
  reasoning: string; // Biomechanical & physiological explanation
  workoutImpact: string; // Program adjustment
  nutritionImpact?: string;
  status: 'improved' | 'maintained' | 'slight_regression' | 'regression' | 'insufficient_evidence';
}

export interface DecisionPipelineFlow {
  detectedIssue: string; // e.g. "Upper Pectoralis Minor/Major Lagging"
  evidence: string[]; // "Flat upper sternal/clavicular region in front photo"
  workoutAdjustment: string; // "+2 Sets Incline DB Press @ 30°"
  nutritionAdjustment: string; // "Protein target maintained at 2.0g/kg"
  recoveryAdjustment: string; // "+1 Rest day after Heavy Upper Session"
  goalImpact: string; // "ETA for Chest Symmetry adjusted by -1 week"
  coachFocus: string; // "Maintain 3-second eccentric pause on incline press"
}

export type TransformationMomentum = 'Excellent' | 'Good' | 'Stable' | 'Slow' | 'At Risk';

export interface ScientificExecutiveSummary {
  keyImprovements: string[];
  noVisibleChangeAreas: string[];
  areasRequiringAttention: string[];
  highestPriority: string;
  expectedResultNextMonth: string;
  scientificLimitations: string[];
  momentum: TransformationMomentum;
  momentumReason: string;
}

export interface BodyAnalysisResult {
  month: string;
  analyzedAt: string;
  transformationStage?: number;
  bodyFat: BodyFatEstimation;
  confidenceReasons?: string[];
  observedFeatures?: string[];
  estimatedFeatures?: string[];
  notDeterminableFeatures?: string[];
  adaptiveWorkoutAdjustments?: string[];
  adaptiveNutritionAdjustments?: string[];
  scientificMuscleAnalyses?: ScientificMuscleGroupAnalysis[];
  decisionPipelineFlow?: DecisionPipelineFlow[];
  executiveSummary?: ScientificExecutiveSummary;
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

export type DeltaCategoryStatus = 'improved' | 'maintained' | 'slight_regression' | 'regression' | 'no_conclusion' | 'unchanged' | 'needs_attention';

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

