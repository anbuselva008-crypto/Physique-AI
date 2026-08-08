import { AIContextBuilder } from '../ai/contextBuilder';
import { memoryEngine } from '../ai/memoryEngine';
import { conversationMemory } from './conversationMemory';
import { questionClassifier, ClassificationResult } from './questionClassifier';
import { getPersona } from '../persona';
import { workoutPlanner } from '../intelligence/workoutPlanner';
import { nutritionPlanner } from '../intelligence/nutritionPlanner';
import { recoveryPlanner } from '../intelligence/recoveryPlanner';
import { goalTracker } from '../intelligence/goalTracker';
import { roadmapPlanner } from '../intelligence/roadmapPlanner';
import { confidenceEngine } from '../intelligence/confidenceEngine';
import { coachEngine } from '../intelligence/coachEngine';
import { transformationIntelligenceEngine } from '../intelligence';
import { visionEngine } from '../vision/visionEngine';
import { photoManager } from '../vision/photoManager';
import { EXERCISE_DATABASE } from '../knowledge/exerciseDatabase';
import { FOOD_KNOWLEDGE_BASE } from '../knowledge/foodKnowledge';
import { SUPPLEMENT_KNOWLEDGE_DATABASE } from '../knowledge/supplementKnowledge';

export interface RetrievedCoachContext {
  classification: ClassificationResult;
  personaSummary?: string;
  memorySummary?: string;
  checkInSummary?: string;
  workoutSummary?: string;
  nutritionSummary?: string;
  transformationStageSummary?: string;
  visionAnalysisSummary?: string;
  monthlyProgressSummary?: string;
  roadmapSummary?: string;
  goalTrackerSummary?: string;
  coachReportSummary?: string;
  confidenceSummary?: string;
  knowledgeBaseSummary?: string;
  conversationHistorySummary?: string;
  fullAssembledText: string;
}

export class ContextRetriever {
  private contextBuilder = new AIContextBuilder();

