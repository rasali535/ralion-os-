'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, Modal } from '@ralion/ui';
import { Sparkles, Send, Bot, User, Zap, Database, FileText, CheckCircle2, ArrowRight, CornerDownLeft, RefreshCw } from 'lucide-react';
import { processMariQuery, executeMariAction, mariKnowledgeManager, MariActionPayload } from '@ralion/ai';

interface ChatMessage {
  id: string;
  sender: 'USER' | 'MARI';
  text: string;
  actionsSuggested?: MariActionPayload[];
  ragContext?: string;
  timestamp: string;
}

export default function MariAiPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'MARI',
      text: 'Welcome to the Mari AI Intelligence Command Center by Ras Ali Labs. I am continuously monitoring your CRM sales pipeline, overdue invoices, operational tasks, and uploaded organizational SOP knowledge base.',
      timestamp: '12:00 PM'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [executedActions, setExecutedActions] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'CHAT' | 'KNOWLEDGE' | 'ACTIONS'>('CHAT');

  const promptSuggestions = [
    'Show me sales this month',
    'Who has overdue payments?',
    'Create a customer report',
    'Summarize SLA policy',
    'Draft a promotional social post'
  ];

  const handleSendQuery = (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'USER',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsProcessing(true);

    setTimeout(() => {
      const response = processMariQuery(queryText);
      const ragSearch = mariKnowledgeManager.searchKnowledgeBase(queryText);

      const mariMsg: ChatMessage = {
        id: `mari-${Date.now()}`,
        sender: 'MARI',
        text: response.answer,
        actionsSuggested: response.suggestedActions as MariActionPayload[],
        ragContext: ragSearch.includes('No matching') ? undefined : ragSearch,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, mariMsg]);
      setIsProcessing(false);
    }, 500);
  };

  const handleActionExecute = async (action: MariActionPayload) => {
    const res = await executeMariAction(action);
    const actionLabel = action.label || action.title || action.type;
    if (res.success) {
      setExecutedActions(prev => [`Executed: ${actionLabel} — ${res.message}`, ...prev]);
      if (action.type === 'NAVIGATE' && res.outputData?.route) {
        router.push(res.outputData.route);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto h-[calc(100vh-6rem)]">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">Mari AI Platform Workspace</h1>
            <Badge variant="purple" className="font-mono">Ras Ali AI Core v2.0</Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Multi-tenant RAG vector intelligence, natural language business queries, and Mari Action drivers.
          </p>
        </div>

        <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveTab('CHAT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeTab === 'CHAT' ? 'bg-blue-600 text-white' : 'text-zinc-400'}`}
          >
            Conversational Workspace
          </button>
          <button
            onClick={() => setActiveTab('KNOWLEDGE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeTab === 'KNOWLEDGE' ? 'bg-blue-600 text-white' : 'text-zinc-400'}`}
          >
            RAG Knowledge Base
          </button>
          <button
            onClick={() => setActiveTab('ACTIONS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeTab === 'ACTIONS' ? 'bg-blue-600 text-white' : 'text-zinc-400'}`}
          >
            Mari Action Execution History
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      {activeTab === 'CHAT' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 overflow-hidden">
          {/* Chat Messages Panel */}
          <Card className="lg:col-span-2 flex flex-col h-full bg-zinc-900/50 border-zinc-800/80">
            <CardHeader className="py-3 border-b border-zinc-800 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-white">Live Mari AI Conversation Thread</span>
              </div>
              <Badge variant="success">AI/ML API Active</Badge>
            </CardHeader>

            {/* Scrollable Chat */}
            <CardContent className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col gap-2 ${msg.sender === 'USER' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`p-4 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                      msg.sender === 'USER'
                        ? 'bg-blue-600 text-white font-medium shadow-md rounded-tr-none'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-100 shadow-xl rounded-tl-none'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 gap-4 text-[10px] font-mono text-zinc-400 border-b border-zinc-800/60 pb-1">
                      <span className="font-bold text-blue-400 flex items-center gap-1">
                        {msg.sender === 'USER' ? <User className="w-3 h-3 text-white" /> : <Bot className="w-3 h-3 text-blue-400" />}
                        {msg.sender === 'USER' ? 'Enterprise User' : 'Mari AI Assistant'}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <p className="mt-1 whitespace-pre-wrap">{msg.text}</p>

                    {/* RAG Context Quote */}
                    {msg.ragContext && (
                      <div className="mt-3 p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-[11px] text-purple-200">
                        <span className="font-bold text-purple-400 flex items-center gap-1 mb-1">
                          <Database className="w-3 h-3" /> RAG Knowledge Vector Quote:
                        </span>
                        {msg.ragContext}
                      </div>
                    )}
                  </div>

                  {/* Executable Action Chips */}
                  {msg.actionsSuggested && msg.actionsSuggested.length > 0 && (
                    <div className="flex flex-wrap gap-2 max-w-[85%] mt-1">
                      {msg.actionsSuggested.map((action, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => handleActionExecute(action)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-blue-500/40 text-xs font-semibold text-blue-300 hover:bg-blue-600/20 hover:border-blue-400 transition-all shadow-md group"
                        >
                          <Zap className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
                          <span>{action.label || action.title || 'Execute Action'}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isProcessing && (
                <div className="flex items-center gap-2 text-xs text-blue-400 italic">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Mari AI is inspecting database context and RAG vectors...
                </div>
              )}
            </CardContent>

            {/* Input & Prompt Suggestions */}
            <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/80 flex flex-col gap-3">
              {/* Quick Prompt Suggestions */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider shrink-0 mr-1">Suggested:</span>
                {promptSuggestions.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendQuery(prompt)}
                    className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 font-medium whitespace-nowrap transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Text Input Box */}
              <div className="relative">
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendQuery(inputQuery)}
                  placeholder="Ask Mari: 'Show sales this month', 'Who has overdue payments?', or 'Summarize SLA policy'..."
                  className="w-full pl-4 pr-12 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 shadow-inner"
                />
                <button
                  onClick={() => handleSendQuery(inputQuery)}
                  disabled={!inputQuery.trim()}
                  className="absolute right-2 top-2 p-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </Card>

          {/* AI Intelligence Insights Side Panel */}
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xs flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-400" /> Mari AI RAG Status
                </CardTitle>
                <CardDescription>Vector index coverage for organization knowledge</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                  <span className="text-zinc-400">Indexed Knowledge Documents</span>
                  <span className="font-mono font-bold text-white">3 Documents</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                  <span className="text-zinc-400">Total RAG Vector Chunks</span>
                  <span className="font-mono font-bold text-purple-400">4 Chunks</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Semantic Search Model</span>
                  <Badge variant="purple">GPT-4o Mini + Vectors</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="flex-1 overflow-y-auto">
              <CardHeader>
                <CardTitle className="text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Executed Mari Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {executedActions.map((log, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 font-mono">
                    {log}
                  </div>
                ))}
                {executedActions.length === 0 && (
                  <p className="text-xs text-zinc-500 italic text-center py-4">
                    No actions executed yet. Click any suggested action button in the conversation thread to execute.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Knowledge Base Tab */}
      {activeTab === 'KNOWLEDGE' && (
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Organization RAG Knowledge Base</CardTitle>
            <CardDescription>Upload SOPs, manuals, and policies for Mari AI contextual search</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Document Title</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Vector Chunks</th>
                    <th className="p-4">Indexed Status</th>
                    <th className="p-4">Created Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {mariKnowledgeManager.getDocuments().map((doc) => (
                    <tr key={doc.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="p-4 font-bold text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-400" />
                        {doc.title}
                      </td>
                      <td className="p-4 text-zinc-400">{doc.category}</td>
                      <td className="p-4 font-mono text-purple-400">{doc.chunkCount} Chunks</td>
                      <td className="p-4">
                        <Badge variant="purple">Vector Indexed</Badge>
                      </td>
                      <td className="p-4 font-mono text-zinc-400">{doc.createdAt.split('T')[0]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Logs Tab */}
      {activeTab === 'ACTIONS' && (
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Mari AI Action Execution History</CardTitle>
            <CardDescription>Audit log of all automated Mari AI task and report dispatches</CardDescription>
          </CardHeader>
          <CardContent className="p-4 flex flex-col gap-3">
            {executedActions.map((log, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                {log}
              </div>
            ))}
            {executedActions.length === 0 && (
              <div className="p-8 text-center text-zinc-500 text-xs">
                No actions have been triggered in this session yet.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
