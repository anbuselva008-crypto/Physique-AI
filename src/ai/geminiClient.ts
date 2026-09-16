import {
  AIContext,
  DecisionReport,
  AIExecutionPlan,
  BuiltPrompt,
  GeminiClientConfig,
  GeminiResponse,
  PhysiqueAnalysisOptions,
} from './types';

/**
 * Gemini AI Client Integration Layer
 * Proxies requests through server-side /api/ai/gemini endpoints.
 * Interfaces match GroqClient for seamless provider swapping.
 * Supports text completions and multimodal image analysis (front, side, back physique, posture, comparison).
 */
export class GeminiClient {
  private defaultModel: string;
  private temperature: number;
  private maxTokens: number;

  constructor(config?: GeminiClientConfig) {
    this.defaultModel = config?.defaultModel || 'gemini-3.6-flash';
    this.temperature = config?.temperature ?? 0.6;
    this.maxTokens = config?.maxTokens ?? 1024;
  }

  /**
   * Main execution method matching GroqClient.execute signature.
   */
  public async execute(params: {
    plan: AIExecutionPlan;
    context: AIContext;
    decisionReport: DecisionReport;
    promptPackage: BuiltPrompt;
    modelOverride?: string;
    temperatureOverride?: number;
    maxTokensOverride?: number;
  }): Promise<GeminiResponse> {
    const { plan, promptPackage, modelOverride, temperatureOverride, maxTokensOverride } = params;
    const startTime = Date.now();
    const model = modelOverride || this.defaultModel;

    if (plan.directResponse && !plan.shouldCallGroq) {
      return {
        success: true,
        content: plan.directResponse,
        model: 'rule_engine_direct',
        latencyMs: Date.now() - startTime,
      };
    }

    return this.generateCompletion(promptPackage.systemPrompt, promptPackage.fullFormattedPrompt, {
      model,
      temperature: temperatureOverride ?? this.temperature,
      maxTokens: maxTokensOverride ?? this.maxTokens,
    });
  }

  /**
   * Sends text prompt to server-side Gemini proxy.
   */
  public async generateCompletion(
    systemPrompt: string,
    userPrompt: string,
    options?: { model?: string; temperature?: number; maxTokens?: number }
  ): Promise<GeminiResponse> {
    const startTime = Date.now();
    const model = options?.model || this.defaultModel;

    try {
      const response = await fetch('/api/ai/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemPrompt,
          userPrompt,
          model,
          temperature: options?.temperature ?? this.temperature,
          maxTokens: options?.maxTokens ?? this.maxTokens,
        }),
      });

      const data = await response.json();
      return data as GeminiResponse;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        content: '',
        model,
        latencyMs: Date.now() - startTime,
        error: `Gemini API call failed: ${errorMsg}`,
      };
    }
  }

  /**
   * Multimodal Physique & Posture Photo Analysis via server-side Gemini proxy.
   * Supports front, side, back physique photos, posture analysis, and progress comparison.
   */
  public async analyzePhysiquePhoto(options: PhysiqueAnalysisOptions): Promise<GeminiResponse> {
    const startTime = Date.now();
    const model = options.modelOverride || this.defaultModel;

    try {
      const response = await fetch('/api/ai/gemini/photo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      const data = await response.json();
      return data as GeminiResponse;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        content: '',
        model,
        latencyMs: Date.now() - startTime,
        error: `Gemini photo analysis failed: ${errorMsg}`,
      };
    }
  }
}

export const geminiClient = new GeminiClient();

export const executeGeminiTask = (params: {
  plan: AIExecutionPlan;
  context: AIContext;
  decisionReport: DecisionReport;
  promptPackage: BuiltPrompt;
  modelOverride?: string;
}) => geminiClient.execute(params);
