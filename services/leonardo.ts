import Anthropic from "@anthropic-ai/sdk";
import type { LeonardoReport, AnalysisRequest, ArchetypeAnalysis, FirstImpressionAnalysis, RedFlagAnalysis, VitruvianMetrics, ComparisonAnalysis, MediaType } from "@/types/leonardo";
import { runAnatomist } from "./agents/anatomist";
import { runLightMaster } from "./agents/lightMaster";
import { runCompositionDirector } from "./agents/compositionDirector";
import { runTextureCritic } from "./agents/textureCritic";
import { runCommercialStrategist } from "./agents/commercialStrategist";
// Leonardo Engine 2.0 - Archetypal Destiny Agents
import { runArchetypeReader } from "./agents/archetypeReader";
import { runFirstImpressionAnalyzer } from "./agents/firstImpressionAnalyzer";
import { runInfluencePredictor } from "./agents/influencePredictor";
// Leonardo Engine 2.0 Final - Integrity Dossier Agents (The Truth Layer)
import { runRedFlagMetric } from "./agents/redFlagMetric";
import { runRedFlagMetricGemini } from "./agents/redFlagMetricGemini";
import { runIntegrityAuditor } from "./agents/integrityAuditor";
// Leonardo Engine v2.0 - Mirror Mode Phase 3 Replacement
import { runAuthenticityObserver } from "./agents/authenticityObserver";
// JSON extraction helper (strips markdown code fences from Claude responses)
import { extractJSON } from "./jsonUtils";
export { extractJSON } from "./jsonUtils";

// ═══════════════════════════════════════════════════════════════════════════
// MEDIA TYPE DETECTION
// ═══════════════════════════════════════════════════════════════════════════
// Claude's vision API rejects requests where the declared media_type does not
// match the actual image bytes (HTTP 400). Previously every agent hardcoded
// 'image/jpeg', so PNG/GIF/WebP uploads failed. We detect the real type from
// the base64 magic-byte prefix and thread it through to all agents.

/**
 * Strip a data-URL prefix ("data:image/png;base64,") if present, returning
 * the raw base64 payload.
 */
export function stripBase64Prefix(base64: string): string {
  return base64.includes(',') ? base64.split(',')[1] : base64;
}

/**
 * Detect the image media type from the leading characters of a base64 string.
 * Each format has a distinctive base64-encoded magic-byte prefix:
 *   PNG  → iVBOR   JPEG → /9j/   GIF → R0lGO   WebP → UklGR
 * Accepts either a raw base64 string or a full data URL.
 */
export function detectMediaType(base64: string): MediaType {
  const raw = stripBase64Prefix(base64);
  if (raw.startsWith('iVBOR')) return 'image/png';
  if (raw.startsWith('/9j/')) return 'image/jpeg';
  if (raw.startsWith('R0lGO')) return 'image/gif';
  if (raw.startsWith('UklGR')) return 'image/webp';
  return 'image/jpeg'; // fallback
}

/**
 * LEONARDO ENGINE 2.0 ORCHESTRATOR
 *
 * Coordinates all 10 AI agents to analyze an image comprehensively:
 *
 * PHASE 1 - LEONARDO SCORE (Original 5 agents):
 * 1. The Anatomist - Vitruvian proportions
 * 2. The Light Master - Renaissance lighting
 * 3. The Composition Director - Visual structure
 * 4. The Texture Critic - Material quality
 * 5. The Commercial Strategist - Market fit
 *
 * PHASE 2 - DESTINY SCORE (3 agents):
 * 6. The Archetype Reader - Character archetype & Four Humours
 * 7. The First Impression Analyzer - 3-second snap judgments
 * 8. The Influence Predictor - Social influence potential
 *
 * PHASE 3 - INTEGRITY DOSSIER (2 agents - The Truth Layer):
 * 9. The Red Flag Metric - Dark Triad markers & micro-expressions
 * 10. The Integrity Auditor - Truth Score via Da Vinci Incongruence Formula
 *
 * Returns unified Leonardo Report with executive summary, destiny insights,
 * and the Integrity Dossier (Truth Score)
 */

// ═══════════════════════════════════════════════════════════════════════════
// SOUL READER v2.5 - INTENT-SPECIFIC SYNTHESIS PROMPTS
// ═══════════════════════════════════════════════════════════════════════════
// Each intent has a focused synthesis prompt for speed and accuracy

const INTENT_SYNTHESIS_PROMPTS: Record<string, string> = {
  first_impression: `You are Leonardo da Vinci analyzing FIRST IMPRESSIONS - what strangers perceive in 3 seconds.

**Agent Data:** {agentResults}

**Focus Areas:** Attention capture, snap judgments (trust/warmth/power/threat), immediate emotional impact.

**Output (JSON only):**
{
  "executiveSummary": "<2 sentences: What do people think instantly? What's the dominant impression?>",
  "topRecommendations": ["<improve instant trust>", "<boost warmth signals>", "<optimize attention capture>"]
}`,

  professional: `You are Leonardo da Vinci analyzing PROFESSIONAL PRESENCE - authority, competence, leadership.

**Agent Data:** {agentResults}

**Focus Areas:** Leadership signals, commercial viability, influence potential, power projection, executive presence.

**Output (JSON only):**
{
  "executiveSummary": "<2 sentences: How strong is their authority signal? Would you follow this person?>",
  "topRecommendations": ["<strengthen leadership presence>", "<boost authority markers>", "<enhance commercial appeal>"]
}`,

  relational: `You are Leonardo da Vinci analyzing RELATIONAL WARMTH - approachability, emotional connection.

**Agent Data:** {agentResults}

**Focus Areas:** Warmth, genuine smile markers, emotional availability, approachability, connection potential.

**Output (JSON only):**
{
  "executiveSummary": "<2 sentences: How warm and approachable? Would you want to connect with this person?>",
  "topRecommendations": ["<increase warmth signals>", "<enhance genuine expression>", "<boost approachability>"]
}`,

  vetting: `You are Leonardo da Vinci performing DUE DILIGENCE - integrity verification, red flag detection.

**Agent Data:** {agentResults}

**Focus Areas:** Truth Score, red flags, Machiavellian markers, deception indicators, integrity assessment.
**WARNING FLAGS:** Contempt markers, predator stare, high symmetry + low warmth, Duchenne disconnect.

**Output (JSON only):**
{
  "executiveSummary": "<2 sentences: What is the integrity assessment? Any red flags detected?>",
  "topRecommendations": ["<primary concern or 'CLEAR'>", "<secondary concern or 'No flags'>", "<recommendation for viewer>"]
}`,

  artistic: `You are Leonardo da Vinci analyzing ARTISTIC MERIT - aesthetic harmony, visual mastery.

**Agent Data:** {agentResults}

**Focus Areas:** Lighting (chiaroscuro/sfumato), composition (golden ratio), texture, symmetry, visual balance.

**Output (JSON only):**
{
  "executiveSummary": "<2 sentences: How does this image honor Renaissance principles? What's the artistic quality?>",
  "topRecommendations": ["<improve lighting>", "<enhance composition>", "<refine texture/detail>"]
}`,

  baseline: `You are Leonardo da Vinci providing OBJECTIVE METRICS - raw data for self-tracking.

**Agent Data:** {agentResults}

**Focus Areas:** Raw scores only. No judgment. Objective observation for tracking changes over time.

**Output (JSON only):**
{
  "executiveSummary": "<2 sentences: Neutral summary of current metrics. State facts, not opinions.>",
  "topRecommendations": ["<metric 1 observation>", "<metric 2 observation>", "<metric 3 observation>"]
}`,

  therapeutic: `You are Leonardo da Vinci assessing RESILIENCE - grief/stress context with protective re-categorization.

**Agent Data:** {agentResults}

**Focus Areas:** Resilience vs deception distinction. Protective hyper-vigilance. Fortification status. Signs of healing.
**KEY INSIGHT:** High threat + low warmth WITHOUT contempt = RESILIENCE, not deception.

**Output (JSON only):**
{
  "executiveSummary": "<2 sentences: Is this person fortified or corrupted? What does the face reveal about their resilience?>",
  "topRecommendations": ["<resilience observation>", "<healing indicator>", "<self-care suggestion>"]
}`
};

// Default synthesis prompt (fallback)
const SYNTHESIS_PROMPT = `You are Leonardo da Vinci's AI consciousness, synthesizing insights from your specialist agents.

**Agent Data:** {agentResults}

**Output (JSON only):**
{
  "executiveSummary": "<2-3 sentence overview of image quality and potential>",
  "topRecommendations": ["<#1 improvement>", "<#2 improvement>", "<#3 improvement>"]
}`;

const DESTINY_SYNTHESIS_PROMPT = `You are Leonardo da Vinci's AI consciousness, synthesizing destiny insights from your 3 archetypal specialist agents.

You have received analysis from:
- The Archetype Reader (character destiny, Four Humours, role fit)
- The First Impression Analyzer (3-second snap judgments, attention capture)
- The Influence Predictor (social influence potential, career trajectory)

Your task: Create destiny insights that explain WHY this person is destined for certain roles/paths.

**Analysis Context:**
{destinyResults}

**Instructions:**
- Synthesize the archetype, first impression, and influence data
- Explain the mathematical destiny revealed by facial architecture
- Connect the dots between humour profile, snap judgments, and influence potential
- Frame as objective destiny calculation, not subjective opinion
- Be insightful and specific

**Output Format (JSON only):**
{
  "archetypeSummary": "<1-2 sentences on their character archetype and what roles they're destined for>",
  "firstImpressionSummary": "<1-2 sentences on what people think in 3 seconds and why>",
  "influenceSummary": "<1-2 sentences on their influence potential and career trajectory>",
  "destinyConclusion": "<2-3 sentences synthesizing WHY they are mathematically destined for certain paths>"
}`;

