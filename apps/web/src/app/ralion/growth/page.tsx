'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge } from '@ralion/ui';
import { TrendingUp, Sparkles, Calendar, Share2, Copy, Send, Megaphone, Check } from 'lucide-react';
import { generateMarketingCampaign } from '@ralion/ai';

export default function GrowthPage() {
  const [promptInput, setPromptInput] = useState('');
  const [platform, setPlatform] = useState('LINKEDIN');
  const [generatedResult, setGeneratedResult] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    if (!promptInput.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      const campaign = generateMarketingCampaign(promptInput, platform);
      setGeneratedResult(campaign);
      setIsGenerating(false);
    }, 700);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white">Ralion Growth AI Marketing Studio</h1>
            <Badge variant="purple" className="gap-1">
              <Sparkles className="w-3 h-3" /> Phase 3 Growth Engine
            </Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Social media scheduling (Facebook, Instagram, LinkedIn, TikTok, X, YouTube), Mari AI Content Generator, and Campaign Builder.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaign Builder Form */}
        <Card className="lg:col-span-1 bg-gradient-to-b from-zinc-900 to-blue-950/20 border-blue-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-blue-400" /> Mari AI Content Studio
            </CardTitle>
            <CardDescription>Enter product promotion or campaign goal</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300">Campaign Prompt / Topic</label>
              <textarea
                rows={3}
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="e.g. Launch a Christmas Promotion offering 20% discount on Ralion OS enterprise tier..."
                className="w-full mt-1.5 p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300">Target Social Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full mt-1.5 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:border-blue-500"
              >
                <option value="LINKEDIN">LinkedIn Enterprise</option>
                <option value="FACEBOOK">Facebook Business</option>
                <option value="INSTAGRAM">Instagram Visual</option>
                <option value="X">X (Twitter)</option>
              </select>
            </div>

            <Button
              variant="glass"
              isLoading={isGenerating}
              onClick={handleGenerate}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 border-none text-white font-bold"
            >
              <Sparkles className="w-4 h-4" /> Generate Campaign Strategy
            </Button>
          </CardContent>
        </Card>

        {/* AI Output Preview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated Campaign Materials</CardTitle>
              <Badge variant="success">Mari AI Output</Badge>
            </div>
            <CardDescription>Review and schedule generated posts across channels</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {generatedResult ? (
              <div className="flex flex-col gap-4">
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-[10px] uppercase font-mono font-bold text-blue-400">Headline</span>
                  <h3 className="text-base font-bold text-white mt-1">{generatedResult.headline}</h3>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-mono font-bold text-purple-400">{platform} Caption</span>
                    <button
                      onClick={() => handleCopy(generatedResult.captions[platform])}
                      className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied!' : 'Copy Text'}
                    </button>
                  </div>
                  <p className="text-xs text-zinc-200 leading-relaxed font-sans">{generatedResult.captions[platform]}</p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {generatedResult.hashtags.map((ht: string, idx: number) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-blue-400">
                      {ht}
                    </span>
                  ))}
                </div>

                <div className="mt-2 flex items-center gap-3">
                  <Button variant="primary" size="sm">
                    <Calendar className="w-4 h-4" /> Schedule to Content Calendar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Send className="w-4 h-4" /> Publish Live Now
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                <Sparkles className="w-8 h-8 text-blue-500/40 mx-auto mb-3 animate-pulse" />
                <p className="text-xs">Enter a topic prompt on the left and click "Generate Campaign Strategy" to trigger Mari Growth AI.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
