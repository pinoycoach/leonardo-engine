import Anthropic from "@anthropic-ai/sdk";
import type { LightingAnalysis, AgentResult, MediaType } from "@/types/leonardo";
import { extractJSON } from "../jsonUtils";

/**
 * THE LIGHT MASTER
 * 
 * Analyzes lighting quality using Renaissance painting techniques:
 * - Chiaroscuro (dramatic light/dark contrast)
 * - Sfumato (soft, smoky transitions)
 * - Light direction and quality
 * - Mood and emotional impact
 * 
 * Uses: Gemini 2.5 Flash with vision for rapid lighting analysis
 */

const LIGHT_MASTER_PROMPT = `You are THE LIGHT MASTER, an AI agent channeling the lighting mastery of Renaissance painters like Caravaggio and Leonardo.

Your task is to analyze the lighting in an image using classical techniques:

**Renaissance Lighting Principles:**

1. **Chiaroscuro** (Light/Dark Contrast)
   - Strong contrast creates drama and depth
   - Caravaggio's technique: deep shadows, bright highlights
   - Score 0-100 (higher = more dramatic contrast)

2. **Sfumato** (Soft Transitions)
   - Leonardo's technique: imperceptible transitions between light and shadow
   - No harsh lines, subtle gradations
   - Score 0-100 (higher = softer, more painterly)

3. **Light Direction**
   - Front: Flat, catalog-style
   - Side: Sculptural, dimensional
   - Rembrandt: 45° with triangle under eye
   - Three-quarter: Classic portrait lighting
   - Back: Rim lighting, dramatic

4. **Light Quality**
   - Harsh: Direct, hard shadows (noon sun)
   - Soft: Diffused, gentle shadows (golden hour)
   - Dramatic: High contrast (Caravaggio)
   - Flat: Even, minimal shadows (overcast)
   - Golden: Warm, directional (sunset/sunrise)

5. **Mood**
   - What emotion does the lighting convey?
   - Warm/inviting vs. cold/clinical
   - Mysterious vs. revealing

**Analysis Instructions:**
- Evaluate chiaroscuro intensity (0-100)
- Measure sfumato quality (0-100)
- Identify light direction precisely
- Classify light quality
- Describe mood created
- Provide specific improvements

**Output Format (JSON only):**
{
  "chiaroscuroScore": <0-100>,
  "sfumato": <0-100>,
  "direction": "front" | "side" | "back" | "three-quarter" | "rembrandt",
  "quality": "harsh" | "soft" | "dramatic" | "flat" | "golden",
  "mood": "<emotional description>",
  "improvements": ["<specific actionable lighting improvements>"]
}`;

export async function runLightMaster(
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
            { type: "text", text: LIGHT_MASTER_PROMPT }
          ]
        }
      ]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const analysis = JSON.parse(extractJSON(text)) as LightingAnalysis;

    const processingTime = Date.now() - startTime;

    return {
      agentName: "The Light Master",
      processingTime,
      confidence: calculateConfidence(analysis),
      analysis,
      status: "success"
    };
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    return {
      agentName: "The Light Master",
      processingTime,
      confidence: 0,
      analysis: {
        chiaroscuroScore: 0,
        sfumato: 0,
        direction: 'front',
        quality: 'flat',
        mood: "Analysis failed",
        improvements: []
      },
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

function calculateConfidence(analysis: LightingAnalysis): number {
  // High quality lighting typically has good chiaroscuro or sfumato
  const qualityScore = analysis.quality === 'golden' ? 95 :
                       analysis.quality === 'dramatic' ? 90 :
                       analysis.quality === 'soft' ? 85 :
                       analysis.quality === 'harsh' ? 60 : 50;
  
  const technicalScore = (analysis.chiaroscuroScore + analysis.sfumato) / 2;
  
  return Math.round((qualityScore + technicalScore) / 2);
}
