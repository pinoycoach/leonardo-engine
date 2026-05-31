// Core types for Leonardo Engine multi-agent system
// ═══════════════════════════════════════════════════════════════════════════
// SOUL READER v2.5 - NEXUS 3.5 WEIGHTED FORENSICS CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════
// Based on Da Vinci's observations and Renaissance physiognomic principles

/**
 * SOUL READER v3.0 Constants - "THE CRAIG PATCH"
 * These values represent the "Da Vincian" weighted engine parameters
 *
 * Updated with the James Craig Case learnings:
 * - Hyper-Congruence Detection (scores >98% are suspicious, not perfect)
 * - Sfumato Coefficient (biological noise measurement)
 * - Enhanced Mask of Sanity detection
 *
 * Da Vinci Principles Applied:
 * 1. Sfumato - Living things have soft edges and variance ("smoke")
 * 2. Falace Fisonomia - Perfect static expressions are false
 * 3. Moti Mentali - Internal thoughts must match external expressions
 * 4. Vitruvian Imperfection - Nature is never perfectly symmetrical
 */
export const SOUL_READER_CONSTANTS = {
  // Ocular Primacy Factor: The eyes carry 90% of the "truth" weight
  // Da Vinci: "The eyes are the window to the soul"
  OCULAR_PRIMACY_FACTOR: 1.8,

  // Oral Masking Factor: The mouth is discounted as a "social tool"
  // The mouth can be easily controlled for social smiles
  ORAL_MASKING_FACTOR: 0.2,

  // Symmetry Sweet Spot: Natural human symmetry range
  // Da Vinci observed that the Vitruvian Man was an IDEAL, not reality
  SYMMETRY_SWEET_SPOT_MIN: 85.0,
  SYMMETRY_SWEET_SPOT_MAX: 95.0,

  // Statue Threshold: Symmetry >= 97% triggers "Uncanny Valley" penalty
  // Leonardo's Rule: Nature is NEVER perfectly symmetrical
  STATUE_THRESHOLD: 97,
  STATUE_PENALTY: 15,

  // ═══════════════════════════════════════════════════════════════════════════
  // CRAIG PATCH v1.0 - HYPER-CONGRUENCE DETECTION
  // ═══════════════════════════════════════════════════════════════════════════
  // The James Craig Case: A 99.75% score was a FALSE NEGATIVE
  // Perfect congruence is SUSPICIOUS, not ideal
  // Psychopaths have no internal conflict to leak through expressions

  // Hyper-Congruence Threshold: Scores above this trigger suspicion
  // Human expressions naturally have 3-15% variance ("biological noise")
  HYPER_CONGRUENCE_THRESHOLD: 96,

  // Hyper-Congruence Penalty: Applied when expression is "too perfect"
  // This caps the maximum "trust" we assign to perfect expressions
  HYPER_CONGRUENCE_PENALTY: 35,

  // ═══════════════════════════════════════════════════════════════════════════
  // SFUMATO COEFFICIENT - BIOLOGICAL NOISE DETECTION
  // ═══════════════════════════════════════════════════════════════════════════
  // Da Vinci's Sfumato: "Going up in smoke" - soft transitions in living things
  // A genuine face has micro-asymmetries, tremors, and blood flow variations
  // A masked face (like James Craig's) is rigid with near-zero variance

  // Minimum Biological Noise: A living expression must have at least this variance
  // Below this threshold, the expression is considered "artificial" or "rehearsed"
  // NEW RULE: If BiologicalNoise < 3% THEN TruthScore = CAP_AT_60 (SUSPICIOUS)
  SFUMATO_MIN_NOISE: 3.0,

  // ═══════════════════════════════════════════════════════════════════════════
  // THE "TOO GOOD TO BE TRUE" ZONE - BELL CURVE INVERSION
  // ═══════════════════════════════════════════════════════════════════════════
  // Zone 1: The Chaos (0-40%) -> Flag: Unstable / Distressed
  // Zone 2: The Human (41-94%) -> Status: Authentic (IDEAL ZONE)
  // Zone 3: The Android (95-100%) -> Flag: "Hyper-Congruence" / Deceptive
  //
  // When biological noise is below 3%, cap the score at 60% (SUSPICIOUS)
  // This is the "Weaponized Cynicism" - perfect execution = scripted behavior
  SFUMATO_CAP_SCORE: 60, // Maximum score when biological noise is below threshold

  // ═══════════════════════════════════════════════════════════════════════════
  // CRITICAL THRESHOLD - AUTO-FAIL TRIGGER
  // ═══════════════════════════════════════════════════════════════════════════
  // NEXUS RECOMMENDATION: Any score with <2% Biological Noise must AUTO-FAIL
  // This is the "James Craig" hard-lock - no exceptions
  SFUMATO_CRITICAL_THRESHOLD: 2.0,
  SFUMATO_AUTO_FAIL: true, // Hard-coded production lock

  // Sfumato Sweet Spot: Optimal biological noise range for authenticity
  // A face must have at least 3% "Biological Noise" to be verified as truthful
  SFUMATO_OPTIMAL_MIN: 5.0,
  SFUMATO_OPTIMAL_MAX: 15.0,

  // Sfumato Penalty: Applied when biological noise is below minimum
  // This indicates a "statue-like" or "rehearsed" expression
  SFUMATO_PENALTY: 40,

  // ═══════════════════════════════════════════════════════════════════════════
  // BELL CURVE ZONE THRESHOLDS
  // ═══════════════════════════════════════════════════════════════════════════
  // Zone 1: The Chaos (0-40%) - Unstable/Distressed
  CHAOS_ZONE_MAX: 40,
  // Zone 2: The Human (41-94%) - Authentic (Ideal)
  HUMAN_ZONE_MIN: 41,
  HUMAN_ZONE_MAX: 94,
  // Zone 3: The Android (95-100%) - Hyper-Congruent/Deceptive
  ANDROID_ZONE_MIN: 95,

  // ═══════════════════════════════════════════════════════════════════════════
  // MASK OF SANITY DETECTION
  // ═══════════════════════════════════════════════════════════════════════════
  // Research shows psychopaths can deliberately produce convincing expressions
  // but have deficits in AUTOMATIC emotional mimicry

  // Micro-Expression Stillness: Low micro-expression count is suspicious
  // A genuine person shows 2-5 micro-expressions per assessment window
  MICRO_EXPRESSION_MIN: 2,

  // Mask of Sanity Warning Threshold: Combined score triggers this warning
  // When: High Congruence + Low Biological Noise + Low Micro-Expressions
  MASK_OF_SANITY_THRESHOLD: 0.8,

  // Machiavellian Trigger: High Symmetry + Low Truth Score
  MACHIAVELLIAN_SYMMETRY_THRESHOLD: 85,
  MACHIAVELLIAN_TRUTH_THRESHOLD: 70,
  MACHIAVELLIAN_PENALTY: 10,

  // Contempt Penalty: Contempt is the #1 predictor of deceptive behavior
  CONTEMPT_PENALTY: 20,

  // Resilience Bonus: Protective Hyper-Vigilance (not deception)
  RESILIENCE_BONUS: 5,

  // Protective Re-categorization thresholds
  HIGH_THREAT_THRESHOLD: 60,
  LOW_WARMTH_THRESHOLD: 25,
} as const;

