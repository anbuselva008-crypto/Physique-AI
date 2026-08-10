import { VisionReport, MonthlyPhotoSet, PoseAngle } from './types';
import { photoManager } from './photoManager';
import { visionClient } from './visionClient';
import { bodyAnalyzer } from './bodyAnalyzer';
import { comparisonEngine } from './comparisonEngine';
import { reportGenerator } from './reportGenerator';
import { monthlyReportStorage } from './monthlyReportStorage';
import { updatePersona, getPersona } from '../persona';
import { memoryEngine } from '../ai/memoryEngine';
import { transformationIntelligenceEngine } from '../intelligence';
import { goalTracker } from '../intelligence/goalTracker';
import { experienceConnector } from '../integration/experienceConnector';
import { stateSynchronizer } from '../integration/stateSynchronizer';

export class VisionEngine {
  /**
   * Upload or add a photo for a given month and pose angle.
   */
  public addProgressPhoto(params: {
    month: string;
    angle: PoseAngle;
    imageBase64: string;
    mimeType?: string;
    notes?: string;
  }): MonthlyPhotoSet {
    return photoManager.addPhoto(params);
  }

  /**
   * Complete end-to-end Vision Analysis workflow:
   * Photo upload/retrieval -> Gemini analysis -> Body analyzer -> Comparison ->
   * Transformation Engine -> Workout/Nutrition/Recovery recalibration -> Goal Tracker ->
   * Roadmap -> Confidence -> Coach Engine -> Experience Engine -> State Synchronizer.
   * Returns a unified VisionReport object.
   */
  public async analyzeAndGenerateReport(month: string): Promise<VisionReport> {
    // 1. Retrieve photo set for target month
    const photoSet = photoManager.getPhotoSet(month) || {
      id: `photoset_${month}`,
      month,
      timestamp: new Date().toISOString(),
    };

    // 2. Gemini Vision analysis call
    const geminiRes = await visionClient.analyzeMonthlyPhotoSet(photoSet);

    // 3. Body Analyzer
    const bodyAnalysis = bodyAnalyzer.analyze({
      month,
      geminiData: geminiRes.success ? geminiRes.data : undefined,
      photoSet,
    });

    // 4. Comparison Engine (compare with previous month)
    const prevPhotoSet = photoManager.getPreviousMonthSet(month);
    let prevBodyAnalysis;
    if (prevPhotoSet) {
      prevBodyAnalysis = bodyAnalyzer.analyze({
        month: prevPhotoSet.month,
        photoSet: prevPhotoSet,
      });
    }

    const comparisonDelta = comparisonEngine.compare(bodyAnalysis, prevBodyAnalysis);

    // 5. Report Generation
    const transformationReport = reportGenerator.generateReport({
      month,
      bodyAnalysis,
      comparisonDelta,
    });

    // 6. AUTO-UPDATE PIPELINE: Phase 3 & Phase 6 Integration
    const visionReport: VisionReport = {
      photoSet,
      bodyAnalysis,
      comparisonDelta,
      transformationReport,
      generatedAt: new Date().toISOString(),
    };

    // 6a. Immutable Monthly Report Storage (Phase 3)
    try {
      monthlyReportStorage.saveReport(visionReport);
    } catch (e) {
      console.warn('[VisionEngine] Failed to save monthly report:', e);
    }

    // 6b. Persona Engine
    const currentPersona = getPersona();
    updatePersona({
      body: {
        ...currentPersona.body,
        estimatedBodyFat: bodyAnalysis.bodyFat.estimatedPercentage,
        weakAreas: bodyAnalysis.weakAreas.length > 0 ? bodyAnalysis.weakAreas : currentPersona.body.weakAreas,
        strongAreas: bodyAnalysis.strongAreas.length > 0 ? bodyAnalysis.strongAreas : currentPersona.body.strongAreas,
      },
      goals: {
        ...currentPersona.goals,
        oneMonth: transformationReport.nextMonthObjectives[0] || currentPersona.goals.oneMonth,
      },
    });

    // 6c. Memory Engine
    memoryEngine.learn(undefined, undefined, {
      key: `vision_analysis_${month}`,
      value: `Month ${month} Body Analysis: Estimated Body Fat ${bodyAnalysis.bodyFat.estimatedPercentage}%. Strong: ${bodyAnalysis.strongAreas.join(', ')}. Focus: ${bodyAnalysis.weakAreas.join(', ')}.`,
      category: 'lifestyle_routine',
      importance: 'high',
    });

    // 6d. Transformation Intelligence Engine (re-runs full loop with updated persona & body metrics)
    transformationIntelligenceEngine.runFullTransformationLoop(1, 1);

    // 6e. Goal Tracker
    goalTracker.evaluateGoals();

    // 6f. State Synchronizer & Event Dispatch (triggers system-wide dashboard, coach, & experience sync)
    try {
      stateSynchronizer.syncAllState();
    } catch {
      // safe fallback
    }

    // 7. Return Unified VisionReport
    return visionReport;
  }

  /**
   * Retrieves a month's existing photo set
   */
  public getPhotoSet(month: string): MonthlyPhotoSet | undefined {
    return photoManager.getPhotoSet(month);
  }

  /**
   * Check if a photo set has all 3 poses
   */
  public isCompleteSet(month: string): boolean {
    return photoManager.isCompleteSet(month);
  }
}

export const visionEngine = new VisionEngine();

export const analyzeMonthlyVision = (month: string) => visionEngine.analyzeAndGenerateReport(month);

