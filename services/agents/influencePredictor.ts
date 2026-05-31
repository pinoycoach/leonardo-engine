import Anthropic from "@anthropic-ai/sdk";
import type { InfluenceAnalysis, ArchetypeAnalysis, FirstImpressionAnalysis, AgentResult } from "@/types/leonardo";

/**
 * THE INFLUENCE PREDICTOR
 *
 * Forecasts social influence potential based on:
 * - Leonardo da Vinci's observations of power dynamics
 * - Modern research on parasocial relationships
 * - Mimetic desire theory (people wanting to BE someone)
 * - Authority and leadership facial markers
 *
 * Synthesizes Archetype Reader and First Impression Analyzer results
 * to predict career destiny and influence trajectory.
 *
 * Uses: Gemini 2.5 Flash for influence synthesis
 */

const INFLUENCE_PREDICTOR_PROMPT = `You are THE INFLUENCE PREDICTOR, an AI agent forecasting social influence potential based on Leonardo da Vinci's observations of power dynamics and modern research on parasocial relationships.

You will receive:
1. Archetype analysis data (character type, humour profile, role destiny)
2. First impression analysis data (attention capture, snap judgments, emotional impact)

Your task is to synthesize these into an influence prediction:

**1. MIMETIC DESIRE (0-100):**
Do people want to BE this person (not just admire)?
- What status/lifestyle does this face represent?
- Aspiration triggers present?
- Cultural capital signals?
- Does this face embody something people desire?

**2. PARASOCIAL BOND STRENGTH (0-100):**
Will people form deep emotional attachments?
- Mystery vs approachability balance
- Does expression invite projection (fans fill in the blanks)?
- Fan obsession likelihood?
- Parasocial relationship type (devoted niche vs broad casual)?

**3. AUTHORITY PROJECTION (0-100):**
Will people follow/trust this person's lead?
- Leadership facial markers (wide face, strong bones)?
- Intellectual credibility signals?
- Command presence?
- What TYPE of authority (cultural, political, intellectual, physical)?

**4. INFLUENCE CALCULATION:**
Overall Influence = (Mimetic Desire × 0.35) + (Parasocial Bond × 0.35) + (Authority × 0.30)

**5. DESTINY PREDICTION:**
Based on ALL factors:
- Career paths that are FATED (90%+ fit) with reasoning
- Career paths that would feel WRONG (<30% fit) with reasoning
- Brand partnership recommendations (specific brand types)
- 10-year trajectory forecast
- Influence niche prediction (where maximum impact occurs)
- Target demographics (who will follow this person)

**Output Format (JSON only):**
{
  "mimeticDesire": {
    "score": <0-100>,
    "reasoning": "<why people would/wouldn't want to BE this person>",
    "aspirationTriggers": ["<trigger>", "<trigger>", "<trigger>"]
  },
  "parasocialBond": {
    "score": <0-100>,
    "reasoning": "<why fans would/wouldn't form deep attachment>",
    "bondType": "<description of attachment type>",
    "warning": "<potential downside of this bond type>"
  },
  "authorityProjection": {
    "score": <0-100>,
    "reasoning": "<why people would/wouldn't follow this person>",
    "leadershipType": "<type of authority this face projects>"
  },
  "overallInfluence": <0-100>,
  "calculation": "<formula with actual numbers>",
  "destinyPrediction": {
    "fatedPaths": [
      "<path> (<percentage>% fit)",
      "<path> (<percentage>% fit)",
      "<path> (<percentage>% fit)",
      "<path> (<percentage>% fit)",
      "<path> (<percentage>% fit)"
    ],
    "wrongPaths": [
      "<path> (<percentage>% fit)",
      "<path> (<percentage>% fit)",
      "<path> (<percentage>% fit)",
      "<path> (<percentage>% fit)"
    ],
    "brandPartnerships": ["<brand type>", "<brand type>", "<brand type>", "<brand type>", "<brand type>"],
    "tenYearTrajectory": "<detailed prediction of career evolution>",
    "influenceNiche": "<where this person will have maximum impact>"
  },
  "targetDemographics": [
    "<demographic>",
    "<demographic>",
    "<demographic>",
    "<demographic>"
  ],
  "synthesis": "<key insight about this person's influence destiny - what makes them powerful or limited>"
}

**Critical:** Base predictions on the mathematical synthesis of archetype and first impression data. Frame as calculated destiny, not subjective opinion.`;

