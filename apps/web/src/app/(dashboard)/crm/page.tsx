'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, Modal } from '@ralion/ui';
import { Users, Plus, Search, Filter, Phone, Mail, DollarSign, Calendar, MessageSquare, Sparkles } from 'lucide-react';
import { DEAL_STAGE_PROBABILITIES } from '@ralion/core';
import { DealStage } from '@ralion/database';

interface ContactItem {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  type: 'LEAD' | 'CUSTOMER' | 'SUPPLIER' | 'PARTNER';
  dealValue: number;
  stage: DealStage;
  tags: string[];
}

const initialContacts: ContactItem[] = [
  { id: '1', name: 'Lesedi Mokgosi', company: 'Kalahari Mining Ltd', email: 'lesedi@kalaharimining.bw', phone: '+267 71234567', type: 'CUSTOMER', dealValue: 45000, stage: 'PROPOSAL', tags: ['Enterprise', 'Botswana'] },
  { id: '2', name: 'John Peterson', company: 'Apex Logistics Inc', email: 'j.peterson@apexlogistics.com', phone: '+1 415 892 1102', type: 'LEAD', dealValue: 28000, stage: 'QUALIFIED', tags: ['Logistics', 'SaaS'] },
  { id: '3', name: 'Kagiso Tau', company: 'Gaborone Health Clinic', email: 'ktau@gaboronehealth.co.bw', phone: '+267 72112233', type: 'CUSTOMER', dealValue: 12500, stage: 'WON', tags: ['Health Plugin'] },
  { id: '4', name: 'Sarah Jenkins', company: 'Global Trade Corp', email: 'sjenkins@globaltrade.io', phone: '+44 20 7946 0912', type: 'LEAD', dealValue: 62000, stage: 'NEGOTIATION', tags: ['Trade Plugin'] },
];

export default function CRMPage() {
  const [contacts, setContacts] = useState<ContactItem[]>(initialContacts);
  const [activeTab, setActiveTab] = useState<'PIPELINE' | 'CONTACTS'>('PIPELINE');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', company: '', email: '', phone: '', dealValue: '10000', stage: 'LEAD' as DealStage });

  const pipelineStages: DealStage[] = ['LEAD', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON'];

  const handleAddContact = () => {
    if (!newContact.name || !newContact.email) return;
    const created: ContactItem = {
      id: Date.now().toString(),
      name: newContact.name,
      company: newContact.company || 'Independent',
      email: newContact.email,
      phone: newContact.phone || '+267 70000000',
      type: 'LEAD',
      dealValue: parseFloat(newContact.dealValue) || 10000,
      stage: newContact.stage,
      tags: ['New Lead']
    };
    setContacts(prev => [created, ...prev]);
    setIsAddModalOpen(false);
    setNewContact({ name: '', company: '', email: '', phone: '', dealValue: '10000', stage: 'LEAD' });
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white">Universal CRM & Sales Pipeline</h1>
            <Badge variant="primary">Phase 1 Core</Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Manage contacts, deal values, activity timelines, and sales funnels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setActiveTab('PIPELINE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeTab === 'PIPELINE' ? 'bg-blue-600 text-white' : 'text-zinc-400'}`}
            >
              Sales Pipeline
            </button>
            <button
              onClick={() => setActiveTab('CONTACTS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeTab === 'CONTACTS' ? 'bg-blue-600 text-white' : 'text-zinc-400'}`}
            >
              Contacts Directory
            </button>
          </div>

          <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4" /> Add Lead / Contact
          </Button>
        </div>
      </div>

      {/* Sales Pipeline View */}
      {activeTab === 'PIPELINE' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto pb-4">
          {pipelineStages.map((stage) => {
            const stageDeals = contacts.filter(c => c.stage === stage);
            const totalStageValue = stageDeals.reduce((sum, d) => sum + d.dealValue, 0);

            return (
              <div key={stage} className="flex flex-col gap-3 min-w-[200px] bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/80">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-xs font-bold text-white tracking-wider">{stage}</span>
                  <Badge variant="default" className="text-[10px]">{stageDeals.length}</Badge>
                </div>
                <div className="text-[10px] text-zinc-400 font-mono font-semibold">
                  Total: ${totalStageValue.toLocaleString()}
                </div>

                <div className="flex flex-col gap-2.5">
                  {stageDeals.map((deal) => (
                    <Card key={deal.id} className="p-3.5 hover:border-blue-500/50 cursor-pointer transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{deal.name}</span>
                        <Badge variant="primary" className="text-[9px]">${(deal.dealValue / 1000).toFixed(0)}k</Badge>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">{deal.company}</p>
                      <div className="mt-3 flex items-center justify-between text-[10px] text-zinc-500">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-zinc-400" /> {deal.email.split('@')[0]}</span>
                        <span className="font-mono text-blue-400">{DEAL_STAGE_PROBABILITIES[stage]}% win</span>
                      </div>
                    </Card>
                  ))}
                  {stageDeals.length === 0 && (
                    <div className="p-4 border border-dashed border-zinc-800 rounded-lg text-center text-[11px] text-zinc-600">
                      No active deals
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Contacts Table View */}
      {activeTab === 'CONTACTS' && (
        <Card>
          <CardHeader>
            <CardTitle>Contacts Directory</CardTitle>
            <CardDescription>All leads, active customers, suppliers, and partners</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Contact Name</th>
                    <th className="p-4">Company</th>
                    <th className="p-4">Email / Phone</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Deal Stage</th>
                    <th className="p-4 text-right">Deal Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {contacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="p-4 font-bold text-white">{contact.name}</td>
                      <td className="p-4 text-zinc-300">{contact.company}</td>
                      <td className="p-4 text-zinc-400 font-mono">{contact.email} <br /><span className="text-[10px]">{contact.phone}</span></td>
                      <td className="p-4">
                        <Badge variant={contact.type === 'CUSTOMER' ? 'success' : 'primary'}>{contact.type}</Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant="purple">{contact.stage}</Badge>
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-white">${contact.dealValue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Contact Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Lead / Contact">
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-300">Full Name</label>
            <input
              type="text"
              value={newContact.name}
              onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              placeholder="e.g. Kagiso Phiri"
              className="w-full mt-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-300">Company Name</label>
            <input
              type="text"
              value={newContact.company}
              onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
              placeholder="e.g. Ras Ali Tech"
              className="w-full mt-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-300">Email Address</label>
              <input
                type="email"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                placeholder="email@company.com"
                className="w-full mt-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-300">Deal Value ($)</label>
              <input
                type="number"
                value={newContact.dealValue}
                onChange={(e) => setNewContact({ ...newContact, dealValue: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleAddContact}>Save Contact</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
