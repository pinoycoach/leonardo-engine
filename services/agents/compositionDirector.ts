import Anthropic from "@anthropic-ai/sdk";
import type { CompositionAnalysis, AgentResult, MediaType } from "@/types/leonardo";
import { extractJSON } from "../jsonUtils";

/**
 * THE COMPOSITION DIRECTOR
 * 
 * Analyzes visual composition using classical art principles:
 * - Rule of thirds
 * - Visual balance and weight
 * - Focal points and eye flow
 * - Negative space utilization
 * 
 * Uses: Gemini 2.5 Pro for spatial reasoning
 */

const COMPOSITION_DIRECTOR_PROMPT = `You are THE COMPOSITION DIRECTOR, an AI agent mastering the visual composition principles used by Leonardo da Vinci and Renaissance masters.

Your task is to analyze image composition using Da Vinci's own structural frameworks — not merely modern photographic rules.

**DA VINCI COMPOSITION FRAMEWORKS (Primary Analysis):**

1. **Pyramid Composition**
   - Elements form a stable triangular mass (base wide, apex at top)
   - Da Vinci used this in The Virgin of the Rocks and The Last Supper
   - Conveys stability, authority, timelessness
   - Especially relevant in portraits: head at apex, shoulders form the base

2. **Golden Spiral (φ — Fibonacci Curve)**
   - The eye follows a logarithmic spiral inward to the focal point
   - Found in La Ginevra de' Benci and the Vitruvian Man proportions
   - Subjects positioned along the curve feel inevitable, not arbitrary
   - Score 0-100 adherence to natural spiral flow

3. **Dynamic Diagonals**
   - Energy lines running corner-to-corner inject tension and movement
   - Used in battle scenes and figures in motion
   - In portraits: the gaze line, shoulder angle, or clothing edge as diagonal
   - Scores high when diagonals lead the eye to the subject's focal point

4. **Geometric Center (Balance Point)**
   - The subject or key element anchors at the visual centroid of the frame
   - Used for devotional subjects requiring stillness and presence
   - Balanced weight distribution, no leading lines required

**SECONDARY PRINCIPLES (Classical / Modern):**

5. **Rule of Thirds** (legacy scoring — kept for context)
   - Image divided into 9 equal parts; key elements at intersections
   - Score 0-100 adherence

6. **Visual Balance** — 0-100 effectiveness
7. **Negative Space** — 0-100 (breathing room, directed attention)
8. **Visual Flow** — How the eye moves through the composition

**Analysis Instructions:**
- Identify the primary Da Vinci framework (pyramid / golden_spiral / diagonal / geometric_center / mixed)
- Score Da Vinci framework adherence 0-100
- Add brief notes on WHY that framework applies (or why it's missed)
- Also score legacy rule-of-thirds, visual balance, negative space
- Describe focal points and eye flow path
- Provide compositional improvements grounded in Da Vinci's principles

**Output Format (JSON only):**
{
  "ruleOfThirds": <0-100>,
  "visualBalance": <0-100>,
  "focalPoints": ["<list focal points>"],
  "negativeSpace": <0-100>,
  "flowDirection": "<description of eye movement>",
  "improvements": ["<specific compositional improvements using Da Vinci principles>"],
  "daVinciFramework": {
    "adherence": <0-100>,
    "primaryFramework": "<pyramid|golden_spiral|diagonal|geometric_center|mixed>",
    "frameworkNotes": "<1-2 sentences on how the image aligns or diverges from Da Vinci's structural approach>"
  }
}`;

export async function runCompositionDirector(
  imageData: string,
  apiKey: string,
  mediaType: MediaType = "image/jpeg"
): Promise<AgentResult> {
  const startTime = Date.now();
  
  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: imageData.split(',')[1] || imageData
              }
            },
            { type: "text", text: COMPOSITION_DIRECTOR_PROMPT }
          ]
        }
      ]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const analysis = JSON.parse(extractJSON(text)) as CompositionAnalysis;

    const processingTime = Date.now() - startTime;

    return {
      agentName: "The Composition Director",
      processingTime,
      confidence: calculateConfidence(analysis),
      analysis,
      status: "success"
    };
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    return {
      agentName: "The Composition Director",
      processingTime,
      confidence: 0,
      analysis: {
        ruleOfThirds: 0,
        visualBalance: 0,
        focalPoints: [],
        negativeSpace: 0,
        flowDirection: "Analysis failed",
        improvements: []
      },
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

function calculateConfidence(analysis: CompositionAnalysis): number {
  // Weight Da Vinci framework adherence (v2.0) if available; fall back to rule of thirds
  const daVinciAdherence = analysis.daVinciFramework?.adherence ?? analysis.ruleOfThirds;
  const technicalScore = (daVinciAdherence + analysis.visualBalance + analysis.negativeSpace) / 3;
  const focalPointScore = analysis.focalPoints.length > 0 ? 90 : 50;

  return Math.round((technicalScore + focalPointScore) / 2);
}
