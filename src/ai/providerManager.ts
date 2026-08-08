import {
  AIContext,
  DecisionReport,
  AIExecutionPlan,
  BuiltPrompt,
  UserRequest,
  AITaskType,
  UnifiedAIResponse,
  PhysiqueAnalysisOptions,
} from './types';
import { groqClient } from './groqClient';
import { geminiClient } from './geminiClient';

/**
 * AI Provider Manager
 * Intelligent routing layer that selects between Groq (low-latency text reasoning)
 * and Gemini 2.5 Flash (multimodal vision, long-context reports) with automatic fallback.
 */
export class AIProviderManager {
  /**
   * Determines the primary provider based on task type and request characteristics.
   */
  public selectProvider(taskType: AITaskType, hasImage: boolean = false): 'groq' | 'gemini' {
    // Gemini handles image analysis, progress photos, long reports, and monthly reviews
    if (
      hasImage ||
      taskType === 'photo_analysis' ||
      taskType === 'monthly_review' ||
      taskType === 'weekly_review'
    ) {
      return 'gemini';
    }

    // Groq handles normal chat, workout advice, nutrition advice, motivation, recovery
    return 'groq';
  }

  /**
   * Executes an AI task with automatic provider selection and fallback capability.
   */
  public async execute(params: {
    plan: AIExecutionPlan;
    context: AIContext;
    decisionReport: DecisionReport;
    promptPackage: BuiltPrompt;
    userRequest?: UserRequest | string;
    modelOverride?: string;
  }): Promise<UnifiedAIResponse> {
    const { plan, context, decisionReport, promptPackage, userRequest, modelOverride } = params;
    const startTime = Date.now();

    // 1. Direct Rule Engine / Knowledge Base check
    if (plan.directResponse && !plan.shouldCallGroq && !plan.shouldCallGemini) {
      return {
        success: true,
        content: plan.directResponse,
        provider: plan.provider === 'knowledge_base' ? 'knowledge_base' : 'rule_engine',
        model: plan.provider === 'knowledge_base' ? 'internal_kb' : 'rule_engine_direct',
        latencyMs: Date.now() - startTime,
      };
    }

    const hasImage =
      typeof userRequest === 'object' && userRequest !== null && !!userRequest.imageUrl;

    // Determine primary provider
    const primaryProvider = this.selectProvider(plan.taskType, hasImage);

    if (primaryProvider === 'groq') {
      // Primary: Groq
      const groqRes = await groqClient.execute({
        plan,
        context,
        decisionReport,
        promptPackage,
        modelOverride,
      });

      if (groqRes.success) {
        return {
          success: true,
          content: groqRes.content,
          provider: 'groq',
          model: groqRes.model,
          latencyMs: groqRes.latencyMs,
          promptTokens: groqRes.promptTokens,
          completionTokens: groqRes.completionTokens,
          totalTokens: groqRes.totalTokens,
          raw: groqRes.raw,
        };
      }

      // Groq failed -> Attempt Fallback to Gemini
      console.warn(`[AIProviderManager] Groq primary execution failed (${groqRes.error}). Attempting fallback to Gemini...`);
      const geminiRes = await geminiClient.execute({
        plan,
        context,
        decisionReport,
        promptPackage,
        modelOverride,
      });

      if (geminiRes.success) {
        return {
          success: true,
          content: geminiRes.content,
          provider: 'gemini',
          model: geminiRes.model,
          latencyMs: Date.now() - startTime,
          fallbackUsed: true,
          fallbackProvider: 'gemini',
          promptTokens: geminiRes.promptTokens,
          completionTokens: geminiRes.completionTokens,
          totalTokens: geminiRes.totalTokens,
          raw: geminiRes.raw,
        };
      }

      // Both failed
      return {
        success: false,
        content: '',
        provider: 'groq',
        model: groqRes.model,
        latencyMs: Date.now() - startTime,
        error: `Primary (Groq) error: ${groqRes.error || 'Unknown'}. Fallback (Gemini) error: ${geminiRes.error || 'Unknown'}`,
      };
    } else {
      // Primary: Gemini
      const geminiRes = await geminiClient.execute({
        plan,
        context,
        decisionReport,
        promptPackage,
        modelOverride,
      });

      if (geminiRes.success) {
        return {
          success: true,
          content: geminiRes.content,
          provider: 'gemini',
          model: geminiRes.model,
          latencyMs: geminiRes.latencyMs,
          promptTokens: geminiRes.promptTokens,
          completionTokens: geminiRes.completionTokens,
          totalTokens: geminiRes.totalTokens,
          raw: geminiRes.raw,
        };
      }

      // If it's a non-image task, attempt Fallback to Groq
      if (!hasImage && plan.taskType !== 'photo_analysis') {
        console.warn(`[AIProviderManager] Gemini primary execution failed (${geminiRes.error}). Attempting fallback to Groq...`);
        const groqRes = await groqClient.execute({
          plan,
          context,
          decisionReport,
          promptPackage,
          modelOverride,
        });

        if (groqRes.success) {
          return {
            success: true,
            content: groqRes.content,
            provider: 'groq',
            model: groqRes.model,
            latencyMs: Date.now() - startTime,
            fallbackUsed: true,
            fallbackProvider: 'groq',
            promptTokens: groqRes.promptTokens,
            completionTokens: groqRes.completionTokens,
            totalTokens: groqRes.totalTokens,
            raw: groqRes.raw,
          };
        }
      }

      // Both failed or photo task failed
      return {
        success: false,
        content: '',
        provider: 'gemini',
        model: geminiRes.model,
        latencyMs: Date.now() - startTime,
        error: `Gemini execution failed: ${geminiRes.error || 'Unknown error'}`,
      };
    }
  }

  /**
   * Multimodal Physique & Posture photo analysis using Gemini.
   */
  public async analyzePhysiquePhoto(
    options: PhysiqueAnalysisOptions
  ): Promise<UnifiedAIResponse> {
    const startTime = Date.now();
    const res = await geminiClient.analyzePhysiquePhoto(options);

    return {
      success: res.success,
      content: res.content,
      provider: 'gemini',
      model: res.model,
      latencyMs: res.latencyMs,
      promptTokens: res.promptTokens,
      completionTokens: res.completionTokens,
      totalTokens: res.totalTokens,
      error: res.error,
      raw: res.raw,
    };
  }
}

export const providerManager = new AIProviderManager();

export const executeUnifiedAITask = (params: {
  plan: AIExecutionPlan;
  context: AIContext;
  decisionReport: DecisionReport;
  promptPackage: BuiltPrompt;
  userRequest?: UserRequest | string;
  modelOverride?: string;
}) => providerManager.execute(params);
