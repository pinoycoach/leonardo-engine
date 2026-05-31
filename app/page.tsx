'use client';

import { useState } from 'react';
import { Upload, Loader2, CheckCircle2, XCircle, Eye, Palette, Grid3x3, Sparkles, TrendingUp, ShieldAlert, AlertTriangle, ArrowRightLeft, Trash2, Layers, ImagePlus, X, Download } from 'lucide-react';
import type { LeonardoReport, AnalysisIntent, BatchResult, BatchImageItem } from '@/types/leonardo';

// ═══════════════════════════════════════════════════════════════════════════
// INPUT MODE: 'single' | 'comparison' | 'batch'
// ═══════════════════════════════════════════════════════════════════════════
type InputMode = 'single' | 'comparison' | 'batch';

export default function LeonardoEngine() {
  const [image, setImage] = useState<string | null>(null);
  // ═══════════════════════════════════════════════════════════════════════════
  // CRAIG PATCH v1.3 - DUAL IMAGE COMPARISON MODE
  // ═══════════════════════════════════════════════════════════════════════════
  const [comparisonImage, setComparisonImage] = useState<string | null>(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<LeonardoReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [intent, setIntent] = useState<AnalysisIntent>('first_impression');

  // ═══════════════════════════════════════════════════════════════════════════
  // BATCH MODE STATE - Process 10-60 images
  // ═══════════════════════════════════════════════════════════════════════════
  const [inputMode, setInputMode] = useState<InputMode>('single');
  const [batchImages, setBatchImages] = useState<BatchImageItem[]>([]);
  const [batchResult, setBatchResult] = useState<BatchResult | null>(null);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);
  const [selectedBatchReport, setSelectedBatchReport] = useState<number | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isComparison: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      if (isComparison) {
        setComparisonImage(reader.result as string);
      } else {
        setImage(reader.result as string);
      }
      setReport(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // BATCH IMAGE UPLOAD HANDLER - Multiple files (10-60)
  // ═══════════════════════════════════════════════════════════════════════════
  const handleBatchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    // Validate count (allow adding to existing, but cap at 60)
    const totalAfterAdd = batchImages.length + fileArray.length;
    if (totalAfterAdd > 60) {
      setError(`Too many images. Maximum is 60. You have ${batchImages.length} and tried to add ${fileArray.length}.`);
      return;
    }

    setError(null);
    setBatchResult(null);

    // Convert all files to base64 in parallel
    const newItems: BatchImageItem[] = await Promise.all(
      fileArray.map((file, idx) => {
        return new Promise<BatchImageItem>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              id: `batch-${Date.now()}-${idx}`,
              fileName: file.name,
              base64: reader.result as string,
              status: 'pending'
            });
          };
          reader.readAsDataURL(file);
        });
      })
    );

    setBatchImages(prev => [...prev, ...newItems]);
    // Reset the file input
    e.target.value = '';
  };

  const removeBatchImage = (id: string) => {
    setBatchImages(prev => prev.filter(img => img.id !== id));
  };

  const clearBatchImages = () => {
    setBatchImages([]);
    setBatchResult(null);
    setBatchProgress(null);
    setSelectedBatchReport(null);
    setError(null);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // BATCH ANALYSIS RUNNER
  // ═══════════════════════════════════════════════════════════════════════════
  const runBatchAnalysis = async () => {
    if (batchImages.length < 10 || batchImages.length > 60) {
      setError(`Batch mode requires 10-60 images. You have ${batchImages.length}.`);
      return;
    }

    setAnalyzing(true);
    setError(null);
    setBatchResult(null);
    setSelectedBatchReport(null);
    setBatchProgress({ current: 0, total: batchImages.length });

    // Mark all as analyzing
    setBatchImages(prev => prev.map(img => ({ ...img, status: 'analyzing' as const })));

    try {
      const requestBody = {
        imageBase64: batchImages[0].base64, // First image as primary (required by validator)
        batchMode: true,
        batchImages: batchImages.map(img => img.base64),
        mode: 'full',
        intent: intent
      };

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Batch analysis failed');
      }

      const data = await response.json() as BatchResult;

      // Update individual batch image statuses with actual file names
      setBatchImages(prev => prev.map((img, idx) => {
        const resultItem = data.reports.find(r => r.index === idx);
        return {
          ...img,
          fileName: img.fileName, // Keep original file name
          status: resultItem?.report ? 'complete' as const : 'error' as const,
          report: resultItem?.report,
          error: resultItem?.error
        };
      }));

      // Update file names in batch result to use real file names
      data.reports = data.reports.map((r, idx) => ({
        ...r,
        fileName: batchImages[idx]?.fileName || r.fileName
      }));
      if (data.batchSummary.highestScore.index < batchImages.length) {
        data.batchSummary.highestScore.fileName = batchImages[data.batchSummary.highestScore.index]?.fileName || data.batchSummary.highestScore.fileName;
      }
      if (data.batchSummary.lowestScore.index < batchImages.length) {
        data.batchSummary.lowestScore.fileName = batchImages[data.batchSummary.lowestScore.index]?.fileName || data.batchSummary.lowestScore.fileName;
      }

      setBatchResult(data);
      setBatchProgress({ current: data.completedImages, total: data.totalImages });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Batch analysis failed');
      setBatchImages(prev => prev.map(img => ({ ...img, status: 'error' as const })));
    } finally {
      setAnalyzing(false);
    }
  };

  const runAnalysis = async () => {
    if (!image) return;

    setAnalyzing(true);
    setError(null);

    try {
      // ═══════════════════════════════════════════════════════════════════════════
      // CRAIG PATCH v1.3 - DUAL IMAGE COMPARISON MODE
      // ═══════════════════════════════════════════════════════════════════════════
      const requestBody: Record<string, unknown> = {
        imageBase64: image,
        mode: 'full',
        intent: intent
      };

      // Add comparison data if in comparison mode with a comparison image
      if (comparisonMode && comparisonImage) {
        requestBody.comparisonMode = true;
        requestBody.comparisonImageBase64 = comparisonImage;
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const data = await response.json() as LeonardoReport;
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      {/* Header */}
      <header className="border-b border-amber-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
                Leonardo Engine
              </h1>
              <p className="text-sm text-gray-600">The Renaissance Meets AI</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Upload Section - Show when no image uploaded OR when in batch mode */}
        {(inputMode === 'batch' || !image) && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Upload an Image for Analysis
              </h2>
              <p className="text-gray-600">
                10 AI directors will analyze your image using Renaissance principles and modern forensic techniques
              </p>
            </div>

            <div className="space-y-6">
              {/* ═══════════════════════════════════════════════════════════════════════════
                  SOUL READER v2.5 - PURPOSE-CENTRIC INTENT SELECTOR
                  ═══════════════════════════════════════════════════════════════════════════ */}
              <div className="bg-white p-6 rounded-xl border border-amber-200 shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What are you trying to understand?
                </label>
                <select
                  value={intent}
                  onChange={(e) => setIntent(e.target.value as AnalysisIntent)}
                  className="w-full p-3 rounded-lg border border-amber-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-white text-gray-900"
                >
                  <optgroup label="Assessment Contexts">
                    <option value="first_impression">First Impression - What strangers see in 3 seconds</option>
                    <option value="professional">Professional - Authority & leadership presence</option>
                    <option value="relational">Personal Connection - Warmth & approachability</option>
                    <option value="vetting">Due Diligence - Integrity & red flag detection</option>
                  </optgroup>
                  <optgroup label="Special Modes">
                    <option value="artistic">Artistic Portrait - Aesthetic & visual harmony</option>
                    <option value="baseline">Personal Baseline - Raw metrics for self-tracking</option>
                    <option value="therapeutic">Resilience Check - Grief/stress assessment</option>
                  </optgroup>
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  Soul Reader v3.0 with Craig Patch: Enhanced integrity detection
                </p>
              </div>

              {/* ═══════════════════════════════════════════════════════════════════════════
                  INPUT MODE SELECTOR: Single | Comparison (2) | Batch (10-60)
                  ═══════════════════════════════════════════════════════════════════════════ */}
              <div className="bg-white p-6 rounded-xl border border-amber-200 shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Input Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      setInputMode('single');
                      setComparisonMode(false);
                      setComparisonImage(null);
                      clearBatchImages();
                    }}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      inputMode === 'single'
                        ? 'border-amber-500 bg-amber-50 text-amber-800'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Upload className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-sm font-medium">Single</div>
                    <div className="text-xs opacity-70">1 image</div>
                  </button>
                  <button
                    onClick={() => {
                      setInputMode('comparison');
                      setComparisonMode(true);
                      clearBatchImages();
                    }}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      inputMode === 'comparison'
                        ? 'border-blue-500 bg-blue-50 text-blue-800'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <ArrowRightLeft className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-sm font-medium">Compare</div>
                    <div className="text-xs opacity-70">2 images</div>
                  </button>
                  <button
                    onClick={() => {
                      setInputMode('batch');
                      setComparisonMode(false);
                      setComparisonImage(null);
                      setImage(null);
                      setReport(null);
                    }}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      inputMode === 'batch'
                        ? 'border-purple-500 bg-purple-50 text-purple-800'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Layers className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-sm font-medium">Batch</div>
                    <div className="text-xs opacity-70">10-60 images</div>
                  </button>
                </div>

                {inputMode === 'comparison' && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs text-blue-800">
                    <ArrowRightLeft className="w-4 h-4 inline mr-1" />
                    Upload a primary image and a comparison image to detect changes in expression markers
                  </div>
                )}
                {inputMode === 'batch' && (
                  <div className="mt-3 p-3 bg-purple-50 rounded-lg text-xs text-purple-800">
                    <Layers className="w-4 h-4 inline mr-1" />
                    Upload 10-60 images for batch analysis. Each image will be processed by all 10 AI agents individually. Results include rankings and averages.
                  </div>
                )}
              </div>

              {/* ═══════════════════════════════════════════════════════════════════════════
                  SINGLE / COMPARISON UPLOAD
                  ═══════════════════════════════════════════════════════════════════════════ */}
              {inputMode !== 'batch' && (
                <label className="block">
                  <div className="border-2 border-dashed border-amber-300 rounded-xl p-12 text-center hover:border-amber-500 transition-colors cursor-pointer bg-white">
                    <Upload className="w-16 h-16 mx-auto mb-4 text-amber-600" />
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      {comparisonMode ? 'Upload PRIMARY Image' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Fashion, product, or portrait photography
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, false)}
                    className="hidden"
                  />
                </label>
              )}

              {/* ═══════════════════════════════════════════════════════════════════════════
                  BATCH UPLOAD AREA
                  ═══════════════════════════════════════════════════════════════════════════ */}
              {inputMode === 'batch' && (
                <div className="space-y-4">
                  {/* Upload zone */}
                  <label className="block">
                    <div className="border-2 border-dashed border-purple-300 rounded-xl p-8 text-center hover:border-purple-500 transition-colors cursor-pointer bg-white">
                      <ImagePlus className="w-12 h-12 mx-auto mb-3 text-purple-500" />
                      <p className="text-lg font-medium text-gray-700 mb-1">
                        Select images for batch processing
                      </p>
                      <p className="text-sm text-gray-500 mb-2">
                        Select 10-60 images at once (hold Ctrl/Cmd to select multiple)
                      </p>
                      <p className="text-xs text-purple-600 font-medium">
                        {batchImages.length}/60 images loaded
                        {batchImages.length > 0 && batchImages.length < 10 && (
                          <span className="text-amber-600 ml-2">
                            (need at least {10 - batchImages.length} more)
                          </span>
                        )}
                        {batchImages.length >= 10 && (
                          <span className="text-green-600 ml-2">Ready to analyze</span>
                        )}
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleBatchUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Batch image grid preview */}
                  {batchImages.length > 0 && (
                    <div className="bg-white rounded-xl border border-purple-200 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-800">
                          {batchImages.length} Image{batchImages.length !== 1 ? 's' : ''} Queued
                        </h4>
                        <button
                          onClick={clearBatchImages}
                          className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Clear All
                        </button>
                      </div>
                      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-64 overflow-y-auto">
                        {batchImages.map((img, idx) => (
                          <div key={img.id} className="relative group">
                            <img
                              src={img.base64}
                              alt={img.fileName}
                              className={`w-full aspect-square object-cover rounded-lg border-2 ${
                                img.status === 'complete' ? 'border-green-400' :
                                img.status === 'error' ? 'border-red-400' :
                                img.status === 'analyzing' ? 'border-amber-400 animate-pulse' :
                                'border-gray-200'
                              }`}
                            />
                            <div className="absolute top-0 left-0 bg-black/60 text-white text-[9px] px-1 rounded-tl-lg rounded-br-lg">
                              {idx + 1}
                            </div>
                            {img.status === 'complete' && (
                              <div className="absolute bottom-0 right-0 bg-green-500 text-white text-[9px] px-1 rounded-tl-lg rounded-br-lg font-bold">
                                {img.report?.overallScore}
                              </div>
                            )}
                            {img.status === 'error' && (
                              <div className="absolute bottom-0 right-0 bg-red-500 text-white text-[9px] px-1 rounded-tl-lg rounded-br-lg">
                                ERR
                              </div>
                            )}
                            <button
                              onClick={() => removeBatchImage(img.id)}
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2 truncate">
                        {batchImages.map(img => img.fileName).slice(0, 3).join(', ')}
                        {batchImages.length > 3 && ` ... and ${batchImages.length - 3} more`}
                      </p>
                    </div>
                  )}

                  {/* Batch run button */}
                  {batchImages.length > 0 && (
                    <button
                      onClick={runBatchAnalysis}
                      disabled={analyzing || batchImages.length < 10 || batchImages.length > 60}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      {analyzing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing {batchImages.length} Images...
                        </>
                      ) : (
                        <>
                          <Layers className="w-5 h-5" />
                          Run Batch Analysis ({batchImages.length} images)
                        </>
                      )}
                    </button>
                  )}

                  {/* Batch progress */}
                  {analyzing && batchProgress && (
                    <div className="bg-purple-50 rounded-xl border border-purple-200 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-purple-800">Batch Progress</span>
                        <span className="text-sm text-purple-600">
                          Processing {batchProgress.total} images...
                        </span>
                      </div>
                      <div className="w-full h-3 bg-purple-200 rounded-full overflow-hidden">
                        <div
                          className="h-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all animate-pulse"
                          style={{ width: '100%' }}
                        />
                      </div>
                      <p className="text-xs text-purple-600 mt-2">
                        All 10 AI agents are analyzing each image. This may take several minutes.
                      </p>
                    </div>
                  )}

                  {/* Error display */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <h4 className="font-medium text-red-900 text-sm">Error</h4>
                      </div>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  {/* Batch results */}
                  {batchResult && (
                    <BatchResultsDisplay
                      result={batchResult}
                      images={batchImages}
                      selectedIndex={selectedBatchReport}
                      onSelectReport={setSelectedBatchReport}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Image Preview & Analysis (Single/Comparison modes only) */}
        {image && inputMode !== 'batch' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Image(s) */}
            <div className="space-y-4">
              {/* Primary Image */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                {comparisonMode && (
                  <div className="text-sm font-medium text-amber-700 mb-2 flex items-center gap-1">
                    <span className="bg-amber-100 px-2 py-0.5 rounded">PRIMARY</span>
                  </div>
                )}
                <img
                  src={image}
                  alt="Uploaded"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>

              {/* ═══════════════════════════════════════════════════════════════════════════
                  CRAIG PATCH v1.3 - COMPARISON IMAGE UPLOAD
                  ═══════════════════════════════════════════════════════════════════════════ */}
              {comparisonMode && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="text-sm font-medium text-blue-700 mb-2 flex items-center gap-1">
                    <span className="bg-blue-100 px-2 py-0.5 rounded">COMPARISON</span>
                    {comparisonImage && (
                      <button
                        onClick={() => setComparisonImage(null)}
                        className="ml-auto text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {comparisonImage ? (
                    <img
                      src={comparisonImage}
                      alt="Comparison"
                      className="w-full h-auto rounded-lg shadow-lg"
                    />
                  ) : (
                    <label className="block cursor-pointer">
                      <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                        <Upload className="w-12 h-12 mx-auto mb-3 text-blue-500" />
                        <p className="text-sm font-medium text-gray-700">
                          Upload comparison image
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Same subject, different context or time
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, true)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              )}

              <button
                onClick={runAnalysis}
                disabled={analyzing || (comparisonMode && !comparisonImage)}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-amber-700 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {comparisonMode ? 'Analyzing Both Images...' : 'Deploying 10 AI Directors...'}
                  </>
                ) : (
                  <>
                    {comparisonMode ? <ArrowRightLeft className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    {comparisonMode ? 'Run Comparison Analysis' : 'Run Leonardo Analysis'}
                  </>
                )}
              </button>

              {comparisonMode && !comparisonImage && (
                <p className="text-sm text-center text-amber-600">
                  Please upload a comparison image to run the analysis
                </p>
              )}

              <button
                onClick={() => {
                  setImage(null);
                  setComparisonImage(null);
                  setReport(null);
                  setError(null);
                }}
                className="w-full text-gray-600 hover:text-gray-900 transition-colors"
              >
                Upload Different Image{comparisonMode ? 's' : ''}
              </button>
            </div>

            {/* Right: Results */}
            <div className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <h3 className="font-semibold text-red-900">Analysis Error</h3>
                  </div>
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {analyzing && <AgentStatus />}

              {report && <ReportDisplay report={report} />}
            </div>
          </div>
        )}

        {/* About Section - Only show on single/comparison mode landing */}
        {!image && !report && inputMode !== 'batch' && (
          <div className="max-w-4xl mx-auto mt-16">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
              The 5 AI Directors
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AgentCard
                icon={<Grid3x3 className="w-6 h-6" />}
                name="The Anatomist"
                description="Analyzes proportions using Leonardo da Vinci's Vitruvian principles"
              />
              <AgentCard
                icon={<Palette className="w-6 h-6" />}
                name="The Light Master"
                description="Evaluates lighting quality using Renaissance techniques"
              />
              <AgentCard
                icon={<Grid3x3 className="w-6 h-6" />}
                name="The Composition Director"
                description="Assesses visual structure and balance"
              />
              <AgentCard
                icon={<Sparkles className="w-6 h-6" />}
                name="The Texture Critic"
                description="Analyzes material quality and authenticity"
              />
              <AgentCard
                icon={<TrendingUp className="w-6 h-6" />}
                name="The Commercial Strategist"
                description="Evaluates market fit and conversion potential"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function AgentCard({ icon, name, description }: { icon: React.ReactNode; name: string; description: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center text-amber-700 mb-4">
        {icon}
      </div>
      <h4 className="font-semibold text-gray-900 mb-2">{name}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

function AgentStatus() {
  const agents = [
    'The Anatomist',
    'The Light Master',
    'The Composition Director',
    'The Texture Critic',
    'The Commercial Strategist'
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Analysis in Progress</h3>
      <div className="space-y-3">
        {agents.map((agent) => (
          <div key={agent} className="flex items-center gap-3">
            <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
            <span className="text-sm text-gray-700">{agent}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportDisplay({ report }: { report: LeonardoReport }) {
  // ═══════════════════════════════════════════════════════════════════════════
  // CRAIG PATCH v1.2 - VETO PROTOCOL (The Kill Switch)
  // ═══════════════════════════════════════════════════════════════════════════
  // If vetoActive is true, BLOCK positive sentiment display entirely
  const summaryHeader = report.summaryHeader;
  const tieredSummary = report.tieredSummary;
  const vetoActive = summaryHeader?.vetoActive ?? tieredSummary?.vetoApplied ?? false;

  // Determine the header icon
  const HeaderIcon = summaryHeader?.icon === 'shield-alert' ? ShieldAlert :
                     summaryHeader?.icon === 'alert-triangle' ? AlertTriangle :
                     CheckCircle2;

  return (
    <div className="space-y-6">
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* VETO PROTOCOL HEADER - The Kill Switch (Cunanan/Craig Rule) */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {summaryHeader && (
        <div className={`${summaryHeader.color} rounded-xl p-6 text-white`}>
          <div className="flex items-center gap-3 mb-3">
            <HeaderIcon className="w-8 h-8" />
            <h2 className="text-2xl font-bold">{summaryHeader.title}</h2>
          </div>
          <p className="text-white/90">{summaryHeader.summaryText}</p>
          {summaryHeader.vetoActive && (
            <div className="mt-4 bg-black/20 rounded-lg p-3">
              <p className="text-sm font-semibold">⛔ VETO PROTOCOL ACTIVE: Positive sentiment analysis has been blocked.</p>
            </div>
          )}
        </div>
      )}

      {/* Tiered Summary (Only show if different from header) */}
      {tieredSummary && tieredSummary.headline !== summaryHeader?.title && (
        <div className={`rounded-xl p-6 ${
          tieredSummary.style === 'CRITICAL' ? 'bg-red-50 border-2 border-red-300' :
          tieredSummary.style === 'WARNING' ? 'bg-yellow-50 border-2 border-yellow-300' :
          'bg-green-50 border-2 border-green-300'
        }`}>
          <h3 className={`font-bold text-lg mb-2 ${
            tieredSummary.style === 'CRITICAL' ? 'text-red-800' :
            tieredSummary.style === 'WARNING' ? 'text-yellow-800' :
            'text-green-800'
          }`}>{tieredSummary.headline}</h3>
          <p className={`${
            tieredSummary.style === 'CRITICAL' ? 'text-red-700' :
            tieredSummary.style === 'WARNING' ? 'text-yellow-700' :
            'text-green-700'
          }`}>{tieredSummary.body}</p>
          {tieredSummary.vetoApplied && tieredSummary.vetoReason && (
            <div className="mt-3 text-xs font-mono bg-black/10 rounded px-2 py-1 inline-block">
              Veto Reason: {tieredSummary.vetoReason}
            </div>
          )}
        </div>
      )}

      {/* Overall Score - Conditionally styled based on veto */}
      <div className={`rounded-xl p-6 text-white ${
        vetoActive ? 'bg-gradient-to-br from-red-600 to-red-800' :
        'bg-gradient-to-br from-amber-600 to-orange-600'
      }`}>
        <div className="text-center">
          <div className="text-6xl font-bold mb-2">{report.overallScore}</div>
          <div className={vetoActive ? 'text-red-100' : 'text-amber-100'}>Leonardo Score</div>
          {vetoActive && (
            <div className="text-red-200 text-sm mt-2 font-semibold">
              ⚠️ Score may not reflect true character - see analysis above
            </div>
          )}
          <div className={`text-xs mt-2 ${vetoActive ? 'text-red-200' : 'text-amber-200'}`}>
            Analyzed in {(report.processingTime / 1000).toFixed(1)}s
          </div>
        </div>
      </div>

      {/* Executive Summary - BLOCKED if veto is active */}
      {!vetoActive && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Executive Summary</h3>
          <p className="text-gray-700">{report.executiveSummary}</p>
        </div>
      )}

      {/* If veto is active, show a warning instead of the positive summary */}
      {vetoActive && (
        <div className="bg-red-50 rounded-xl border-2 border-red-200 p-6">
          <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" />
            Executive Summary Blocked
          </h3>
          <p className="text-red-700">
            The standard executive summary has been blocked by the Veto Protocol.
            The subject&apos;s expression triggered high-risk markers (Hyper-Congruence or Mastermind Profile)
            that indicate potential impression management. Do not rely on visual impressions of warmth or authenticity.
          </p>
        </div>
      )}

      {/* Top Recommendations */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Top Recommendations</h3>
        <div className="space-y-3">
          {report.topRecommendations.map((rec, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-sm font-semibold">
                {i + 1}
              </div>
              <p className="text-gray-700 text-sm">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          CRAIG PATCH v1.3 - COMPARISON ANALYSIS RESULTS
          ═══════════════════════════════════════════════════════════════════════════ */}
      {report.comparisonAnalysis && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
          <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5" />
            Comparison Analysis Results
          </h3>

          {/* Same Subject Confidence */}
          <div className="mb-4 p-3 bg-white rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Same Subject Confidence</span>
              <span className={`text-sm font-bold ${
                report.comparisonAnalysis.sameSubjectConfidence >= 70 ? 'text-green-600' :
                report.comparisonAnalysis.sameSubjectConfidence >= 40 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {report.comparisonAnalysis.sameSubjectConfidence}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div
                className={`h-2 rounded-full ${
                  report.comparisonAnalysis.sameSubjectConfidence >= 70 ? 'bg-green-500' :
                  report.comparisonAnalysis.sameSubjectConfidence >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${report.comparisonAnalysis.sameSubjectConfidence}%` }}
              />
            </div>
          </div>

          {/* Consistency Verdict */}
          <div className={`mb-4 p-4 rounded-lg ${
            report.comparisonAnalysis.comparisonVerdict.consistency === 'HIGH' ? 'bg-green-100 border border-green-200' :
            report.comparisonAnalysis.comparisonVerdict.consistency === 'MODERATE' ? 'bg-yellow-100 border border-yellow-200' :
            'bg-red-100 border border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {report.comparisonAnalysis.comparisonVerdict.consistency === 'HIGH' ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : report.comparisonAnalysis.comparisonVerdict.consistency === 'MODERATE' ? (
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-red-600" />
              )}
              <span className="font-semibold">
                Consistency: {report.comparisonAnalysis.comparisonVerdict.consistency}
              </span>
            </div>
            <p className="text-sm text-gray-700">
              {report.comparisonAnalysis.comparisonVerdict.recommendation}
            </p>
            {report.comparisonAnalysis.comparisonVerdict.warnings.length > 0 && (
              <ul className="mt-2 space-y-1">
                {report.comparisonAnalysis.comparisonVerdict.warnings.map((warning, i) => (
                  <li key={i} className="text-sm text-amber-700 flex items-center gap-1">
                    <span>⚠️</span> {warning}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Delta Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Integrity Delta */}
            <div className="p-3 bg-white rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Integrity Delta</h4>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg font-bold text-gray-800">
                  {report.comparisonAnalysis.integrityDelta.primaryScore}
                </span>
                <span className="text-gray-400">→</span>
                <span className="text-lg font-bold text-gray-800">
                  {report.comparisonAnalysis.integrityDelta.comparisonScore}
                </span>
                <span className={`text-sm font-bold ${
                  report.comparisonAnalysis.integrityDelta.delta > 0 ? 'text-green-600' :
                  report.comparisonAnalysis.integrityDelta.delta < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  ({report.comparisonAnalysis.integrityDelta.delta > 0 ? '+' : ''}{report.comparisonAnalysis.integrityDelta.delta})
                </span>
              </div>
              <p className="text-xs text-gray-600">{report.comparisonAnalysis.integrityDelta.interpretation}</p>
            </div>

            {/* Expression Delta */}
            <div className="p-3 bg-white rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Expression Shift</h4>
              <div className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${
                report.comparisonAnalysis.expressionDelta.overallShift === 'STABLE' ? 'bg-green-100 text-green-700' :
                report.comparisonAnalysis.expressionDelta.overallShift === 'MORE_OPEN' ? 'bg-blue-100 text-blue-700' :
                report.comparisonAnalysis.expressionDelta.overallShift === 'MORE_GUARDED' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {report.comparisonAnalysis.expressionDelta.overallShift.replace('_', ' ')}
              </div>
              <p className="text-xs text-gray-600">{report.comparisonAnalysis.expressionDelta.interpretation}</p>
            </div>

            {/* Sfumato Delta */}
            <div className="p-3 bg-white rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Biological Variance</h4>
              <div className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${
                report.comparisonAnalysis.sfumatoDelta.consistencyAssessment === 'STABLE' ? 'bg-green-100 text-green-700' :
                report.comparisonAnalysis.sfumatoDelta.consistencyAssessment === 'NATURAL_VARIATION' ? 'bg-blue-100 text-blue-700' :
                'bg-red-100 text-red-700'
              }`}>
                {report.comparisonAnalysis.sfumatoDelta.consistencyAssessment.replace('_', ' ')}
              </div>
              <p className="text-xs text-gray-600">{report.comparisonAnalysis.sfumatoDelta.interpretation}</p>
            </div>

            {/* Red Flag Comparison */}
            <div className="p-3 bg-white rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Red Flag Status</h4>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">{report.comparisonAnalysis.redFlagComparison.primaryStatus}</span>
                <span className="text-gray-400">→</span>
                <span className="text-sm font-medium">{report.comparisonAnalysis.redFlagComparison.comparisonStatus}</span>
                {report.comparisonAnalysis.redFlagComparison.escalation && (
                  <span className="text-red-600 text-xs font-bold">↑ ESCALATED</span>
                )}
                {report.comparisonAnalysis.redFlagComparison.deEscalation && (
                  <span className="text-green-600 text-xs font-bold">↓ DE-ESCALATED</span>
                )}
              </div>
              <p className="text-xs text-gray-600">{report.comparisonAnalysis.redFlagComparison.interpretation}</p>
            </div>
          </div>
        </div>
      )}

      {/* Agent Results */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Detailed Agent Reports</h3>
        <div className="space-y-4">
          {Object.entries(report.agents).map(([key, agent]) => (
            <AgentResult key={key} agent={agent} />
          ))}
        </div>
      </div>
    </div>
  );
}

function AgentResult({ agent }: { agent: any }) {
  const isSuccess = agent.status === 'success';

  return (
    <div className="border-l-4 border-amber-500 pl-4 py-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isSuccess ? (
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          ) : (
            <XCircle className="w-4 h-4 text-red-600" />
          )}
          <span className="font-medium text-gray-900">{agent.agentName}</span>
        </div>
        <div className="text-sm text-gray-500">
          Confidence: {agent.confidence}%
        </div>
      </div>
      {isSuccess && (
        <div className="text-sm text-gray-600">
          <pre className="bg-gray-50 p-3 rounded overflow-x-auto text-xs">
            {JSON.stringify(agent.analysis, null, 2)}
          </pre>
        </div>
      )}
      {agent.error && (
        <div className="text-sm text-red-600">{agent.error}</div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// BATCH RESULTS DISPLAY COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
function BatchResultsDisplay({
  result,
  images,
  selectedIndex,
  onSelectReport
}: {
  result: BatchResult;
  images: BatchImageItem[];
  selectedIndex: number | null;
  onSelectReport: (index: number | null) => void;
}) {
  const { batchSummary } = result;
  const selectedReport = selectedIndex !== null
    ? result.reports.find(r => r.index === selectedIndex)
    : null;

  const downloadAllReports = () => {
    const exportData = {
      batchSummary: {
        totalImages: result.totalImages,
        completedImages: result.completedImages,
        failedImages: result.failedImages,
        averageLeonardoScore: batchSummary.averageLeonardoScore,
        averageDestinyScore: batchSummary.averageDestinyScore,
        averageIntegrityScore: batchSummary.averageIntegrityScore,
        highestScore: batchSummary.highestScore,
        lowestScore: batchSummary.lowestScore,
        totalProcessingTime: batchSummary.totalProcessingTime,
        exportedAt: new Date().toISOString()
      },
      reports: result.reports.map(r => ({
        index: r.index,
        fileName: r.fileName,
        status: r.report ? 'success' : 'error',
        error: r.error || undefined,
        leonardoScore: r.report?.overallScore,
        destinyScore: r.report?.destinyScore,
        integrityScore: r.report?.integrityScore,
        executiveSummary: r.report?.executiveSummary,
        topRecommendations: r.report?.topRecommendations,
        summaryHeader: r.report?.summaryHeader,
        tieredSummary: r.report?.tieredSummary,
        destinyInsights: r.report?.destinyInsights,
        integrityDossier: r.report?.integrityDossier,
        soulReaderMetadata: r.report?.soulReaderMetadata,
        processingTime: r.report?.processingTime,
        agents: r.report ? Object.fromEntries(
          Object.entries(r.report.agents).map(([key, agent]) => [
            key,
            {
              agentName: agent.agentName,
              confidence: agent.confidence,
              status: agent.status,
              analysis: agent.analysis,
              error: agent.error
            }
          ])
        ) : undefined
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leonardo-batch-report-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Layers className="w-6 h-6" />
            Batch Analysis Complete
          </h3>
          <button
            onClick={downloadAllReports}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Download All Reports
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold">{batchSummary.averageLeonardoScore}</div>
            <div className="text-purple-200 text-xs">Avg Leonardo</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{batchSummary.averageDestinyScore}</div>
            <div className="text-purple-200 text-xs">Avg Destiny</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{batchSummary.averageIntegrityScore}</div>
            <div className="text-purple-200 text-xs">Avg Integrity</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-purple-200 text-xs mb-1">Best Image</div>
            <div className="font-semibold">{batchSummary.highestScore.fileName}</div>
            <div className="text-green-300 font-bold">{batchSummary.highestScore.score}/100</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-purple-200 text-xs mb-1">Weakest Image</div>
            <div className="font-semibold">{batchSummary.lowestScore.fileName}</div>
            <div className="text-red-300 font-bold">{batchSummary.lowestScore.score}/100</div>
          </div>
        </div>
        <div className="mt-3 text-xs text-purple-200">
          {result.completedImages}/{result.totalImages} succeeded
          {result.failedImages > 0 && <span className="text-red-300 ml-2">({result.failedImages} failed)</span>}
          {' '}in {(batchSummary.totalProcessingTime / 1000).toFixed(1)}s
        </div>
      </div>

      {/* Ranked Results Table */}
      <div className="bg-white rounded-xl border border-purple-200 p-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">Rankings (by Leonardo Score)</h4>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {[...result.reports]
            .filter(r => r.report)
            .sort((a, b) => (b.report?.overallScore ?? 0) - (a.report?.overallScore ?? 0))
            .map((r, rank) => {
              const img = images[r.index];
              return (
                <button
                  key={r.index}
                  onClick={() => onSelectReport(selectedIndex === r.index ? null : r.index)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left ${
                    selectedIndex === r.index
                      ? 'bg-purple-100 border border-purple-300'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    rank === 0 ? 'bg-yellow-400 text-yellow-900' :
                    rank === 1 ? 'bg-gray-300 text-gray-700' :
                    rank === 2 ? 'bg-amber-600 text-white' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {rank + 1}
                  </div>
                  {img && (
                    <img
                      src={img.base64}
                      alt={r.fileName}
                      className="w-10 h-10 rounded object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{r.fileName}</div>
                    <div className="text-xs text-gray-500">
                      Destiny: {r.report?.destinyScore ?? '—'} | Integrity: {r.report?.integrityScore ?? '—'}
                    </div>
                  </div>
                  <div className={`text-lg font-bold flex-shrink-0 ${
                    (r.report?.overallScore ?? 0) >= 80 ? 'text-green-600' :
                    (r.report?.overallScore ?? 0) >= 60 ? 'text-amber-600' :
                    'text-red-600'
                  }`}>
                    {r.report?.overallScore}
                  </div>
                </button>
              );
            })}

          {/* Show failed images at bottom */}
          {result.reports.filter(r => !r.report).map(r => (
            <div key={r.index} className="flex items-center gap-3 p-2 rounded-lg bg-red-50 border border-red-200">
              <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-red-100 text-red-600">
                <XCircle className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-red-800 truncate">{r.fileName}</div>
                <div className="text-xs text-red-600 truncate">{r.error}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected report detail view */}
      {selectedReport?.report && (
        <div className="border-2 border-purple-300 rounded-xl overflow-hidden">
          <div className="bg-purple-100 px-4 py-2 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-purple-800">
              Detailed Report: {selectedReport.fileName}
            </h4>
            <button
              onClick={() => onSelectReport(null)}
              className="text-purple-600 hover:text-purple-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4">
            <ReportDisplay report={selectedReport.report} />
          </div>
        </div>
      )}
    </div>
  );
}
