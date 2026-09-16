import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

// Support large payloads for base64 photo uploads (up to 50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Lazy initialization for GoogleGenAI
let geminiClientInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  if (!geminiClientInstance) {
    try {
      geminiClientInstance = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (err) {
      console.warn('[Server] Error initializing GoogleGenAI client:', err);
      return null;
    }
  }
  return geminiClientInstance;
}

// ----------------------------------------------------
// Health Check
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    hasGroqKey: !!process.env.GROQ_API_KEY,
  });
});

// ----------------------------------------------------
// Server-Side Groq Proxy
// ----------------------------------------------------
app.post('/api/ai/groq', async (req, res) => {
  const apiKey = process.env.GROQ_API_KEY;
  const startTime = Date.now();
  const { model = 'llama-3.3-70b-versatile', messages, temperature = 0.6, max_tokens = 1024 } = req.body;

  if (!apiKey) {
    return res.json({
      success: false,
      content: '',
      model,
      latencyMs: Date.now() - startTime,
      error: 'GROQ_API_KEY environment variable is missing on the server. Please configure GROQ_API_KEY.',
    });
  }

  try {
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
      }),
    });

    if (!groqResponse.ok) {
      const errData = await groqResponse.json().catch(() => ({}));
      const errorMsg =
        (errData as { error?: { message?: string } })?.error?.message ||
        `Groq HTTP ${groqResponse.status}: ${groqResponse.statusText}`;
      return res.json({
        success: false,
        content: '',
        model,
        latencyMs: Date.now() - startTime,
        error: errorMsg,
        raw: errData,
      });
    }

    const data = await groqResponse.json();
    const content = data.choices?.[0]?.message?.content || '';
    const usage = data.usage || {};

    return res.json({
      success: true,
      content,
      model: data.model || model,
      latencyMs: Date.now() - startTime,
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
      totalTokens: usage.total_tokens,
      raw: data,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return res.json({
      success: false,
      content: '',
      model,
      latencyMs: Date.now() - startTime,
      error: `Server proxy to Groq failed: ${errorMsg}`,
    });
  }
});

// ----------------------------------------------------
// Server-Side Gemini Text Completion Proxy
// ----------------------------------------------------
app.post('/api/ai/gemini', async (req, res) => {
  const startTime = Date.now();
  const { systemPrompt = '', userPrompt = '', model = 'gemini-3.6-flash', temperature = 0.6, maxTokens = 1024 } = req.body;

  const client = getGeminiClient();
  if (!client) {
    return res.json({
      success: false,
      content: '',
      model,
      latencyMs: Date.now() - startTime,
      error: 'GEMINI_API_KEY environment variable is missing on the server. Please configure GEMINI_API_KEY.',
    });
  }

  try {
    const response = await client.models.generateContent({
      model,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt || undefined,
        temperature,
        maxOutputTokens: maxTokens,
      },
    });

    const text = response.text || '';
    const usage = response.usageMetadata;

    return res.json({
      success: true,
      content: text,
      model,
      latencyMs: Date.now() - startTime,
      promptTokens: usage?.promptTokenCount,
      completionTokens: usage?.candidatesTokenCount,
      totalTokens: usage?.totalTokenCount,
      raw: response,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return res.json({
      success: false,
      content: '',
      model,
      latencyMs: Date.now() - startTime,
      error: `Server proxy to Gemini failed: ${errorMsg}`,
    });
  }
});

// ----------------------------------------------------
// Server-Side Gemini Multimodal Photo Analysis Proxy
// ----------------------------------------------------
app.post('/api/ai/gemini/photo', async (req, res) => {
  const startTime = Date.now();
  const {
    angle,
    imageBase64,
    mimeType = 'image/jpeg',
    comparisonImageBase64,
    comparisonMimeType = 'image/jpeg',
    additionalNotes,
    modelOverride,
  } = req.body;

  const model = modelOverride || 'gemini-3.6-flash';
  const client = getGeminiClient();

  if (!client) {
    return res.json({
      success: false,
      content: '',
      model,
      latencyMs: Date.now() - startTime,
      error: 'GEMINI_API_KEY environment variable is missing on the server.',
    });
  }

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
    default:
      userPromptText = `Analyze this physique photo and assess muscular balance, posture, and body composition.`;
  }

  if (additionalNotes) {
    userPromptText += `\n\nUser Context/Notes: "${additionalNotes}"`;
  }

  try {
    const cleanImageBase64 = (imageBase64 || '').replace(/^data:image\/\w+;base64,/, '');
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

    return res.json({
      success: true,
      content: text,
      model,
      latencyMs: Date.now() - startTime,
      promptTokens: usage?.promptTokenCount,
      completionTokens: usage?.candidatesTokenCount,
      totalTokens: usage?.totalTokenCount,
      raw: response,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return res.json({
      success: false,
      content: '',
      model,
      latencyMs: Date.now() - startTime,
      error: `Gemini photo analysis failed: ${errorMsg}`,
    });
  }
});

// ----------------------------------------------------
// Server-Side Vision Analysis (3-Angle Monthly Photo Set)
// ----------------------------------------------------
app.post('/api/vision/analyze', async (req, res) => {
  const { photoSet } = req.body;
  if (!photoSet) {
    return res.json({ success: false, error: 'No photoSet provided in request body.' });
  }

  const client = getGeminiClient();
  if (!client) {
    return res.json({
      success: false,
      error: 'GEMINI_API_KEY is not configured on the server. Unable to analyze progress photos.',
    });
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

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3.6-flash',
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
      return res.json({
        success: true,
        data: parsed,
        rawText,
      });
    } catch {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return res.json({
          success: true,
          data: parsed,
          rawText,
        });
      }
      return res.json({
        success: false,
        error: 'Failed to parse JSON response from Gemini Vision.',
        rawText,
      });
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return res.json({
      success: false,
      error: `Gemini Vision API analysis failed: ${errorMsg}`,
    });
  }
});

// ----------------------------------------------------
// Vite Middleware / Production Static Serving
// ----------------------------------------------------
async function setupViteAndListen() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

setupViteAndListen();