export interface VitruvianMetrics {
  headRatio: number; // Target: 8.0 (height = 8 heads)
  apeIndex: number; // Target: 1.0 (wingspan = height)
  goldenRatioScore: number; // 0-100
  symmetryScore: number; // 0-100
  proportionAnalysis: string;
  recommendations: string[];
}

export interface LightingAnalysis {
  chiaroscuroScore: number; // 0-100 (light/dark contrast)
  sfumato: number; // 0-100 (soft transitions)
  direction: 'front' | 'side' | 'back' | 'three-quarter' | 'rembrandt';
  quality: 'harsh' | 'soft' | 'dramatic' | 'flat' | 'golden';
  mood: string;
  improvements: string[];
}

export interface CompositionAnalysis {
  ruleOfThirds: number; // 0-100 adherence (legacy — kept for backward compat)
  visualBalance: number; // 0-100
  focalPoints: string[];
  negativeSpace: number; // 0-100 effective use
  flowDirection: string;
  improvements: string[];
  // ─── Da Vinci Framework Analysis (v2.0) ───────────────────────────────────
  daVinciFramework?: {
    adherence: number;  // 0-100
    primaryFramework: 'pyramid' | 'golden_spiral' | 'diagonal' | 'geometric_center' | 'mixed';
    frameworkNotes: string;
  };
}

export interface TextureAnalysis {
  skinDetail: number; // 0-100
  fabricQuality: number; // 0-100
  uncannyValleyRisk: number; // 0-100 (lower is better)
  authenticityScore: number; // 0-100
  materialNotes: string[];
  improvements: string[];
}

