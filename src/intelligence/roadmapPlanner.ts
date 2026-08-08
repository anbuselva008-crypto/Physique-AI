import { DynamicRoadmap, TransformationStatus } from './types';
import { getPersona } from '../persona';

/**
 * RoadmapPlanner
 * Generates an adaptive, non-static multi-phase transformation roadmap.
 * Dynamically recalculates monthly objectives, primary/secondary focus areas,
 * weekly milestones, and potential risk factors based on current transformation stage.
 */
export class RoadmapPlanner {
  /**
   * Generates a dynamic roadmap tailored to the user's current stage and transformation status.
   */
  public generateRoadmap(
    status: TransformationStatus,
    currentMonthNum: number = 1
  ): DynamicRoadmap {
    const persona = getPersona();
    const stage = status.currentStage;

    let currentMonthTitle = `Month ${currentMonthNum} - `;
    let currentObjective = '';
    let primaryFocus = '';
    let secondaryFocus = '';
    let expectedResults: string[] = [];
    let potentialRisks: string[] = [];
    let weeklyMilestones: string[] = [];
    let monthlyMilestones: string[] = [];

    switch (stage) {
      case 'Skinny Fat':
        currentMonthTitle += 'Recomposition & Metabolic Priming';
        currentObjective = 'Build foundational muscle mass while progressively tightening waist circumference.';
        primaryFocus = 'High-protein diet (2.0g/kg) and progressive overload on compound lifts.';
        secondaryFocus = '10,000 daily steps for steady non-exercise activity thermogenesis (NEAT).';
        expectedResults = [
          '1.0 - 1.5kg fat loss with simultaneous 0.8kg muscle gain',
          'Noticeable reduction in midsection bloating',
          '20% increase in baseline compound exercise strength',
        ];
        potentialRisks = [
          'Under-eating protein causing loss of lean muscle',
          'Skipping workouts due to early muscle soreness (DOMS)',
        ];
        weeklyMilestones = [
          'Week 1: Log all scheduled workouts and hit 140g+ protein daily',
          'Week 2: Add 2.5kg or 1 rep to primary compound lifts',
          'Week 3: Maintain 7.5h average sleep and 3.5L hydration',
          'Week 4: Take updated progress photos & waist measurement',
        ];
        monthlyMilestones = [
          'Month 1: Recomposition foundation established',
          'Month 2: Visible shoulder & upper chest definition',
          'Month 3: Full 2.5% body fat reduction achieved',
        ];
        break;

      case 'Beginner Fat Loss':
        currentMonthTitle += 'Caloric Deficit & Fat Mobilization';
        currentObjective = 'Drive steady, sustainable fat loss (0.5 - 0.8kg per week) preserving lean muscle.';
        primaryFocus = 'Adhering to a 300-500 kcal daily caloric deficit with high protein.';
        secondaryFocus = '4x weekly weight resistance training + 20 min post-workout zone-2 cardio.';
        expectedResults = [
          '2.0 - 3.0kg net weight reduction over 30 days',
          'Decreased waist and hip measurements',
          'Preserved gym strength on heavy compound sets',
        ];
        potentialRisks = [
          'Aggressive crash dieting leading to muscle catabolism',
          'Uncontrolled weekend cheat meals erasing weekly deficit',
        ];
        weeklyMilestones = [
          'Week 1: Zero missed meal logs & hit 3.5L daily hydration',
          'Week 2: Complete 4 resistance workouts + 2 cardio sessions',
          'Week 3: Down 0.6kg on 7-day average scale weight',
          'Week 4: Review waist measurement and adjust calories if plateaus occur',
        ];
        monthlyMilestones = [
          'Month 1: 2.5kg fat lost',
          'Month 2: Sub-18% body fat threshold reached',
          'Month 3: Abdominal outline visible in front lighting',
        ];
        break;

      case 'Lean Building':
      case 'Muscle Gain':
        currentMonthTitle += 'Hypertrophy & Progressive Overload';
        currentObjective = 'Maximize lean muscle tissue growth with minimal fat accumulation.';
        primaryFocus = 'Slight 200-300 kcal daily caloric surplus with 2.2g/kg protein intake.';
        secondaryFocus = 'Optimizing training volume (12-16 direct sets per muscle group weekly).';
        expectedResults = [
          '1.0 - 1.2kg lean body mass accretion over 30 days',
          'Continuous strength PRs across Bench, Squat, and Rows',
          'Fuller muscle bellies with tight waist maintenance',
        ];
        potentialRisks = [
          'Excessive caloric surplus resulting in rapid fat gain',
          'Overtraining CNS without adequate 8h sleep recovery',
        ];
        weeklyMilestones = [
          'Week 1: Complete all hypertrophy sessions with RPE 8-9 intensity',
          'Week 2: Increase training volume on weak muscle groups by 2 sets',
          'Week 3: Maintain weight gain rate at 0.25kg per week',
          'Week 4: Execute deload or high-intensity microcycle based on recovery score',
        ];
        monthlyMilestones = [
          'Month 1: +1kg high-quality lean mass gained',
          'Month 2: 5kg added to working set weights on compound lifts',
          'Month 3: Noticeable V-taper frame expansion',
        ];
        break;

      default:
        currentMonthTitle += 'Physique Maintenance & Athletic Conditioning';
        currentObjective = 'Maintain optimal body composition while enhancing athletic stamina and recovery.';
        primaryFocus = 'Isocaloric nutrition (maintenance calories) and high nutrient density.';
        secondaryFocus = 'Rotational strength, joint mobility, and cardiorespiratory conditioning.';
        expectedResults = [
          'Body fat maintained strictly at target percentage',
          'Enhanced recovery score and zero joint pain',
          'Improved cardiovascular stamina',
        ];
        potentialRisks = ['Losing training intensity due to lack of aggressive targets'];
        weeklyMilestones = [
          'Week 1: Complete 4 balanced resistance sessions',
          'Week 2: Complete 2 high-intensity interval conditioning sessions',
          'Week 3: Maintain 8h daily sleep target',
          'Week 4: Assess body composition metrics',
        ];
        monthlyMilestones = ['Month 1: Ideal physique maintained with zero unwanted fat gain'];
        break;
    }

    const estimatedConfidence = Math.round(
      status.consistencyScore * 0.5 + status.recoveryScore * 0.3 + (status.riskLevel === 'low' ? 20 : 10)
    );

    return {
      currentMonth: currentMonthTitle,
      currentObjective,
      primaryFocus,
      secondaryFocus,
      expectedResults,
      estimatedConfidence: Math.min(98, Math.max(45, estimatedConfidence)),
      potentialRisks,
      weeklyMilestones,
      monthlyMilestones,
    };
  }
}

export const roadmapPlanner = new RoadmapPlanner();
