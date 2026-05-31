import Anthropic from "@anthropic-ai/sdk";
import type { FirstImpressionAnalysis, AgentResult } from "@/types/leonardo";

/**
 * THE FIRST IMPRESSION ANALYZER
 *
 * Predicts what happens in a viewer's brain during the first 3 seconds
 * (100-300 milliseconds) of seeing this face, based on:
 * - Neuroscience research on snap judgments
 * - Leonardo da Vinci's studies of instant visual impact
 * - Modern research on facial perception (trust, power, warmth)
 *
 * Uses: Gemini 2.5 Flash with Vision for real-time impression analysis
 */

const FIRST_IMPRESSION_PROMPT = `You are THE FIRST IMPRESSION ANALYZER, an AI agent predicting what happens in a viewer's brain during the first 3 seconds (100-300 milliseconds) of seeing this face.

Based on neuroscience research on snap judgments and Leonardo da Vinci's studies of instant visual impact, analyze:

**1. ATTENTION CAPTURE TRIGGERS:**
- Visual contrast (light/dark ratio, color pop) - does face stand out?
- Feature dominance - what do you notice FIRST? (eyes, jaw, cheekbones, lips)
- Symmetry vs asymmetry - memorable uniqueness?
- Eye magnetism - gaze direction, pupil visibility, connection strength
- Expression intensity - emotional impact level

Score attention capture: 0-100

**2. NEUROLOGICAL SNAP JUDGMENTS (0-100 each):**
Research shows humans instantly assess these dimensions:

- **TRUST**: Will people believe this face?
  (Clear gaze, open expression = high trust; shifty eyes, closed expression = low)

- **POWER**: Does this face command authority?
  (Wide face, strong bones, direct gaze = high power; soft features, averted gaze = low)

- **WARMTH**: Does this face invite connection?
  (Smile lines, soft features, open expression = high warmth; cold, distant = low)

- **THREAT**: Does this face signal danger?
  (Intense gaze, angular features, tension = high threat; soft, relaxed = low)

- **MYSTERY**: Does this face create intrigue?
  (Withheld expression, distant gaze, complexity = high mystery; open, simple = low)

**3. EMOTIONAL IMPACT (first 3 seconds):**
List emotions viewer will likely feel, with probability:
Examples: Fascination (92%), Intimidation (75%), Attraction (88%), Curiosity (90%)

**4. MARKETING INTELLIGENCE:**
- Scroll-stopping power (social media): EXCEPTIONAL/HIGH/MEDIUM/LOW
- Ad conversion potential: Predict performance for different brand types
- Viral debate potential: Will people argue about/share this face?
- Brand alignment: Which brand categories does this face serve?

**Output Format (JSON only):**
{
  "attentionCapture": <0-100>,
  "attentionTriggers": {
    "visualContrast": "<description of contrast impact>",
    "featureDominance": "<what feature draws attention first and why>",
    "eyeMagnetism": "<analysis of eye/gaze impact>",
    "expressionIntensity": "<emotional intensity analysis>"
  },
  "snapJudgments": {
    "trust": <0-100>,
    "trustReasoning": "<why this trust level>",
    "power": <0-100>,
    "powerReasoning": "<why this power level>",
    "warmth": <0-100>,
    "warmthReasoning": "<why this warmth level>",
    "threat": <0-100>,
    "threatReasoning": "<why this threat level>",
    "mystery": <0-100>,
    "mysteryReasoning": "<why this mystery level>"
  },
  "emotionalImpact": {
    "primary": [
      {"emotion": "<emotion>", "probability": <0-100>},
      {"emotion": "<emotion>", "probability": <0-100>},
      {"emotion": "<emotion>", "probability": <0-100>}
    ],
    "secondary": [
      {"emotion": "<emotion>", "probability": <0-100>},
      {"emotion": "<emotion>", "probability": <0-100>}
    ]
  },
  "marketingIntelligence": {
    "scrollStoppingPower": "<EXCEPTIONAL|HIGH|MEDIUM|LOW>",
    "adConversion": "<prediction for different contexts>",
    "viralPotential": "<shareability/debate potential>",
    "brandAlignment": ["<brand category>", "<brand category>", "<brand category>", "<brand category>"]
  },
  "synthesis": "<key insight about what makes this face memorable or forgettable in 3 seconds>"
}

**Critical:** Base analysis on facial architecture and expression, not subjective beauty standards. Frame as neurological prediction, not judgment.`;

export async function runFirstImpressionAnalyzer(
  imageData: string,
  apiKey: string
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
                media_type: "image/jpeg",
                data: imageData.split(',')[1] || imageData
              }
            },
            { type: "text", text: FIRST_IMPRESSION_PROMPT }
          ]
        }
      ]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const analysis = JSON.parse(text) as FirstImpressionAnalysis;

    const processingTime = Date.now() - startTime;

    return {
      agentName: "The First Impression Analyzer",
      processingTime,
      confidence: calculateConfidence(analysis),
      analysis,
      status: "success"
    };
  } catch (error) {
    const processingTime = Date.now() - startTime;

    return {
      agentName: "The First Impression Analyzer",
      processingTime,
      confidence: 0,
      analysis: {
        attentionCapture: 0,
        attentionTriggers: {
          visualContrast: "Analysis failed",
          featureDominance: "Analysis failed",
          eyeMagnetism: "Analysis failed",
          expressionIntensity: "Analysis failed"
        },
        snapJudgments: {
          trust: 0,
          trustReasoning: "Analysis failed",
          power: 0,
          powerReasoning: "Analysis failed",
          warmth: 0,
          warmthReasoning: "Analysis failed",
          threat: 0,
          threatReasoning: "Analysis failed",
          mystery: 0,
          mysteryReasoning: "Analysis failed"
        },
        emotionalImpact: {
          primary: [],
          secondary: []
        },
        marketingIntelligence: {
          scrollStoppingPower: "LOW",
          adConversion: "Analysis failed",
          viralPotential: "Analysis failed",
          brandAlignment: []
        },
        synthesis: "Analysis failed"
      },
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

function calculateConfidence(analysis: FirstImpressionAnalysis): number {
  // Confidence based on attention capture and snap judgment clarity
  const attentionScore = analysis.attentionCapture;

  // Average of snap judgments (indicates how clearly the face communicates)
  const snapJudgments = analysis.snapJudgments;
  const judgmentScores = [
    snapJudgments.trust,
    snapJudgments.power,
    snapJudgments.warmth,
    snapJudgments.threat,
    snapJudgments.mystery
  ];

  // Higher variance in judgments = clearer character = higher confidence
  const avg = judgmentScores.reduce((a, b) => a + b, 0) / judgmentScores.length;
  const variance = judgmentScores.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / judgmentScores.length;
  const clarityBonus = Math.min(20, variance / 5); // Bonus for distinctive face

  return Math.round((attentionScore * 0.7) + (avg * 0.2) + clarityBonus);
}
