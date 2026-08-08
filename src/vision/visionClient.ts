import { GoogleGenAI } from '@google/genai';
import { MonthlyPhotoSet } from './types';

export class VisionClient {
  private apiKey: string;
  private model: string = 'gemini-2.5-flash';
  private maxRetries: number = 3;
  private retryDelayMs: number = 1000;
  private aiClient: GoogleGenAI | null = null;

  constructor(apiKey?: string) {
    this.apiKey =
      apiKey ||
      (typeof process !== 'undefined'
        ? process.env?.GEMINI_API_KEY || process.env?.VITE_GEMINI_API_KEY
        : '') ||
      (typeof import.meta !== 'undefined'
        ? (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GEMINI_API_KEY ||
          (import.meta as unknown as { env?: Record<string, string> }).env?.GEMINI_API_KEY
        : '') ||
      '';

    this.initClient();
  }

  private initClient(): void {
    if (this.apiKey) {
      try {
        this.aiClient = new GoogleGenAI({
          apiKey: this.apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build-vision',
            },
          },
        });
      } catch (err) {
        console.warn('[VisionClient] Initialization error:', err);
      }
    }
  }

  private getClient(): GoogleGenAI | null {
    if (!this.aiClient) {
      this.apiKey =
        this.apiKey ||
        (typeof process !== 'undefined'
          ? process.env?.GEMINI_API_KEY || process.env?.VITE_GEMINI_API_KEY
          : '') ||
        (typeof import.meta !== 'undefined'
          ? (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GEMINI_API_KEY ||
            (import.meta as unknown as { env?: Record<string, string> }).env?.GEMINI_API_KEY
          : '') ||
        '';
      this.initClient();
    }
    return this.aiClient;
  }

  /**
   * Analyzes a complete set of front, side, and back photos for a given month using Gemini Vision.
   * Returns parsed JSON response from Gemini.
   */
  public async analyzeMonthlyPhotoSet(photoSet: MonthlyPhotoSet): Promise<{
    success: boolean;
    data?: Record<string, unknown>;
    rawText?: string;
    error?: string;
  }> {
    const client = this.getClient();
    if (!client) {
      return {
        success: false,
        error:
          'VITE_GEMINI_API_KEY or GEMINI_API_KEY is not configured. Unable to analyze progress photos.',
      };
    }

    const systemInstruction = `You are the lead AI Biomechanics and Sports Science Specialist for Physique AI.
Analyze the user's physique progress photos (Front, Side, Back views).
Your output MUST be strictly valid JSON without markdown codeblocks or extra conversational text.

Return a JSON object conforming strictly to this schema:
{
  "estimatedBodyFat": {
    "percentage": 15.5,
    "confidenceLevel": "medium",
    "rangeLow": 14.5,
    "rangeHigh": 16.5,
    "justification": "Detailed anatomical visual reasoning"
  },
  "postureObservations": [
    "Observation 1 regarding cervical/shoulder/pelvic alignment"
  ],
  "visibleMuscleDevelopment": {
    "chest": "Evaluation of clavicular, sternal, abdominal chest fibers",
    "shoulders": "Evaluation of anterior, lateral, posterior deltoid caps",
    "back": "Evaluation of lat sweep, rhomboids, lower back erectors",
    "arms": "Evaluation of biceps peak and triceps lateral/medial heads",
    "core": "Evaluation of ab definition, waist tightness, serratus",
    "legs": "Evaluation of quad sweep, hamstring depth, calf development"
  },
  "muscleImbalances": [
    "Imbalance note e.g. Right shoulder slight elevation vs left"
  ],
  "symmetryObservations": [
    "Left vs right side balance observation"
  ],
  "fatDistribution": "Summary of regional adipose storage patterns",
  "weakAreas": ["Target Area 1", "Target Area 2"],
  "strongAreas": ["Highlight Area 1", "Highlight Area 2"],
  "recommendedPriorities": [
    "Actionable priority 1",
    "Actionable priority 2"
  ]
}

DO NOT include medical diagnoses. Keep assessments objective, respectful, and sports-science focused.`;

    const parts: Array<{ inlineData: { mimeType: string; data: string } } | { text: string }> = [];

    if (photoSet.frontPhoto) {
      parts.push({
        inlineData: {
          mimeType: photoSet.frontPhoto.mimeType || 'image/jpeg',
          data: photoSet.frontPhoto.imageBase64.replace(/^data:image\/\w+;base64,/, ''),
        },
      });
      parts.push({ text: '[IMAGE 1: FRONT VIEW PHYSIQUE PHOTO]' });
    }

    if (photoSet.sidePhoto) {
      parts.push({
        inlineData: {
          mimeType: photoSet.sidePhoto.mimeType || 'image/jpeg',
          data: photoSet.sidePhoto.imageBase64.replace(/^data:image\/\w+;base64,/, ''),
        },
      });
      parts.push({ text: '[IMAGE 2: SIDE VIEW PHYSIQUE & POSTURE PHOTO]' });
    }

    if (photoSet.backPhoto) {
      parts.push({
        inlineData: {
          mimeType: photoSet.backPhoto.mimeType || 'image/jpeg',
          data: photoSet.backPhoto.imageBase64.replace(/^data:image\/\w+;base64,/, ''),
        },
      });
      parts.push({ text: '[IMAGE 3: BACK VIEW POSTERIOR CHAIN PHOTO]' });
    }

    parts.push({
      text: `Perform a full 3-angle anatomical analysis for month ${photoSet.month}. Return strictly the requested JSON format.`,
    });

    let attempt = 0;
    let lastError = '';

    while (attempt < this.maxRetries) {
      attempt++;
      try {
        const response = await client.models.generateContent({
          model: this.model,
          contents: { parts },
          config: {
            systemInstruction,
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        });

        const rawText = response.text || '';
        try {
          const parsed = JSON.parse(rawText);
          return {
            success: true,
            data: parsed,
            rawText,
          };
        } catch (jsonErr) {
          // If responseMimeType wasn't clean JSON, attempt clean regex strip
          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
              success: true,
              data: parsed,
              rawText,
            };
          }
          throw new Error(`Failed to parse response JSON: ${jsonErr}`);
        }
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
      error: `Gemini Vision API analysis failed after ${this.maxRetries} attempts: ${lastError}`,
    };
  }
}

export const visionClient = new VisionClient();
