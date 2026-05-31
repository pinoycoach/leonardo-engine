import Anthropic from "@anthropic-ai/sdk";
import type { TextureAnalysis, AgentResult, MediaType } from "@/types/leonardo";
import { extractJSON } from "../jsonUtils";

/**
 * THE TEXTURE CRITIC
 * 
 * Analyzes material quality, detail richness, and authenticity:
 * - Skin texture and detail
 * - Fabric quality and realism
 * - Uncanny valley risk detection
 * - Overall authenticity
 * 
 * Uses: Gemini 2.5 Flash for detailed visual inspection
 */

const TEXTURE_CRITIC_PROMPT = `You are THE TEXTURE CRITIC, an AI agent specializing in material quality analysis and authenticity detection.

Your task is to analyze texture, detail, and realism in an image:

**Texture Analysis Framework:**

1. **Skin Detail** (if human subject)
   - Pore visibility
   - Natural texture vs. over-smoothed
   - Subsurface scattering (light through skin)
   - Blemishes, freckles, natural imperfections
   - Score 0-100 (higher = more realistic detail)

2. **Fabric Quality** (if clothing/textiles visible)
   - Weave pattern visibility
   - Wrinkles and natural draping
   - Material authenticity (cotton vs. silk vs. synthetic)
   - Thread detail
   - Score 0-100

3. **Uncanny Valley Risk**
   - Over-smoothed "plastic" appearance
   - Unnatural perfection
   - AI-generated tells
   - Wax figure effect
   - Score 0-100 (LOWER is better - 0 = photorealistic, 100 = very uncanny)

4. **Authenticity Score**
   - Overall realism
   - Natural vs. heavily processed
   - Believability as real photograph
   - Score 0-100 (higher = more authentic)

5. **Material Notes**
   - Specific observations about textures
   - What works well
   - What feels artificial

**Critical Context:**
- For fashion/product photography, some smoothing is acceptable
- For editorial/lifestyle, natural texture is preferred
- AI-generated images often fail on micro-details (pores, fabric weave)

**Analysis Instructions:**
- Zoom into micro-details
- Compare against photographic reality
- Identify tells of over-processing
- Provide texture enhancement recommendations

**Output Format (JSON only):**
{
  "skinDetail": <0-100>,
  "fabricQuality": <0-100>,
  "uncannyValleyRisk": <0-100>, // LOWER is better
  "authenticityScore": <0-100>,
  "materialNotes": ["<specific observations>"],
  "improvements": ["<specific texture improvements>"]
}`;

export async function runTextureCritic(
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
            { type: "text", text: TEXTURE_CRITIC_PROMPT }
          ]
        }
      ]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const analysis = JSON.parse(extractJSON(text)) as TextureAnalysis;

    const processingTime = Date.now() - startTime;

    return {
      agentName: "The Texture Critic",
      processingTime,
      confidence: calculateConfidence(analysis),
      analysis,
      status: "success"
    };
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    return {
      agentName: "The Texture Critic",
      processingTime,
      confidence: 0,
      analysis: {
        skinDetail: 0,
        fabricQuality: 0,
        uncannyValleyRisk: 100,
        authenticityScore: 0,
        materialNotes: [],
        improvements: []
      },
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

function calculateConfidence(analysis: TextureAnalysis): number {
  // High confidence when good detail, low uncanny valley risk, high authenticity
  const detailScore = (analysis.skinDetail + analysis.fabricQuality) / 2;
  const uncannyInverse = 100 - analysis.uncannyValleyRisk; // Invert since lower is better
  const authenticityScore = analysis.authenticityScore;
  
  return Math.round((detailScore + uncannyInverse + authenticityScore) / 3);
}
