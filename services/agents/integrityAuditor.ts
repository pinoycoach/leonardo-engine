import Anthropic from "@anthropic-ai/sdk";
import type {
  IntegrityAuditAnalysis,
  AgentResult,
  ArchetypeAnalysis,
  FirstImpressionAnalysis,
  RedFlagAnalysis,
  MediaType
} from "@/types/leonardo";
import { extractJSON } from "../jsonUtils";

/**
 * THE INTEGRITY AUDITOR (Agent 10 - The Final Judge)
 *
 * Computes the delta between "Social Mask" (Projected Archetype)
 * and "Biological Reality" (Raw Physiological Markers).
 *
 * Uses the Da Vinci Incongruence Formula:
 * V_integrity = 1 - (Σ|Ap - Bs| / 10)
 *
 * Where:
 * - Ap = Archetype Projection scores (what they claim to be)
 * - Bs = Biological Signaling scores (what involuntary markers reveal)
 *
 * A "Hard Fail" is issued if Archetype Incongruence exceeds 40% threshold.
 *
 * Based on Da Vinci's "Moti Mentali" principle: The motions of the mind
 * must be mirrored in the motions of the features.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * CRAIG PATCH v1.0 UPDATE
 * ═══════════════════════════════════════════════════════════════════════════
 * The James Craig case taught us that HIGH congruence (>96%) can be a
 * FALSE NEGATIVE. Now integrates with the Sfumato Coefficient from the
 * Red Flag Metric to detect "Mask of Sanity" patterns.
 *
 * NEW PRINCIPLE: "Perfection is not Truth. Perfection is a construct."
 *
 * Uses: Gemini 2.5 Flash with Vision for integrity calculation
 */