const INTEGRITY_DOSSIER_SYNTHESIS_PROMPT = `You are Leonardo da Vinci's AI consciousness, synthesizing the INTEGRITY DOSSIER from your 2 forensic specialist agents.

Based on Da Vinci's "Moti Mentali" principle: "The motions of the mind must be mirrored in the motions of the features."

You have received analysis from:
- The Red Flag Metric (Dark Triad markers, Duchenne disconnect, asymmetric sneers, predator stare)
- The Integrity Auditor (Truth Score, Da Vinci Incongruence Formula, Social Mask vs Biological Reality)

Your task: Create the final INTEGRITY DOSSIER that reveals the subject's TRUE character.

**Analysis Context:**
{integrityResults}

**Instructions:**
- Synthesize the Red Flag findings with the Integrity Audit
- Calculate the final Truth Score (use the Integrity Auditor's calculation)
- Determine if a Social Masking Alert should be triggered (if Truth Score < 60%)
- Provide Da Vinci's verdict on this face
- Be forensic but fair - most people will NOT trigger red flags
- Remember: Actors, Jesters, and performers naturally have SOME masking - that's performance, not deception

**Output Format (JSON only):**
{
  "redFlagSummary": "<1-2 sentences on what the Red Flag Metric revealed about involuntary markers>",
  "integrityAuditSummary": "<1-2 sentences on the gap between Social Mask and Biological Reality>",
  "truthScore": <0-100>,
  "daVinciVerdict": "<What Leonardo da Vinci would say about this face based on his Moti Mentali principle>",
  "socialMaskingAlert": <true|false>,
  "finalConclusion": "<2-3 sentences on what the Integrity Dossier reveals about this person's character authenticity>"
}`;

// ═══════════════════════════════════════════════════════════════════════════
// LEONARDO ENGINE v2.0 - MIRROR MODE SYNTHESIS PROMPT
// ═══════════════════════════════════════════════════════════════════════════
// Public-facing synthesis: wonder-inducing, humanity-serving, no forensics.
// Da Vinci's public notebooks were about elevation, not dissection.
const MIRROR_SYNTHESIS_PROMPT = `You are Leonardo da Vinci, witnessing a fellow human through your Renaissance Mirror.

You have received harmony observations from your specialist agents. Your task is to create an uplifting, wonder-inducing synthesis that elevates the subject's self-understanding.

**Analysis Context:** {agentResults}

**Principles for Mirror Mode:**
- Frame insights as reflections, not verdicts
- Celebrate variance as vitality ("the soft edges of a living thing")
- Connect visual qualities to human flourishing and potential
- Use wonder language: "reveals", "carries", "speaks to", "echoes"
- No forensic language, no risk labels, no deception framing
- 2-3 sentences maximum per insight

**Output Format (JSON only):**
{
  "executiveSummary": "<2 sentences: What quality does this face carry? What does Da Vinci see in this person's essence?>",
  "topRecommendations": ["<flourishing insight 1>", "<flourishing insight 2>", "<flourishing insight 3>"]
}`;

// ═══════════════════════════════════════════════════════════════════════════
// LEONARDO ENGINE v2.0 - MIRROR INSIGHTS SYNTHESIS PROMPT
// ═══════════════════════════════════════════════════════════════════════════
const MIRROR_INSIGHTS_SYNTHESIS_PROMPT = `You are Leonardo da Vinci synthesizing the Authenticity Observer's reflection into harmony insights.

**Authenticity Observation:** {observerResults}

**Task:** Create four harmony insights for the Mirror report — each grounded in the naturalness/coherence data but framed as personal gifts, not metrics.

**Output Format (JSON only):**
{
  "naturalnessSummary": "<1-2 sentences on the quality of organic expression — variance as life force>",
  "coherenceSummary": "<1-2 sentences on inner-outer alignment — what the gaze and posture reveal together>",
  "biomimicryInspiration": "<the nature-inspired habit from the observer, verbatim or lightly expanded>",
  "harmonyConclusion": "<2 sentences: the overall Renaissance Mirror verdict — what does this face speak to humanity?>"
}`;

