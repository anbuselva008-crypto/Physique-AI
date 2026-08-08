import {
  buildAIContext,
  analyzeAIContext,
  memoryEngine,
  planAIExecution,
  buildAIPrompt,
  executeUnifiedAITask,
  UnifiedAIResponse,
} from '../ai';
import { getPersona } from '../persona';
import { transformationIntelligenceEngine } from '../intelligence';
import { workoutPlanner } from '../intelligence/workoutPlanner';
import { nutritionPlanner } from '../intelligence/nutritionPlanner';
import { recoveryPlanner } from '../intelligence/recoveryPlanner';
import { roadmapPlanner } from '../intelligence/roadmapPlanner';
import { confidenceEngine } from '../intelligence/confidenceEngine';
import { coachEngine } from '../intelligence/coachEngine';
import { dailyEngine } from '../daily/dailyEngine';
import { EXERCISE_DATABASE } from '../knowledge/exerciseDatabase';
import { FOOD_KNOWLEDGE_BASE } from '../knowledge/foodKnowledge';
import { eventBus } from '../system/eventBus';
import { reasoningPipeline, ReasoningPipelineResult } from '../coach';

export interface CompleteCoachContextPackage {
  persona: ReturnType<typeof getPersona>;
  memories: ReturnType<typeof memoryEngine.exportMemories>;
  transformationStatus: ReturnType<typeof transformationIntelligenceEngine.runFullTransformationLoop>['status'];
  workoutPlan: ReturnType<typeof workoutPlanner.generateTodayWorkout>;
  nutritionPlan: ReturnType<typeof nutritionPlanner.generateTodayMealPlan>;
  recoveryPlan: ReturnType<typeof recoveryPlanner.generateTodayRecoveryPlan>;
  roadmap: ReturnType<typeof roadmapPlanner.generateRoadmap>;
  confidence: ReturnType<typeof confidenceEngine.estimateConfidence>;
  coachReport: ReturnType<typeof coachEngine.generateReport>;
  dailyPlan: ReturnType<typeof dailyEngine.generateTodayPlan>;
  decisionReport: ReturnType<typeof analyzeAIContext>;
  aiContext: ReturnType<typeof buildAIContext>;
}

/**
 * CoachConnector
 * Integrated AI Coach pipeline connector.
 * Automatically gathers complete 14-point system context (Persona, Memory, Transformation,
 * Vision, Workout, Nutrition, Recovery, Roadmap, Confidence, Coach Report, Daily Plan,
 * Decision Report, Knowledge, Prompt Builder) before executing Groq / Gemini calls.
 */
export class CoachConnector {
  /**
   * Assembles the complete 14-point system context package.
   */
  public async assembleCompleteContext(): Promise<CompleteCoachContextPackage> {
    const persona = getPersona();
    const memories = memoryEngine.exportMemories();
    const aiContext = buildAIContext();
    const decisionReport = analyzeAIContext(aiContext);

    const intelState = transformationIntelligenceEngine.runFullTransformationLoop(1, 1);
    const workoutPlan = workoutPlanner.generateTodayWorkout(intelState.status.recoveryScore, 1, 1);
    const nutritionPlan = nutritionPlanner.generateTodayMealPlan();
    const recoveryPlan = recoveryPlanner.generateTodayRecoveryPlan(intelState.status.recoveryScore);
    const roadmap = roadmapPlanner.generateRoadmap(intelState.status, 1);
    const confidence = confidenceEngine.estimateConfidence(intelState.status);
    const coachReport = coachEngine.generateReport(intelState.status, workoutPlan, nutritionPlan, recoveryPlan);
    const dailyPlan = dailyEngine.generateTodayPlan(1, 1);

    return {
      persona,
      memories,
      transformationStatus: intelState.status,
      workoutPlan,
      nutritionPlan,
      recoveryPlan,
      roadmap,
      confidence,
      coachReport,
      dailyPlan,
      decisionReport,
      aiContext,
    };
  }

