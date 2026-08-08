import { BodyAnalysisResult, ProgressComparisonDelta, CategoryComparisonItem, DeltaCategoryStatus } from './types';

export class ComparisonEngine {
  /**
   * Compares the current month's BodyAnalysisResult against a previous month's BodyAnalysisResult.
   */
  public compare(
    current: BodyAnalysisResult,
    previous?: BodyAnalysisResult
  ): ProgressComparisonDelta {
    if (!previous) {
      const baselineComparisons: CategoryComparisonItem[] = [
        {
          category: 'Body Fat % & Recomposition',
          status: 'unchanged',
          currentObservation: `Baseline body fat established at ${current.bodyFat.estimatedPercentage}% (${current.bodyFat.range[0]}%-${current.bodyFat.range[1]}%).`,
          previousObservation: 'No previous baseline photo set recorded.',
          changeSummary: 'Initial baseline recording.',
        },
        {
          category: 'Chest & Clavicular Fiber Mass',
          status: 'unchanged',
          currentObservation: current.visibleMuscleDevelopment.chest,
          previousObservation: 'Baseline recorded.',
          changeSummary: 'Baseline chest development logged.',
        },
        {
          category: 'Shoulder Width & Deltoids',
          status: 'unchanged',
          currentObservation: current.visibleMuscleDevelopment.shoulders,
          previousObservation: 'Baseline recorded.',
          changeSummary: 'Baseline shoulder width logged.',
        },
        {
          category: 'Back & Lat Sweep V-Taper',
          status: 'unchanged',
          currentObservation: current.visibleMuscleDevelopment.back,
          previousObservation: 'Baseline recorded.',
          changeSummary: 'Baseline lat sweep logged.',
        },
        {
          category: 'Waistline & Core Tightness',
          status: 'unchanged',
          currentObservation: current.visibleMuscleDevelopment.core,
          previousObservation: 'Baseline recorded.',
          changeSummary: 'Baseline core definition logged.',
        },
        {
          category: 'Biomechanical Posture & Alignment',
          status: 'unchanged',
          currentObservation: current.postureObservations[0] || 'Neutral alignment.',
          previousObservation: 'Baseline recorded.',
          changeSummary: 'Baseline posture logged.',
        },
      ];

      return {
        previousMonth: 'N/A (Baseline)',
        currentMonth: current.month,
        improvements: [
          'Initial baseline photo analysis logged successfully.',
          `Baseline body fat established at ${current.bodyFat.estimatedPercentage}%.`,
          `Strong baseline areas identified: ${current.strongAreas.join(', ')}.`,
        ],
        regressions: [],
        unchangedMetrics: ['Baseline metric tracking initialized.'],
        bodyFatChangePercentage: 0,
        visualHypertrophyNotes: [
          'First baseline assessment recorded. Progress will be tracked against future uploads.',
        ],
        posturalChanges: current.postureObservations,
        categoryComparisons: baselineComparisons,
      };
    }

    const bfDiff =
      Math.round((current.bodyFat.estimatedPercentage - previous.bodyFat.estimatedPercentage) * 10) /
      10;

    const improvements: string[] = [];
    const regressions: string[] = [];
    const unchangedMetrics: string[] = [];
    const visualHypertrophyNotes: string[] = [];
    const posturalChanges: string[] = [];
    const categoryComparisons: CategoryComparisonItem[] = [];

    // 1. Body fat comparison
    let bfStatus: DeltaCategoryStatus = 'unchanged';
    if (bfDiff < 0) {
      bfStatus = 'improved';
      improvements.push(
        `Body fat decreased by ${Math.abs(bfDiff)}% (from ${previous.bodyFat.estimatedPercentage}% to ${current.bodyFat.estimatedPercentage}%).`
      );
    } else if (bfDiff > 0) {
      bfStatus = 'needs_attention';
      regressions.push(
        `Body fat increased by ${bfDiff}% (from ${previous.bodyFat.estimatedPercentage}% to ${current.bodyFat.estimatedPercentage}%).`
      );
    } else {
      unchangedMetrics.push(`Body fat percentage remained steady at ${current.bodyFat.estimatedPercentage}%.`);
    }

    categoryComparisons.push({
      category: 'Body Fat % & Recomposition',
      status: bfStatus,
      currentObservation: `Currently ${current.bodyFat.estimatedPercentage}% (${current.bodyFat.confidenceLevel} confidence)`,
      previousObservation: `Previously ${previous.bodyFat.estimatedPercentage}%`,
      changeSummary:
        bfDiff < 0
          ? `${Math.abs(bfDiff)}% body fat reduction achieved`
          : bfDiff > 0
          ? `${bfDiff}% increase in adipose storage`
          : 'Body composition maintained steady',
    });

    // 2. Anatomical groups comparison
    const anatomicalGroups: Array<{
      category: string;
      key: keyof BodyAnalysisResult['visibleMuscleDevelopment'];
    }> = [
      { category: 'Chest & Clavicular Fiber Mass', key: 'chest' },
      { category: 'Shoulder Width & Deltoids', key: 'shoulders' },
      { category: 'Back & Lat Sweep V-Taper', key: 'back' },
      { category: 'Arm Development & Biceps Peak', key: 'arms' },
      { category: 'Waistline & Core Tightness', key: 'core' },
      { category: 'Leg Development & Quad Sweep', key: 'legs' },
    ];

    anatomicalGroups.forEach(({ category, key }) => {
      const currObs = current.visibleMuscleDevelopment[key] || '';
      const prevObs = previous.visibleMuscleDevelopment[key] || '';

      const isWeakNow = current.weakAreas.some((w) => w.toLowerCase().includes(key));
      const wasWeak = previous.weakAreas.some((w) => w.toLowerCase().includes(key));

      let status: DeltaCategoryStatus = 'unchanged';
      let changeSummary = 'Maintained current muscular volume and symmetry.';

      if (wasWeak && !isWeakNow) {
        status = 'improved';
        changeSummary = 'Visually resolved lagging muscle mass through targeted progressive overload.';
      } else if (isWeakNow) {
        status = 'needs_attention';
        changeSummary = 'Identified as a priority focus area for upcoming training cycles.';
      } else if (currObs !== prevObs) {
        status = 'improved';
        changeSummary = 'Noticed visual density and muscle shape refinement.';
      }

      categoryComparisons.push({
        category,
        status,
        currentObservation: currObs,
        previousObservation: prevObs,
        changeSummary,
      });

      if (currObs !== prevObs) {
        visualHypertrophyNotes.push(`${key.toUpperCase()}: ${currObs}`);
      } else {
        unchangedMetrics.push(`${key.toUpperCase()} development maintained.`);
      }
    });

    // 3. Posture comparison
    const currPost = current.postureObservations.join('; ');
    const prevPost = previous.postureObservations.join('; ');
    const postureStatus: DeltaCategoryStatus =
      currPost !== prevPost ? 'improved' : 'unchanged';

    categoryComparisons.push({
      category: 'Biomechanical Posture & Alignment',
      status: postureStatus,
      currentObservation: currPost || 'Neutral spinal alignment.',
      previousObservation: prevPost || 'Neutral alignment.',
      changeSummary: postureStatus === 'improved' ? 'Observed posture alignment progress.' : 'Postural stability maintained.',
    });

    // Weak areas vs previous weak areas
    const resolvedWeak = previous.weakAreas.filter((w) => !current.weakAreas.includes(w));
    if (resolvedWeak.length > 0) {
      improvements.push(`Visible muscle mass improvements in former lagging areas: ${resolvedWeak.join(', ')}.`);
    }

    // Strong areas
    const newStrong = current.strongAreas.filter((s) => !previous.strongAreas.includes(s));
    if (newStrong.length > 0) {
      improvements.push(`Newly prominent muscle developments: ${newStrong.join(', ')}.`);
    }

    if (improvements.length === 0) {
      improvements.push('Consistent workout & diet adherence maintained across training mesocycle.');
    }

    return {
      previousMonth: previous.month,
      currentMonth: current.month,
      improvements,
      regressions,
      unchangedMetrics,
      bodyFatChangePercentage: bfDiff,
      visualHypertrophyNotes,
      posturalChanges: posturalChanges.length > 0 ? posturalChanges : ['Posture metrics remained stable.'],
      categoryComparisons,
    };
  }
}

export const comparisonEngine = new ComparisonEngine();

