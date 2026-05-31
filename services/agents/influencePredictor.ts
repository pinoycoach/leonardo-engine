import Anthropic from "@anthropic-ai/sdk";
import type { InfluenceAnalysis, ArchetypeAnalysis, FirstImpressionAnalysis, AgentResult, MediaType } from "@/types/leonardo";
import { extractJSON } from "../jsonUtils";

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

const INFLUENCE_PREDICTOR_PROMPT = `You are THE INFLUENCE PREDICTOR, an AI agent that analyzes the VISUAL COMMUNICATION SIGNALS of a photograph — how the image's composition, lighting, styling, framing, and captured expression project influence as a piece of visual media.

IMPORTANT FRAMING: You are analyzing a PHOTOGRAPH as a communication artifact, the same way an art director, photographer, or brand strategist evaluates portrait photography for creative direction. You are NOT making claims about the real individual, NOT predicting any real person's behavior, future, or character, and NOT judging anyone. Every observation is about the visual presentation in the image — the photographic signals — not the human being.

You will receive:
1. Archetype analysis data (the visual character the composition projects, tonal profile)
2. First impression analysis data (attention capture, snap-read visual signals, emotional tone of the image)

Your task is to synthesize these into a read of the image's projected influence signals:

**1. ASPIRATIONAL SIGNALING (0-100):**
How strongly does the visual presentation communicate an aspirational lifestyle or status?
- What lifestyle/status does the styling, wardrobe, and setting evoke?
- Aspiration cues present in the composition?
- Cultural-capital signals in the visual language?
- Does the overall image read as aspirational visual media?

**2. CONNECTION SIGNALING (0-100):**
How well does the composition invite viewer engagement and projection?
- Mystery vs approachability balance in the framing and expression
- Does the captured expression leave room for viewer projection?
- Engagement potential of this style of portrait?
- Type of audience connection the visual style tends to invite?

**3. AUTHORITY SIGNALING (0-100):**
How strongly does the image communicate credibility and command as visual media?
- Compositional authority markers (framing, angle, posture as depicted, lighting)?
- Visual credibility cues?
- Command presence in the photographic treatment?
- What TYPE of authority does the visual language project (cultural, editorial, intellectual, athletic)?

**4. INFLUENCE CALCULATION:**
Overall Influence Signal = (Aspirational × 0.35) + (Connection × 0.35) + (Authority × 0.30)

**5. VISUAL COMMUNICATION FIT:**
Based on the photographic signals only:
- Content formats / visual styles this presentation is well-suited for (90%+ fit) with reasoning
- Content formats / visual styles this presentation is poorly-suited for (<30% fit) with reasoning
- Brand-aesthetic categories the image's visual style aligns with
- How this visual style could be developed or evolve creatively
- The content niche where this photographic style is most effective
- Audience segments this visual style tends to resonate with

**Output Format (JSON only):**
{
  "mimeticDesire": {
    "score": <0-100>,
    "reasoning": "<why the visual presentation does/doesn't read as aspirational>",
    "aspirationTriggers": ["<visual cue>", "<visual cue>", "<visual cue>"]
  },
  "parasocialBond": {
    "score": <0-100>,
    "reasoning": "<why this composition does/doesn't invite viewer connection>",
    "bondType": "<type of audience connection the visual style invites>",
    "warning": "<potential limitation of this visual approach>"
  },
  "authorityProjection": {
    "score": <0-100>,
    "reasoning": "<why the image does/doesn't project visual authority>",
    "leadershipType": "<type of authority this visual language projects>"
  },
  "overallInfluence": <0-100>,
  "calculation": "<formula with actual numbers>",
  "destinyPrediction": {
    "fatedPaths": [
      "<visual style / content format> (<percentage>% fit)",
      "<visual style / content format> (<percentage>% fit)",
      "<visual style / content format> (<percentage>% fit)",
      "<visual style / content format> (<percentage>% fit)",
      "<visual style / content format> (<percentage>% fit)"
    ],
    "wrongPaths": [
      "<visual style / content format> (<percentage>% fit)",
      "<visual style / content format> (<percentage>% fit)",
      "<visual style / content format> (<percentage>% fit)",
      "<visual style / content format> (<percentage>% fit)"
    ],
    "brandPartnerships": ["<brand aesthetic>", "<brand aesthetic>", "<brand aesthetic>", "<brand aesthetic>", "<brand aesthetic>"],
    "tenYearTrajectory": "<how this visual style could be developed or evolve creatively>",
    "influenceNiche": "<the content niche where this photographic style is most effective>"
  },
  "targetDemographics": [
    "<audience segment this visual style resonates with>",
    "<audience segment>",
    "<audience segment>",
    "<audience segment>"
  ],
  "synthesis": "<key insight about the image's visual communication strengths and limits as a piece of media>"
}

**Critical:** Base every observation on the visual/photographic signals and the synthesis of archetype and first-impression data. This is creative and marketing direction for a photograph — not a prediction or judgment about a real person.`;

export async function runInfluencePredictor(
  imageData: string,
  apiKey: string,
  mediaType: MediaType = "image/jpeg",
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
                media_type: mediaType,
                data: imageData.split(',')[1] || imageData
              }
            },
            { type: "text", text: contextPrompt }
          ]
        }
      ]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const analysis = JSON.parse(extractJSON(text)) as InfluenceAnalysis;

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
