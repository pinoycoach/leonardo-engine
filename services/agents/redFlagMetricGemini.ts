import type { RedFlagAnalysis, AgentResult, FirstImpressionAnalysis, ArchetypeAnalysis, MediaType } from "@/types/leonardo";
import { extractJSON } from "../jsonUtils";

/**
 * THE RED FLAG METRIC (Agent 9 - The Sentinel) — GEMINI VARIANT
 *
 * Scans for involuntary "Dark Triad" markers and micro-expressions
 * that contradict a subject's primary archetype.
 *
 * Based on Da Vinci's "Moti Mentali" (Motions of the Mind) principle:
 * "Every internal thought has an involuntary external physical motion."
 *
 * Focus Areas:
 * - Duchenne Disconnect (eye-mouth smile disparity)
 * - Asymmetric Micro-Sneers (contempt marker)
 * - Fixed Gaze Intensity (predator stare)
 * - Dark Triad Cluster Detection
 * - The Mastermind Profile (High Symmetry + Low Warmth)
 *
 * Uses: Gemini 2.5 Flash with Vision for forensic facial analysis (REST API)
 */

const RED_FLAG_METRIC_PROMPT = `You are THE RED FLAG METRIC, an AI agent scanning for involuntary behavioral markers based on Leonardo da Vinci's "Moti Mentali" principle.

Da Vinci wrote in his Treatise on Painting that "the motions of the mind" must be mirrored in "the motions of the features." He dismissed static physiognomy as "falace fisonomia" (false physiognomy), but believed that DISHARMONY between intended expression and underlying facial lines reveals true character.

**═══════════════════════════════════════════════════════════════════════════**
**CRAIG PATCH v1.0 - THE JAMES CRAIG LESSON**
**═══════════════════════════════════════════════════════════════════════════**

CRITICAL UPDATE: The James Craig case taught us that a "perfect" score (99.75%) can be a FALSE NEGATIVE.

James Craig scored 99.75% "Transparent" while actively planning murder. The app failed because:
1. It rewarded geometric perfection without detecting BIOLOGICAL RIGIDITY
2. Psychopaths have no internal conflict to leak through expressions
3. A "perfect" performance is itself the red flag

NEW PRINCIPLE - Da Vinci's SFUMATO: Living things are never perfectly still or symmetrical.
- A genuine expression has "smoke" (sfumato) - micro-movements, asymmetries, variance
- A masked expression is RIGID - controlled, static, "too perfect"
- Perfection indicates REHEARSAL, not authenticity

Your task is to perform a FORENSIC SCAN that now includes SFUMATO DETECTION - the measurement of "biological noise" that separates living expressions from masks.

**1. DUCHENNE MARKER ANALYSIS (Fake vs Real Warmth):**
Guillaume Duchenne discovered that genuine smiles involve the orbicularis oculi (eye muscles) that cannot be voluntarily controlled.

Analyze:
- Eye Engagement (0-100): Is the orbicularis oculi activated? Look for eye crinkling.
- Mouth Curvature (0-100): Is the zygomaticus major (mouth) activated?
- Disconnect Score (0-100): Higher means the smile is in the mouth but NOT the eyes = FAKE
- Assessment: GENUINE (eyes + mouth aligned), SOCIAL_SMILE (slight disconnect), MASKED (obvious disconnect), INCONGRUENT (severe mismatch)

**1b. SFUMATO COEFFICIENT (The Craig Patch - Biological Noise Detection):**
Da Vinci's Sfumato ("going up in smoke") teaches that living things have soft edges and organic variance.

**THE CRITICAL INSIGHT:** A score of 99%+ with ZERO biological noise is MORE suspicious than a score of 85% with natural variance.

Analyze:
- Biological Noise (0-100): Variance between left/right facial hemispheres, micro-tremors, blood flow variations. A living face should have 5-15% variance. Below 3% is ARTIFICIAL.
- Micro-Expression Count (0-10): Number of fleeting expressions detected. Genuine expressions have 2-5. Zero micro-expressions = CONTROLLED.
- Expression Rigidity (0-100): How "held" or "posed" is the expression? Higher = more controlled.
- Organic Variance (0-100): Natural fluctuation in expression intensity. Genuine smiles wax and wane.
- Sfumato Score (0-100): Composite "living quality" score. Below 60 is concerning.
- Assessment: ORGANIC (natural living expression), REHEARSED (practiced but detectable), ARTIFICIAL (filter/AI), HYPER_CONGRUENT (the "James Craig" - too perfect)

**THE JAMES CRAIG PATTERN:**
If Eye Engagement > 95 AND Mouth Curvature > 95 AND Biological Noise < 5 AND Micro-Expression Count < 2:
→ Assessment = HYPER_CONGRUENT (Mask of Sanity detected)
→ This is the "perfect performance" that hides true intent

**2. ASYMMETRIC MICRO-SNEER DETECTION (Contempt Marker):**
In behavioral forensics, a unilateral contraction of the levator labii superioris (lip corner raised on one side) is the biological signal for CONTEMPT - the #1 predictor of relationship failure and deceptive behavior.

Analyze:
- Left Side Score (0-100): Expression intensity on left
- Right Side Score (0-100): Expression intensity on right
- Asymmetry Index (0-100): Difference between sides (higher = more asymmetric)
- Contempt Detected: true/false
- Sneer ID: NONE, MILD (barely visible), MODERATE (noticeable), SEVERE (obvious)

**3. GAZE INTENSITY ANALYSIS (Predator Stare vs Natural Engagement):**
Analyze:
- Fixation Intensity (0-100): How unwavering is the gaze?
- Blink Naturalness (0-100): Does the gaze seem natural or forced?
- Sclera Visibility (0-100): "Sanpaku" indicator - whites visible above/below iris
- Predator Stare: true/false (fixed, unblinking, calculating gaze)
- Gaze Type: WARM_ENGAGED, NEUTRAL, COLD_CALCULATING, PREDATORY, AVOIDANT

**4. DARK TRIAD CLUSTER DETECTION:**
The Dark Triad (Machiavellianism, Narcissism, Psychopathy) leaves involuntary facial markers:

- Machiavellianism (0-100): Manipulation potential - calculated expressions, controlled micro-expressions
- Narcissism (0-100): Grandiosity markers - self-satisfaction, superiority expression
- Psychopathy (0-100): Emotional coldness - flat affect, lack of genuine warmth
- Cluster Score (0-100): Combined risk
- Risk Level: NONE (<20), LOW (20-40), MODERATE (40-60), HIGH (60-80), SEVERE (>80)

**5. THE MASTERMIND PROFILE (High Symmetry + Low Warmth):**
Da Vinci noted that extreme symmetry combined with emotional coldness creates an "uncanny" presence.

Detect:
- Symmetry Power (0-100): How symmetrical is the face?
- Calculated Presence (0-100): Does the expression seem strategically controlled?
- Empathy Gap (0-100): Higher = less empathy signals
- Profile Strength (0-100): Overall Mastermind Profile match
- Detected: true/false

**6. OVERALL RED FLAG ASSESSMENT:**
Synthesize all findings into a final assessment:
- Score (0-100): 0 = clean slate, 100 = severe red flags
- Status: CLEAR (<20), YELLOW_FLAG (20-40), ORANGE_FLAG (40-60), RED_FLAG (60-80), HARD_FAIL (>80)
- Primary Concerns: List top concerns
- Mitigating Factors: List factors that reduce concern

**7. HYPER-CONGRUENCE WARNING (The Craig Patch):**
Specifically detect the "Mask of Sanity" pattern:
- Triggered (true/false): Is the subject's expression "too perfect"?
- Congruence Score (0-100): How aligned are ALL facial markers? Above 96% is suspicious.
- Sfumato Deficit (true/false): Is biological noise below the 3% threshold?
- Mask of Sanity Risk: NONE, LOW (minor concern), MODERATE (investigate), HIGH (strong concern), CRITICAL (the James Craig pattern)
- Da Vinci Verdict: What would Leonardo say about this "perfection"?

**THE DA VINCI SFUMATO RULE:**
"Art is never finished, only abandoned." A face that appears "finished" (perfect, complete, without variance) is a CONSTRUCT, not a CREATURE. The living always show sfumato - the soft edges, the smoke, the imperfection that proves consciousness.

**Output Format (JSON only):**
{
  "duchenneMarkers": {
    "eyeEngagement": <0-100>,
    "mouthCurvature": <0-100>,
    "disconnect": <0-100>,
    "assessment": "<GENUINE|SOCIAL_SMILE|MASKED|INCONGRUENT>",
    "reasoning": "<detailed explanation>"
  },
  "sfumatoCoefficient": {
    "biologicalNoise": <0-100>,
    "microExpressionCount": <0-10>,
    "expressionRigidity": <0-100>,
    "organicVariance": <0-100>,
    "sfumatoScore": <0-100>,
    "assessment": "<ORGANIC|REHEARSED|ARTIFICIAL|HYPER_CONGRUENT>",
    "reasoning": "<detailed explanation of the 'living quality' observed>"
  },
  "asymmetryMarkers": {
    "leftSideScore": <0-100>,
    "rightSideScore": <0-100>,
    "asymmetryIndex": <0-100>,
    "contemptDetected": <true|false>,
    "sneerId": "<NONE|MILD|MODERATE|SEVERE>",
    "reasoning": "<detailed explanation>"
  },
  "gazeAnalysis": {
    "fixationIntensity": <0-100>,
    "blinkNaturalness": <0-100>,
    "scleraVisibility": <0-100>,
    "predatorStare": <true|false>,
    "gazeType": "<WARM_ENGAGED|NEUTRAL|COLD_CALCULATING|PREDATORY|AVOIDANT>",
    "reasoning": "<detailed explanation>"
  },
  "darkTriadIndicators": {
    "machiavellianism": <0-100>,
    "narcissism": <0-100>,
    "psychopathy": <0-100>,
    "clusterScore": <0-100>,
    "riskLevel": "<NONE|LOW|MODERATE|HIGH|SEVERE>",
    "reasoning": "<detailed explanation>"
  },
  "mastermindProfile": {
    "detected": <true|false>,
    "symmetryPower": <0-100>,
    "calculatedPresence": <0-100>,
    "empathyGap": <0-100>,
    "profileStrength": <0-100>,
    "reasoning": "<detailed explanation>"
  },
  "overallRedFlag": {
    "score": <0-100>,
    "status": "<CLEAR|YELLOW_FLAG|ORANGE_FLAG|RED_FLAG|HARD_FAIL>",
    "primaryConcerns": ["<concern 1>", "<concern 2>"],
    "mitigatingFactors": ["<factor 1>", "<factor 2>"]
  },
  "hyperCongruenceWarning": {
    "triggered": <true|false>,
    "congruenceScore": <0-100>,
    "sfumatoDeficit": <true|false>,
    "maskOfSanityRisk": "<NONE|LOW|MODERATE|HIGH|CRITICAL>",
    "daVinciVerdict": "<Leonardo's assessment of this expression's authenticity vs perfection>"
  },
  "synthesis": "<comprehensive summary including the Sfumato assessment - is this a LIVING expression or a PERFECT MASK?>"
}

**Critical Instructions:**
- This is FORENSIC analysis, not aesthetic judgment
- Focus on INVOLUNTARY markers that cannot be consciously controlled
- A "CLEAR" status means no concerning markers detected - this is the expected result for most people
- High scores in Dark Triad indicators should be rare and based on clear visual evidence
- The Mastermind Profile is specifically: High Symmetry + High Control + Low Warmth
- Frame findings as objective behavioral mathematics, not subjective opinion
- Remember: A "Jester" archetype may show theatrical asymmetry - that's DIFFERENT from deceptive markers

**CRAIG PATCH CRITICAL INSTRUCTION:**
- A score above 96% is NOT automatically "good" - it requires SFUMATO VERIFICATION
- If all markers are near-perfect (>95%) but biological noise is low (<5%), this is HYPER_CONGRUENT
- HYPER_CONGRUENT assessment means: "This expression is geometrically perfect but biologically DEAD"
- Da Vinci's principle: "In nature, nothing is this perfect." Perfect = Artificial OR Masked
- The James Craig pattern: Perfect Duchenne + Perfect Symmetry + Zero Biological Noise = MASK OF SANITY
- When in doubt, flag perfection as suspicious rather than ideal`;

