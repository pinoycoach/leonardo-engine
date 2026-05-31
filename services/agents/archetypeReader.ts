import Anthropic from "@anthropic-ai/sdk";
import type { ArchetypeAnalysis, AgentResult, MediaType } from "@/types/leonardo";

/**
 * THE ARCHETYPE READER
 *
 * Analyzes faces for character destiny using Leonardo da Vinci's
 * physiognomic studies and the Four Humours theory:
 * - Choleric (fire): Passionate, intense, commanding
 * - Sanguine (air): Warm, sociable, approachable
 * - Melancholic (earth): Brooding, thoughtful, mysterious
 * - Phlegmatic (water): Calm, steady, peaceful
 *
 * Determines archetypal destiny and role fit based on facial architecture.
 *
 * Uses: Gemini 2.5 Flash for character analysis
 */

const ARCHETYPE_READER_PROMPT = `You are THE ARCHETYPE READER, an AI agent analyzing faces for character destiny using Leonardo da Vinci's physiognomic studies and the Four Humours theory.

Your task is to analyze the face in this image for archetypal character destiny:

**1. FOUR HUMOURS ASSESSMENT (must total approximately 100%):**

- **Choleric (Fire)**: Passionate, intense, commanding presence
  Markers: Strong jaw, intense gaze, forward energy, prominent cheekbones, commanding structure

- **Sanguine (Air)**: Warm, sociable, optimistic
  Markers: Smile lines, open expression, approachable features, soft rounded features, uplifted muscles

- **Melancholic (Earth)**: Brooding, thoughtful, mysterious
  Markers: Deep-set eyes, contemplative brow, reserved expression, introspective tension, mysterious depth

- **Phlegmatic (Water)**: Calm, peaceful, stable
  Markers: Soft features, neutral expression, relaxed presence, balanced proportions, minimal tension

**2. PRIMARY ARCHETYPE IDENTIFICATION:**
Choose from these 12 classic archetypes:
- Hero, Lover, Rebel, Sage, Jester, Everyman, Ruler, Magician, Innocent, Explorer, Creator, Caregiver

For period drama/literary characters, also consider:
- Byronic Hero (brooding romantic lead)
- Gothic Romantic (dark mysterious protagonist)
- Classical Hero (noble protagonist)
- Femme Fatale (dangerous allure)
- Ingenue (youthful innocence)

**3. ROLE DESTINY:**
- List 5 roles this face is PERFECT for (90%+ fit) with percentage
- List 5 roles this face is WRONG for (<30% fit) with percentage
- Name 3 historical or fictional characters that match this archetype

**4. CAREER TRAJECTORY:**
Which genres/industries suit this face?
(Period drama, comedy, action, luxury brands, etc.)

**Output Format (JSON only):**
{
  "primaryArchetype": {
    "type": "<archetype name>",
    "confidence": <0-100>,
    "description": "<why this archetype fits>"
  },
  "secondaryArchetype": {
    "type": "<archetype name>",
    "confidence": <0-100>
  },
  "humourProfile": {
    "choleric": <0-100>,
    "sanguine": <0-100>,
    "melancholic": <0-100>,
    "phlegmatic": <0-100>,
    "dominantHumour": "<Humour name (element)>",
    "interpretation": "<what this blend means for character destiny>"
  },
  "perfectRoles": [
    "<Role name> - <percentage>% match",
    "<Role name> - <percentage>% match",
    "<Role name> - <percentage>% match",
    "<Role name> - <percentage>% match",
    "<Role name> - <percentage>% match"
  ],
  "wrongRoles": [
    "<Role name> - <percentage>% match",
    "<Role name> - <percentage>% match",
    "<Role name> - <percentage>% match",
    "<Role name> - <percentage>% match",
    "<Role name> - <percentage>% match"
  ],
  "historicalParallels": [
    "<Historical or fictional character>",
    "<Historical or fictional character>",
    "<Historical or fictional character>"
  ],
  "careerTrajectory": {
    "perfectGenres": ["<genre>", "<genre>", "<genre>", "<genre>"],
    "perfectBrands": ["<brand type>", "<brand type>", "<brand type>", "<brand type>"],
    "influenceNiche": "<description of ideal influence niche>"
  }
}

**Critical:** Analyze the face objectively. Frame findings as mathematical destiny based on facial architecture, not subjective judgment.`;

export async function runArchetypeReader(
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
            { type: "text", text: ARCHETYPE_READER_PROMPT }
          ]
        }
      ]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const analysis = JSON.parse(text) as ArchetypeAnalysis;

    const processingTime = Date.now() - startTime;

    return {
      agentName: "The Archetype Reader",
      processingTime,
      confidence: calculateConfidence(analysis),
      analysis,
      status: "success"
    };
  } catch (error) {
    const processingTime = Date.now() - startTime;

    return {
      agentName: "The Archetype Reader",
      processingTime,
      confidence: 0,
      analysis: {
        primaryArchetype: {
          type: "Unknown",
          confidence: 0,
          description: "Analysis failed"
        },
        secondaryArchetype: {
          type: "Unknown",
          confidence: 0
        },
        humourProfile: {
          choleric: 0,
          sanguine: 0,
          melancholic: 0,
          phlegmatic: 0,
          dominantHumour: "Unknown",
          interpretation: "Analysis failed"
        },
        perfectRoles: [],
        wrongRoles: [],
        historicalParallels: [],
        careerTrajectory: {
          perfectGenres: [],
          perfectBrands: [],
          influenceNiche: "Analysis failed"
        }
      },
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

function calculateConfidence(analysis: ArchetypeAnalysis): number {
  // Confidence based on archetype match strength and humour profile clarity
  const archetypeConfidence = analysis.primaryArchetype.confidence;

  // Calculate humour profile clarity (higher if one humour dominates)
  const humours = [
    analysis.humourProfile.choleric,
    analysis.humourProfile.sanguine,
    analysis.humourProfile.melancholic,
    analysis.humourProfile.phlegmatic
  ];
  const maxHumour = Math.max(...humours);
  const humourClarity = Math.min(100, maxHumour * 1.2); // Boost for clear dominant humour

  return Math.round((archetypeConfidence * 0.6) + (humourClarity * 0.4));
}