export interface CommercialAnalysis {
  conversionPotential: number; // 0-100
  targetDemographic: string[];
  marketFit: number; // 0-100
  brandAlignment: string;
  usageRecommendations: string[];
  competitiveAdvantage: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// LEONARDO ENGINE 2.0 - ARCHETYPAL DESTINY AGENTS
// ═══════════════════════════════════════════════════════════════════════════

export interface ArchetypeAnalysis {
  primaryArchetype: {
    type: string;
    confidence: number; // 0-100
    description: string;
  };
  secondaryArchetype: {
    type: string;
    confidence: number; // 0-100
  };
  humourProfile: {
    choleric: number; // 0-100 (fire: passionate, intense)
    sanguine: number; // 0-100 (air: warm, sociable)
    melancholic: number; // 0-100 (earth: brooding, mysterious)
    phlegmatic: number; // 0-100 (water: calm, stable)
    dominantHumour: string;
    interpretation: string;
  };
  perfectRoles: string[]; // Roles with 90%+ fit
  wrongRoles: string[]; // Roles with <30% fit
  historicalParallels: string[]; // Historical/fictional character matches
  careerTrajectory: {
    perfectGenres: string[];
    perfectBrands: string[];
    influenceNiche: string;
  };
}

export interface FirstImpressionAnalysis {
  attentionCapture: number; // 0-100
  attentionTriggers: {
    visualContrast: string;
    featureDominance: string;
    eyeMagnetism: string;
    expressionIntensity: string;
  };
  snapJudgments: {
    trust: number; // 0-100
    trustReasoning: string;
    power: number; // 0-100
    powerReasoning: string;
    warmth: number; // 0-100
    warmthReasoning: string;
    threat: number; // 0-100
    threatReasoning: string;
    mystery: number; // 0-100
    mysteryReasoning: string;
  };
  emotionalImpact: {
    primary: Array<{ emotion: string; probability: number }>;
    secondary: Array<{ emotion: string; probability: number }>;
  };
  marketingIntelligence: {
    scrollStoppingPower: 'EXCEPTIONAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    adConversion: string;
    viralPotential: string;
    brandAlignment: string[];
  };
  synthesis: string;
}

export interface InfluenceAnalysis {
  mimeticDesire: {
    score: number; // 0-100
    reasoning: string;
    aspirationTriggers: string[];
  };
  parasocialBond: {
    score: number; // 0-100
    reasoning: string;
    bondType: string;
    warning?: string;
  };
  authorityProjection: {
    score: number; // 0-100
    reasoning: string;
    leadershipType: string;
  };
  overallInfluence: number; // 0-100 (weighted calculation)
  calculation: string; // Formula breakdown
  destinyPrediction: {
    fatedPaths: string[]; // Career paths with 90%+ fit
    wrongPaths: string[]; // Career paths with <30% fit
    brandPartnerships: string[];
    tenYearTrajectory: string;
    influenceNiche: string;
  };
  targetDemographics: string[];
  synthesis: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// LEONARDO ENGINE 2.0 - INTEGRITY DOSSIER AGENTS (The Truth Layer)
// Based on Da Vinci's "Moti Mentali" (Motions of the Mind) principle
// ═══════════════════════════════════════════════════════════════════════════

/**
 * THE RED FLAG METRIC (Agent 9 - The Sentinel)
 *
 * Scans for involuntary "Dark Triad" markers and micro-expressions
 * that contradict a subject's primary archetype.
 *
 * Based on Da Vinci's observation that "the motions of the mind"
 * must be mirrored in "the motions of the features."
 *
 * CRAIG PATCH v1.0 UPDATE:
 * Added Sfumato Coefficient and Hyper-Congruence Detection
 * to catch "perfect performances" (Mask of Sanity)
 */
export interface RedFlagAnalysis {
  // Duchenne Disconnect: Eye-mouth smile disparity (fake vs real warmth)
  duchenneMarkers: {
    eyeEngagement: number; // 0-100 (orbicularis oculi activation)
    mouthCurvature: number; // 0-100 (zygomaticus major activation)
    disconnect: number; // 0-100 (higher = more fake)
    assessment: 'GENUINE' | 'SOCIAL_SMILE' | 'MASKED' | 'INCONGRUENT';
    reasoning: string;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // CRAIG PATCH v1.0 - SFUMATO COEFFICIENT (Biological Noise Detection)
  // ═══════════════════════════════════════════════════════════════════════════
  // Da Vinci's Sfumato: Living things have "smoke" - soft edges, variance
  // A genuine expression has micro-asymmetries, tremors, blood flow variations
  // A "perfect" expression (like James Craig's) is rigid and artificial
  sfumatoCoefficient: {
    biologicalNoise: number; // 0-100 (variance between left/right, micro-movements)
    microExpressionCount: number; // Number of detected micro-expressions
    expressionRigidity: number; // 0-100 (higher = more rigid/controlled)
    organicVariance: number; // 0-100 (natural fluctuation in expression)
    sfumatoScore: number; // 0-100 (composite "living quality" score)
    assessment: 'ORGANIC' | 'REHEARSED' | 'ARTIFICIAL' | 'HYPER_CONGRUENT';
    reasoning: string;
  };

  // Asymmetric Micro-Sneers: The contempt marker
  asymmetryMarkers: {
    leftSideScore: number; // 0-100 expression intensity
    rightSideScore: number; // 0-100 expression intensity
    asymmetryIndex: number; // 0-100 (higher = more asymmetric)
    contemptDetected: boolean;
    sneerId: 'NONE' | 'MILD' | 'MODERATE' | 'SEVERE';
    reasoning: string;
  };

  // Gaze Intensity Analysis: Fixed predator stare vs natural engagement
  gazeAnalysis: {
    fixationIntensity: number; // 0-100
    blinkNaturalness: number; // 0-100 (estimated)
    scleraVisibility: number; // 0-100 (Sanpaku indicator)
    predatorStare: boolean;
    gazeType: 'WARM_ENGAGED' | 'NEUTRAL' | 'COLD_CALCULATING' | 'PREDATORY' | 'AVOIDANT';
    reasoning: string;
  };

  // Dark Triad Cluster Detection
  darkTriadIndicators: {
    machiavellianism: number; // 0-100 (manipulation potential)
    narcissism: number; // 0-100 (grandiosity markers)
    psychopathy: number; // 0-100 (emotional coldness)
    clusterScore: number; // 0-100 (combined risk)
    riskLevel: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
    reasoning: string;
  };

  // The Mastermind Profile: High Symmetry + High Intelligence + Low Warmth
  mastermindProfile: {
    detected: boolean;
    symmetryPower: number; // 0-100
    calculatedPresence: number; // 0-100
    empathyGap: number; // 0-100 (higher = less empathy)
    profileStrength: number; // 0-100
    reasoning: string;
  };

  // Overall Red Flag Assessment
  overallRedFlag: {
    score: number; // 0-100 (0 = clean, 100 = severe flags)
    status: 'CLEAR' | 'YELLOW_FLAG' | 'ORANGE_FLAG' | 'RED_FLAG' | 'HARD_FAIL';
    primaryConcerns: string[];
    mitigatingFactors: string[];
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // CRAIG PATCH v1.0 - HYPER-CONGRUENCE WARNING
  // ═══════════════════════════════════════════════════════════════════════════
  // The James Craig Case: 99.75% score was a FALSE NEGATIVE
  // Perfect congruence without biological noise = MASK OF SANITY
  hyperCongruenceWarning?: {
    triggered: boolean;
    congruenceScore: number; // 0-100 (how "perfect" the expression is)
    sfumatoDeficit: boolean; // true if biological noise below threshold
    maskOfSanityRisk: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    daVinciVerdict: string; // Leonardo's assessment of this "perfection"
  };

  synthesis: string;
}

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
 * - Ap = Archetype Projection scores
 * - Bs = Biological Signaling scores
 */
export interface IntegrityAuditAnalysis {
  // Archetype Projection (What they claim to be)
  archetypeProjection: {
    claimedArchetype: string;
    projectedWarmth: number; // 0-100
    projectedTrust: number; // 0-100
    projectedPower: number; // 0-100
    projectedThreat: number; // 0-100
    socialMaskStrength: number; // 0-100 (how hard they're trying)
  };

  // Biological Signaling (What involuntary markers reveal)
  biologicalSignaling: {
    actualWarmth: number; // 0-100 (from Duchenne analysis)
    actualTrust: number; // 0-100 (from gaze/expression)
    actualPower: number; // 0-100 (from structure)
    actualThreat: number; // 0-100 (from Red Flag Metric)
    maskingEffort: number; // 0-100 (muscle tension indicating effort)
  };

  // The Incongruence Calculation
  incongruenceMetrics: {
    warmthDelta: number; // |projected - actual|
    trustDelta: number;
    powerDelta: number;
    threatDelta: number;
    totalDelta: number; // Sum of all deltas
    incongruencePercentage: number; // 0-100%
  };

  // The Integrity Quotient (Truth Score)
  integrityQuotient: {
    score: number; // 0-100 (100 = total transparency)
    formula: string; // The calculation shown
    interpretation: string;
    status: 'HIGH_INTEGRITY' | 'MODERATE_INTEGRITY' | 'LOW_INTEGRITY' | 'SOCIAL_MASKING_ALERT' | 'HARD_FAIL';
  };

  // Archetype Consistency Check
  archetypeConsistency: {
    claimedVsBiological: string; // Description of the gap
    consistencyScore: number; // 0-100
    deceptionRisk: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
    reasoning: string;
  };

  // Da Vinci Moti Mentali Assessment
  motiMentali: {
    internalExternalAlignment: number; // 0-100
    emotionalCongruence: boolean;
    microExpressionAlignment: boolean;
    daVinciVerdict: string; // What Da Vinci would say
  };

  // Final Verdict
  finalVerdict: {
    truthScore: number; // 0-100 (the main score)
    verdict: 'TRANSPARENT' | 'AUTHENTIC' | 'GUARDED' | 'MASKED' | 'DECEPTIVE';
    confidence: number; // 0-100
    warnings: string[];
    recommendations: string[];
    // ─── Graduated Response (Notebook mode v2.0) ──────────────────────────
    // Replaces hard veto blocks with contextual annotations
    graduatedResponse?: GraduatedResponse;
  };

  synthesis: string;
}

export interface AgentResult {
  agentName: string;
  processingTime: number; // milliseconds
  confidence: number; // 0-100
  analysis: VitruvianMetrics | LightingAnalysis | CompositionAnalysis | TextureAnalysis | CommercialAnalysis | ArchetypeAnalysis | FirstImpressionAnalysis | InfluenceAnalysis | RedFlagAnalysis | IntegrityAuditAnalysis | AuthenticityObservation;
  status: 'success' | 'error' | 'processing';
  error?: string;
}

export interface LeonardoReport {
  imageUrl: string;
  timestamp: string;
  overallScore: number; // 0-100 (Leonardo Score from original 5 agents)
  destinyScore?: number; // 0-100 (Archetypal Destiny Score from 3 agents)
  integrityScore?: number; // 0-100 (Truth Score from Integrity Dossier)
  agents: {
    // Original 5 agents (Leonardo Score)
    anatomist: AgentResult;
    lightMaster: AgentResult;
    compositionDirector: AgentResult;
    textureCritic: AgentResult;
    commercialStrategist: AgentResult;
    // 3 agents (Destiny Score) - Leonardo Engine 2.0
    archetypeReader?: AgentResult;
    firstImpressionAnalyzer?: AgentResult;
    influencePredictor?: AgentResult;
    // 2 agents (Integrity Dossier) - Leonardo Engine 2.0 Final [notebook mode]
    redFlagMetric?: AgentResult;
    integrityAuditor?: AgentResult;
    // 1 agent (Authenticity Observer) - Leonardo Engine v2.0 [mirror mode]
    authenticityObserver?: AgentResult;
  };
  executiveSummary: string;
  topRecommendations: string[];

  // ═══════════════════════════════════════════════════════════════════════════
  // CRAIG PATCH v1.2 - VETO PROTOCOL (Hierarchical Summary)
  // ═══════════════════════════════════════════════════════════════════════════
  // The Cunanan Rule: If Hyper-Congruence or Mastermind Profile is detected,
  // the positive sentiment analysis is BLOCKED, not just appended.
  // The Executive Summary must be HIERARCHICAL, not holistic.
  tieredSummary?: {
    style: 'CRITICAL' | 'WARNING' | 'SUCCESS';
    headline: string;
    body: string;
    // VETO PROTOCOL - blocks positive sentiment when risk is high
    vetoApplied: boolean;
    vetoReason?: string;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // VETO PROTOCOL HEADER - For Frontend Display (The Kill Switch)
  // ═══════════════════════════════════════════════════════════════════════════
  // This overrides any positive visual impression when risk is detected
  // If vetoActive is true, the UI must BLOCK positive sentiment display
  summaryHeader?: {
    title: string;
    color: 'bg-red-600' | 'bg-yellow-500' | 'bg-green-500';
    icon: 'shield-alert' | 'alert-triangle' | 'check-circle';
    summaryText: string;
    vetoActive: boolean;
  };

  destinyInsights?: {
    archetypeSummary: string;
    firstImpressionSummary: string;
    influenceSummary: string;
    destinyConclusion: string;
  };
  // The Integrity Dossier (The Truth Layer) [notebook mode]
  integrityDossier?: {
    redFlagSummary: string;
    integrityAuditSummary: string;
    truthScore: number; // 0-100 (the main Integrity Quotient)
    daVinciVerdict: string;
    socialMaskingAlert: boolean;
    finalConclusion: string;
  };
  // ─── Mirror Insights (Renaissance Mirror) [mirror mode] ───────────────────
  mirrorInsights?: {
    naturalnessSummary: string;   // Variance as vitality
    coherenceSummary: string;     // Inner-outer alignment
    biomimicryInspiration: string;// Nature-inspired habit from observation
    harmonyConclusion: string;    // Wonder-inducing synthesis
  };
  // ─── Score Bands (v2.0) ───────────────────────────────────────────────────
  scoreBands?: {
    leonardoScore: ScoredMetric;
    destinyScore: ScoredMetric;
    harmonyScore?: ScoredMetric;  // Mirror mode overall harmony
  };
  // ─── Active analysis mode (v2.0) ──────────────────────────────────────────
  analysisMode?: LeonardoAnalysisMode;
  // ═══════════════════════════════════════════════════════════════════════════
  // SOUL READER v3.0 - Metadata tracking the weighted forensic adjustments
  // Updated with Craig Patch v1.0 (Hyper-Congruence + Sfumato Detection)
  // ═══════════════════════════════════════════════════════════════════════════
  soulReaderMetadata?: {
    // Ocular Primacy applied (1.8 eye weight, 0.2 mouth weight)
    ocularPrimacyApplied: boolean;
    // Statue Alert triggered (symmetry >= 97%)
    statueAlertTriggered: boolean;
    symmetryScore?: number;
    // Machiavellian detection (high symmetry + low truth)
    machiavellianDetected: boolean;
    // Resilience re-categorization applied
    resilienceRecategorized: boolean;
    // Contempt penalty applied
    contemptPenaltyApplied: boolean;
    // Raw score before Soul Reader adjustments
    rawIntegrityScore: number;
    // Final score after Soul Reader adjustments
    adjustedIntegrityScore: number;

    // ═══════════════════════════════════════════════════════════════════════════
    // CRAIG PATCH v1.0 - New Metadata Fields
    // ═══════════════════════════════════════════════════════════════════════════
    // Hyper-Congruence Warning (scores >96% trigger suspicion)
    hyperCongruenceTriggered: boolean;
    hyperCongruenceScore?: number;
    // Sfumato Coefficient (biological noise detection)
    sfumatoCoefficient?: number;
    sfumatoDeficit: boolean; // true if below SFUMATO_MIN_NOISE threshold
    // Mask of Sanity Risk Assessment
    maskOfSanityRisk: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    // Da Vinci's Sfumato Verdict
    sfumatoVerdict?: string;

    // Version identifier
    version: string;
  };
  processingTime: number; // total milliseconds

  // ═══════════════════════════════════════════════════════════════════════════
  // CRAIG PATCH v1.3 - COMPARISON ANALYSIS
  // ═══════════════════════════════════════════════════════════════════════════
  // Optional comparison results when two images are provided
  comparisonAnalysis?: ComparisonAnalysis;
  comparisonImageUrl?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// SOUL READER v2.5 - PURPOSE-CENTRIC ANALYSIS INTENTS
// ═══════════════════════════════════════════════════════════════════════════
// Aligned with Da Vinci's forensic approach: "What am I trying to understand?"
// Each intent contextualizes the synthesis for specific assessment purposes

export type AnalysisIntent =
  | 'first_impression'  // The 3-Second Window: How strangers perceive you instantly
  | 'professional'      // The Authority Assessment: Leadership, competence, business presence
  | 'relational'        // The Heart's Window: Warmth, approachability, emotional connection
  | 'vetting'           // The Mastermind Detector: Integrity verification, red flag focus
  | 'artistic'          // The Renaissance Portrait: Aesthetic harmony, visual mastery
  | 'baseline'          // The Mirror of Truth: Personal tracking, raw metrics only
  | 'therapeutic';      // The Fortified Sage: Resilience assessment, grief/stress context

/**
 * Intent descriptions for UI and documentation
 */
export const INTENT_METADATA: Record<AnalysisIntent, {
  label: string;
  description: string;
  focusAreas: string[];
  daVinciAlignment: string;
}> = {
  first_impression: {
    label: "First Impression",
    description: "What will strangers think in 3 seconds?",
    focusAreas: ["Attention capture", "Snap judgments", "Trust signals", "Warmth projection"],
    daVinciAlignment: "The first impression of a face is a summary of a life"
  },
  professional: {
    label: "Professional/Business",
    description: "Authority, competence, and leadership presence",
    focusAreas: ["Leadership signals", "Commercial viability", "Influence potential", "Power projection"],
    daVinciAlignment: "The commanding presence of Renaissance patrons"
  },
  relational: {
    label: "Personal Connection",
    description: "Warmth, approachability, and emotional openness",
    focusAreas: ["Warmth", "Approachability", "Emotional availability", "Genuine connection"],
    daVinciAlignment: "The Mona Lisa's inviting mystery"
  },
  vetting: {
    label: "Due Diligence",
    description: "Integrity verification and red flag detection",
    focusAreas: ["Truth Score", "Red flags", "Machiavellian detection", "Deception markers"],
    daVinciAlignment: "Know your enemy before you embrace them"
  },
  artistic: {
    label: "Artistic Portrait",
    description: "Aesthetic quality and emotional depth",
    focusAreas: ["Lighting mastery", "Composition", "Texture", "Golden ratio", "Visual harmony"],
    daVinciAlignment: "The technical mastery of Vitruvian principles"
  },
  baseline: {
    label: "Personal Baseline",
    description: "Self-assessment for tracking over time",
    focusAreas: ["Raw metrics", "No external comparison", "Objective observation", "Change tracking"],
    daVinciAlignment: "The anatomist's objective observation"
  },
  therapeutic: {
    label: "Resilience Check",
    description: "Grief/stress assessment with protective re-categorization",
    focusAreas: ["Resilience vs deception", "Protective signals", "Fortification status", "Healing progress"],
    daVinciAlignment: "Da Vinci's later self-portraits showing weathered wisdom"
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// LEONARDO ENGINE v2.0 DUAL-MODE ARCHITECTURE
// ═══════════════════════════════════════════════════════════════════════════
// mirror  → Public Renaissance Mirror. Wonder-inducing, humanity-serving.
//           Phase 3 = AuthenticityObserver (harmonic observation, no forensics)
// notebook → Private Da Vinci Notebook. Full forensic truth-seeking.
//            Phase 3 = RedFlagMetric + IntegrityAuditor (unchanged)
export type LeonardoAnalysisMode = 'mirror' | 'notebook';

// ─── New v2.0 Types ────────────────────────────────────────────────────────

/**
 * AUTHENTICITY OBSERVATION
 * Mirror-mode replacement for the forensic integrity layer.
 * Frames variance as vitality and measures inner-outer coherence.
 *
 * Schema matches Claude handoff spec exactly:
 * expressionFlow — how naturally emotion moves through the face
 * biologicalVitality — the sfumato "living quality" dimension
 */
export interface AuthenticityObservation {
  expressionFlow: {
    naturalness: number;          // 0-100, how organic/unforced the expression appears
    emotionalCoherence: number;   // 0-100, do eyes/mouth/posture tell same story
    presenceLevel: number;        // 0-100, engaged vs. distant/guarded
    assessment: 'FLOWING' | 'COMPOSED' | 'GUARDED' | 'EFFORTFUL';
    reflection: string;           // Warm, growth-oriented interpretation
  };
  biologicalVitality: {
    sfumatoCoefficient: number;   // Biological noise / variance metric
    livingQuality: number;        // 0-100, variance as sign of life
    assessment: 'VIBRANT' | 'NATURAL' | 'CONTROLLED' | 'RIGID';
    reflection: string;           // Growth-oriented note framing variance positively
  };
  harmonyNote: string;            // One-sentence wellness/reflection prompt
  overallScore: number;           // 0-100 composite authenticity flow
  confidence: number;             // 0-100 agent confidence in reading
}

/**
 * GRADUATED RESPONSE
 * Notebook-mode annotation replacing hard veto blocks.
 * Annotates concern level in-context rather than suppressing reports.
 */
export interface GraduatedResponse {
  level: 'NOTE' | 'WARNING' | 'CRITICAL';
  annotation: string;             // Contextual note with Da Vinci framing
}

/**
 * SCORED METRIC WITH CONFIDENCE BAND
 * Wraps any numeric score with epistemic humility.
 * Formula: margin = Math.round((100 - confidence) / 5)
 * e.g. 89% confidence → margin 2 → band {low: score-2, high: score+2}
 *      60% confidence → margin 8 → band {low: score-8, high: score+8}
 */
export interface ScoredMetric {
  score: number;
  confidence: number;             // 0-100 agent/phase confidence
  band: {
    low: number;                  // Math.max(0, score - margin)
    high: number;                 // Math.min(100, score + margin)
  };
  stability: 'HIGH' | 'MODERATE' | 'LOW'; // margin ≤3 → HIGH, ≤7 → MODERATE, else LOW
}

export interface AnalysisRequest {
  imageUrl?: string;
  imageBase64?: string;
  mode: 'full' | 'quick' | 'custom';
  selectedAgents?: string[];
  intent?: AnalysisIntent;
  // ═══════════════════════════════════════════════════════════════════════════
  // LEONARDO ENGINE v2.0 - DUAL-MODE SWITCH
  // ═══════════════════════════════════════════════════════════════════════════
  analysisMode?: LeonardoAnalysisMode; // Default: 'notebook' (preserves existing behavior)
  // ─── SCORING MODE (v2.0) ───────────────────────────────────────────────
  // davinci  → anatomy 35%, light 30%, composition 20%, texture 15%, commercial 0% (DEFAULT)
  // commercial → commercial 30%, light 25%, composition 20%, anatomy 15%, texture 10%
  scoringMode?: 'davinci' | 'commercial'; // Default: 'davinci'
  // ═══════════════════════════════════════════════════════════════════════════
  // CRAIG PATCH v1.3 - DUAL IMAGE COMPARISON (Delta Analysis)
  // ═══════════════════════════════════════════════════════════════════════════
  // Allows comparison between two images of the same subject
  // Useful for detecting changes over time or comparing different contexts
  comparisonMode?: boolean;
  comparisonImageUrl?: string;
  comparisonImageBase64?: string;
  // ═══════════════════════════════════════════════════════════════════════════
  // BATCH MODE - Process 10-60 images sequentially
  // ═══════════════════════════════════════════════════════════════════════════
  batchMode?: boolean;
  batchImages?: string[]; // Array of base64 image strings
}

// ═══════════════════════════════════════════════════════════════════════════
// BATCH PROCESSING TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type BatchImageStatus = 'pending' | 'analyzing' | 'complete' | 'error';

export interface BatchImageItem {
  id: string;
  fileName: string;
  base64: string;
  status: BatchImageStatus;
  report?: LeonardoReport;
  error?: string;
}

export interface BatchResult {
  totalImages: number;
  completedImages: number;
  failedImages: number;
  reports: Array<{
    index: number;
    fileName: string;
    report?: LeonardoReport;
    error?: string;
  }>;
  batchSummary: {
    averageLeonardoScore: number;
    averageDestinyScore: number;
    averageIntegrityScore: number;
    highestScore: { index: number; fileName: string; score: number };
    lowestScore: { index: number; fileName: string; score: number };
    totalProcessingTime: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// CRAIG PATCH v1.3 - COMPARISON ANALYSIS RESULT
// ═══════════════════════════════════════════════════════════════════════════
// Delta analysis between two images
export interface ComparisonAnalysis {
  // Identity verification
  sameSubjectConfidence: number; // 0-100 (are these the same person?)

  // Integrity Delta (changes in truth markers)
  integrityDelta: {
    primaryScore: number;
    comparisonScore: number;
    delta: number; // positive = improved, negative = degraded
    interpretation: string;
  };

  // Expression Delta (changes in expression markers)
  expressionDelta: {
    warmthChange: number; // -100 to +100
    trustChange: number;
    threatChange: number;
    overallShift: 'MORE_GUARDED' | 'MORE_OPEN' | 'STABLE' | 'INCONSISTENT';
    interpretation: string;
  };

  // Sfumato Delta (changes in biological variance)
  sfumatoDelta: {
    primaryNoise: number;
    comparisonNoise: number;
    delta: number;
    consistencyAssessment: 'NATURAL_VARIATION' | 'SUSPICIOUS_CHANGE' | 'STABLE';
    interpretation: string;
  };

  // Red Flag Comparison
  redFlagComparison: {
    primaryStatus: string;
    comparisonStatus: string;
    escalation: boolean; // true if flags increased
    deEscalation: boolean; // true if flags decreased
    interpretation: string;
  };

  // Final Verdict
  comparisonVerdict: {
    consistency: 'HIGH' | 'MODERATE' | 'LOW' | 'SUSPICIOUS';
    recommendation: string;
    warnings: string[];
  };
}