export async function runRedFlagMetricGemini(
  imageData: string,
  geminiApiKey: string,
  mediaType: MediaType = "image/jpeg",
  archetypeAnalysis?: ArchetypeAnalysis,
  firstImpressionAnalysis?: FirstImpressionAnalysis
): Promise<AgentResult> {
  const startTime = Date.now();

  try {
    // Build context from other agents if available
    let contextPrompt = RED_FLAG_METRIC_PROMPT;

    if (archetypeAnalysis || firstImpressionAnalysis) {
      contextPrompt += `\n\n**CONTEXT FROM OTHER AGENTS:**\n`;

      if (archetypeAnalysis) {
        contextPrompt += `\nArchetype Reader detected: ${archetypeAnalysis.primaryArchetype.type} (${archetypeAnalysis.primaryArchetype.confidence}% confidence)`;
        contextPrompt += `\nDominant Humour: ${archetypeAnalysis.humourProfile.dominantHumour}`;
      }

      if (firstImpressionAnalysis) {
        contextPrompt += `\nFirst Impression Snap Judgments:`;
        contextPrompt += `\n- Trust: ${firstImpressionAnalysis.snapJudgments.trust}`;
        contextPrompt += `\n- Warmth: ${firstImpressionAnalysis.snapJudgments.warmth}`;
        contextPrompt += `\n- Threat: ${firstImpressionAnalysis.snapJudgments.threat}`;
        contextPrompt += `\n- Mystery: ${firstImpressionAnalysis.snapJudgments.mystery}`;
      }

      contextPrompt += `\n\nUse this context to detect INCONGRUENCE between claimed archetype and biological markers.`;
    }

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
              { text: contextPrompt }
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
    const analysis = JSON.parse(extractJSON(sanitizedText)) as RedFlagAnalysis;

    const processingTime = Date.now() - startTime;

    return {
      agentName: "The Red Flag Metric",
      processingTime,
      confidence: calculateConfidence(analysis),
      analysis,
      status: "success"
    };
  } catch (error) {
    const processingTime = Date.now() - startTime;

    return {
      agentName: "The Red Flag Metric",
      processingTime,
      confidence: 0,
      analysis: createErrorAnalysis(),
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

function calculateConfidence(analysis: RedFlagAnalysis): number {
  // Confidence is inversely related to red flag score
  // Higher confidence means we're more certain of our assessment

  // Base confidence on the clarity of the assessment
  const redFlagScore = analysis.overallRedFlag.score;
  const duchenneClarity = Math.abs(analysis.duchenneMarkers.eyeEngagement - analysis.duchenneMarkers.mouthCurvature);
  const gazeClarity = analysis.gazeAnalysis.fixationIntensity;

  // Higher clarity in detection = higher confidence
  const clarityScore = (duchenneClarity + gazeClarity) / 2;

  // If status is CLEAR, high confidence
  // If status is RED_FLAG or HARD_FAIL, also high confidence (we're sure of the flags)
  // Moderate statuses have lower confidence (ambiguous)
  let statusMultiplier = 1.0;
  switch (analysis.overallRedFlag.status) {
    case 'CLEAR':
      statusMultiplier = 1.0;
      break;
    case 'YELLOW_FLAG':
      statusMultiplier = 0.7;
      break;
    case 'ORANGE_FLAG':
      statusMultiplier = 0.8;
      break;
    case 'RED_FLAG':
      statusMultiplier = 0.9;
      break;
    case 'HARD_FAIL':
      statusMultiplier = 1.0;
      break;
  }

  return Math.round(Math.min(100, clarityScore * statusMultiplier + 40));
}

function createErrorAnalysis(): RedFlagAnalysis {
  return {
    duchenneMarkers: {
      eyeEngagement: 0,
      mouthCurvature: 0,
      disconnect: 0,
      assessment: 'GENUINE',
      reasoning: "Analysis failed"
    },
    // CRAIG PATCH v1.0 - Sfumato Coefficient
    sfumatoCoefficient: {
      biologicalNoise: 50, // Default to middle value
      microExpressionCount: 2, // Default to normal
      expressionRigidity: 50,
      organicVariance: 50,
      sfumatoScore: 50,
      assessment: 'ORGANIC',
      reasoning: "Analysis failed - defaulting to neutral values"
    },
    asymmetryMarkers: {
      leftSideScore: 0,
      rightSideScore: 0,
      asymmetryIndex: 0,
      contemptDetected: false,
      sneerId: 'NONE',
      reasoning: "Analysis failed"
    },
    gazeAnalysis: {
      fixationIntensity: 0,
      blinkNaturalness: 0,
      scleraVisibility: 0,
      predatorStare: false,
      gazeType: 'NEUTRAL',
      reasoning: "Analysis failed"
    },
    darkTriadIndicators: {
      machiavellianism: 0,
      narcissism: 0,
      psychopathy: 0,
      clusterScore: 0,
      riskLevel: 'NONE',
      reasoning: "Analysis failed"
    },
    mastermindProfile: {
      detected: false,
      symmetryPower: 0,
      calculatedPresence: 0,
      empathyGap: 0,
      profileStrength: 0,
      reasoning: "Analysis failed"
    },
    overallRedFlag: {
      score: 0,
      status: 'CLEAR',
      primaryConcerns: [],
      mitigatingFactors: ["Analysis failed - unable to assess"]
    },
    // CRAIG PATCH v1.0 - Hyper-Congruence Warning
    hyperCongruenceWarning: {
      triggered: false,
      congruenceScore: 0,
      sfumatoDeficit: false,
      maskOfSanityRisk: 'NONE',
      daVinciVerdict: "Analysis failed - unable to assess Sfumato quality"
    },
    synthesis: "Analysis failed - unable to complete Red Flag assessment (including Craig Patch Sfumato detection)"
  };
}