  public async retrieveContext(
    userPrompt: string,
    recentHistory: { sender: string; text: string }[] = []
  ): Promise<RetrievedCoachContext> {
    const classification = questionClassifier.classify(
      userPrompt,
      recentHistory.length > 0
    );

    const required = classification.requiredContext;
    const baseAIContext = this.contextBuilder.buildContextSync();

    const sections: string[] = [];

    // 1. Persona Context
    let personaSummary: string | undefined;
    if (required.persona) {
      const activePersona = getPersona();
      personaSummary = `[User Persona & Constraints]
- Name: ${activePersona.personal?.name || 'User'}
- Goals: ${activePersona.goals?.oneMonth || 'Body Recomposition'} | 12-Month: ${activePersona.goals?.twelveMonths || 'Complete Transformation'}
- Schedule: College (${activePersona.college?.collegeName || 'Campus'} - ${activePersona.college?.hostelStatus || 'Hostel Resident'})
- Diet Constraints: ${activePersona.diet?.dietaryPreferences?.[0] || 'High Protein'}, Budget: ${activePersona.constraints?.budgetLimits || '₹250/day max'}
- Training Level: ${activePersona.fitness?.trainingLevel || 'Intermediate'}, Equipment: ${activePersona.fitness?.availableEquipment ? activePersona.fitness.availableEquipment.join(', ') : 'Full Gym'}`;
      sections.push(personaSummary);
    }

    // 2. Memory & Conversation History Context
    let memorySummary: string | undefined;
    if (required.conversationHistory) {
      const longTermMemory = memoryEngine.summarize();
      const coachMemory = conversationMemory.summarizeForCoach();
      const chatHistorySnippet = recentHistory
        .slice(-4)
        .map((m) => `${m.sender.toUpperCase()}: ${m.text}`)
        .join('\n');

      memorySummary = `${coachMemory}\n[Long-term AI Memory]: ${longTermMemory}\n[Recent Turn Context]:\n${chatHistorySnippet || 'No prior turn in this session.'}`;
      sections.push(memorySummary);
    }

    // 3. Transformation Intel Loop Setup
    const intelLoop = transformationIntelligenceEngine.runFullTransformationLoop(1, 1);
    const recoveryScore = intelLoop.status.recoveryScore;

    // 4. Today's Recovery Context
    let checkInSummary: string | undefined;
    if (required.recovery) {
      const recoveryPlan = recoveryPlanner.generateTodayRecoveryPlan(recoveryScore);
      const checkInSummaryData = baseAIContext.todayCheckIn.summary;

      checkInSummary = `[Today's Recovery & Check-in]
- Sleep: ${checkInSummaryData.sleepHours || 7} hrs
- Soreness: ${checkInSummaryData.soreness || 'None'}, Energy Level: ${checkInSummaryData.energyLevel || 7}/10
- Readiness Score: ${recoveryScore}/100
- Recovery Guidance: ${recoveryPlan.recoveryAdvice[0] || 'Optimal recovery state'}`;
      sections.push(checkInSummary);
    }

    // 5. Workout Plan Context
    let workoutSummary: string | undefined;
    if (required.workoutPlan) {
      const dailyWorkout = workoutPlanner.generateTodayWorkout(recoveryScore, 1, 1);
      workoutSummary = `[Workout Plan Today]
- Workout: ${dailyWorkout.sessionType} (${dailyWorkout.targetFocus}, ~${dailyWorkout.estimatedDurationMins} mins)
- Intensity Level: ${dailyWorkout.intensityLevel}
- Key Exercises: ${dailyWorkout.exercises.map((e) => `${e.name} (${e.sets}x${e.reps})`).join(', ')}`;
      sections.push(workoutSummary);
    }

    // 6. Nutrition Plan Context
    let nutritionSummary: string | undefined;
    if (required.nutritionPlan) {
      const nutritionPlan = nutritionPlanner.generateTodayMealPlan();
      const consumedP = baseAIContext.nutrition.consumed.protein;
      const targetP = baseAIContext.nutrition.goals.targetProtein;
      const consumedC = baseAIContext.nutrition.consumed.calories;
      const targetC = baseAIContext.nutrition.goals.targetCalories;

      nutritionSummary = `[Nutrition & Macro Balances]
- Calories: ${consumedC} / ${targetC} kcal (Remaining: ${Math.max(0, targetC - consumedC)} kcal)
- Protein: ${consumedP}g / ${targetP}g (Remaining: ${Math.max(0, targetP - consumedP)}g)
- Hydration Target: ${nutritionPlan.hydrationTargetLiters}L target
- Total Planned Calories: ${nutritionPlan.totalCalories} kcal, Protein: ${nutritionPlan.totalProtein}g`;
      sections.push(nutritionSummary);
    }

    // 7. Transformation Stage & Roadmap
    let transformationStageSummary: string | undefined;
    let roadmapSummary: string | undefined;
    if (required.transformationStage || required.roadmap) {
      const stageReport = intelLoop.status;
      const roadmap = roadmapPlanner.generateRoadmap(intelLoop.status, 1);

      transformationStageSummary = `[Transformation Stage & Roadmap]
- Phase: Stage (${stageReport.currentStage}) - Risk Level: ${stageReport.riskLevel}
- Consistency Score: ${stageReport.consistencyScore}/100
- Current Objective: ${roadmap.currentObjective} (Primary Focus: ${roadmap.primaryFocus})`;
      roadmapSummary = transformationStageSummary;
      sections.push(transformationStageSummary);
    }

    // 8. Vision Analysis & Photo Comparison
    let visionAnalysisSummary: string | undefined;
    if (required.visionAnalysis) {
      const latestPhotoSet = photoManager.getPhotoSet('2026-08');
      const latestVisionReport = await visionEngine.analyzeAndGenerateReport('2026-08');

      visionAnalysisSummary = `[Vision Engine Analysis (Aug 2026)]
- Estimated Body Fat: ${latestVisionReport.bodyAnalysis.bodyFat.estimatedPercentage}% (${latestVisionReport.bodyAnalysis.bodyFat.confidenceLevel} confidence)
- Strong Areas: ${latestVisionReport.bodyAnalysis.strongAreas.join(', ')}
- Priority Improvement Areas: ${latestVisionReport.bodyAnalysis.weakAreas.join(', ')}
- Posture: ${latestVisionReport.bodyAnalysis.postureObservations[0] || 'Good alignment'}
- Photo Set Uploaded: ${latestPhotoSet ? `Available (${latestPhotoSet.month})` : 'None uploaded this month'}`;
      sections.push(visionAnalysisSummary);
    }

    // 9. Monthly Progress, Goals, & Confidence
    let goalTrackerSummary: string | undefined;
    let confidenceSummary: string | undefined;
    let coachReportSummary: string | undefined;
    let monthlyProgressSummary: string | undefined;

    if (required.monthlyProgress || required.goalTracker || required.confidenceReport) {
      const goalStatus = goalTracker.evaluateGoals();
      const confidence = confidenceEngine.estimateConfidence(intelLoop.status);
      const workoutPlan = workoutPlanner.generateTodayWorkout(recoveryScore, 1, 1);
      const mealPlan = nutritionPlanner.generateTodayMealPlan();
      const recoveryPlan = recoveryPlanner.generateTodayRecoveryPlan(recoveryScore);
      const coachReport = coachEngine.generateReport(intelLoop.status, workoutPlan, mealPlan, recoveryPlan);

      monthlyProgressSummary = `[Coach Progress & Confidence Engine]
- Goal Status: 1M: ${goalStatus.oneMonthGoal.status} | 3M: ${goalStatus.threeMonthGoal.status} | 12M: ${goalStatus.twelveMonthGoal.status}
- Confidence Score: ${confidence.confidenceScore}/100 (${confidence.reasoning})
- Strategic Coach Summary: "${coachReport.goodMorningGreeting}"
- Priority Focus: ${coachReport.todaysPriority}`;

      goalTrackerSummary = `Goal Status: 1M ${goalStatus.oneMonthGoal.status}`;
      confidenceSummary = `Confidence: ${confidence.confidenceScore}/100`;
      coachReportSummary = coachReport.goodMorningGreeting;

      sections.push(monthlyProgressSummary);
    }

    // 10. Knowledge Base Matching
    let knowledgeBaseSummary: string | undefined;
    if (required.knowledgeBase) {
      const textLower = userPrompt.toLowerCase();
      const exMatch = EXERCISE_DATABASE.find(
        (e) => textLower.includes(e.name.toLowerCase()) || textLower.includes(e.movementPattern.toLowerCase())
      );
      const foodMatch = FOOD_KNOWLEDGE_BASE.find(
        (f) => textLower.includes(f.name.toLowerCase()) || textLower.includes(f.mealCategory.toLowerCase())
      );
      const suppMatch = SUPPLEMENT_KNOWLEDGE_DATABASE.find(
        (s) => textLower.includes(s.name.toLowerCase())
      );

      const kbParts: string[] = [];
      if (exMatch) {
        kbParts.push(
          `Exercise DB Match: ${exMatch.name} (Muscles: ${exMatch.primaryMuscles.join(', ')}). Form tip: ${exMatch.tips[0] || 'Strict tension'}`
        );
      }
      if (foodMatch) {
        kbParts.push(
          `Food DB Match: ${foodMatch.name} (${foodMatch.calories} kcal, ${foodMatch.protein}g protein per ${foodMatch.servingSize}). Veg: ${foodMatch.isVegetarian ? 'Yes' : 'No'}`
        );
      }
      if (suppMatch) {
        kbParts.push(
          `Supplement DB Match: ${suppMatch.name} - Dosage: ${suppMatch.recommendedDosage}, Timing: ${suppMatch.timing}`
        );
      }

      if (kbParts.length > 0) {
        knowledgeBaseSummary = `[Knowledge Base Matches]\n${kbParts.join('\n')}`;
        sections.push(knowledgeBaseSummary);
      }
    }

    const fullAssembledText = sections.join('\n\n');

    return {
      classification,
      personaSummary,
      memorySummary,
      checkInSummary,
      workoutSummary,
      nutritionSummary,
      transformationStageSummary,
      visionAnalysisSummary,
      monthlyProgressSummary,
      roadmapSummary,
      goalTrackerSummary,
      coachReportSummary,
      confidenceSummary,
      knowledgeBaseSummary,
      conversationHistorySummary: memorySummary,
      fullAssembledText,
    };
  }
}

export const contextRetriever = new ContextRetriever();