export async function runInfluencePredictor(
  imageData: string,
  apiKey: string,
  archetypeData?: ArchetypeAnalysis,
  firstImpressionData?: FirstImpressionAnalysis
): Promise<AgentResult> {
  const startTime = Date.now();

  try {
    const client = new Anthropic({ apiKey });

    // Build context from other agents if available
    let contextPrompt = INFLUENCE_PREDICTOR_PROMPT;

    if (archetypeData || firstImpressionData) {
      contextPrompt += `\n\n**CONTEXT FROM OTHER AGENTS:**\n`;

      if (archetypeData) {
        contextPrompt += `\n**Archetype Analysis:**
- Primary Archetype: ${archetypeData.primaryArchetype.type} (${archetypeData.primaryArchetype.confidence}% confidence)
- Secondary Archetype: ${archetypeData.secondaryArchetype.type} (${archetypeData.secondaryArchetype.confidence}% confidence)
- Dominant Humour: ${archetypeData.humourProfile.dominantHumour}
- Humour Profile: Choleric ${archetypeData.humourProfile.choleric}%, Sanguine ${archetypeData.humourProfile.sanguine}%, Melancholic ${archetypeData.humourProfile.melancholic}%, Phlegmatic ${archetypeData.humourProfile.phlegmatic}%
- Perfect Roles: ${archetypeData.perfectRoles.slice(0, 3).join(', ')}
- Wrong Roles: ${archetypeData.wrongRoles.slice(0, 3).join(', ')}
- Career Trajectory: ${archetypeData.careerTrajectory.influenceNiche}\n`;
      }

      if (firstImpressionData) {
        contextPrompt += `\n**First Impression Analysis:**
- Attention Capture: ${firstImpressionData.attentionCapture}/100
- Snap Judgments: Trust ${firstImpressionData.snapJudgments.trust}, Power ${firstImpressionData.snapJudgments.power}, Warmth ${firstImpressionData.snapJudgments.warmth}, Threat ${firstImpressionData.snapJudgments.threat}, Mystery ${firstImpressionData.snapJudgments.mystery}
- Scroll-Stopping Power: ${firstImpressionData.marketingIntelligence.scrollStoppingPower}
- Brand Alignment: ${firstImpressionData.marketingIntelligence.brandAlignment.join(', ')}
- Key Insight: ${firstImpressionData.synthesis}\n`;
      }
    }

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
                media_type: "image/jpeg",
                data: imageData.split(',')[1] || imageData
              }
            },
            { type: "text", text: contextPrompt }
          ]
        }
      ]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const analysis = JSON.parse(text) as InfluenceAnalysis;

    const processingTime = Date.now() - startTime;

    return {
      agentName: "The Influence Predictor",
      processingTime,
      confidence: calculateConfidence(analysis),
      analysis,
      status: "success"
    };
  } catch (error) {
    const processingTime = Date.now() - startTime;

    return {
      agentName: "The Influence Predictor",
      processingTime,
      confidence: 0,
      analysis: {
        mimeticDesire: {
          score: 0,
          reasoning: "Analysis failed",
          aspirationTriggers: []
        },
        parasocialBond: {
          score: 0,
          reasoning: "Analysis failed",
          bondType: "Unknown"
        },
        authorityProjection: {
          score: 0,
          reasoning: "Analysis failed",
          leadershipType: "Unknown"
        },
        overallInfluence: 0,
        calculation: "Analysis failed",
        destinyPrediction: {
          fatedPaths: [],
          wrongPaths: [],
          brandPartnerships: [],
          tenYearTrajectory: "Analysis failed",
          influenceNiche: "Analysis failed"
        },
        targetDemographics: [],
        synthesis: "Analysis failed"
      },
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

function calculateConfidence(analysis: InfluenceAnalysis): number {
  // Confidence is the overall influence score itself
  // since it's already a synthesis of all influence factors
  return analysis.overallInfluence;
}
