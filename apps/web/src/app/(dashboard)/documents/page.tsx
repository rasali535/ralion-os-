'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge } from '@ralion/ui';
import { Folder, FileText, Upload, Sparkles, Download, Eye, Lock, Share2 } from 'lucide-react';

interface DocItem {
  id: string;
  name: string;
  category: string;
  size: string;
  updated: string;
  ragIndexed: boolean;
}

const sampleDocs: DocItem[] = [
  { id: 'd1', name: 'Ras_Ali_Labs_Company_SOP_2026.pdf', category: 'Company Policy', size: '2.4 MB', updated: 'Yesterday', ragIndexed: true },
  { id: 'd2', name: 'Enterprise_Service_Agreement_Template.docx', category: 'Legal Contracts', size: '480 KB', updated: 'Jul 20', ragIndexed: true },
  { id: 'd3', name: 'Botswana_Customs_Clearance_Checklist.pdf', category: 'Logistics Docs', size: '1.1 MB', updated: 'Jul 18', ragIndexed: false },
  { id: 'd4', name: 'Ralion_Health_Clinical_Protocol_V1.pdf', category: 'Health Protocol', size: '3.8 MB', updated: 'Jul 15', ragIndexed: true },
];

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocItem[]>(sampleDocs);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white">Central Document Management</h1>
            <Badge variant="primary">Phase 1 Core</Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Upload files, manage folders, generate PDF templates, and feed Mari AI Knowledge Base.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Folder className="w-4 h-4" /> Create Folder
          </Button>
          <Button variant="primary" size="sm">
            <Upload className="w-4 h-4" /> Upload Files
          </Button>
        </div>
      </div>

      {/* Document Folders Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { name: 'Company SOPs', count: '14 Files' },
          { name: 'Legal Contracts', count: '8 Files' },
          { name: 'Financial Receipts', count: '42 Files' },
          { name: 'Mari AI Knowledge Base', count: '19 Indexed Docs' },
        ].map((folder, idx) => (
          <Card key={idx} className="p-4 hover:border-blue-500/40 cursor-pointer transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Folder className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold text-white">{folder.name}</h4>
                <p className="text-[10px] text-zinc-400">{folder.count}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Document File Table */}
      <Card>
        <CardHeader>
          <CardTitle>Enterprise Document Storage</CardTitle>
          <CardDescription>Files stored with automatic Mari AI vector indexing</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Document Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">File Size</th>
                  <th className="p-4">Mari RAG Vector Status</th>
                  <th className="p-4">Updated</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {docs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      {doc.name}
                    </td>
                    <td className="p-4 text-zinc-400">{doc.category}</td>
                    <td className="p-4 font-mono text-zinc-400">{doc.size}</td>
                    <td className="p-4">
                      {doc.ragIndexed ? (
                        <Badge variant="purple" className="gap-1">
                          <Sparkles className="w-3 h-3" /> Mari RAG Ready
                        </Badge>
                      ) : (
                        <Badge variant="default">Pending Index</Badge>
                      )}
                    </td>
                    <td className="p-4 font-mono text-zinc-400">{doc.updated}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"><Eye className="w-3.5 h-3.5" /></button>
                        <button className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"><Download className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