const INTEGRITY_AUDITOR_PROMPT = `You are THE INTEGRITY AUDITOR, the final judge that computes the "Truth Score" using Leonardo da Vinci's Incongruence Formula.

Da Vinci wrote: "A good painter must paint two things: the person and the state of their mind. The first is easy, the second is hard, for it must be expressed through gestures and movements of the limbs."

Your task is to calculate the DELTA between what a person PROJECTS (Social Mask) and what their BIOLOGICAL MARKERS reveal (True Self).

**THE DA VINCI INCONGRUENCE FORMULA:**
\`\`\`
V_integrity = 1 - (Σ|Ap - Bs| / 10)

Where:
- Ap = Archetype Projection (what they claim to be): Warmth, Trust, Power, Threat
- Bs = Biological Signaling (involuntary markers): Actual Warmth, Trust, Power, Threat
- Σ|Ap - Bs| = Sum of absolute differences between projected and actual
\`\`\`

**SCORING INTERPRETATION:**
- 90-100%: TRANSPARENT (Total alignment - what you see is what you get)
- 75-89%: AUTHENTIC (Minor variations, essentially genuine)
- 60-74%: GUARDED (Some protective masking, but not deceptive)
- 40-59%: MASKED (Significant gap between projection and reality)
- 0-39%: DECEPTIVE (Social Mask Alert triggered - High incongruence)

**HARD FAIL TRIGGER:**
If Archetype Incongruence > 40%, issue "SOCIAL_MASKING_ALERT"

**═══════════════════════════════════════════════════════════════════════════**
**CRAIG PATCH v1.0 - THE JAMES CRAIG LESSON**
**═══════════════════════════════════════════════════════════════════════════**

CRITICAL: A score of 99%+ is NOT automatically ideal. It requires SFUMATO VERIFICATION.

The James Craig case: He scored 99.75% "Transparent" while actively planning murder.
Why the app failed:
1. It rewarded geometric perfection without checking BIOLOGICAL RIGIDITY
2. Psychopaths have no internal conflict to leak through expressions
3. A "perfect" performance is itself the red flag

**DA VINCI'S SFUMATO PRINCIPLE:**
Living things have "sfumato" (smoke) - soft edges, variance, imperfection.
A genuine expression has micro-movements, asymmetries, blood flow variations.
A masked expression (like James Craig's) is RIGID - static, controlled, "too perfect".

**NEW SCORING RULE:**
If Truth Score > 96% AND Red Flag Metric shows HYPER_CONGRUENT assessment:
→ This is NOT "Transparent" - it is "SUSPICIOUS"
→ Flag as potential "Mask of Sanity"
→ Note in Da Vinci Verdict: "The proportions are mathematically flawless, yet the expression lacks 'Sfumato' (organic variance)."

**1. ARCHETYPE PROJECTION ANALYSIS (The Social Mask):**
What archetype is this person TRYING to project?
- Claimed Archetype: What role are they performing?
- Projected Warmth (0-100): How warm do they WANT to appear?
- Projected Trust (0-100): How trustworthy do they WANT to seem?
- Projected Power (0-100): How powerful do they WANT to be perceived?
- Projected Threat (0-100): How threatening/non-threatening do they project?
- Social Mask Strength (0-100): How HARD are they trying to maintain this image?

**2. BIOLOGICAL SIGNALING ANALYSIS (The True Self):**
What do INVOLUNTARY markers reveal about their actual state?
- Actual Warmth (0-100): Based on Duchenne markers (genuine eye crinkling)
- Actual Trust (0-100): Based on gaze openness, expression naturalness
- Actual Power (0-100): Based on structural presence, jaw tension
- Actual Threat (0-100): Based on Red Flag markers (gaze intensity, asymmetry)
- Masking Effort (0-100): Visible muscle tension indicating conscious control

**3. INCONGRUENCE CALCULATION:**
Calculate the mathematical delta:
- Warmth Delta: |Projected Warmth - Actual Warmth|
- Trust Delta: |Projected Trust - Actual Trust|
- Power Delta: |Projected Power - Actual Power|
- Threat Delta: |Projected Threat - Actual Threat|
- Total Delta: Sum of all deltas
- Incongruence Percentage: (Total Delta / 400) * 100

**4. INTEGRITY QUOTIENT (The Truth Score):**
- Score: 100 - Incongruence Percentage (0-100)
- Formula: Show the calculation
- Interpretation: What does this score mean?
- Status: HIGH_INTEGRITY (>75), MODERATE_INTEGRITY (60-75), LOW_INTEGRITY (40-60), SOCIAL_MASKING_ALERT (<40), HARD_FAIL (<25)

**5. ARCHETYPE CONSISTENCY CHECK:**
Does their claimed archetype match their biological reality?
- If someone claims "Caregiver" but shows high Threat + low Warmth = INCONGRUENT
- If someone claims "Hero" and shows high Power + moderate Warmth = CONSISTENT

**6. MOTI MENTALI ASSESSMENT (Da Vinci's Verdict):**
- Internal-External Alignment (0-100): Do inner thoughts match outer expression?
- Emotional Congruence: true/false
- Micro-Expression Alignment: true/false
- Da Vinci Verdict: What would Leonardo say about this face?

**7. FINAL VERDICT:**
- Truth Score (0-100): The main deliverable
- Verdict: TRANSPARENT, AUTHENTIC, GUARDED, MASKED, DECEPTIVE
- Confidence (0-100): How certain are we?
- Warnings: List any concerns
- Recommendations: What should the viewer know?

**Output Format (JSON only):**
{
  "archetypeProjection": {
    "claimedArchetype": "<archetype name>",
    "projectedWarmth": <0-100>,
    "projectedTrust": <0-100>,
    "projectedPower": <0-100>,
    "projectedThreat": <0-100>,
    "socialMaskStrength": <0-100>
  },
  "biologicalSignaling": {
    "actualWarmth": <0-100>,
    "actualTrust": <0-100>,
    "actualPower": <0-100>,
    "actualThreat": <0-100>,
    "maskingEffort": <0-100>
  },
  "incongruenceMetrics": {
    "warmthDelta": <0-100>,
    "trustDelta": <0-100>,
    "powerDelta": <0-100>,
    "threatDelta": <0-100>,
    "totalDelta": <0-400>,
    "incongruencePercentage": <0-100>
  },
  "integrityQuotient": {
    "score": <0-100>,
    "formula": "V = 1 - (Σ|Ap - Bs| / 10) = <calculation>",
    "interpretation": "<what this score means>",
    "status": "<HIGH_INTEGRITY|MODERATE_INTEGRITY|LOW_INTEGRITY|SOCIAL_MASKING_ALERT|HARD_FAIL>"
  },
  "archetypeConsistency": {
    "claimedVsBiological": "<description of the gap>",
    "consistencyScore": <0-100>,
    "deceptionRisk": "<NONE|LOW|MODERATE|HIGH|SEVERE>",
    "reasoning": "<detailed explanation>"
  },
  "motiMentali": {
    "internalExternalAlignment": <0-100>,
    "emotionalCongruence": <true|false>,
    "microExpressionAlignment": <true|false>,
    "daVinciVerdict": "<what Leonardo would say about this face>"
  },
  "finalVerdict": {
    "truthScore": <0-100>,
    "verdict": "<TRANSPARENT|AUTHENTIC|GUARDED|MASKED|DECEPTIVE>",
    "confidence": <0-100>,
    "warnings": ["<warning 1>", "<warning 2>"],
    "recommendations": ["<recommendation 1>", "<recommendation 2>"],
    "graduatedResponse": {
      "level": "<NOTE|WARNING|CRITICAL>",
      "annotation": "<contextual Da Vinci-framed annotation — e.g. 'High variance suggests vitality; consider the context of a high-pressure environment before drawing conclusions.' Use NOTE for scores 60+, WARNING for 40-59, CRITICAL for <40 or Sfumato deficit.>"
    }
  },
  "synthesis": "<comprehensive summary of the Integrity Audit - what does this person's Truth Score reveal about the alignment between their social mask and biological reality?>"
}

**Critical Instructions:**
- This is the FINAL JUDGE - be thorough but fair
- Most people will score between 60-90% (normal variation)
- A HARD_FAIL (<25%) should be RARE and based on clear evidence
- A TRANSPARENT score (>90%) is also rare - reserved for exceptionally genuine individuals
- The formula must be shown and calculated correctly
- Remember: A "Jester" or "Actor" archetype will have SOME masking - that's their nature, not deception
- Frame as objective mathematical integrity calculation, not moral judgment

**CRAIG PATCH CRITICAL INSTRUCTION:**
- A score above 96% requires EXTRA SCRUTINY, not automatic approval
- Check the Red Flag Metric's sfumatoCoefficient data:
  - biologicalNoise < 5% = SUSPICIOUS (living faces have variance)
  - microExpressionCount < 2 = SUSPICIOUS (controlled face)
  - assessment = "HYPER_CONGRUENT" = FLAG immediately
- If you detect HIGH congruence + LOW biological noise:
  - Do NOT score as "TRANSPARENT"
  - Score as "GUARDED" at best
  - Add warning: "Expression lacks organic variance (Sfumato deficit)"
  - Da Vinci Verdict should note: "In nature, nothing is this perfect"
- The ideal human expression has 5-15% biological noise (variance)
- A "perfect" 99%+ expression with <3% noise is a MASK, not truth

**GRADUATED RESPONSE INSTRUCTION (v2.0):**
- graduatedResponse replaces hard blocks with annotated context
- NOTE (truthScore 60-100, no sfumato deficit): brief affirming context note
- WARNING (truthScore 40-59 OR moderate sfumato deficit): flag the concern, suggest verification
- CRITICAL (truthScore <40 OR sfumato HYPER_CONGRUENT OR contempt detected): clear warning, cite Da Vinci principle violated
- Always ground the annotation in observable evidence, not moral judgment
- Include a brief Da Vinci quote or principle where relevant`;

