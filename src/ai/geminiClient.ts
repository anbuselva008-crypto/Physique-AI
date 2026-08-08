import { GoogleGenAI } from '@google/genai';
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
 * Integrates Google GenAI SDK (@google/genai) supporting Gemini 2.5 Flash.
 * Interfaces match GroqClient for seamless provider swapping.
 * Supports text completions and multimodal image analysis (front, side, back physique, posture, comparison).
 */
export class GeminiClient {
  private apiKey: string;
  private defaultModel: string;
  private temperature: number;
  private maxTokens: number;
  private maxRetries: number;
  private retryDelayMs: number;
  private aiClient: GoogleGenAI | null = null;

  constructor(config?: GeminiClientConfig) {
    this.apiKey =
      config?.apiKey ||
      (typeof process !== 'undefined'
        ? process.env?.GEMINI_API_KEY || process.env?.VITE_GEMINI_API_KEY
        : '') ||
      (typeof import.meta !== 'undefined'
        ? (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GEMINI_API_KEY ||
          (import.meta as unknown as { env?: Record<string, string> }).env?.GEMINI_API_KEY
        : '') ||
      '';

    this.defaultModel = config?.defaultModel || 'gemini-2.5-flash';
    this.temperature = config?.temperature ?? 0.6;
    this.maxTokens = config?.maxTokens ?? 1024;
    this.maxRetries = config?.maxRetries ?? 3;
    this.retryDelayMs = config?.retryDelayMs ?? 1000;

    if (this.apiKey) {
      try {
        this.aiClient = new GoogleGenAI({
          apiKey: this.apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });
      } catch (err) {
        console.warn('Failed to initialize GoogleGenAI client:', err);
      }
    }
  }

  private getClient(): GoogleGenAI | null {
    if (!this.aiClient) {
      const key =
        this.apiKey ||
        (typeof process !== 'undefined'
          ? process.env?.GEMINI_API_KEY || process.env?.VITE_GEMINI_API_KEY
          : '') ||
        (typeof import.meta !== 'undefined'
          ? (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GEMINI_API_KEY ||
            (import.meta as unknown as { env?: Record<string, string> }).env?.GEMINI_API_KEY
          : '') ||
        '';

      if (key) {
        this.apiKey = key;
        try {
          this.aiClient = new GoogleGenAI({
            apiKey: key,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build',
              },
            },
          });
        } catch (e) {
          console.warn('Lazy init GoogleGenAI failed:', e);
        }
      }
    }
    return this.aiClient;
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
   * Directly sends custom prompts to Gemini 2.5 Flash with retry support.
   */
  public async generateCompletion(
    systemPrompt: string,
    userPrompt: string,
    options?: { model?: string; temperature?: number; maxTokens?: number }
  ): Promise<GeminiResponse> {
    const startTime = Date.now();
    const model = options?.model || this.defaultModel;
    const client = this.getClient();

    if (!client) {
      return {
        success: false,
        content: '',
        model,
        latencyMs: Date.now() - startTime,
        error:
          'GEMINI_API_KEY environment variable is missing. Please configure GEMINI_API_KEY to enable Gemini inference.',
      };
    }

    let attempt = 0;
    let lastError = 'Unknown error';

    while (attempt < this.maxRetries) {
      attempt++;
      try {
        const response = await client.models.generateContent({
          model,
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
            temperature: options?.temperature ?? this.temperature,
            maxOutputTokens: options?.maxTokens ?? this.maxTokens,
          },
        });

        const text = response.text || '';
        const usage = response.usageMetadata;

        return {
          success: true,
          content: text,
          model,
          latencyMs: Date.now() - startTime,
          promptTokens: usage?.promptTokenCount,
          completionTokens: usage?.candidatesTokenCount,
          totalTokens: usage?.totalTokenCount,
          raw: response,
        };
      } catch (err: unknown) {
        lastError = err instanceof Error ? err.message : String(err);
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
      error: `Gemini API call failed after ${this.maxRetries} attempts: ${lastError}`,
    };
  }

  /**
   * Multimodal Physique & Posture Photo Analysis.
   * Supports front, side, back physique photos, posture analysis, and progress comparison.
   */
  public async analyzePhysiquePhoto(options: PhysiqueAnalysisOptions): Promise<GeminiResponse> {
    const startTime = Date.now();
    const model = options.modelOverride || this.defaultModel;
    const client = this.getClient();

    if (!client) {
      return {
        success: false,
        content: '',
        model,
        latencyMs: Date.now() - startTime,
        error: 'GEMINI_API_KEY environment variable is missing.',
      };
    }

    const {
      angle,
      imageBase64,
      mimeType = 'image/jpeg',
      comparisonImageBase64,
      comparisonMimeType = 'image/jpeg',
      additionalNotes,
    } = options;

    const systemPrompt = `You are the Head Sports Scientist and Biomechanics AI Specialist for Physique AI.
Provide evidence-based, respectful, highly detailed physical assessments.
Evaluate muscular symmetry, estimated body fat range, posture alignment, structural highlights, and actionable fitness recommendations.
Never give medical diagnoses. Focus on body composition, posture mechanics, and athletic development.`;

    let userPromptText = '';
    switch (angle) {
      case 'front':
        userPromptText = `Analyze this FRONT view physique photo. Evaluate:
1. Clavicular width and chest development (upper/mid/lower).
2. Shoulder symmetry and deltoid caps.
3. Core/abdominal definition, serratus anterior, and waist-to-shoulder ratio (V-taper).
4. Quad sweep and leg symmetry.
5. Estimated body fat percentage range and muscular balance.`;
        break;
      case 'side':
        userPromptText = `Analyze this SIDE view physique photo. Evaluate:
1. Chest thickness and anterior deltoid alignment.
2. Arm development (biceps vs triceps lateral/long heads).
3. Spinal posture (lordosis, kyphotic curve, forward head position, pelvis tilt).
4. Glute, hamstring, and quad depth.
5. Overall profile muscular balance and posture mechanics.`;
        break;
      case 'back':
        userPromptText = `Analyze this BACK view physique photo. Evaluate:
1. Latissimus dorsi width, insertion height, and lower lat development.
2. Trapezius and rhomboid thickness.
3. Rear deltoid caps and infraspinatus definition.
4. Spinal erector thickness and waist/hip taper.
5. Posterior chain symmetry and hamstring/calves balance.`;
        break;
      case 'posture':
        userPromptText = `Perform a comprehensive BIOMECHANICAL & POSTURE ANALYSIS on this photo. Evaluate:
1. Shoulder elevation/protraction/asymmetry.
2. Forward head posture or cervical spinal angle.
3. Pelvic tilt (anterior/posterior tilt) and spinal curvature.
4. Knee tracking and feet alignment (pronation/supination if visible).
5. Corrective exercise recommendations (mobility drills, stretching target areas, strengthening weak muscle groups).`;
        break;
      case 'comparison':
        userPromptText = `Perform a side-by-side PROGRESS COMPARISON between Image 1 (Earlier Baseline) and Image 2 (Current Progress). Evaluate:
1. Muscular hypertrophy gains in key target groups.
2. Body fat reduction and vascularity/definition changes.
3. Posture improvements or waist tightening.
4. Quantitative progression summary and motivation.`;
        break;
    }

    if (additionalNotes) {
      userPromptText += `\n\nUser Context/Notes: "${additionalNotes}"`;
    }

    try {
      const cleanImageBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const parts: Array<{ inlineData: { mimeType: string; data: string } } | { text: string }> = [
        {
          inlineData: {
            mimeType,
            data: cleanImageBase64,
          },
        },
      ];

      if (angle === 'comparison' && comparisonImageBase64) {
        const cleanCompBase64 = comparisonImageBase64.replace(/^data:image\/\w+;base64,/, '');
        parts.push({
          inlineData: {
            mimeType: comparisonMimeType,
            data: cleanCompBase64,
          },
        });
      }

      parts.push({ text: userPromptText });

      const response = await client.models.generateContent({
        model,
        contents: { parts },
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.4,
          maxOutputTokens: 1200,
        },
      });

      const text = response.text || '';
      const usage = response.usageMetadata;

      return {
        success: true,
        content: text,
        model,
        latencyMs: Date.now() - startTime,
        promptTokens: usage?.promptTokenCount,
        completionTokens: usage?.candidatesTokenCount,
        totalTokens: usage?.totalTokenCount,
        raw: response,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        content: '',
        model,
        latencyMs: Date.now() - startTime,
        error: `Gemini image analysis failed: ${errorMsg}`,
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
