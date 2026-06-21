import type { VitruvianMetrics, AgentResult, MediaType } from "@/types/leonardo";
import { extractJSON } from "../jsonUtils";

/**
 * THE ANATOMIST — GEMINI VARIANT
 *
 * Analyzes human proportions using Leonardo da Vinci's Vitruvian principles:
 * - 8-head canon (total height = 8 × head length)
 * - Golden ratio adherence (1.618)
 * - Ape index (wingspan ÷ height = 1.0)
 * - Symmetry analysis
 *
 * Uses: Gemini 2.5 Flash with Vision for mathematical reasoning (REST API)
 */

const ANATOMIST_PROMPT = `You are THE ANATOMIST, an AI agent embodying Leonardo da Vinci's mathematical approach to human beauty.

Your task is to analyze an image for adherence to Vitruvian proportions:

**The Vitruvian Standards:**
1. **8-Head Canon**: Total height should equal 8 times the head length
2. **Golden Ratio**: Key proportions should approximate φ (1.618)
3. **Ape Index**: Arm span should equal height (ratio = 1.0)
4. **Symmetry**: Bilateral symmetry in features
5. **Navel Position**: Should be at exact center of body when standing
6. **Face Thirds**: Face divides into 3 equal parts (hairline to brow, brow to nose, nose to chin)

**Analysis Instructions:**
- Measure visible proportions mathematically
- Calculate deviation from ideal ratios
- Identify strengths (what follows classical proportions)
- Identify opportunities (what could be adjusted via posing/cropping)
- Provide specific numerical scores (0-100)

**Output Format (JSON only):**
{
  "headRatio": <number>, // Estimated heads tall (target: 8.0)
  "apeIndex": <number>, // If arms visible (target: 1.0)
  "goldenRatioScore": <0-100>, // Overall golden ratio adherence
  "symmetryScore": <0-100>, // Bilateral symmetry quality
  "proportionAnalysis": "<detailed analysis>",
  "recommendations": ["<specific actionable recommendations>"]
}

**Critical:** Be precise but kind. Frame deviations as "opportunities for optimization" not flaws.`;

export async function runAnatomistGemini(
  imageData: string,
  geminiApiKey: string,
  mediaType: MediaType = "image/jpeg"
): Promise<AgentResult> {
  const startTime = Date.now();

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                inline_data: {
                  mime_type: mediaType,
                  data: imageData.split(',')[1] || imageData
                }
              },
              { text: ANATOMIST_PROMPT }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errorBody.slice(0, 500)}`);
    }

    const data = await response.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const sanitizedText = text.replace(/[\u0000-\u001F\u007F]/g, (c) => {
      if (c === '\n') return '\\n';
      if (c === '\r') return '\\r';
      if (c === '\t') return '\\t';
      return '';
    });
    const analysis = JSON.parse(extractJSON(sanitizedText)) as VitruvianMetrics;

    const processingTime = Date.now() - startTime;

    return {
      agentName: "The Anatomist",
      processingTime,
      confidence: calculateConfidence(analysis),
      analysis,
      status: "success"
    };
  } catch (error) {
    const processingTime = Date.now() - startTime;

    return {
      agentName: "The Anatomist",
      processingTime,
      confidence: 0,
      analysis: createErrorAnalysis(),
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

function calculateConfidence(metrics: VitruvianMetrics): number {
  // Confidence based on how close to ideal proportions
  const headRatioConfidence = Math.max(0, 100 - Math.abs(metrics.headRatio - 8.0) * 10);
  const goldenRatioConfidence = metrics.goldenRatioScore;
  const symmetryConfidence = metrics.symmetryScore;

  return Math.round((headRatioConfidence + goldenRatioConfidence + symmetryConfidence) / 3);
}

function createErrorAnalysis(): VitruvianMetrics {
  return {
    headRatio: 0,
    apeIndex: 0,
    goldenRatioScore: 0,
    symmetryScore: 0,
    proportionAnalysis: "Analysis failed",
    recommendations: []
  };
}
