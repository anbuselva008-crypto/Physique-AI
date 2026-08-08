import {
  AIContext,
  DecisionReport,
  AIExecutionPlan,
  BuiltPrompt,
  GroqClientConfig,
  GroqResponse,
} from './types';

/**
 * Groq AI Client Integration Layer
 * Independent client for sending structured execution plans & prompts to the Groq API.
 * Features exponential backoff retries, error handling, configurable models, and zero UI bindings.
 */
export class GroqClient {
  private apiKey: string;
  private defaultModel: string;
  private temperature: number;
  private maxTokens: number;
  private maxRetries: number;
  private retryDelayMs: number;
  private timeoutMs: number;

  constructor(config?: GroqClientConfig) {
    this.apiKey =
      config?.apiKey ||
      (typeof process !== 'undefined' ? process.env?.GROQ_API_KEY || process.env?.VITE_GROQ_API_KEY : '') ||
      (typeof import.meta !== 'undefined'
        ? (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GROQ_API_KEY ||
          (import.meta as unknown as { env?: Record<string, string> }).env?.GROQ_API_KEY
        : '') ||
      '';
    this.defaultModel = config?.defaultModel || 'llama-3.3-70b-versatile';
    this.temperature = config?.temperature ?? 0.6;
    this.maxTokens = config?.maxTokens ?? 1024;
    this.maxRetries = config?.maxRetries ?? 3;
    this.retryDelayMs = config?.retryDelayMs ?? 1000;
    this.timeoutMs = config?.timeoutMs ?? 15000;
  }

  /**
   * Main entry point accepting execution plan, context, decision report, and prompt package.
   */
  public async execute(params: {
    plan: AIExecutionPlan;
    context: AIContext;
    decisionReport: DecisionReport;
    promptPackage: BuiltPrompt;
    modelOverride?: string;
    temperatureOverride?: number;
    maxTokensOverride?: number;
  }): Promise<GroqResponse> {
    const { plan, promptPackage, modelOverride, temperatureOverride, maxTokensOverride } = params;

    const startTime = Date.now();
    const model = modelOverride || this.defaultModel;

    // Check if direct response already exists in execution plan (e.g. satisfied by rule engine / KB)
    if (plan.directResponse && !plan.shouldCallGroq) {
      return {
        success: true,
        content: plan.directResponse,
        model: 'rule_engine_direct',
        latencyMs: Date.now() - startTime,
      };
    }

    if (!this.apiKey) {
      return {
        success: false,
        content: '',
        model,
        latencyMs: Date.now() - startTime,
        error:
          'GROQ_API_KEY environment variable is missing. Please configure GROQ_API_KEY to enable Groq inference.',
      };
    }

    const messages = [
      {
        role: 'system',
        content: promptPackage.systemPrompt,
      },
      {
        role: 'user',
        content: promptPackage.fullFormattedPrompt,
      },
    ];

    const body = {
      model,
      messages,
      temperature: temperatureOverride ?? this.temperature,
      max_tokens: maxTokensOverride ?? this.maxTokens,
    };

    return this.sendWithRetry(body, model, startTime);
  }

  /**
   * Directly sends a custom chat completion prompt with retries.
   */
  public async generateCompletion(
    systemPrompt: string,
    userPrompt: string,
    options?: { model?: string; temperature?: number; maxTokens?: number }
  ): Promise<GroqResponse> {
    const startTime = Date.now();
    const model = options?.model || this.defaultModel;

    if (!this.apiKey) {
      return {
        success: false,
        content: '',
        model,
        latencyMs: Date.now() - startTime,
        error: 'GROQ_API_KEY environment variable is missing.',
      };
    }

    const body = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: options?.temperature ?? this.temperature,
      max_tokens: options?.maxTokens ?? this.maxTokens,
    };

    return this.sendWithRetry(body, model, startTime);
  }

  private async sendWithRetry(body: unknown, model: string, startTime: number): Promise<GroqResponse> {
    let attempt = 0;
    let lastError = 'Unknown error';

    while (attempt < this.maxRetries) {
      attempt++;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const status = response.status;
          lastError = (errData as Record<string, unknown>)?.error
            ? String((errData as Record<string, { message?: string }>).error?.message || response.statusText)
            : `Groq API HTTP ${status}: ${response.statusText}`;

          // If rate limit (429) or server error (5xx), retry with exponential backoff
          if ((status === 429 || status >= 500) && attempt < this.maxRetries) {
            const delay = this.retryDelayMs * Math.pow(2, attempt - 1);
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }

          return {
            success: false,
            content: '',
            model,
            latencyMs: Date.now() - startTime,
            error: lastError,
            raw: errData,
          };
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        const usage = data.usage || {};

        return {
          success: true,
          content,
          model: data.model || model,
          latencyMs: Date.now() - startTime,
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
          raw: data,
        };
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          lastError = `Request timed out after ${this.timeoutMs}ms`;
        } else {
          lastError = err instanceof Error ? err.message : String(err);
        }

        if (attempt < this.maxRetries) {
          const delay = this.retryDelayMs * Math.pow(2, attempt - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    return {
      success: false,
      content: '',
      model,
      latencyMs: Date.now() - startTime,
      error: `Failed after ${this.maxRetries} attempts. Last error: ${lastError}`,
    };
  }
}

export const groqClient = new GroqClient();

export const executeGroqTask = (params: {
  plan: AIExecutionPlan;
  context: AIContext;
  decisionReport: DecisionReport;
  promptPackage: BuiltPrompt;
  modelOverride?: string;
}) => groqClient.execute(params);