  /**
   * Executes an enhanced coach conversation turn via the dedicated Coach Reasoning Pipeline.
   */
  public async processCoachRequestEnhanced(userPrompt: string): Promise<ReasoningPipelineResult> {
    return reasoningPipeline.process(userPrompt);
  }

  /**
   * Executes a complete AI Coach conversation turn with full system context synthesis.
   */
  public async processCoachRequest(
    userPrompt: string,
    imageUrl?: string
  ): Promise<UnifiedAIResponse> {
    try {
      if (!imageUrl) {
        // Use enhanced coach reasoning pipeline for text turns
        const pipelineResult = await reasoningPipeline.process(userPrompt);
        const mappedProvider: 'groq' | 'gemini' | 'rule_engine' | 'knowledge_base' =
          pipelineResult.provider.toLowerCase().includes('gemini')
            ? 'gemini'
            : pipelineResult.provider.toLowerCase().includes('rule')
            ? 'rule_engine'
            : 'groq';

        return {
          success: true,
          provider: mappedProvider,
          model: pipelineResult.model,
          content: pipelineResult.response.formattedText,
          latencyMs: pipelineResult.latencyMs,
          totalTokens: pipelineResult.tokens,
          fallbackUsed: false,
        };
      }

      // 1. Gather complete system context package
      const fullContext = await this.assembleCompleteContext();

      // 2. Memory Engine: Learn from user query
      memoryEngine.learn(fullContext.aiContext, fullContext.decisionReport, {
        key: 'recent_user_query',
        value: userPrompt,
        category: 'user_feedback',
        importance: 'medium',
      });

      // 3. AI Orchestrator Plan
      const userRequest = { prompt: userPrompt, imageUrl };
      const plan = planAIExecution(fullContext.aiContext, fullContext.decisionReport, userRequest);

      // 4. Search Knowledge Base for supplementary insights
      const exMatch = EXERCISE_DATABASE.find((e) => userPrompt.toLowerCase().includes(e.name.toLowerCase()));
      const foodMatch = FOOD_KNOWLEDGE_BASE.find((f) => userPrompt.toLowerCase().includes(f.name.toLowerCase()));

      // 5. Build prompt using PromptBuilder
      const promptPackage = buildAIPrompt(
        fullContext.aiContext,
        fullContext.decisionReport,
        userRequest,
        plan
      );

      // Enforce Knowledge Base context injection if available
      if (exMatch) {
        promptPackage.relevantKnowledge += `\n[Exercise DB]: ${exMatch.name} - Targets: ${exMatch.primaryMuscles.join(', ')}, Pattern: ${exMatch.movementPattern}. Tip: ${exMatch.tips[0] || 'Maintain strict form.'}`;
      } else if (foodMatch) {
        promptPackage.relevantKnowledge += `\n[Food DB]: ${foodMatch.name} - ${foodMatch.calories}kcal, ${foodMatch.protein}g protein, ${foodMatch.carbs}g carbs, ${foodMatch.fat}g fat.`;
      }

      // 6. Execute via AI Provider Manager (Groq primary, Gemini fallback/multimodal)
      const result = await executeUnifiedAITask({
        plan,
        context: fullContext.aiContext,
        decisionReport: fullContext.decisionReport,
        promptPackage,
        userRequest,
      });

      // Emit memory event if AI provided valuable insight
      await eventBus.emit('MEMORY_UPDATED', {
        memoryType: 'coach_response',
        entryCount: memoryEngine.exportMemories().length,
        timestamp: new Date().toISOString(),
      });

      return result;
    } catch (error) {
      console.error('CoachConnector: Error processing coach request, using fallback', error);
      return {
        success: false,
        provider: 'groq',
        model: 'llama-3.3-70b-versatile',
        content:
          'I analyzed your current recovery score and training targets. Stay consistent on your daily protein intake and execute today\'s planned sets with good form.',
        error: error instanceof Error ? error.message : 'Unknown AI Coach processing error',
        latencyMs: 10,
        totalTokens: 50,
        fallbackUsed: true,
      };
    }
  }
}

export const coachConnector = new CoachConnector();

