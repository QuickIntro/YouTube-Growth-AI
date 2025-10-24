'use client';

import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { AdSenseUnit } from '@/components/adsense';
import { apiClient } from '@/lib/api';
import { Sparkles, FileText, Tag, Search, Copy, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ToolsPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<string>('titles');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Title Generator State
  const [titleInput, setTitleInput] = useState({
    currentTitle: '',
    description: '',
    keywords: '',
    language: 'bn' as 'bn' | 'en',
  });
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);

  // Description Generator State
  const [descInput, setDescInput] = useState({
    title: '',
    keywords: '',
    language: 'bn' as 'bn' | 'en',
  });
  const [generatedDescription, setGeneratedDescription] = useState('');

  // Tag Generator State
  const [tagInput, setTagInput] = useState({
    title: '',
    description: '',
    language: 'bn' as 'bn' | 'en',
  });
  const [generatedTags, setGeneratedTags] = useState<string[]>([]);

  // Keyword Analyzer State
  const [keyword, setKeyword] = useState('');
  const [keywordAnalysis, setKeywordAnalysis] = useState<any>(null);

  // Title Analysis State
  const [titleAnalysisInput, setTitleAnalysisInput] = useState({
    title: '',
    language: 'bn' as 'bn' | 'en',
  });
  const [titleAnalysis, setTitleAnalysis] = useState<any>(null);

  // Description Analysis State
  const [descAnalysisInput, setDescAnalysisInput] = useState({
    description: '',
    language: 'bn' as 'bn' | 'en',
  });
  const [descAnalysis, setDescAnalysis] = useState<any>(null);

  // Tag Analysis State
  const [tagAnalysisInput, setTagAnalysisInput] = useState({
    tags: '' as string,
    language: 'bn' as 'bn' | 'en',
  });
  const [tagAnalysis, setTagAnalysis] = useState<any>(null);

  // Thumbnail Analysis State (heuristic)
  const [thumbInput, setThumbInput] = useState({ imageUrl: '' });
  const [thumbAnalysis, setThumbAnalysis] = useState<any>(null);

  if (status === 'loading') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (status === 'unauthenticated') {
    signIn('google', { callbackUrl: '/tools' });
    return null;
  }

  const handleGenerateTitles = async () => {
    if (!titleInput.currentTitle) {
      toast.error('Please enter a current title');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.generateTitles({
        currentTitle: titleInput.currentTitle,
        description: titleInput.description,
        keywords: titleInput.keywords.split(',').map(k => k.trim()).filter(Boolean),
        language: titleInput.language,
      });
      setGeneratedTitles(response.titles);
      toast.success('Titles generated successfully!');
    } catch (error) {
      toast.error('Failed to generate titles');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const isTitles = activeTab === 'titles';

  const handleAnalyzeTitle = async () => {
    if (!titleAnalysisInput.title) {
      toast.error('Please enter a title');
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.analyzeTitle({
        title: titleAnalysisInput.title,
        language: titleAnalysisInput.language,
      });
      setTitleAnalysis(res);
      toast.success('Title analyzed successfully!');
    } catch (error) {
      toast.error('Failed to analyze title');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeDescriptionText = async () => {
    if (!descAnalysisInput.description) {
      toast.error('Please enter a description');
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.analyzeDescriptionText({
        description: descAnalysisInput.description,
        language: descAnalysisInput.language,
      });
      setDescAnalysis(res);
      toast.success('Description analyzed successfully!');
    } catch (error) {
      toast.error('Failed to analyze description');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeTagsSet = async () => {
    const list = tagAnalysisInput.tags.split(',').map(t => t.trim()).filter(Boolean);
    if (list.length === 0) {
      toast.error('Please enter at least one tag');
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.analyzeTagsSet({
        tags: list,
        language: tagAnalysisInput.language,
      });
      setTagAnalysis(res);
      toast.success('Tags analyzed successfully!');
    } catch (error) {
      toast.error('Failed to analyze tags');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeThumbnailHeuristic = async () => {
    if (!thumbInput.imageUrl) {
      toast.error('Please provide thumbnail image URL');
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.analyzeThumbnailHeuristic({ imageUrl: thumbInput.imageUrl });
      setThumbAnalysis(res);
      toast.success('Thumbnail analyzed successfully!');
    } catch (error) {
      toast.error('Failed to analyze thumbnail');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!descInput.title) {
      toast.error('Please enter a title');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.generateDescription({
        title: descInput.title,
        keywords: descInput.keywords.split(',').map(k => k.trim()).filter(Boolean),
        language: descInput.language,
      });
      setGeneratedDescription(response.description);
      toast.success('Description generated successfully!');
    } catch (error) {
      toast.error('Failed to generate description');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTags = async () => {
    if (!tagInput.title) {
      toast.error('Please enter a title');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.generateTags({
        title: tagInput.title,
        description: tagInput.description,
        language: tagInput.language,
      });
      setGeneratedTags(response.tags);
      toast.success('Tags generated successfully!');
    } catch (error) {
      toast.error('Failed to generate tags');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeKeyword = async () => {
    if (!keyword) {
      toast.error('Please enter a keyword');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.analyzeKeyword(keyword, 'bn');
      setKeywordAnalysis(response);
      toast.success('Keyword analyzed successfully!');
    } catch (error) {
      toast.error('Failed to analyze keyword');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs: { id: string; name: string; icon: any }[] = [
    { id: 'titles', name: 'Title Generator', icon: Sparkles },
    { id: 'description', name: 'Description Generator', icon: FileText },
    { id: 'tags', name: 'Tag Generator', icon: Tag },
    { id: 'keyword', name: 'Keyword Analyzer', icon: Search },
    { id: 'titleAnalysis', name: 'Title Analysis', icon: Sparkles },
    { id: 'descAnalysis', name: 'Description Analysis', icon: FileText },
    { id: 'tagAnalysis', name: 'Tag Analysis', icon: Tag },
    { id: 'thumbAnalysis', name: 'Thumbnail Analysis', icon: Search },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">AI Tools</h1>
          <p className="text-slate-400">
            Generate optimized titles, descriptions, tags, and analyze keywords using AI
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card hover:bg-muted'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Ad Slot */}
        <AdSenseUnit
          slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOOLS!}
          format="horizontal"
        />

        {/* Title Generator */}
        {isTitles && (
          <div className="glass p-6 rounded-xl space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">AI Title Generator</h2>
              <p className="text-sm text-muted-foreground">
                Generate 5 viral title suggestions for your video
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Current Title *
                </label>
                <input
                  type="text"
                  value={titleInput.currentTitle}
                  onChange={(e) =>
                    setTitleInput({ ...titleInput, currentTitle: e.target.value })
                  }
                  placeholder="Enter your current video title"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={titleInput.description}
                  onChange={(e) =>
                    setTitleInput({ ...titleInput, description: e.target.value })
                  }
                  placeholder="Brief description of your video"
                  rows={3}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Keywords (Optional)
                </label>
                <input
                  type="text"
                  value={titleInput.keywords}
                  onChange={(e) =>
                    setTitleInput({ ...titleInput, keywords: e.target.value })
                  }
                  placeholder="keyword1, keyword2, keyword3"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Language</label>
                <select
                  value={titleInput.language}
                  onChange={(e) =>
                    setTitleInput({
                      ...titleInput,
                      language: e.target.value as 'bn' | 'en',
                    })
                  }
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="bn">Bangla</option>
                  <option value="en">English</option>
                </select>
              </div>

              <button
                onClick={handleGenerateTitles}
                disabled={loading}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Titles
                  </>
                )}

        {/* Title Analysis */}
        {String(activeTab) === 'titleAnalysis' && (
          <div className="glass p-6 rounded-xl space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Title Analysis</h2>
              <p className="text-sm text-muted-foreground">Analyze and score your title for SEO best practices</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Video Title *</label>
                <input
                  type="text"
                  value={titleAnalysisInput.title}
                  onChange={(e) => setTitleAnalysisInput({ ...titleAnalysisInput, title: e.target.value })}
                  placeholder="Enter your video title"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Language</label>
                <select
                  value={titleAnalysisInput.language}
                  onChange={(e) => setTitleAnalysisInput({ ...titleAnalysisInput, language: e.target.value as 'bn'|'en' })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="bn">Bangla</option>
                  <option value="en">English</option>
                </select>
              </div>
              <button onClick={handleAnalyzeTitle} disabled={loading} className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? (<><Loader2 className="w-5 h-5 animate-spin" />Analyzing...</>) : (<>Analyze Title</>)}
              </button>
            </div>
            {titleAnalysis && (
              <div className="space-y-3">
                <h3 className="font-semibold">Analysis</h3>
                <div className="p-4 bg-background border border-border rounded-lg whitespace-pre-wrap text-sm">
                  {JSON.stringify(titleAnalysis, null, 2)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Description Analysis */}
        {String(activeTab) === 'descAnalysis' && (
          <div className="glass p-6 rounded-xl space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Description Analysis</h2>
              <p className="text-sm text-muted-foreground">Analyze and score your description for SEO best practices</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  value={descAnalysisInput.description}
                  onChange={(e) => setDescAnalysisInput({ ...descAnalysisInput, description: e.target.value })}
                  rows={5}
                  placeholder="Paste your description"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Language</label>
                <select
                  value={descAnalysisInput.language}
                  onChange={(e) => setDescAnalysisInput({ ...descAnalysisInput, language: e.target.value as 'bn'|'en' })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="bn">Bangla</option>
                  <option value="en">English</option>
                </select>
              </div>
              <button onClick={handleAnalyzeDescriptionText} disabled={loading} className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? (<><Loader2 className="w-5 h-5 animate-spin" />Analyzing...</>) : (<>Analyze Description</>)}
              </button>
            </div>
            {descAnalysis && (
              <div className="space-y-3">
                <h3 className="font-semibold">Analysis</h3>
                <div className="p-4 bg-background border border-border rounded-lg whitespace-pre-wrap text-sm">
                  {JSON.stringify(descAnalysis, null, 2)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tag Analysis */}
        {String(activeTab) === 'tagAnalysis' && (
          <div className="glass p-6 rounded-xl space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Tag Analysis</h2>
              <p className="text-sm text-muted-foreground">Analyze your tag set for coverage, duplicates, and suggestions</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tags (comma-separated) *</label>
                <input
                  type="text"
                  value={tagAnalysisInput.tags}
                  onChange={(e) => setTagAnalysisInput({ ...tagAnalysisInput, tags: e.target.value })}
                  placeholder="tag1, tag2, tag3"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Language</label>
                <select
                  value={tagAnalysisInput.language}
                  onChange={(e) => setTagAnalysisInput({ ...tagAnalysisInput, language: e.target.value as 'bn'|'en' })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="bn">Bangla</option>
                  <option value="en">English</option>
                </select>
              </div>
              <button onClick={handleAnalyzeTagsSet} disabled={loading} className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? (<><Loader2 className="w-5 h-5 animate-spin" />Analyzing...</>) : (<>Analyze Tags</>)}
              </button>
            </div>
            {tagAnalysis && (
              <div className="space-y-3">
                <h3 className="font-semibold">Analysis</h3>
                <div className="p-4 bg-background border border-border rounded-lg whitespace-pre-wrap text-sm">
                  {JSON.stringify(tagAnalysis, null, 2)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Thumbnail Analysis (URL based) */}
        {String(activeTab) === 'thumbAnalysis' && (
          <div className="glass p-6 rounded-xl space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Thumbnail Analysis</h2>
              <p className="text-sm text-muted-foreground">Heuristic analysis and recommendations for your thumbnail</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Image URL *</label>
                <input
                  type="url"
                  value={thumbInput.imageUrl}
                  onChange={(e) => setThumbInput({ imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button onClick={handleAnalyzeThumbnailHeuristic} disabled={loading} className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? (<><Loader2 className="w-5 h-5 animate-spin" />Analyzing...</>) : (<>Analyze Thumbnail</>)}
              </button>
            </div>
            {thumbAnalysis && (
              <div className="space-y-3">
                <h3 className="font-semibold">Analysis</h3>
                <div className="p-4 bg-background border border-border rounded-lg whitespace-pre-wrap text-sm">
                  {JSON.stringify(thumbAnalysis, null, 2)}
                </div>
              </div>
            )}
          </div>
        )}
              </button>
            </div>

            {generatedTitles.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Generated Titles:</h3>
                {generatedTitles.map((title, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-background border border-border rounded-lg"
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <p className="flex-1">{title}</p>
                    <button
                      onClick={() => copyToClipboard(title)}
                      className="flex-shrink-0 p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Description Generator */}
        {String(activeTab) === 'description' && (
          <div className="glass p-6 rounded-xl space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">AI Description Generator</h2>
              <p className="text-sm text-muted-foreground">
                Generate SEO-optimized description for your video
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Video Title *</label>
                <input
                  type="text"
                  value={descInput.title}
                  onChange={(e) => setDescInput({ ...descInput, title: e.target.value })}
                  placeholder="Enter your video title"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Keywords (Optional)
                </label>
                <input
                  type="text"
                  value={descInput.keywords}
                  onChange={(e) =>
                    setDescInput({ ...descInput, keywords: e.target.value })
                  }
                  placeholder="keyword1, keyword2, keyword3"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Language</label>
                <select
                  value={descInput.language}
                  onChange={(e) =>
                    setDescInput({
                      ...descInput,
                      language: e.target.value as 'bn' | 'en',
                    })
                  }
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="bn">Bangla</option>
                  <option value="en">English</option>
                </select>
              </div>

              <button
                onClick={handleGenerateDescription}
                disabled={loading}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    Generate Description
                  </>
                )}
              </button>
            </div>

            {generatedDescription && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Generated Description:</h3>
                  <button
                    onClick={() => copyToClipboard(generatedDescription)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 bg-background border border-border rounded-lg whitespace-pre-wrap">
                  {generatedDescription}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tag Generator */}
        {String(activeTab) === 'tags' && (
          <div className="glass p-6 rounded-xl space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">AI Tag Generator</h2>
              <p className="text-sm text-muted-foreground">
                Generate relevant tags for your video
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Video Title *</label>
                <input
                  type="text"
                  value={tagInput.title}
                  onChange={(e) => setTagInput({ ...tagInput, title: e.target.value })}
                  placeholder="Enter your video title"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={tagInput.description}
                  onChange={(e) =>
                    setTagInput({ ...tagInput, description: e.target.value })
                  }
                  placeholder="Brief description"
                  rows={3}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Language</label>
                <select
                  value={tagInput.language}
                  onChange={(e) =>
                    setTagInput({
                      ...tagInput,
                      language: e.target.value as 'bn' | 'en',
                    })
                  }
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="bn">Bangla</option>
                  <option value="en">English</option>
                </select>
              </div>

              <button
                onClick={handleGenerateTags}
                disabled={loading}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Tag className="w-5 h-5" />
                    Generate Tags
                  </>
                )}
              </button>
            </div>

            {generatedTags.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Generated Tags:</h3>
                  <button
                    onClick={() => copyToClipboard(generatedTags.join(', '))}
                    className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy All
                      </>
                    )}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {generatedTags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Keyword Analyzer */}
        {String(activeTab) === 'keyword' && (
          <div className="glass p-6 rounded-xl space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Keyword Analyzer</h2>
              <p className="text-sm text-muted-foreground">
                Analyze keyword search volume and competition
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Keyword *</label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Enter keyword to analyze"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                onClick={handleAnalyzeKeyword}
                disabled={loading}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Analyze Keyword
                  </>
                )}
              </button>
            </div>

            {keywordAnalysis && (
              <div className="space-y-4">
                <h3 className="font-semibold">Analysis Results:</h3>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-background border border-border rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">
                      Search Volume
                    </div>
                    <div className="text-2xl font-bold">{keywordAnalysis.searchVolume}</div>
                  </div>
                  <div className="p-4 bg-background border border-border rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Competition</div>
                    <div className="text-2xl font-bold">{keywordAnalysis.competition}</div>
                  </div>
                  <div className="p-4 bg-background border border-border rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">
                      SEO Difficulty
                    </div>
                    <div className="text-2xl font-bold">
                      {keywordAnalysis.seoDifficulty}/10
                    </div>
                  </div>
                </div>

                {keywordAnalysis.relatedKeywords?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Related Keywords:</h4>
                    <div className="flex flex-wrap gap-2">
                      {keywordAnalysis.relatedKeywords.map((kw: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-muted rounded-full text-sm"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {keywordAnalysis.bestPractices && (
                  <div className="p-4 bg-background border border-border rounded-lg">
                    <h4 className="font-medium mb-2">Best Practices:</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {keywordAnalysis.bestPractices}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
