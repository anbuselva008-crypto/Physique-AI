import { MonthlyPhotoSet } from './types';

export class VisionClient {
  /**
   * Analyzes a complete set of front, side, and back photos for a given month using Gemini Vision via server API.
   * Returns parsed JSON response from Gemini.
   */
  public async analyzeMonthlyPhotoSet(photoSet: MonthlyPhotoSet): Promise<{
    success: boolean;
    data?: Record<string, unknown>;
    rawText?: string;
    error?: string;
  }> {
    try {
      const response = await fetch('/api/vision/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ photoSet }),
      });

      const data = await response.json();
      return data;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        error: `Vision analysis request failed: ${errorMsg}`,
      };
    }
  }
}

export const visionClient = new VisionClient();
