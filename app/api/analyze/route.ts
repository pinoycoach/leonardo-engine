import { NextRequest, NextResponse } from 'next/server';
import { analyzePupil, analyzeDualPupil, detectMediaType } from '@/services/leonardo';
import type { AnalysisRequest, BatchResult } from '@/types/leonardo';

export const runtime = 'nodejs';
export const maxDuration = 300; // 300 seconds for batch processing (up to 60 images)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as AnalysisRequest;

    // Validate API key
    const apiKey = process.env.ANTHROPIC_API_KEY || request.headers.get('x-api-key');

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key required. Set ANTHROPIC_API_KEY environment variable or provide x-api-key header.' },
        { status: 401 }
      );
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // BATCH MODE - Process 10-60 images sequentially
    // ═══════════════════════════════════════════════════════════════════════════
    // Check batch mode BEFORE single-image validation
    if (body.batchMode && body.batchImages && body.batchImages.length > 0) {
      const batchImages = body.batchImages;

      if (batchImages.length < 10 || batchImages.length > 60) {
        return NextResponse.json(
          { error: `Batch mode requires 10-60 images. Got ${batchImages.length}.` },
          { status: 400 }
        );
      }

      console.log(`📦 Starting BATCH ANALYSIS: ${batchImages.length} images...`);
      const batchStartTime = Date.now();

      const reports: BatchResult['reports'] = [];
      let completedImages = 0;
      let failedImages = 0;

      for (let i = 0; i < batchImages.length; i++) {
        const imageBase64 = batchImages[i];
        console.log(`📸 [${i + 1}/${batchImages.length}] Analyzing image...`);

        try {
          // Detect the actual image type (PNG/JPEG/GIF/WebP) from the base64
          // bytes so agents declare the correct media_type to Claude.
          const mediaType = detectMediaType(imageBase64);

          const singleRequest: AnalysisRequest = {
            imageBase64,
            mediaType,
            mode: body.mode || 'full',
            intent: body.intent
          };

          const report = await analyzePupil(singleRequest, apiKey, mediaType);
          reports.push({ index: i, fileName: `Image ${i + 1}`, report });
          completedImages++;
          console.log(`   ✅ Image ${i + 1} complete: Leonardo Score ${report.overallScore}/100`);
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Unknown error';
          reports.push({ index: i, fileName: `Image ${i + 1}`, error: errorMsg });
          failedImages++;
          console.log(`   ❌ Image ${i + 1} failed: ${errorMsg}`);
        }
      }

      // Calculate batch summary
      const successfulReports = reports.filter(r => r.report);
      const leonardoScores = successfulReports.map(r => r.report!.overallScore);
      const destinyScores = successfulReports.map(r => r.report!.destinyScore ?? 0);
      const integrityScores = successfulReports.map(r => r.report!.integrityScore ?? 0);

      const avg = (arr: number[]) => arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

      let highestScore = { index: 0, fileName: 'N/A', score: 0 };
      let lowestScore = { index: 0, fileName: 'N/A', score: 100 };
      for (const r of successfulReports) {
        if (r.report!.overallScore > highestScore.score) {
          highestScore = { index: r.index, fileName: r.fileName, score: r.report!.overallScore };
        }
        if (r.report!.overallScore < lowestScore.score) {
          lowestScore = { index: r.index, fileName: r.fileName, score: r.report!.overallScore };
        }
      }

      const batchResult: BatchResult = {
        totalImages: batchImages.length,
        completedImages,
        failedImages,
        reports,
        batchSummary: {
          averageLeonardoScore: avg(leonardoScores),
          averageDestinyScore: avg(destinyScores),
          averageIntegrityScore: avg(integrityScores),
          highestScore,
          lowestScore,
          totalProcessingTime: Date.now() - batchStartTime
        }
      };

      console.log(`📦 Batch complete: ${completedImages}/${batchImages.length} succeeded`);
      console.log(`   Avg Leonardo: ${batchResult.batchSummary.averageLeonardoScore}`);
      console.log(`   Best: Image ${highestScore.index + 1} (${highestScore.score})`);
      console.log(`   Worst: Image ${lowestScore.index + 1} (${lowestScore.score})`);

      return NextResponse.json(batchResult);
    }

    // Validate request for single/comparison mode
    if (!body.imageBase64 && !body.imageUrl) {
      return NextResponse.json(
        { error: 'Either imageBase64 or imageUrl must be provided' },
        { status: 400 }
      );
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // CRAIG PATCH v1.3 - DUAL IMAGE COMPARISON MODE
    // ═══════════════════════════════════════════════════════════════════════════
    const isComparisonMode = body.comparisonMode &&
      (body.comparisonImageBase64 || body.comparisonImageUrl);

    // Detect the actual image media type (PNG/JPEG/GIF/WebP) from the incoming
    // base64 so every agent declares the correct media_type to Claude. PNG
    // uploads previously failed because 'image/jpeg' was hardcoded.
    const mediaType = body.imageBase64 ? detectMediaType(body.imageBase64) : undefined;
    if (mediaType) {
      console.log(`🖼️ Incoming image media type: ${mediaType}`);
    }

    if (isComparisonMode) {
      console.log('🎨 Starting Leonardo Engine 2.0 DUAL IMAGE COMPARISON analysis...');

      // Run dual analysis (each image's type is auto-detected internally)
      const report = await analyzeDualPupil(body, apiKey);

      console.log('✅ Dual analysis complete:');
      console.log(`   Leonardo Score: ${report.overallScore}/100`);
      console.log(`   Destiny Score: ${report.destinyScore}/100`);
      console.log(`   Integrity Score (Truth): ${report.integrityScore}/100`);
      if (report.comparisonAnalysis) {
        console.log(`   Comparison Consistency: ${report.comparisonAnalysis.comparisonVerdict.consistency}`);
      }

      return NextResponse.json(report);
    }

    console.log('🎨 Starting Leonardo Engine 2.0 FINAL analysis...');

    // Run analysis with all 10 agents
    const report = await analyzePupil(body, apiKey, mediaType);

    console.log('✅ Analysis complete:');
    console.log(`   Leonardo Score: ${report.overallScore}/100`);
    console.log(`   Destiny Score: ${report.destinyScore}/100`);
    console.log(`   Integrity Score (Truth): ${report.integrityScore}/100`);

    return NextResponse.json(report);
    
  } catch (error) {
    console.error('Leonardo Engine error:', error);
    
    return NextResponse.json(
      { 
        error: 'Analysis failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'Leonardo Engine 2.0 FINAL operational',
    version: '2.0.0-final',
    scores: {
      leonardoScore: 'Photo quality analysis (original 5 agents)',
      destinyScore: 'Archetypal destiny analysis (3 agents)',
      integrityScore: 'Truth Score via Da Vinci Incongruence Formula (2 agents)'
    },
    agents: {
      phase1_leonardo: [
        'The Anatomist - Vitruvian proportions',
        'The Light Master - Renaissance lighting',
        'The Composition Director - Visual structure',
        'The Texture Critic - Material quality',
        'The Commercial Strategist - Market fit'
      ],
      phase2_destiny: [
        'The Archetype Reader - Character destiny & Four Humours',
        'The First Impression Analyzer - 3-second snap judgments',
        'The Influence Predictor - Social influence potential'
      ],
      phase3_integrity: [
        'The Red Flag Metric - Dark Triad markers, Duchenne disconnect, asymmetric sneers',
        'The Integrity Auditor - Truth Score via Da Vinci Incongruence Formula'
      ]
    },
    daVinciPrinciples: {
      motiMentali: 'Motions of the Mind - internal thoughts have involuntary external motions',
      vitruvianProportions: 'Golden Ratio and 8-Head Rule as markers for Stability and Trust',
      chiaroscuroSfumato: 'Light/shadow and soft transitions detect digital manipulation'
    },
    integrityFormula: 'V_integrity = 1 - (Σ|Ap - Bs| / 10)',
    totalAgents: 10
  });
}
