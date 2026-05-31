import Anthropic from "@anthropic-ai/sdk";
import type { CommercialAnalysis, AgentResult, MediaType } from "@/types/leonardo";

/**
 * THE COMMERCIAL STRATEGIST
 * 
 * Analyzes commercial viability and market fit:
 * - Conversion potential for e-commerce
 * - Target demographic alignment
 * - Brand positioning
 * - Usage recommendations
 * - Competitive advantages
 * 
 * Uses: Gemini 2.5 Pro for strategic analysis
 */

const COMMERCIAL_STRATEGIST_PROMPT = `You are THE COMMERCIAL STRATEGIST, an AI agent with 30 years of commercial photography and marketing expertise.

Your task is to analyze an image's commercial viability and strategic positioning:

**Commercial Analysis Framework:**

1. **Conversion Potential** (E-commerce Effectiveness)
   - Will this image drive purchases?
   - Clear product/subject visibility
   - Emotional connection strength
   - Call-to-action clarity
   - Score 0-100 (predicted conversion effectiveness)

2. **Target Demographic**
   - Who is this image appealing to?
   - Age range, gender, lifestyle
   - Psychographic profile
   - Cultural considerations

3. **Market Fit** (Category Alignment)
   - Fashion: Luxury vs. fast fashion vs. athletic
   - Lifestyle: Aspirational vs. relatable
   - Product category appropriateness
   - Score 0-100 (alignment with category norms)

4. **Brand Alignment**
   - What brand personality does this convey?
   - Premium, accessible, edgy, classic, sporty?
   - Consistency with intended positioning

5. **Usage Recommendations**
   - Best platforms (Instagram, e-commerce, print, etc.)
   - Optimal use cases
   - A/B testing suggestions

6. **Competitive Advantage**
   - What makes this image stand out?
   - Unique selling propositions
   - Differentiation factors

**Market Context (2026):**
- Fashion e-commerce highly competitive
- Authenticity and relatability trending
- Diversity and inclusivity critical
- User-generated aesthetic outperforming overly polished
- Video/motion increasingly important

**Analysis Instructions:**
- Think like a CMO and creative director
- Consider ROI and business impact
- Provide actionable strategic recommendations
- Balance artistic merit with commercial effectiveness

**Output Format (JSON only):**
{
  "conversionPotential": <0-100>,
  "targetDemographic": ["<demographic segments>"],
  "marketFit": <0-100>,
  "brandAlignment": "<brand personality description>",
  "usageRecommendations": ["<platform-specific recommendations>"],
  "competitiveAdvantage": ["<unique strengths>"]
}`;

export async function runCommercialStrategist(
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
            { type: "text", text: COMMERCIAL_STRATEGIST_PROMPT }
          ]
        }
      ]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const analysis = JSON.parse(text) as CommercialAnalysis;

    const processingTime = Date.now() - startTime;

    return {
      agentName: "The Commercial Strategist",
      processingTime,
      confidence: calculateConfidence(analysis),
      analysis,
      status: "success"
    };
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    return {
      agentName: "The Commercial Strategist",
      processingTime,
      confidence: 0,
      analysis: {
        conversionPotential: 0,
        targetDemographic: [],
        marketFit: 0,
        brandAlignment: "Analysis failed",
        usageRecommendations: [],
        competitiveAdvantage: []
      },
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

function calculateConfidence(analysis: CommercialAnalysis): number {
  // High confidence when strong conversion potential and market fit
  const commercialScore = (analysis.conversionPotential + analysis.marketFit) / 2;
  const strategicScore = analysis.competitiveAdvantage.length > 0 ? 85 : 60;
  
  return Math.round((commercialScore + strategicScore) / 2);
}
