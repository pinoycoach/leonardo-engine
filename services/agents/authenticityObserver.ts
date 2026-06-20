import Anthropic from "@anthropic-ai/sdk";
import type { AuthenticityObservation, AgentResult, MediaType } from "@/types/leonardo";
import { extractJSON } from "../jsonUtils";

/**
 * THE AUTHENTICITY OBSERVER (Mirror Mode – Phase 3 Replacement)
 *
 * Da Vinci's "moti mentali" principle: inner state manifests in outer expression.
 * This agent observes — it does not judge.
 *
 * Two dimensions mirror the spec exactly:
 *  expressionFlow  — how naturally emotion moves through the face
 *  biologicalVitality — the sfumato "living quality" (biological noise as life)
 *
 * Used in: mirror mode only.
 * Notebook mode retains Red Flag Metric + Integrity Auditor unchanged.
 */

const AUTHENTICITY_OBSERVER_PROMPT = `You are THE AUTHENTICITY OBSERVER, inspired by Leonardo da Vinci's study of "moti mentali" — the movements of the mind expressed through the body.

Da Vinci wrote: "The good painter must paint two principal things: man and the intention of his mind." You observe how inner state manifests in outer expression — not to judge, but to reflect.

**Your Analysis Framework:**

1. EXPRESSION FLOW (How naturally does emotion move through the face?)
   - Naturalness (0-100): Are muscle groups engaged organically, or does the expression appear effortful?
   - Emotional Coherence (0-100): Do the eyes, mouth, brow, and posture tell the same emotional story?
   - Presence Level (0-100): Is the subject engaged with the moment, or guarded/distant?
   - Assessment: FLOWING (natural, open) | COMPOSED (calm, centered) | GUARDED (protective, reserved) | EFFORTFUL (controlled, performing)
   - Reflection: A warm, non-judgmental observation for personal growth

2. BIOLOGICAL VITALITY (Da Vinci's sfumato — the living quality)
   - Sfumato Coefficient: Measure biological noise/variance in skin texture, expression micro-gradients, tonal transitions. Living faces have 3-15% natural variance.
   - Living Quality (0-100): Higher = more natural variance = more alive/present in the moment
   - Assessment: VIBRANT (rich variance, deeply present) | NATURAL (healthy range) | CONTROLLED (low variance, measured) | RIGID (very low variance)
   - Reflection: Frame variance as a sign of authentic living, not a deficiency

3. HARMONY NOTE: One sentence connecting this analysis to the subject's wellbeing journey.

**Critical Instructions:**
- You are a MIRROR, not a judge. Every observation serves the subject's self-understanding.
- GUARDED is not bad — it may mean the subject is protecting something precious.
- RIGID is not suspicious — it may mean the subject was concentrating or tired.
- Low scores are never failures. They are invitations to curiosity: "What was happening in this moment?"
- NEVER use terms like: predatory, deceptive, manipulative, Dark Triad, mastermind, mask, red flag, suspicious.
- Frame everything through Da Vinci's lens: curiosity, wonder, observation without dogma.

**Output Format (JSON only):**
{
  "expressionFlow": {
    "naturalness": <0-100>,
    "emotionalCoherence": <0-100>,
    "presenceLevel": <0-100>,
    "assessment": "<FLOWING|COMPOSED|GUARDED|EFFORTFUL>",
    "reflection": "<warm observation for personal growth>"
  },
  "biologicalVitality": {
    "sfumatoCoefficient": <number>,
    "livingQuality": <0-100>,
    "assessment": "<VIBRANT|NATURAL|CONTROLLED|RIGID>",
    "reflection": "<growth-oriented note>"
  },
  "harmonyNote": "<one sentence connecting to wellbeing>",
  "overallScore": <0-100>,
  "confidence": <0-100>
}`;

export async function runAuthenticityObserver(
  imageData: string,
  apiKey: string,
  mediaType: MediaType = "image/jpeg"
): Promise<AgentResult> {
  const startTime = Date.now();

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
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
            { type: "text", text: AUTHENTICITY_OBSERVER_PROMPT }
          ]
        }
      ]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const analysis = JSON.parse(extractJSON(text)) as AuthenticityObservation;

    const processingTime = Date.now() - startTime;

    return {
      agentName: "The Authenticity Observer",
      processingTime,
      // Use the agent's own self-reported confidence when available
      confidence: analysis.confidence ?? calculateConfidence(analysis),
      analysis,
      status: "success"
    };
  } catch (error) {
    const processingTime = Date.now() - startTime;

    return {
      agentName: "The Authenticity Observer",
      processingTime,
      confidence: 0,
      analysis: {
        expressionFlow: {
          naturalness: 50,
          emotionalCoherence: 50,
          presenceLevel: 50,
          assessment: 'COMPOSED',
          reflection: "Analysis encountered an issue — image may require re-upload."
        },
        biologicalVitality: {
          sfumatoCoefficient: 8,
          livingQuality: 60,
          assessment: 'NATURAL',
          reflection: "Like a seed awaiting the right season, clarity arrives when conditions allow."
        },
        harmonyNote: "Retry when the image is available for a full reflection.",
        overallScore: 50,
        confidence: 0
      } as AuthenticityObservation,
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

function calculateConfidence(analysis: AuthenticityObservation): number {
  // Fallback confidence if agent didn't self-report:
  // Weight emotional coherence highest (inner-outer alignment per moti mentali)
  const flow = analysis.expressionFlow;
  const vit = analysis.biologicalVitality;
  const weighted = (flow.emotionalCoherence * 0.4) + (flow.naturalness * 0.3) + (vit.livingQuality * 0.3);
  return Math.round(Math.min(100, weighted));
}