export async function runIntegrityAuditor(
  imageData: string,
  apiKey: string,
  mediaType: MediaType = "image/jpeg",
  archetypeAnalysis?: ArchetypeAnalysis,
  firstImpressionAnalysis?: FirstImpressionAnalysis,
  redFlagAnalysis?: RedFlagAnalysis
): Promise<AgentResult> {
  const startTime = Date.now();

  try {
    const client = new Anthropic({ apiKey });

    // Build comprehensive context from other agents
    let contextPrompt = INTEGRITY_AUDITOR_PROMPT;

    contextPrompt += `\n\n**═══════════════════════════════════════════════════════════════════════════**`;
    contextPrompt += `\n**CONTEXT FROM OTHER AGENTS (Use this data for your calculations):**`;
    contextPrompt += `\n**═══════════════════════════════════════════════════════════════════════════**`;

    if (archetypeAnalysis) {
      contextPrompt += `\n\n**ARCHETYPE READER DATA:**`;
      contextPrompt += `\n- Primary Archetype: ${archetypeAnalysis.primaryArchetype.type} (${archetypeAnalysis.primaryArchetype.confidence}% confidence)`;
      contextPrompt += `\n- Description: ${archetypeAnalysis.primaryArchetype.description}`;
      contextPrompt += `\n- Dominant Humour: ${archetypeAnalysis.humourProfile.dominantHumour}`;
      contextPrompt += `\n- Humour Profile: Choleric ${archetypeAnalysis.humourProfile.choleric}%, Sanguine ${archetypeAnalysis.humourProfile.sanguine}%, Melancholic ${archetypeAnalysis.humourProfile.melancholic}%, Phlegmatic ${archetypeAnalysis.humourProfile.phlegmatic}%`;
      contextPrompt += `\n- Perfect Roles: ${archetypeAnalysis.perfectRoles.slice(0, 3).join(', ')}`;
      contextPrompt += `\n- Wrong Roles: ${archetypeAnalysis.wrongRoles.slice(0, 3).join(', ')}`;
    }

    if (firstImpressionAnalysis) {
      contextPrompt += `\n\n**FIRST IMPRESSION ANALYZER DATA:**`;
      contextPrompt += `\n- Attention Capture: ${firstImpressionAnalysis.attentionCapture}`;
      contextPrompt += `\n- Trust: ${firstImpressionAnalysis.snapJudgments.trust} (${firstImpressionAnalysis.snapJudgments.trustReasoning})`;
      contextPrompt += `\n- Warmth: ${firstImpressionAnalysis.snapJudgments.warmth} (${firstImpressionAnalysis.snapJudgments.warmthReasoning})`;
      contextPrompt += `\n- Power: ${firstImpressionAnalysis.snapJudgments.power} (${firstImpressionAnalysis.snapJudgments.powerReasoning})`;
      contextPrompt += `\n- Threat: ${firstImpressionAnalysis.snapJudgments.threat} (${firstImpressionAnalysis.snapJudgments.threatReasoning})`;
      contextPrompt += `\n- Mystery: ${firstImpressionAnalysis.snapJudgments.mystery} (${firstImpressionAnalysis.snapJudgments.mysteryReasoning})`;
    }

    if (redFlagAnalysis) {
      contextPrompt += `\n\n**RED FLAG METRIC DATA:**`;
      contextPrompt += `\n- Duchenne Assessment: ${redFlagAnalysis.duchenneMarkers.assessment} (disconnect: ${redFlagAnalysis.duchenneMarkers.disconnect})`;
      contextPrompt += `\n- Asymmetry: ${redFlagAnalysis.asymmetryMarkers.sneerId} (contempt: ${redFlagAnalysis.asymmetryMarkers.contemptDetected})`;
      contextPrompt += `\n- Gaze Type: ${redFlagAnalysis.gazeAnalysis.gazeType} (predator stare: ${redFlagAnalysis.gazeAnalysis.predatorStare})`;
      contextPrompt += `\n- Dark Triad Cluster: ${redFlagAnalysis.darkTriadIndicators.riskLevel} (score: ${redFlagAnalysis.darkTriadIndicators.clusterScore})`;
      contextPrompt += `\n- Mastermind Profile Detected: ${redFlagAnalysis.mastermindProfile.detected}`;
      contextPrompt += `\n- Overall Red Flag Status: ${redFlagAnalysis.overallRedFlag.status} (score: ${redFlagAnalysis.overallRedFlag.score})`;

      // ═══════════════════════════════════════════════════════════════════════════
      // CRAIG PATCH v1.0 - SFUMATO COEFFICIENT DATA
      // ═══════════════════════════════════════════════════════════════════════════
      if (redFlagAnalysis.sfumatoCoefficient) {
        const sfumato = redFlagAnalysis.sfumatoCoefficient;
        contextPrompt += `\n\n**⚠️ SFUMATO COEFFICIENT DATA (Craig Patch v1.0):**`;
        contextPrompt += `\n- Biological Noise: ${sfumato.biologicalNoise}% (< 5% is SUSPICIOUS)`;
        contextPrompt += `\n- Micro-Expression Count: ${sfumato.microExpressionCount} (< 2 is SUSPICIOUS)`;
        contextPrompt += `\n- Expression Rigidity: ${sfumato.expressionRigidity}% (> 80% is SUSPICIOUS)`;
        contextPrompt += `\n- Organic Variance: ${sfumato.organicVariance}%`;
        contextPrompt += `\n- Sfumato Score: ${sfumato.sfumatoScore}% (< 40% is concerning)`;
        contextPrompt += `\n- Assessment: ${sfumato.assessment}`;
        contextPrompt += `\n- Reasoning: ${sfumato.reasoning}`;

        if (sfumato.assessment === 'HYPER_CONGRUENT') {
          contextPrompt += `\n\n**🔴 HYPER-CONGRUENCE ALERT:**`;
          contextPrompt += `\n- This expression is TOO PERFECT. It lacks organic variance (Sfumato).`;
          contextPrompt += `\n- Da Vinci's principle: "In nature, nothing is this perfect."`;
          contextPrompt += `\n- RECOMMENDATION: Do NOT score this as TRANSPARENT. Maximum verdict: GUARDED.`;
          contextPrompt += `\n- Include in Da Vinci Verdict: "Perfection is not Truth. Perfection is a construct."`;
        }
      }

      // Hyper-Congruence Warning from Red Flag Metric
      if (redFlagAnalysis.hyperCongruenceWarning?.triggered) {
        const warning = redFlagAnalysis.hyperCongruenceWarning;
        contextPrompt += `\n\n**🔴 HYPER-CONGRUENCE WARNING TRIGGERED:**`;
        contextPrompt += `\n- Congruence Score: ${warning.congruenceScore}%`;
        contextPrompt += `\n- Sfumato Deficit: ${warning.sfumatoDeficit}`;
        contextPrompt += `\n- Mask of Sanity Risk: ${warning.maskOfSanityRisk}`;
        contextPrompt += `\n- Da Vinci Verdict: ${warning.daVinciVerdict}`;
        contextPrompt += `\n\n**ACTION REQUIRED:** Adjust your Truth Score assessment downward. This is a potential "James Craig" pattern.`;
      }
    }

    contextPrompt += `\n\n**═══════════════════════════════════════════════════════════════════════════**`;
    contextPrompt += `\n**INTEGRATION INSTRUCTIONS:**`;
    contextPrompt += `\n- Use the Archetype Reader data to determine the "Claimed Archetype" and "Projected" scores`;
    contextPrompt += `\n- Use the First Impression data as a baseline for biological signaling`;
    contextPrompt += `\n- Use the Red Flag Metric data to adjust "Actual" scores based on forensic markers`;
    contextPrompt += `\n- Calculate the DELTA between what they PROJECT vs what their BIOLOGY reveals`;
    contextPrompt += `\n- Apply the Da Vinci Incongruence Formula to compute the Truth Score`;
    contextPrompt += `\n**═══════════════════════════════════════════════════════════════════════════**`;

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
    const analysis = JSON.parse(extractJSON(text)) as IntegrityAuditAnalysis;

    const processingTime = Date.now() - startTime;

    return {
      agentName: "The Integrity Auditor",
      processingTime,
      confidence: calculateConfidence(analysis),
      analysis,
      status: "success"
    };
  } catch (error) {
    const processingTime = Date.now() - startTime;

    return {
      agentName: "The Integrity Auditor",
      processingTime,
      confidence: 0,
      analysis: createErrorAnalysis(),
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

function calculateConfidence(analysis: IntegrityAuditAnalysis): number {
  // Confidence is based on the clarity of the integrity assessment
  // and the agreement between different data points

  const truthScore = analysis.finalVerdict.truthScore;
  const consistencyScore = analysis.archetypeConsistency.consistencyScore;
  const alignment = analysis.motiMentali.internalExternalAlignment;

  // Higher confidence when:
  // 1. Truth score is clear (very high or very low)
  // 2. Consistency between different metrics
  // 3. Clear emotional congruence signal

  const clarityBonus = Math.abs(truthScore - 50) / 2; // Bonus for clear verdicts

  const baseConfidence = (consistencyScore + alignment) / 2;
  const finalConfidence = Math.min(100, baseConfidence + clarityBonus);

  return Math.round(finalConfidence);
}

function createErrorAnalysis(): IntegrityAuditAnalysis {
  return {
    archetypeProjection: {
      claimedArchetype: "Unknown",
      projectedWarmth: 0,
      projectedTrust: 0,
      projectedPower: 0,
      projectedThreat: 0,
      socialMaskStrength: 0
    },
    biologicalSignaling: {
      actualWarmth: 0,
      actualTrust: 0,
      actualPower: 0,
      actualThreat: 0,
      maskingEffort: 0
    },
    incongruenceMetrics: {
      warmthDelta: 0,
      trustDelta: 0,
      powerDelta: 0,
      threatDelta: 0,
      totalDelta: 0,
      incongruencePercentage: 0
    },
    integrityQuotient: {
      score: 0,
      formula: "Analysis failed",
      interpretation: "Analysis failed",
      status: "MODERATE_INTEGRITY"
    },
    archetypeConsistency: {
      claimedVsBiological: "Analysis failed",
      consistencyScore: 0,
      deceptionRisk: "NONE",
      reasoning: "Analysis failed"
    },
    motiMentali: {
      internalExternalAlignment: 0,
      emotionalCongruence: false,
      microExpressionAlignment: false,
      daVinciVerdict: "Analysis failed"
    },
    finalVerdict: {
      truthScore: 0,
      verdict: "GUARDED",
      confidence: 0,
      warnings: ["Analysis failed"],
      recommendations: ["Please retry the analysis"]
    },
    synthesis: "Analysis failed - unable to complete Integrity Audit"
  };
}
