import { questionClassifier } from './questionClassifier';
import { contextRetriever } from './contextRetriever';
import { analyzeAIContext } from '../ai/decisionEngine';
import { planAIExecution } from '../ai/orchestrator';
import { buildAIPrompt } from '../ai/promptBuilder';
import { executeUnifiedAITask } from '../ai/providerManager';
import { coachPersonality } from './coachPersonality';
import { recommendationEngine } from './recommendationEngine';
import { responseComposer, ComposedCoachResponse } from './responseComposer';
import { conversationManager } from './conversationManager';
import { conversationMemory } from './conversationMemory';
import { buildAIContext } from '../ai/contextBuilder';

export interface ReasoningPipelineResult {
  response: ComposedCoachResponse;
  rawAIContent: string;
  provider: string;
  model: string;
  latencyMs: number;
  tokens: number;
  category: string;
}

export class ReasoningPipeline {
  public async process(userPrompt: string): Promise<ReasoningPipelineResult> {
    const startTime = Date.now();

    // 1. Add User Message to Conversation History & Memory
    conversationManager.addMessage('user', userPrompt);

    // 2. Question Classification
    const history = conversationManager.getHistory(6);
    const recentTurns = history.map((h) => ({ sender: h.sender, text: h.text }));
    const classification = questionClassifier.classify(userPrompt, history.length > 2);

    // 3. Relevant Context Retrieval (selective token-efficient assembly)
    const retrievedContext = await contextRetriever.retrieveContext(userPrompt, recentTurns);

    // 4. Decision Engine Execution (Deterministic Rules)
    const baseAIContext = buildAIContext();
    const decisionReport = analyzeAIContext(baseAIContext);

    // 5. Knowledge Base & Recommendation Fallback Preparation
    const personalizedRec = recommendationEngine.generateRecommendation({
      category: classification.category,
      userPrompt,
      consumedProtein: baseAIContext.nutrition.consumed.protein,
      targetProtein: baseAIContext.nutrition.goals.targetProtein,
      consumedCalories: baseAIContext.nutrition.consumed.calories,
      targetCalories: baseAIContext.nutrition.goals.targetCalories,
      sleepHours: baseAIContext.todayCheckIn.summary.sleepHours || 7,
      energyScore: baseAIContext.todayCheckIn.summary.energyLevel || 7,
      sorenessScore: baseAIContext.todayCheckIn.summary.soreness === 'Heavy' ? 8 : 3,
    });

    // 6. Orchestrator & Execution Strategy
    const executionPlan = planAIExecution(baseAIContext, decisionReport, userPrompt);

    // 7. Prompt Builder with Coach System Personality & Injected Context
    const systemPromptWithPersonality = coachPersonality.formatPromptHeader(
      userPrompt,
      classification.category,
      retrievedContext.fullAssembledText
    );

    const promptPackage = buildAIPrompt(
      baseAIContext,
      decisionReport,
      { prompt: systemPromptWithPersonality },
      executionPlan
    );

    // 8. Execute via Groq Llama 3.3 70B (Primary) or Gemini (Multimodal / Fallback)
    const aiResult = await executeUnifiedAITask({
      plan: executionPlan,
      context: baseAIContext,
      decisionReport,
      promptPackage,
      userRequest: userPrompt,
    });

    const rawContent = aiResult.success ? aiResult.content : '';

    // 9. Response Composer
    const currentSituationSummary = conversationManager.getRecentUserContextSnippet();

    const composedResponse = responseComposer.compose({
      category: classification.category,
      userPrompt,
      rawAIAnswer: rawContent,
      recommendation: personalizedRec,
      currentSituationSummary,
    });

    // 10. Record Assistant Response & Update Memory
    conversationManager.addMessage('assistant', composedResponse.formattedText, classification.category);

    conversationMemory.recordObservation(
      'frequent_question',
      `q_${classification.category.toLowerCase()}`,
      `Asked about ${classification.category}: "${userPrompt.slice(0, 50)}"`
    );

    const latencyMs = Date.now() - startTime;

    return {
      response: composedResponse,
      rawAIContent: rawContent || composedResponse.formattedText,
      provider: aiResult.provider || 'Groq / Decision Engine',
      model: aiResult.model || 'llama-3.3-70b-versatile',
      latencyMs,
      tokens: aiResult.totalTokens || 180,
      category: classification.category,
    };
  }
}

export const reasoningPipeline = new ReasoningPipeline();
