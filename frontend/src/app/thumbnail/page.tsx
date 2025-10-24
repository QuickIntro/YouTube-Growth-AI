'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { apiClient } from '@/lib/api';
import { Upload, Image as ImageIcon, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ThumbnailAnalyzerPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);

  if (status === 'unauthenticated') {
    redirect('/api/auth/signin');
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysis(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast.error('Please select a thumbnail first');
      return;
    }

    setLoading(true);
    try {
      const result = await apiClient.analyzeThumbnail(selectedFile);
      setAnalysis(result);
      toast.success('Thumbnail analyzed successfully!');
    } catch (error) {
      toast.error('Failed to analyze thumbnail');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Thumbnail Analyzer</h1>
          <p className="text-slate-400">
            Upload your thumbnail to get AI-powered analysis and recommendations
          </p>
        </div>

        {/* Upload Section */}
        <div className="glass p-8 rounded-xl">
          <div className="max-w-2xl mx-auto">
            {!previewUrl ? (
              <label className="block cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary transition-colors">
                  <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <div className="text-lg font-medium mb-2">
                    Click to upload thumbnail
                  </div>
                  <div className="text-sm text-muted-foreground">
                    PNG, JPG, WEBP up to 5MB
                  </div>
                </div>
              </label>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Thumbnail preview"
                    className="w-full h-auto"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-5 h-5" />
                        Analyze Thumbnail
                      </>
                    )}
                  </button>

                  <label className="px-6 py-3 bg-muted rounded-lg font-medium hover:bg-muted/80 cursor-pointer flex items-center justify-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    Change Image
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="glass p-8 rounded-xl text-center">
              <div className="text-sm text-muted-foreground mb-2">Overall Score</div>
              <div className={`text-6xl font-bold mb-2 ${getScoreColor(analysis.overall_score)}`}>
                {analysis.overall_score}
              </div>
              <div className="text-muted-foreground">out of 100</div>
            </div>

            {/* Detailed Scores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass p-6 rounded-xl">
                <div className="text-sm text-muted-foreground mb-3">Brightness</div>
                <div className="flex items-center gap-3">
                  <div className={`text-3xl font-bold ${getScoreColor(analysis.brightness_score)}`}>
                    {analysis.brightness_score}
                  </div>
                  <div className="flex-1">
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getScoreBgColor(analysis.brightness_score)} rounded-full`}
                        style={{ width: `${analysis.brightness_score}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass p-6 rounded-xl">
                <div className="text-sm text-muted-foreground mb-3">Contrast</div>
                <div className="flex items-center gap-3">
                  <div className={`text-3xl font-bold ${getScoreColor(analysis.contrast_score)}`}>
                    {analysis.contrast_score}
                  </div>
                  <div className="flex-1">
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getScoreBgColor(analysis.contrast_score)} rounded-full`}
                        style={{ width: `${analysis.contrast_score}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass p-6 rounded-xl">
                <div className="text-sm text-muted-foreground mb-3">Face Detection</div>
                <div className="flex items-center gap-3">
                  <div className={`text-3xl font-bold ${getScoreColor(analysis.face_detection_score)}`}>
                    {analysis.face_detection_score}
                  </div>
                  <div className="flex-1">
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getScoreBgColor(analysis.face_detection_score)} rounded-full`}
                        style={{ width: `${analysis.face_detection_score}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass p-6 rounded-xl">
                <div className="text-sm text-muted-foreground mb-3">Text Detection</div>
                <div className="flex items-center gap-3">
                  <div className={`text-3xl font-bold ${getScoreColor(analysis.text_detection_score)}`}>
                    {analysis.text_detection_score}
                  </div>
                  <div className="flex-1">
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getScoreBgColor(analysis.text_detection_score)} rounded-full`}
                        style={{ width: `${analysis.text_detection_score}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="glass p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
              <div className="space-y-3">
                {analysis.recommendations.map((rec: string, index: number) => {
                  const isPositive = rec.toLowerCase().includes('great') || 
                                   rec.toLowerCase().includes('optimal') ||
                                   rec.toLowerCase().includes('good');
                  
                  return (
                    <div
                      key={index}
                      className={`flex items-start gap-3 p-4 rounded-lg ${
                        isPositive
                          ? 'bg-green-500/10 border border-green-500/20'
                          : 'bg-yellow-500/10 border border-yellow-500/20'
                      }`}
                    >
                      {isPositive ? (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      )}
                      <p className="text-sm">{rec}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Technical Details */}
            {analysis.details && (
              <div className="glass p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4">Technical Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {analysis.details.dimensions && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Dimensions</div>
                      <div className="font-medium">
                        {analysis.details.dimensions.width} × {analysis.details.dimensions.height}
                      </div>
                    </div>
                  )}
                  
                  {analysis.details.brightness && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Brightness</div>
                      <div className="font-medium">
                        {analysis.details.brightness.mean_value?.toFixed(1)}
                      </div>
                    </div>
                  )}
                  
                  {analysis.details.contrast && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Contrast</div>
                      <div className="font-medium">
                        {analysis.details.contrast.value?.toFixed(1)}
                      </div>
                    </div>
                  )}
                  
                  {analysis.details.faces && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Faces Detected</div>
                      <div className="font-medium">{analysis.details.faces.count}</div>
                    </div>
                  )}
                  
                  {analysis.details.text_regions && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Text Coverage</div>
                      <div className="font-medium">
                        {analysis.details.text_regions.coverage_percent?.toFixed(1)}%
                      </div>
                    </div>
                  )}
                  
                  {analysis.details.color_vibrancy && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Color Vibrancy</div>
                      <div className="font-medium">
                        {analysis.details.color_vibrancy.status}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tips */}
        <div className="glass p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-4">Thumbnail Best Practices</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium mb-1">Use High Contrast</div>
                <p className="text-muted-foreground">
                  Make text and important elements stand out clearly
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium mb-1">Include Faces</div>
                <p className="text-muted-foreground">
                  Thumbnails with faces typically get higher CTR
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium mb-1">Add Text Overlay</div>
                <p className="text-muted-foreground">
                  Use 3-5 words to communicate your video topic
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium mb-1">Vibrant Colors</div>
                <p className="text-muted-foreground">
                  Use bright, saturated colors to catch attention
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