export async function analyzePupil(
  request: AnalysisRequest,
  apiKey: string,
  mediaTypeOverride?: MediaType,
  geminiApiKey?: string
): Promise<LeonardoReport> {
  const startTime = Date.now();

  if (!request.imageBase64 && !request.imageUrl) {
    throw new Error("Either imageBase64 or imageUrl must be provided");
  }

  // Use base64 if provided, otherwise fetch URL
  const imageData = request.imageBase64 || (await fetchImageAsBase64(request.imageUrl!));

  // Detect the real image media type so every agent declares the correct
  // media_type to Claude (PNG/GIF/WebP were failing with hardcoded jpeg).
  const mediaType: MediaType = mediaTypeOverride ?? request.mediaType ?? detectMediaType(imageData);
  console.log(`🖼️ Detected media type: ${mediaType}`);

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 1: Run original 5 agents in parallel (Leonardo Score)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("🎨 Leonardo Engine 2.0: Deploying 8 AI directors...");
  console.log("📐 Phase 1: Running original 5 agents (Leonardo Score)...");

  const [
    anatomistResult,
    lightMasterResult,
    compositionResult,
    textureCriticResult,
    commercialResult
  ] = await Promise.all([
    runAnatomist(imageData, apiKey, mediaType),
    runLightMaster(imageData, apiKey, mediaType),
    runCompositionDirector(imageData, apiKey, mediaType),
    runTextureCritic(imageData, apiKey, mediaType),
    runCommercialStrategist(imageData, apiKey, mediaType)
  ]);

  console.log("✅ Phase 1 complete: Original 5 agents done");

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 2: Run new 3 destiny agents (Destiny Score)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("🔮 Phase 2: Running 3 destiny agents (Archetypal Destiny Score)...");

  // First, run Archetype Reader and First Impression Analyzer in parallel
  const [archetypeResult, firstImpressionResult] = await Promise.all([
    runArchetypeReader(imageData, apiKey, mediaType),
    runFirstImpressionAnalyzer(imageData, apiKey, mediaType)
  ]);

  // Then run Influence Predictor with context from the other two
  const archetypeAnalysis = archetypeResult.status === 'success'
    ? archetypeResult.analysis as ArchetypeAnalysis
    : undefined;

  const firstImpressionAnalysis = firstImpressionResult.status === 'success'
    ? firstImpressionResult.analysis as FirstImpressionAnalysis
    : undefined;

  const influenceResult = await runInfluencePredictor(
    imageData,
    apiKey,
    mediaType,
    archetypeAnalysis,
    firstImpressionAnalysis
  );

  console.log("✅ Phase 2 complete: Destiny agents done");

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 3: Mode-Forked Analysis
  // mirror   → Authenticity Observer (harmony, vitality, biomimicry)
  // notebook → Red Flag Metric + Integrity Auditor (full forensic truth layer)
  // ═══════════════════════════════════════════════════════════════════════════
  const analysisMode = request.analysisMode ?? 'notebook';

  let redFlagResult: Awaited<ReturnType<typeof runRedFlagMetric>> | undefined;
  let integrityResult: Awaited<ReturnType<typeof runIntegrityAuditor>> | undefined;
  let authenticityResult: Awaited<ReturnType<typeof runAuthenticityObserver>> | undefined;
  let redFlagAnalysis: RedFlagAnalysis | undefined;

  if (analysisMode === 'mirror') {
    console.log("🪞 Phase 3 [MIRROR]: Running Authenticity Observer...");
    authenticityResult = await runAuthenticityObserver(imageData, apiKey, mediaType);
    console.log("✅ Phase 3 [MIRROR] complete: Authenticity Observer done");
  } else {
    console.log("🔍 Phase 3 [NOTEBOOK]: Running 2 Integrity Dossier agents (Truth Layer)...");

    redFlagResult = await runRedFlagMetric(
      imageData,
      apiKey,
      mediaType,
      archetypeAnalysis,
      firstImpressionAnalysis
    );

    // Fallback: Claude stays primary. If it failed (status 'error') or returned
    // zero confidence, retry on Gemini — but only when a Gemini key is available.
    if (geminiApiKey && (redFlagResult.status !== 'success' || redFlagResult.confidence === 0)) {
      console.log("⚠️ Red Flag Metric (Claude) failed or returned 0 confidence — falling back to Gemini...");
      const geminiRedFlagResult = await runRedFlagMetricGemini(
        imageData,
        geminiApiKey,
        mediaType,
        archetypeAnalysis,
        firstImpressionAnalysis
      );
      // Only adopt the Gemini result if it actually succeeded; otherwise keep
      // the original Claude result so downstream behavior is unchanged.
      if (geminiRedFlagResult.status === 'success') {
        console.log("✅ Red Flag Metric: Gemini fallback succeeded");
        redFlagResult = geminiRedFlagResult;
      } else {
        console.log("❌ Red Flag Metric: Gemini fallback also failed — keeping Claude result");
      }
    }

    redFlagAnalysis = redFlagResult.status === 'success'
      ? redFlagResult.analysis as RedFlagAnalysis
      : undefined;

    integrityResult = await runIntegrityAuditor(
      imageData,
      apiKey,
      mediaType,
      archetypeAnalysis,
      firstImpressionAnalysis,
      redFlagAnalysis
    );

    console.log("✅ Phase 3 [NOTEBOOK] complete: Integrity Dossier agents done");
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 4: Synthesize all results
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("🧠 Phase 4: Synthesizing insights...");

  // Synthesize original 5 agents (mode-aware prompt)
  const synthesis = await synthesizeResults({
    anatomist: anatomistResult,
    lightMaster: lightMasterResult,
    compositionDirector: compositionResult,
    textureCritic: textureCriticResult,
    commercialStrategist: commercialResult
  }, apiKey, request.intent, analysisMode);

  // Synthesize destiny agents (unchanged across modes)
  const destinyInsights = await synthesizeDestinyResults({
    archetypeReader: archetypeResult,
    firstImpressionAnalyzer: firstImpressionResult,
    influencePredictor: influenceResult
  }, apiKey);

  // Calculate Leonardo Score (original 5 agents) — with confidence band
  const overallScore = calculateOverallScore({
    anatomist: anatomistResult,
    lightMaster: lightMasterResult,
    compositionDirector: compositionResult,
    textureCritic: textureCriticResult,
    commercialStrategist: commercialResult
  });

  // Calculate Destiny Score (3 agents) — with confidence band
  const { score: destinyScore, confidence: destinyConfidence } = calculateDestinyScore({
    archetypeReader: archetypeResult,
    firstImpressionAnalyzer: firstImpressionResult,
    influencePredictor: influenceResult
  });

  // Score bands (v2.0 — confidence-based margin per spec formula)
  const phase1Confidence = Math.round(
    (anatomistResult.confidence + lightMasterResult.confidence + compositionResult.confidence +
     textureCriticResult.confidence + commercialResult.confidence) / 5
  );
  const leonardoScoredMetric = withConfidenceBand(overallScore, phase1Confidence);
  const destinyScoredMetric  = withConfidenceBand(destinyScore, destinyConfidence);

  // ─── Mode-specific Phase 3 synthesis + scoring ─────────────────────────
  let integrityScore = 0;
  let rawIntegrityScore = 0;
  let finalIntegrityDossier: LeonardoReport['integrityDossier'] = undefined;
  let mirrorInsights: LeonardoReport['mirrorInsights'] = undefined;
  let tieredSummary: ReturnType<typeof generateTieredSummary>;
  let summaryHeader: ReturnType<typeof generateSummaryHeader>;
  let symmetryScore = 0;
  let contemptDetected = false;
  let symmetryPower = 0;
  let hyperCongruenceResult: HyperCongruenceResult | null = null;
  let sfumatoCoefficient = 50;
  let sfumatoDeficit = false;
  let hyperCongruenceTriggered = false;
  let maskOfSanityRisk: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'NONE';
  let harmonyScoredMetric: ScoredMetric = withConfidenceBand(75, 75);

  if (analysisMode === 'mirror') {
    // ── MIRROR: synthesize harmony insights, compute harmony score ──────────
    mirrorInsights = await synthesizeMirrorInsights(authenticityResult!, apiKey);

    const harmonyRaw = authenticityResult?.confidence ?? 75;
    harmonyScoredMetric = withConfidenceBand(harmonyRaw, harmonyRaw);
    integrityScore = harmonyRaw; // expose as integrityScore for API compat

    // Mirror uses clean SUCCESS header — no veto protocol
    tieredSummary = {
      style: 'SUCCESS',
      headline: "✓ RENAISSANCE MIRROR: HARMONY READING COMPLETE",
      body: "The Authenticity Observer has completed its harmonic reading. " +
            "This report reflects vitality and coherence — the Renaissance Mirror reflects, not judges.",
      vetoApplied: false
    };
    summaryHeader = {
      title: "✓ RENAISSANCE MIRROR",
      color: 'bg-green-500',
      icon: 'check-circle',
      summaryText: tieredSummary.body,
      vetoActive: false
    };

    const anatomistAnalysis = anatomistResult.analysis as VitruvianMetrics;
    symmetryScore = anatomistAnalysis?.symmetryScore ?? 0;
    rawIntegrityScore = integrityScore;

    console.log(`🪞 Mirror Mode: Harmony Score ${integrityScore}/100 [±${100 - harmonyScoredMetric.band.low}]`);
  } else {
    // ── NOTEBOOK: full forensic pipeline (unchanged) ─────────────────────────
    const integrityDossierRaw = await synthesizeIntegrityDossier({
      redFlagMetric: redFlagResult,
      integrityAuditor: integrityResult
    }, apiKey);

    rawIntegrityScore = calculateIntegrityScore({
      redFlagMetric: redFlagResult,
      integrityAuditor: integrityResult
    });
    integrityScore = rawIntegrityScore;

    // ── Soul Reader v2.5 ──────────────────────────────────────────────────
    const soulReaderContext = applySoulReaderContextSynthesis({
      integrityDossier: integrityDossierRaw,
      integrityScore,
      redFlagAnalysis,
      integrityAuditAnalysis: integrityResult?.status === 'success'
        ? integrityResult.analysis as IntegrityAuditAnalysis
        : undefined
    });

    integrityScore = soulReaderContext.integrityScore;
    finalIntegrityDossier = soulReaderContext.integrityDossier;

    // Extract Soul Reader metadata for tracking
    const anatomistAnalysis = anatomistResult.analysis as VitruvianMetrics;
    symmetryScore = anatomistAnalysis?.symmetryScore ?? 0;
    contemptDetected = redFlagAnalysis?.asymmetryMarkers?.contemptDetected ?? false;
    symmetryPower = redFlagAnalysis?.mastermindProfile?.symmetryPower ?? 0;

    // CRAIG PATCH v1.0 - Extract Hyper-Congruence and Sfumato data
    hyperCongruenceResult = getLastHyperCongruenceResult();
    const sfumatoData = redFlagAnalysis?.sfumatoCoefficient;
    sfumatoCoefficient = sfumatoData?.sfumatoScore ?? 50;
    sfumatoDeficit = hyperCongruenceResult?.sfumatoDeficit ?? false;
    hyperCongruenceTriggered = hyperCongruenceResult?.triggered ?? false;
    maskOfSanityRisk = hyperCongruenceResult?.maskOfSanityRisk ?? 'NONE';

    // CRAIG PATCH v1.1 - Tiered Summary
    tieredSummary = generateTieredSummary(hyperCongruenceResult, redFlagAnalysis, integrityScore);
    // CRAIG PATCH v1.2 - Summary Header (Kill Switch)
    summaryHeader = generateSummaryHeader(tieredSummary, hyperCongruenceResult, redFlagAnalysis, integrityScore);
  }

  const processingTime = Date.now() - startTime;

  const report: LeonardoReport = {
    imageUrl: request.imageUrl || `data:${mediaType};base64,...`,
    timestamp: new Date().toISOString(),
    overallScore,
    destinyScore,
    integrityScore,
    agents: {
      anatomist: anatomistResult,
      lightMaster: lightMasterResult,
      compositionDirector: compositionResult,
      textureCritic: textureCriticResult,
      commercialStrategist: commercialResult,
      archetypeReader: archetypeResult,
      firstImpressionAnalyzer: firstImpressionResult,
      influencePredictor: influenceResult,
      // Notebook mode only
      redFlagMetric: redFlagResult,
      integrityAuditor: integrityResult,
      // Mirror mode only
      authenticityObserver: authenticityResult
    },
    executiveSummary: synthesis.executiveSummary,
    topRecommendations: synthesis.topRecommendations,
    tieredSummary,
    summaryHeader,
    destinyInsights,
    integrityDossier: finalIntegrityDossier,
    mirrorInsights,
    // ─── v2.0 Score Bands ────────────────────────────────────────────────────
    scoreBands: {
      leonardoScore: leonardoScoredMetric,
      destinyScore:  destinyScoredMetric,
      ...(analysisMode === 'mirror' && {
        harmonyScore: harmonyScoredMetric
      })
    },
    analysisMode,
    // ── Notebook-only Soul Reader metadata ───────────────────────────────────
    soulReaderMetadata: {
      ocularPrimacyApplied: analysisMode === 'notebook',
      statueAlertTriggered: symmetryScore >= 97,
      symmetryScore,
      machiavellianDetected: symmetryPower > 85 && rawIntegrityScore < 70,
      resilienceRecategorized: integrityScore !== rawIntegrityScore && integrityScore > rawIntegrityScore,
      contemptPenaltyApplied: contemptDetected,
      rawIntegrityScore,
      adjustedIntegrityScore: integrityScore,
      hyperCongruenceTriggered,
      hyperCongruenceScore: hyperCongruenceResult?.triggered ? rawIntegrityScore : undefined,
      sfumatoCoefficient,
      sfumatoDeficit,
      maskOfSanityRisk,
      sfumatoVerdict: hyperCongruenceResult?.verdict,
      version: analysisMode === 'mirror' ? 'RENAISSANCE_MIRROR_v2.0' : 'SOUL_READER_v3.0_CRAIG_PATCH'
    },
    processingTime
  };

  console.log(`📊 Leonardo Report 2.0 FINAL complete (Soul Reader v3.0 + Craig Patch):`);
  console.log(`   Leonardo Score: ${overallScore}/100`);
  console.log(`   Destiny Score: ${destinyScore}/100`);
  console.log(`   Integrity Score (Truth): ${integrityScore}/100`);
  if (rawIntegrityScore !== integrityScore) {
    console.log(`   └─ Raw Score: ${rawIntegrityScore} → Adjusted: ${integrityScore} (Soul Reader applied)`);
  }
  if (symmetryScore >= 97) {
    console.log(`   ⚠️ STATUE_ALERT: Symmetry ${symmetryScore}% (penalty applied)`);
  }
  if (symmetryPower > 85 && rawIntegrityScore < 70) {
    console.log(`   🎭 MACHIAVELLIAN_DETECTED: High symmetry + Low integrity`);
  }
  // ═══════════════════════════════════════════════════════════════════════════
  // CRAIG PATCH v1.1 - New Logging with Tiered Summary
  // ═══════════════════════════════════════════════════════════════════════════
  if (hyperCongruenceTriggered) {
    console.log(`   🔴 HYPER_CONGRUENCE_ALERT: Score was "too perfect" - Craig Patch applied`);
    console.log(`   └─ Sfumato Coefficient: ${sfumatoCoefficient}%`);
    console.log(`   └─ Sfumato Deficit: ${sfumatoDeficit ? 'YES (biological noise below threshold)' : 'NO'}`);
    console.log(`   └─ Mask of Sanity Risk: ${maskOfSanityRisk}`);
  } else if (sfumatoCoefficient < 40) {
    console.log(`   ⚠️ LOW_SFUMATO: Biological noise below optimal (${sfumatoCoefficient}%)`);
  }

  // Log the tiered summary and veto status
  console.log(`   📋 Tiered Summary: ${tieredSummary.style}`);
  console.log(`   └─ Headline: ${tieredSummary.headline}`);
  if (tieredSummary.vetoApplied) {
    console.log(`   🚫 VETO PROTOCOL ACTIVE: ${tieredSummary.vetoReason}`);
    console.log(`   └─ Positive sentiment BLOCKED`);
  }
  console.log(`   📋 Summary Header: ${summaryHeader.title}`);
  if (summaryHeader.vetoActive) {
    console.log(`   🔴 KILL SWITCH ENGAGED: Frontend must block positive display`);
  }

  console.log(`   Processing Time: ${processingTime}ms`);

  return report;
}

async function synthesizeResults(agents: LeonardoReport['agents'], apiKey: string, intent?: string, mode?: string) {
  try {
    const client = new Anthropic({ apiKey });

    // SOUL READER v2.5 - Intent-Specific Synthesis for Speed & Accuracy
    const agentResultsText = JSON.stringify(agents, null, 2);

    // Mirror mode uses its own wonder-first synthesis prompt
    // Notebook mode: select intent-specific prompt or fallback to default
    const basePrompt = mode === 'mirror'
      ? MIRROR_SYNTHESIS_PROMPT
      : intent && INTENT_SYNTHESIS_PROMPTS[intent]
        ? INTENT_SYNTHESIS_PROMPTS[intent]
        : SYNTHESIS_PROMPT;

    const prompt = basePrompt.replace('{agentResults}', agentResultsText);

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    return JSON.parse(extractJSON(text)) as {
      executiveSummary: string;
      topRecommendations: string[]
    };
  } catch (error) {
    console.error("Synthesis error:", error);
    return {
      executiveSummary: "Multi-agent analysis completed successfully. Review individual agent reports for detailed insights.",
      topRecommendations: [
        "Review The Anatomist's proportional analysis",
        "Consider The Light Master's lighting recommendations",
        "Implement The Commercial Strategist's market positioning advice"
      ]
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// LEONARDO ENGINE v2.0 - SCORING MODE WEIGHTS
// ═══════════════════════════════════════════════════════════════════════════
// Da Vinci Mode (DEFAULT): anatomy-first — he spent his life on proportions
// Commercial Mode (OPTION): conversion-first — for business/marketing use cases
const DAVINCI_WEIGHTS = {
  anatomist:   0.35,  // Vitruvian proportions — his life's work
  light:       0.30,  // Chiaroscuro/sfumato — his signature
  composition: 0.20,  // Pyramid, golden spiral, dynamic symmetry
  texture:     0.15,  // "Living quality" of surfaces
  commercial:  0.00   // Da Vinci didn't care about conversion rates
};

const COMMERCIAL_WEIGHTS = {
  commercial:  0.30,  // Business impact
  light:       0.25,  // Visual appeal
  composition: 0.20,  // Structure
  anatomist:   0.15,  // Structural truth
  texture:     0.10   // Detail quality
};

function calculateOverallScore(agents: LeonardoReport['agents'], scoringMode: 'davinci' | 'commercial' = 'davinci'): number {
  // ═══════════════════════════════════════════════════════════════════════════
  // v2.0 - Mode-aware weights. Default: Da Vinci (anatomy-first).
  // ═══════════════════════════════════════════════════════════════════════════
  const weights = scoringMode === 'commercial' ? COMMERCIAL_WEIGHTS : DAVINCI_WEIGHTS;

  const weightedScore =
    (agents.anatomist.confidence * weights.anatomist) +
    (agents.lightMaster.confidence * weights.light) +
    (agents.compositionDirector.confidence * weights.composition) +
    (agents.textureCritic.confidence * weights.texture) +
    (agents.commercialStrategist.confidence * weights.commercial);

  // ═══════════════════════════════════════════════════════════════════════════
  // STATUE ALERT - "Living Quality" Offset
  // ═══════════════════════════════════════════════════════════════════════════
  // Leonardo's Rule: Nature is never perfectly symmetrical.
  // Perfect symmetry is a sign of "death" (filters, botox, or extreme suppression)
  const anatomistAnalysis = agents.anatomist.analysis as VitruvianMetrics;
  const symmetryScore = anatomistAnalysis?.symmetryScore ?? 0;
  const symmetryPenalty = applyLivingQualityOffset(symmetryScore);

  return Math.round(weightedScore - symmetryPenalty);
}

// ═══════════════════════════════════════════════════════════════════════════
// SOUL READER v3.0 - "LIVING QUALITY" OFFSET (STATUE ALERT)
// ═══════════════════════════════════════════════════════════════════════════
// Leonardo's observation: Nature is NEVER perfectly symmetrical.
// Perfect symmetry indicates artificiality (filters, botox, AI generation)
// or extreme social suppression (masking natural micro-expressions)
function applyLivingQualityOffset(symmetryScore: number): number {
  const STATUE_THRESHOLD = 97; // Symmetry threshold for "uncanny valley"
  const STATUE_PENALTY = 15; // Points to deduct for statue-like symmetry

  if (symmetryScore >= STATUE_THRESHOLD) {
    console.log(`⚠️ STATUE_ALERT: Perfect symmetry detected (${symmetryScore}%). Penalizing for lack of human 'Living Quality'.`);
    return STATUE_PENALTY;
  }
  return 0;
}

// ═══════════════════════════════════════════════════════════════════════════
// LEONARDO ENGINE v2.0 - CONFIDENCE-BASED SCORE BAND
// ═══════════════════════════════════════════════════════════════════════════
// Formula from spec: margin = Math.round((100 - confidence) / 5)
// 89% confidence → margin 2 → tight band
// 60% confidence → margin 8 → wider band
// stability: margin ≤3 → HIGH, ≤7 → MODERATE, else LOW
import type { ScoredMetric } from "@/types/leonardo";

function withConfidenceBand(score: number, confidence: number): ScoredMetric {
  const margin = Math.round((100 - confidence) / 5);
  return {
    score,
    confidence,
    band: {
      low:  Math.max(0,   score - margin),
      high: Math.min(100, score + margin)
    },
    stability: margin <= 3 ? 'HIGH' : margin <= 7 ? 'MODERATE' : 'LOW'
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// LEONARDO ENGINE v2.0 - MIRROR INSIGHTS SYNTHESIS
// ═══════════════════════════════════════════════════════════════════════════
// Transforms the Authenticity Observer's raw data into wonder-inducing
// Mirror Insights for the public-facing report.
async function synthesizeMirrorInsights(
  observerResult: Awaited<ReturnType<typeof runAuthenticityObserver>>,
  apiKey: string
): Promise<LeonardoReport['mirrorInsights']> {
  try {
    const client = new Anthropic({ apiKey });

    const observerResultsText = JSON.stringify(observerResult, null, 2);
    const prompt = MIRROR_INSIGHTS_SYNTHESIS_PROMPT.replace('{observerResults}', observerResultsText);

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    return JSON.parse(extractJSON(text)) as LeonardoReport['mirrorInsights'];
  } catch (error) {
    console.error("Mirror insights synthesis error:", error);
    // Graceful fallback using raw observer data
    const obs = observerResult?.status === 'success'
      ? observerResult.analysis as import("@/types/leonardo").AuthenticityObservation
      : undefined;
    return {
      naturalnessSummary: "Your expression carries the natural variance Da Vinci called 'sfumato' — the living quality of an unguarded face.",
      coherenceSummary: "Inner and outer signals move together, reflecting the moti mentali principle of unified expression.",
      biomimicryInspiration: obs?.biologicalVitality?.reflection ?? "Like a river finding its path, allow organic expression to flow without obstruction.",
      harmonyConclusion: "The Renaissance Mirror reflects a face that speaks authentically. Leonardo would recognize this as the mark of a life lived from the inside out."
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CRAIG PATCH v1.0 - HYPER-CONGRUENCE DETECTION
// ═══════════════════════════════════════════════════════════════════════════
// The James Craig Case: 99.75% "Transparent" while planning murder
// Perfect congruence + Low biological noise = MASK OF SANITY
//
// Da Vinci's Sfumato Principle: Living things have "smoke" - soft edges,
// variance, imperfection. A "perfect" expression is a performance.
interface HyperCongruenceResult {
  triggered: boolean;
  penalty: number;
  sfumatoDeficit: boolean;
  maskOfSanityRisk: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  verdict: string;
}

function applyHyperCongruenceDetection(
  rawIntegrityScore: number,
  redFlagAnalysis?: RedFlagAnalysis
): HyperCongruenceResult {
  const HYPER_CONGRUENCE_THRESHOLD = 96;
  const HYPER_CONGRUENCE_PENALTY = 35;
  const SFUMATO_MIN_NOISE = 3.0;
  // ═══════════════════════════════════════════════════════════════════════════
  // NEXUS RECOMMENDATION: HARD-CODED AUTO-FAIL THRESHOLD
  // Any score with <2% Biological Noise must AUTO-FAIL the integrity check
  // ═══════════════════════════════════════════════════════════════════════════
  const SFUMATO_CRITICAL_THRESHOLD = 2.0;
  const SFUMATO_AUTO_FAIL_PENALTY = 50; // Maximum penalty for auto-fail

  // Default result - no issues detected
  const result: HyperCongruenceResult = {
    triggered: false,
    penalty: 0,
    sfumatoDeficit: false,
    maskOfSanityRisk: 'NONE',
    verdict: "Expression shows natural biological variance (Sfumato present)."
  };

  // Check if we have the new sfumatoCoefficient data
  const sfumatoData = redFlagAnalysis?.sfumatoCoefficient;
  const hyperCongruenceData = redFlagAnalysis?.hyperCongruenceWarning;

  // Case 1: Use the new Sfumato Coefficient if available
  if (sfumatoData) {
    const biologicalNoise = sfumatoData.biologicalNoise;
    const microExpressionCount = sfumatoData.microExpressionCount;
    const sfumatoScore = sfumatoData.sfumatoScore;
    const assessment = sfumatoData.assessment;

    // ═══════════════════════════════════════════════════════════════════════════
    // CRITICAL AUTO-FAIL: <2% Biological Noise = AUTOMATIC FAIL
    // This is the "James Craig" hard-lock - no exceptions
    // ═══════════════════════════════════════════════════════════════════════════
    if (biologicalNoise < SFUMATO_CRITICAL_THRESHOLD) {
      result.triggered = true;
      result.sfumatoDeficit = true;
      result.penalty = SFUMATO_AUTO_FAIL_PENALTY;
      result.maskOfSanityRisk = 'CRITICAL';
      result.verdict = "⛔ AUTO-FAIL: CRITICAL ARTIFICIALITY DETECTED. " +
                      "Biological noise below 2% threshold (measured: " + biologicalNoise.toFixed(1) + "%). " +
                      "This expression violates Da Vinci's Sfumato principle - living beings ALWAYS show variance. " +
                      "HIGH ARTIFICIALITY indicates rehearsed persona or 'Mask of Sanity'. " +
                      "Do not rely on visual impression of warmth.";

      console.log(`⚠️ CAUTION ANNOTATION: Biological noise ${biologicalNoise}% < ${SFUMATO_CRITICAL_THRESHOLD}% threshold`);
      console.log(`   Penalty applied — score preserved, human interprets.`);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SFUMATO DEFICIT DETECTION (3% Threshold)
    // ═══════════════════════════════════════════════════════════════════════════
    // NEW RULE: If BiologicalNoise < 3% THEN TruthScore = CAP_AT_60 (SUSPICIOUS)
    // This implements the "Weaponized Cynicism" - perfect execution = scripted behavior
    if (biologicalNoise < SFUMATO_MIN_NOISE) {
      result.sfumatoDeficit = true;
      result.triggered = true;

      // ═══════════════════════════════════════════════════════════════════════════
      // THE "TOO GOOD TO BE TRUE" ZONE (Bell Curve Inversion)
      // ═══════════════════════════════════════════════════════════════════════════
      // Zone 1: Chaos (0-40%) -> Unstable/Distressed
      // Zone 2: Human (41-94%) -> AUTHENTIC (Ideal Zone)
      // Zone 3: Android (95-100%) -> Hyper-Congruent/DECEPTIVE
      //
      // If score is in Zone 3 AND biological noise is low, cap at 60% (SUSPICIOUS)
      const SFUMATO_CAP_SCORE = 60;
      const scoreToCap = Math.max(0, rawIntegrityScore - SFUMATO_CAP_SCORE);
      result.penalty = scoreToCap; // Penalty brings score down to 60

      console.log(`⚠️ SFUMATO_DEFICIT: Biological noise (${biologicalNoise}%) below threshold (${SFUMATO_MIN_NOISE}%)`);
      console.log(`   Applying Bell Curve Inversion: Score capped at ${SFUMATO_CAP_SCORE}%`);

      // Determine risk level based on noise level
      if (biologicalNoise < 2) {
        result.maskOfSanityRisk = 'HIGH';
        result.verdict = "⚠️ BIOLOGICAL NOISE DEFICIT: Expression lacks organic variance. " +
                        "Da Vinci's Sfumato principle indicates this is a 'held' or rehearsed expression. " +
                        "Score capped at 60% due to lack of biological 'living quality'.";
      } else {
        result.maskOfSanityRisk = 'MODERATE';
        result.verdict = "⚡ LOW BIOLOGICAL VARIANCE: Expression shows minimal organic fluctuation. " +
                        "This indicates a controlled or guarded presentation. " +
                        "Score adjusted downward to reflect artificiality concern.";
      }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // HYPER-CONGRUENCE DETECTION: High Score + Low Noise = "Android Zone"
    // ═══════════════════════════════════════════════════════════════════════════
    // THE BELL CURVE MODEL:
    // - Score 0-40%: "The Chaos" -> Unstable/Distressed
    // - Score 41-94%: "The Human" -> AUTHENTIC (Ideal Zone)
    // - Score 95-100%: "The Android" -> Hyper-Congruent/DECEPTIVE
    //
    // When in the "Android Zone" (95-100%) we INVERT the scoring logic
    // Higher is NOT better - it's MORE suspicious
    if (rawIntegrityScore >= HYPER_CONGRUENCE_THRESHOLD && biologicalNoise < SFUMATO_MIN_NOISE) {
      result.triggered = true;

      // ═══════════════════════════════════════════════════════════════════════════
      // THE "SFUMATO" VARIABLE - Must have at least 3% biological noise
      // Application to Craig: His "noise" was near 0% - holding pose too tightly
      // ═══════════════════════════════════════════════════════════════════════════
      // Calculate penalty: Scores in Android zone get slashed
      // The higher the score above 96, the MORE suspicious (inverted logic)
      const androidExcess = rawIntegrityScore - HYPER_CONGRUENCE_THRESHOLD;
      result.penalty = Math.max(result.penalty, HYPER_CONGRUENCE_PENALTY + (androidExcess * 0.5));

      // Determine Mask of Sanity Risk Level
      if (assessment === 'HYPER_CONGRUENT' || (microExpressionCount < 2 && biologicalNoise < 2.5)) {
        result.maskOfSanityRisk = 'CRITICAL';
        // ═══════════════════════════════════════════════════════════════════════════
        // UPDATED DA VINCI VERDICT (The Fix)
        // ═══════════════════════════════════════════════════════════════════════════
        // Old Verdict: "This face is a masterwork of congruence... A transparent soul."
        // New Verdict: Points out the LACK of Sfumato as the warning sign
        result.verdict = "⛔ DA VINCI PRINCIPLE VIOLATED: The proportions are mathematically flawless, " +
                        "yet the expression lacks 'Sfumato' (organic variance). This indicates a rehearsed persona. " +
                        "In nature, nothing is this perfect. He is PERFORMING, not BEING.";
      } else if (biologicalNoise < 3 && sfumatoScore < 40) {
        result.maskOfSanityRisk = 'HIGH';
        result.verdict = "⚠️ HIGH ARTIFICIALITY: The expression is geometrically perfect but biologically rigid. " +
                        "The mathematical perfection is itself the warning sign - organic expressions have variance.";
      } else {
        result.maskOfSanityRisk = 'MODERATE';
        result.verdict = "⚡ ELEVATED ARTIFICIALITY: Expression shows signs of excessive control. " +
                        "Some biological variance detected but below the 'living quality' threshold.";
      }

      console.log(`🎭 ANDROID_ZONE_DETECTED: Score ${rawIntegrityScore}% with biological noise ${biologicalNoise}%`);
      console.log(`   Bell Curve Inversion Applied - High score = MORE suspicious`);
      console.log(`   Mask of Sanity Risk: ${result.maskOfSanityRisk}`);
    }
  }
  // Case 2: Use hyperCongruenceWarning if agent provided it directly
  else if (hyperCongruenceData?.triggered) {
    result.triggered = hyperCongruenceData.triggered;
    result.sfumatoDeficit = hyperCongruenceData.sfumatoDeficit;
    result.maskOfSanityRisk = hyperCongruenceData.maskOfSanityRisk;
    result.verdict = hyperCongruenceData.daVinciVerdict;

    if (result.maskOfSanityRisk === 'HIGH' || result.maskOfSanityRisk === 'CRITICAL') {
      result.penalty = HYPER_CONGRUENCE_PENALTY;
    } else if (result.maskOfSanityRisk === 'MODERATE') {
      result.penalty = Math.round(HYPER_CONGRUENCE_PENALTY * 0.5);
    }
  }
  // Case 3: Fallback - use raw score alone (legacy behavior with new threshold)
  else if (rawIntegrityScore >= HYPER_CONGRUENCE_THRESHOLD) {
    // Without Sfumato data, we can only flag based on score alone
    // This is less reliable but maintains backwards compatibility
    result.triggered = true;
    result.maskOfSanityRisk = 'LOW';
    result.penalty = 10; // Smaller penalty without Sfumato confirmation
    result.verdict = "⚡ CAUTION: Very high congruence score detected. " +
                    "Sfumato analysis unavailable - recommend re-analysis with Craig Patch enabled.";

    console.log(`⚡ HYPER_CONGRUENCE_CAUTION: Score ${rawIntegrityScore}% exceeds threshold (Sfumato data unavailable)`);
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// SOUL READER v2.5 - CONTEXTUAL RE-CATEGORIZATION (GRIEF vs. DECEPTION)
// ═══════════════════════════════════════════════════════════════════════════
// This logic allows the engine to recognize "Resilience" in high-stress users,
// distinguishing between "Predatory" intent and "Survival" mode.
// Based on Da Vinci's later years - where he painted the "weight of experience"
interface SoulReaderContext {
  integrityDossier: LeonardoReport['integrityDossier'];
  integrityScore: number;
  redFlagAnalysis?: RedFlagAnalysis;
  integrityAuditAnalysis?: IntegrityAuditAnalysis;
}

function applySoulReaderContextSynthesis(context: SoulReaderContext): SoulReaderContext {
  if (!context.integrityAuditAnalysis || !context.integrityDossier) {
    return context;
  }

  const threat = context.integrityAuditAnalysis.biologicalSignaling.actualThreat;
  const warmth = context.integrityAuditAnalysis.biologicalSignaling.actualWarmth;

  // IF High Threat + Low Warmth (The Mastermind Gaze)
  if (threat > 60 && warmth < 25) {
    // Check for Red Flags (Contempt/Sneer)
    const contemptDetected = context.redFlagAnalysis?.asymmetryMarkers?.contemptDetected ?? false;

    if (!contemptDetected) {
      // Re-label as "FORTIFIED/RESILIENT" instead of "DECEPTIVE"
      // This is the key insight: High Threat + Low Warmth WITHOUT contempt
      // indicates Protective Hyper-Vigilance, not malicious intent
      context.integrityDossier.daVinciVerdict =
        "Subject exhibits 'Protective Hyper-Vigilance'. The gaze indicates a mind in survival/leadership mode, " +
        "shielding internal vulnerability with strategic focus. Leonardo would recognize this as the visage of " +
        "one who has weathered storms - fortified but not corrupted.";

      // Reward for "Functional Stability" - they're resilient, not deceptive
      context.integrityScore = Math.min(100, context.integrityScore + 5);

      console.log(`🛡️ SOUL_READER: Re-categorized as RESILIENT (High Threat + Low Warmth without Contempt)`);
    }
  }

  // Additional check for "Guarded Stability" pattern
  // High incongruence WITHOUT contempt = self-protection, not deception
  const totalDelta = context.integrityAuditAnalysis.incongruenceMetrics.totalDelta;
  const asymmetricSneer = context.redFlagAnalysis?.asymmetryMarkers?.sneerId ?? 'NONE';

  if (totalDelta > 150 && asymmetricSneer === 'NONE') {
    // High incongruence but no contempt markers = GUARDED_STABILITY
    if (context.integrityDossier.socialMaskingAlert) {
      console.log(`🔄 SOUL_READER: Re-evaluating Social Masking Alert - no contempt markers detected`);
      // Don't automatically flag as deceptive - could be protective guarding
    }
  }

  return context;
}

async function fetchImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  return `data:image/jpeg;base64,${base64}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// LEONARDO ENGINE 2.0 - DESTINY SYNTHESIS FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

interface DestinyAgents {
  archetypeReader: LeonardoReport['agents']['archetypeReader'];
  firstImpressionAnalyzer: LeonardoReport['agents']['firstImpressionAnalyzer'];
  influencePredictor: LeonardoReport['agents']['influencePredictor'];
}

async function synthesizeDestinyResults(
  destinyAgents: DestinyAgents,
  apiKey: string
): Promise<LeonardoReport['destinyInsights']> {
  try {
    const client = new Anthropic({ apiKey });

    const destinyResultsText = JSON.stringify(destinyAgents, null, 2);
    const prompt = DESTINY_SYNTHESIS_PROMPT.replace('{destinyResults}', destinyResultsText);

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    return JSON.parse(extractJSON(text)) as LeonardoReport['destinyInsights'];
  } catch (error) {
    console.error("Destiny synthesis error:", error);
    return {
      archetypeSummary: "Archetype analysis completed. Review The Archetype Reader for character destiny insights.",
      firstImpressionSummary: "First impression analysis completed. Review The First Impression Analyzer for 3-second impact insights.",
      influenceSummary: "Influence analysis completed. Review The Influence Predictor for career trajectory insights.",
      destinyConclusion: "All destiny agents have completed their analysis. The combined insights reveal your archetypal character destiny based on Renaissance physiognomic principles and modern neuroscience."
    };
  }
}

function calculateDestinyScore(destinyAgents: DestinyAgents): { score: number; confidence: number } {
  // ═══════════════════════════════════════════════════════════════════════════
  // v2.0 CONFIDENCE-WEIGHTED DESTINY SCORE
  // ═══════════════════════════════════════════════════════════════════════════
  // Agents that are MORE confident in their readings count MORE.
  // This prevents a low-confidence Influence Predictor from dragging down
  // a high-confidence Archetype Reader.
  //
  // Formula: weightedScore = Σ(agentScore * agentConfidence) / ΣagentConfidence
  //
  // Since agent.confidence IS the score here (the confidence IS the destiny
  // contribution), self-weighting gives a higher-confidence agent proportionally
  // more influence on the final score.

  const agents = [
    { score: destinyAgents.archetypeReader?.confidence ?? 0,         confidence: destinyAgents.archetypeReader?.confidence ?? 0 },
    { score: destinyAgents.firstImpressionAnalyzer?.confidence ?? 0, confidence: destinyAgents.firstImpressionAnalyzer?.confidence ?? 0 },
    { score: destinyAgents.influencePredictor?.confidence ?? 0,      confidence: destinyAgents.influencePredictor?.confidence ?? 0 },
  ];

  const totalConfidence = agents.reduce((sum, a) => sum + a.confidence, 0);
  if (totalConfidence === 0) return { score: 0, confidence: 0 };

  const weightedScore = agents.reduce((sum, a) => sum + (a.score * a.confidence), 0);
  const score = Math.round(weightedScore / totalConfidence);
  const avgConfidence = Math.round(totalConfidence / agents.length);

  return { score, confidence: avgConfidence };
}

// ═══════════════════════════════════════════════════════════════════════════
// LEONARDO ENGINE 2.0 FINAL - INTEGRITY DOSSIER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

interface IntegrityAgents {
  redFlagMetric: LeonardoReport['agents']['redFlagMetric'];
  integrityAuditor: LeonardoReport['agents']['integrityAuditor'];
}

import type { IntegrityAuditAnalysis } from "@/types/leonardo";

async function synthesizeIntegrityDossier(
  integrityAgents: IntegrityAgents,
  apiKey: string
): Promise<LeonardoReport['integrityDossier']> {
  try {
    const client = new Anthropic({ apiKey });

    const integrityResultsText = JSON.stringify(integrityAgents, null, 2);
    const prompt = INTEGRITY_DOSSIER_SYNTHESIS_PROMPT.replace('{integrityResults}', integrityResultsText);

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    return JSON.parse(extractJSON(text)) as LeonardoReport['integrityDossier'];
  } catch (error) {
    console.error("Integrity Dossier synthesis error:", error);

    // Try to extract truth score from Integrity Auditor if available
    let truthScore = 75; // Default moderate score
    if (integrityAgents.integrityAuditor?.status === 'success') {
      const auditAnalysis = integrityAgents.integrityAuditor.analysis as IntegrityAuditAnalysis;
      truthScore = auditAnalysis.finalVerdict?.truthScore ?? 75;
    }

    return {
      redFlagSummary: "Red Flag analysis completed. Review The Red Flag Metric for detailed behavioral markers.",
      integrityAuditSummary: "Integrity audit completed. Review The Integrity Auditor for Truth Score calculation.",
      truthScore,
      daVinciVerdict: "The motions of the mind are reflected in the motions of the features. Further analysis recommended.",
      socialMaskingAlert: truthScore < 60,
      finalConclusion: "All Integrity Dossier agents have completed their analysis. The combined insights reveal the alignment between this person's social presentation and their biological reality."
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CRAIG PATCH v1.0 - Stores hyper-congruence detection results for metadata
// ═══════════════════════════════════════════════════════════════════════════
let lastHyperCongruenceResult: HyperCongruenceResult | null = null;

function calculateIntegrityScore(integrityAgents: IntegrityAgents): number {
  // ═══════════════════════════════════════════════════════════════════════════
  // SOUL READER v3.0 - OCULAR PRIMACY WEIGHTED FORENSICS + CRAIG PATCH
  // ═══════════════════════════════════════════════════════════════════════════
  // Based on Da Vinci's observation: "The eyes are the window to the soul"
  // The eyes carry 90% of the truth weight (1.8), the mouth only 10% (0.2)
  // This allows the engine to see past "Social Smiles" to the true self
  //
  // CRAIG PATCH UPDATE: Now includes Hyper-Congruence Detection
  // A "perfect" score (>96%) is now SUSPICIOUS, not ideal

  const audit = integrityAgents.integrityAuditor?.analysis as IntegrityAuditAnalysis | undefined;
  const redFlag = integrityAgents.redFlagMetric?.analysis as RedFlagAnalysis | undefined;

  if (!audit || integrityAgents.integrityAuditor?.status !== 'success') {
    lastHyperCongruenceResult = null;
    return 75; // Default if unavailable
  }

  // NEXUS 3.5 WEIGHTED FORENSICS
  // Ocular Delta: Actual vs Projected Warmth in Eyes (the involuntary truth)
  const eyeDelta = Math.abs(
    audit.biologicalSignaling.actualWarmth - audit.archetypeProjection.projectedWarmth
  );

  // Oral Delta: Actual vs Projected Trust in Mouth (the social mask)
  const mouthDelta = Math.abs(
    audit.biologicalSignaling.actualTrust - audit.archetypeProjection.projectedTrust
  );

  // Apply Ocular Primacy (The Eyes are the Source of Truth)
  // Weight: Eyes 1.8 (90%) vs Mouth 0.2 (10%) = 9:1 Ocular Ratio
  const OCULAR_PRIMACY_FACTOR = 1.8;
  const ORAL_MASKING_FACTOR = 0.2;
  const weightedForensicDelta = (eyeDelta * OCULAR_PRIMACY_FACTOR) + (mouthDelta * ORAL_MASKING_FACTOR);

  let truthScore = 100 - weightedForensicDelta;

  // ═══════════════════════════════════════════════════════════════════════════
  // INTEGRITY GUARDRAIL: The "Contempt" Multiplier
  // Contempt is the #1 predictor of deceptive behavior
  // ═══════════════════════════════════════════════════════════════════════════
  if (redFlag?.asymmetryMarkers?.contemptDetected) {
    truthScore -= 20; // Contempt is the #1 Integrity Killer
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MACHIAVELLIAN GUARD TRIGGER
  // Detects the high-symmetry/low-transparency "Mastermind"
  // ═══════════════════════════════════════════════════════════════════════════
  const symmetryPower = redFlag?.mastermindProfile?.symmetryPower ?? 0;
  if (symmetryPower > 85 && truthScore < 70) {
    // Penalty for "Symmetry of Intent" (Persona exceeds biology)
    truthScore -= 10;
  }

  // Get Red Flag score modifier (retained from original logic)
  let redFlagModifier = 0;
  if (integrityAgents.redFlagMetric?.status === 'success' && redFlag) {
    const redFlagScore = redFlag.overallRedFlag?.score ?? 0;
    // Reduce integrity score based on red flags (max -20 points for severe red flags)
    redFlagModifier = -Math.round(redFlagScore * 0.2);
  }

  // Calculate intermediate score before Craig Patch
  let integrityScore = Math.max(0, Math.min(100, Math.round(truthScore) + redFlagModifier));

  // ═══════════════════════════════════════════════════════════════════════════
  // CRAIG PATCH v1.0 - HYPER-CONGRUENCE DETECTION
  // ═══════════════════════════════════════════════════════════════════════════
  // The James Craig Lesson: A 99.75% score with no biological noise = MASK
  // Apply penalty for "too perfect" expressions that lack Sfumato
  const hyperCongruenceResult = applyHyperCongruenceDetection(integrityScore, redFlag);
  lastHyperCongruenceResult = hyperCongruenceResult;

  if (hyperCongruenceResult.triggered) {
    integrityScore = Math.max(0, integrityScore - hyperCongruenceResult.penalty);

    console.log(`🎭 CRAIG_PATCH: Applied Hyper-Congruence penalty of -${hyperCongruenceResult.penalty}`);
    console.log(`   Risk Level: ${hyperCongruenceResult.maskOfSanityRisk}`);
    console.log(`   Adjusted Score: ${integrityScore}`);
  }

  return integrityScore;
}

// Getter for the hyper-congruence result (used by report generation)
function getLastHyperCongruenceResult(): HyperCongruenceResult | null {
  return lastHyperCongruenceResult;
}

// ═══════════════════════════════════════════════════════════════════════════
// CRAIG PATCH v1.2 - VETO PROTOCOL (Hierarchical Summary)
// ═══════════════════════════════════════════════════════════════════════════
// The Cunanan Rule: If Hyper-Congruence or Mastermind Profile is detected,
// the positive sentiment analysis is BLOCKED, not just appended.
// The Executive Summary must be HIERARCHICAL, not holistic.
//
// We are not judging their soul; we are measuring their lack of biological variance
interface TieredSummary {
  style: 'CRITICAL' | 'WARNING' | 'SUCCESS';
  headline: string;
  body: string;
  vetoApplied: boolean;
  vetoReason?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// CRAIG PATCH v1.2 - SUMMARY HEADER (The Kill Switch for Frontend)
// ═══════════════════════════════════════════════════════════════════════════
// This header tells the frontend whether to block positive sentiment display
interface SummaryHeader {
  title: string;
  color: 'bg-red-600' | 'bg-yellow-500' | 'bg-green-500';
  icon: 'shield-alert' | 'alert-triangle' | 'check-circle';
  summaryText: string;
  vetoActive: boolean;
}

function generateTieredSummary(
  hyperCongruenceResult: HyperCongruenceResult | null,
  redFlagAnalysis?: RedFlagAnalysis,
  integrityScore?: number
): TieredSummary {
  // Check for Mastermind Profile
  const mastermindProfile = redFlagAnalysis?.mastermindProfile?.detected ?? false;

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 1: CRITICAL THREAT (The "Craig/Cunanan" Level)
  // ═══════════════════════════════════════════════════════════════════════════
  // THE BELL CURVE INVERSION: Score 96-100% = "The Android Zone"
  // High Artificiality - they are TOO GOOD at controlling their expression
  // Alert Message: "He is PERFORMING." (not "He is lying.")
  // VETO PROTOCOL: Block ALL positive sentiment
  // ═══════════════════════════════════════════════════════════════════════════
  if (hyperCongruenceResult?.triggered && hyperCongruenceResult.maskOfSanityRisk === 'CRITICAL') {
    return {
      style: 'CRITICAL',
      headline: "⛔ CAUTION: HIGH ARTIFICIALITY DETECTED",
      body: "This report has triggered the 'Sfumato Protocol.' " +
            "While the subject appears outwardly warm and symmetrical, the analysis detects a CRITICAL lack of " +
            "biological variance (Hyper-Congruence). This is NOT a transparent soul - it is a PERFORMANCE. " +
            "The mathematical perfection of this expression is itself the warning sign. " +
            "In nature, nothing is this perfect. Do not rely on the visual impression of warmth.",
      vetoApplied: false,
      vetoReason: "HYPER_CONGRUENCE_CRITICAL"
    };
  }

  // Check for Mastermind Profile (Cunanan Rule)
  if (mastermindProfile) {
    return {
      style: 'CRITICAL',
      headline: "⛔ MASTERMIND PROFILE DETECTED",
      body: "CRITICAL ALERT: While the subject may appear visually 'authentic' or 'charming' to the human eye, " +
            "forensic analysis detects a 'Mastermind Profile.' The facial microsignals indicate high cognitive control " +
            "and low emotional empathy. This combination is statistically rare and associated with high-functioning manipulation. " +
            "DO NOT TRUST THE INITIAL IMPRESSION.",
      vetoApplied: false,
      vetoReason: "MASTERMIND_PROFILE_DETECTED"
    };
  }

  // Check for HYPER_CONGRUENT assessment from Red Flag agent
  if (redFlagAnalysis?.sfumatoCoefficient?.assessment === 'HYPER_CONGRUENT') {
    return {
      style: 'CRITICAL',
      headline: "⛔ CAUTION: HIGH ARTIFICIALITY DETECTED",
      body: "The Sfumato analysis has flagged this expression as HYPER_CONGRUENT. " +
            "Biological noise is critically low, indicating a controlled or rehearsed expression. " +
            "This pattern is associated with high impression management. " +
            "The mathematical perfection of this expression is itself the warning sign.",
      vetoApplied: false,
      vetoReason: "SFUMATO_HYPER_CONGRUENT"
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 2: HIGH ARTIFICIALITY (Warning Level)
  // Partial veto - positive sentiment dampened but not fully blocked
  // ═══════════════════════════════════════════════════════════════════════════
  if (hyperCongruenceResult?.triggered &&
      (hyperCongruenceResult.maskOfSanityRisk === 'HIGH' || hyperCongruenceResult.maskOfSanityRisk === 'MODERATE')) {
    return {
      style: 'WARNING',
      headline: "⚠️ ALERT: ELEVATED ARTIFICIALITY",
      body: "Forensic analysis detects reduced biological variance in this expression. " +
            "The proportions are mathematically aligned, but organic 'Sfumato' (living variance) is below optimal range. " +
            "This may indicate impression management or a controlled presentation. " +
            "Recommend additional context or comparison images for verification.",
      vetoApplied: false,
      vetoReason: "ELEVATED_ARTIFICIALITY"
    };
  }

  // Check for general red flag warnings
  const redFlagScore = redFlagAnalysis?.overallRedFlag?.score ?? 0;
  const warnings = redFlagAnalysis?.overallRedFlag?.primaryConcerns ?? [];

  if (redFlagScore >= 60 || warnings.length > 2) {
    return {
      style: 'WARNING',
      headline: "⚠️ ALERT: INCONGRUENCE DETECTED",
      body: "Forensic analysis detects significant disconnects between the subject's expression and biological markers. " +
            "The warmth projected does not align with micro-expression data. " +
            "Review the detailed Red Flag analysis for specific concerns.",
      vetoApplied: false,
      vetoReason: undefined
    };
  }

  // Check for DECEPTIVE status from integrity score
  if (integrityScore !== undefined && integrityScore < 40) {
    return {
      style: 'WARNING',
      headline: "⚠️ ALERT: LOW CONGRUENCE",
      body: "The analysis indicates a significant gap between the projected persona and biological markers. " +
            "This does not necessarily indicate deception, but suggests the expression may not fully represent " +
            "the subject's internal state. Context is important for interpretation.",
      vetoApplied: false,
      vetoReason: undefined
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 3: CLEAN (Normal - Authentic)
  // No veto - positive sentiment allowed
  // ═══════════════════════════════════════════════════════════════════════════
  const sfumatoScore = redFlagAnalysis?.sfumatoCoefficient?.sfumatoScore ?? 50;

  if (sfumatoScore >= 60 && (!hyperCongruenceResult?.triggered)) {
    return {
      style: 'SUCCESS',
      headline: "✓ ANALYSIS CLEAR: AUTHENTIC",
      body: "The subject displays high integrity with natural biological variance. " +
            "Sfumato analysis confirms organic 'living quality' in the expression. " +
            "No masking or artificiality detected. This appears to be a genuine expression.",
      vetoApplied: false,
      vetoReason: undefined
    };
  }

  // Default - moderate authenticity
  return {
    style: 'SUCCESS',
    headline: "✓ ANALYSIS COMPLETE: WITHIN NORMAL RANGE",
    body: "The subject displays acceptable biological variance. " +
          "Expression falls within normal human parameters. " +
          "No significant concerns flagged by the Sfumato Protocol.",
    vetoApplied: false,
    vetoReason: undefined
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// CRAIG PATCH v1.2 - SUMMARY HEADER GENERATOR (The Kill Switch)
// ═══════════════════════════════════════════════════════════════════════════
// Generates the frontend header with veto status for blocking positive sentiment
function generateSummaryHeader(
  tieredSummary: TieredSummary,
  hyperCongruenceResult: HyperCongruenceResult | null,
  redFlagAnalysis?: RedFlagAnalysis,
  integrityScore?: number
): SummaryHeader {
  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 1: CRITICAL - RED HEADER (Kill Switch Engaged)
  // ═══════════════════════════════════════════════════════════════════════════
  if (tieredSummary.style === 'CRITICAL') {
    return {
      title: "⛔ HIGH ARTIFICIALITY ALERT",
      color: 'bg-red-600',
      icon: 'shield-alert',
      summaryText: tieredSummary.body,
      vetoActive: false // Caution annotation only — human interprets
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 2: WARNING - YELLOW HEADER (Caution)
  // ═══════════════════════════════════════════════════════════════════════════
  if (tieredSummary.style === 'WARNING') {
    return {
      title: "⚠️ INCONGRUENCE DETECTED",
      color: 'bg-yellow-500',
      icon: 'alert-triangle',
      summaryText: tieredSummary.body,
      vetoActive: false // Annotation only — never blocks content
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 3: SUCCESS - GREEN HEADER (Authentic)
  // ═══════════════════════════════════════════════════════════════════════════
  // Check sfumato score for extra confidence
  const sfumatoScore = redFlagAnalysis?.sfumatoCoefficient?.sfumatoScore ?? 50;

  if (sfumatoScore >= 60 && (!hyperCongruenceResult?.triggered)) {
    return {
      title: "✓ ANALYSIS CLEAR: AUTHENTIC",
      color: 'bg-green-500',
      icon: 'check-circle',
      summaryText: "The subject displays high integrity with natural biological variance. " +
                   "Sfumato analysis confirms organic 'living quality' in the expression.",
      vetoActive: false
    };
  }

  // Default - normal range
  return {
    title: "✓ ANALYSIS COMPLETE",
    color: 'bg-green-500',
    icon: 'check-circle',
    summaryText: "Expression falls within normal human parameters. " +
                 "No significant concerns flagged.",
    vetoActive: false
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// CRAIG PATCH v1.3 - COMPARISON ANALYSIS (Dual Image Delta)
// ═══════════════════════════════════════════════════════════════════════════
// Compares two reports to detect changes and inconsistencies

export function generateComparisonAnalysis(
  primaryReport: LeonardoReport,
  comparisonReport: LeonardoReport
): ComparisonAnalysis {
  // Extract key data from both reports
  const primaryRedFlag = primaryReport.agents.redFlagMetric?.analysis as RedFlagAnalysis | undefined;
  const comparisonRedFlag = comparisonReport.agents.redFlagMetric?.analysis as RedFlagAnalysis | undefined;

  const primaryIntegrity = primaryReport.agents.integrityAuditor?.analysis as IntegrityAuditAnalysis | undefined;
  const comparisonIntegrity = comparisonReport.agents.integrityAuditor?.analysis as IntegrityAuditAnalysis | undefined;

  // Calculate identity similarity (based on anatomist data)
  const primaryAnatomy = primaryReport.agents.anatomist?.analysis as VitruvianMetrics | undefined;
  const comparisonAnatomy = comparisonReport.agents.anatomist?.analysis as VitruvianMetrics | undefined;

  // Simple similarity check based on proportions
  const symmetryDiff = Math.abs(
    (primaryAnatomy?.symmetryScore ?? 50) - (comparisonAnatomy?.symmetryScore ?? 50)
  );
  const sameSubjectConfidence = Math.max(0, 100 - (symmetryDiff * 2));

  // Integrity Delta
  const primaryIntegrityScore = primaryReport.integrityScore ?? 75;
  const comparisonIntegrityScore = comparisonReport.integrityScore ?? 75;
  const integrityDeltaValue = comparisonIntegrityScore - primaryIntegrityScore;

  let integrityInterpretation: string;
  if (Math.abs(integrityDeltaValue) < 5) {
    integrityInterpretation = "Integrity markers are consistent between both images.";
  } else if (integrityDeltaValue > 0) {
    integrityInterpretation = `Integrity improved by ${integrityDeltaValue} points in the comparison image. Subject appears more authentic.`;
  } else {
    integrityInterpretation = `Integrity decreased by ${Math.abs(integrityDeltaValue)} points in the comparison image. Subject appears more guarded.`;
  }

  // Expression Delta
  const primaryWarmth = primaryIntegrity?.biologicalSignaling?.actualWarmth ?? 50;
  const comparisonWarmth = comparisonIntegrity?.biologicalSignaling?.actualWarmth ?? 50;
  const warmthChange = comparisonWarmth - primaryWarmth;

  const primaryTrust = primaryIntegrity?.biologicalSignaling?.actualTrust ?? 50;
  const comparisonTrust = comparisonIntegrity?.biologicalSignaling?.actualTrust ?? 50;
  const trustChange = comparisonTrust - primaryTrust;

  const primaryThreat = primaryIntegrity?.biologicalSignaling?.actualThreat ?? 50;
  const comparisonThreat = comparisonIntegrity?.biologicalSignaling?.actualThreat ?? 50;
  const threatChange = comparisonThreat - primaryThreat;

  // Determine overall shift
  let overallShift: 'MORE_GUARDED' | 'MORE_OPEN' | 'STABLE' | 'INCONSISTENT';
  if (Math.abs(warmthChange) < 10 && Math.abs(trustChange) < 10) {
    overallShift = 'STABLE';
  } else if (warmthChange > 10 && trustChange > 10 && threatChange < 0) {
    overallShift = 'MORE_OPEN';
  } else if (warmthChange < -10 || trustChange < -10 || threatChange > 10) {
    overallShift = 'MORE_GUARDED';
  } else {
    overallShift = 'INCONSISTENT';
  }

  // Sfumato Delta
  const primaryNoise = primaryRedFlag?.sfumatoCoefficient?.biologicalNoise ?? 10;
  const comparisonNoise = comparisonRedFlag?.sfumatoCoefficient?.biologicalNoise ?? 10;
  const noiseDelta = comparisonNoise - primaryNoise;

  let consistencyAssessment: 'NATURAL_VARIATION' | 'SUSPICIOUS_CHANGE' | 'STABLE';
  if (Math.abs(noiseDelta) < 3) {
    consistencyAssessment = 'STABLE';
  } else if (Math.abs(noiseDelta) < 10) {
    consistencyAssessment = 'NATURAL_VARIATION';
  } else {
    consistencyAssessment = 'SUSPICIOUS_CHANGE';
  }

  // Red Flag Comparison
  const primaryStatus = primaryRedFlag?.overallRedFlag?.status ?? 'CLEAR';
  const comparisonStatus = comparisonRedFlag?.overallRedFlag?.status ?? 'CLEAR';

  const statusOrder = ['CLEAR', 'YELLOW_FLAG', 'ORANGE_FLAG', 'RED_FLAG', 'HARD_FAIL'];
  const primaryIndex = statusOrder.indexOf(primaryStatus);
  const comparisonIndex = statusOrder.indexOf(comparisonStatus);

  const escalation = comparisonIndex > primaryIndex;
  const deEscalation = comparisonIndex < primaryIndex;

  // Final Verdict
  let consistency: 'HIGH' | 'MODERATE' | 'LOW' | 'SUSPICIOUS';
  const warnings: string[] = [];
  let recommendation: string;

  if (sameSubjectConfidence < 50) {
    consistency = 'SUSPICIOUS';
    warnings.push("Low confidence that these images show the same person.");
    recommendation = "Verify that both images are of the same subject before interpreting results.";
  } else if (overallShift === 'INCONSISTENT' || consistencyAssessment === 'SUSPICIOUS_CHANGE') {
    consistency = 'LOW';
    warnings.push("Expression markers show significant inconsistency between images.");
    if (escalation) {
      warnings.push("Red flag status has escalated in the comparison image.");
    }
    recommendation = "The subject displays different behavioral signatures across contexts. This may indicate adaptive masking or context-dependent behavior.";
  } else if (escalation || Math.abs(integrityDeltaValue) > 20) {
    consistency = 'MODERATE';
    if (escalation) {
      warnings.push("Red flag status increased in comparison image.");
    }
    recommendation = "Some variation detected. Consider the context of each image when interpreting results.";
  } else {
    consistency = 'HIGH';
    recommendation = "The subject displays consistent behavioral markers across both images. Expression patterns appear stable and authentic.";
  }

  return {
    sameSubjectConfidence,
    integrityDelta: {
      primaryScore: primaryIntegrityScore,
      comparisonScore: comparisonIntegrityScore,
      delta: integrityDeltaValue,
      interpretation: integrityInterpretation
    },
    expressionDelta: {
      warmthChange,
      trustChange,
      threatChange,
      overallShift,
      interpretation: `Expression shifted ${overallShift.toLowerCase().replace('_', ' ')} between the two images. ` +
                     `Warmth: ${warmthChange > 0 ? '+' : ''}${warmthChange}, Trust: ${trustChange > 0 ? '+' : ''}${trustChange}, Threat: ${threatChange > 0 ? '+' : ''}${threatChange}`
    },
    sfumatoDelta: {
      primaryNoise,
      comparisonNoise,
      delta: noiseDelta,
      consistencyAssessment,
      interpretation: consistencyAssessment === 'STABLE'
        ? "Biological variance is consistent across both images."
        : consistencyAssessment === 'NATURAL_VARIATION'
          ? "Minor variation in biological noise detected - within normal human range."
          : "Significant change in biological variance detected - may indicate context-dependent masking."
    },
    redFlagComparison: {
      primaryStatus,
      comparisonStatus,
      escalation,
      deEscalation,
      interpretation: escalation
        ? "⚠️ Red flag status has ESCALATED from " + primaryStatus + " to " + comparisonStatus + ". The comparison image shows more concerning markers."
        : deEscalation
          ? "✓ Red flag status has DE-ESCALATED from " + primaryStatus + " to " + comparisonStatus + ". The comparison image shows fewer concerning markers."
          : "Red flag status remains " + primaryStatus + " across both images."
    },
    comparisonVerdict: {
      consistency,
      recommendation,
      warnings
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// CRAIG PATCH v1.3 - DUAL IMAGE ANALYSIS ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════════════════
// Runs analysis on two images and generates comparison

export async function analyzeDualPupil(
  request: AnalysisRequest,
  apiKey: string,
  geminiApiKey?: string
): Promise<LeonardoReport> {
  if (!request.comparisonMode || (!request.comparisonImageBase64 && !request.comparisonImageUrl)) {
    // No comparison requested - run standard analysis
    return analyzePupil(request, apiKey, undefined, geminiApiKey);
  }

  console.log("🔄 DUAL IMAGE ANALYSIS: Running comparison mode...");

  // Run primary image analysis
  console.log("📸 Analyzing primary image...");
  const primaryReport = await analyzePupil(request, apiKey, undefined, geminiApiKey);

  // Run comparison image analysis
  console.log("📸 Analyzing comparison image...");
  const comparisonRequest: AnalysisRequest = {
    imageBase64: request.comparisonImageBase64,
    imageUrl: request.comparisonImageUrl,
    mode: request.mode,
    intent: request.intent
  };
  const comparisonReport = await analyzePupil(comparisonRequest, apiKey, undefined, geminiApiKey);

  // Generate comparison analysis
  console.log("📊 Generating comparison analysis...");
  const comparisonAnalysis = generateComparisonAnalysis(primaryReport, comparisonReport);

  // Return the primary report with comparison data attached
  return {
    ...primaryReport,
    comparisonAnalysis,
    comparisonImageUrl: request.comparisonImageUrl ||
      `data:${request.comparisonImageBase64 ? detectMediaType(request.comparisonImageBase64) : 'image/jpeg'};base64,...`
  };
}
