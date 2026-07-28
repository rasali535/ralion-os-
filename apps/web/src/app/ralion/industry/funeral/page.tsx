'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, Modal } from '@ralion/ui';
import { Shield, Plus, FileText, Calendar, Truck, DollarSign, UserCheck, Download, Sparkles, X } from 'lucide-react';
interface FuneralCase {
  id: string;
  orgId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  caseNumber: string;
  deceasedName: string;
  status: string;
  serviceDate: string;
}
import { generateEnterpriseDocument } from '@ralion/core';


interface ExtendedFuneralCase extends FuneralCase {
  familyContact: string;
  phone: string;
  paymentStatus: 'PAID' | 'PARTIAL' | 'PENDING';
  totalCost: number;
  casketSelected?: string;
  hearseAssigned?: string;
}


const sampleDovesCases: ExtendedFuneralCase[] = [
  {
    id: 'f1',
    orgId: 'doves-funeral-parlour',
    createdBy: 'u-doves-admin',
    createdAt: '2026-07-24',
    updatedAt: '2026-07-24',
    caseNumber: 'FC-2026-088',
    deceasedName: 'Late Kgosi Phiri',
    familyContact: 'Kagiso Phiri (Son)',
    phone: '+267 71990011',
    serviceDate: 'Jul 29, 2026',
    casketSelected: 'Oak Deluxe Executive Casket',
    hearseAssigned: 'Mercedes-Benz Hearse #H-02',
    status: 'IN_PROGRESS',
    paymentStatus: 'PARTIAL',
    totalCost: 35000
  },
  {
    id: 'f2',
    orgId: 'doves-funeral-parlour',
    createdBy: 'u-doves-admin',
    createdAt: '2026-07-22',
    updatedAt: '2026-07-22',
    caseNumber: 'FC-2026-087',
    deceasedName: 'Late Mpho Khama',
    familyContact: 'Tshepo Khama (Brother)',
    phone: '+267 72110099',
    serviceDate: 'Jul 27, 2026',
    casketSelected: 'Mahogany Elite Casket',
    hearseAssigned: 'Cadillac Hearse #H-01',
    status: 'SCHEDULED',
    paymentStatus: 'PAID',
    totalCost: 42000
  }
];

export default function FuneralPluginPage() {
  const [cases, setCases] = useState<ExtendedFuneralCase[]>(sampleDovesCases);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCase, setNewCase] = useState({
    deceasedName: '',
    familyContact: '',
    phone: '+267 70000000',
    serviceDate: '2026-08-02',
    casketSelected: 'Oak Deluxe Executive Casket',
    totalCost: '35000'
  });

  const handleCreateCase = () => {
    if (!newCase.deceasedName || !newCase.familyContact) return;
    const created: ExtendedFuneralCase = {
      id: `f-${Date.now()}`,
      orgId: 'doves-funeral-parlour',
      createdBy: 'u-admin',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      caseNumber: `FC-2026-0${cases.length + 89}`,
      deceasedName: newCase.deceasedName,
      familyContact: newCase.familyContact,
      phone: newCase.phone,
      serviceDate: newCase.serviceDate,
      casketSelected: newCase.casketSelected,
      hearseAssigned: 'Mercedes-Benz Hearse #H-03',
      status: 'SCHEDULED',
      paymentStatus: 'PENDING',
      totalCost: parseFloat(newCase.totalCost) || 35000
    };
    setCases(prev => [created, ...prev]);
    setIsModalOpen(false);
    setNewCase({ deceasedName: '', familyContact: '', phone: '+267 70000000', serviceDate: '2026-08-02', casketSelected: 'Oak Deluxe Executive Casket', totalCost: '35000' });
  };

  const handleExportPDF = (c: ExtendedFuneralCase) => {
    const docRes = generateEnterpriseDocument({
      templateType: 'FUNERAL_CONTRACT',
      orgName: 'Doves Funeral Parlour',
      clientName: c.familyContact,
      clientEmail: c.phone,
      items: [
        { description: `Funeral Service Package — ${c.casketSelected}`, qty: 1, unitPrice: c.totalCost * 0.8 },
        { description: `Hearse Dispatch (${c.hearseAssigned})`, qty: 1, unitPrice: c.totalCost * 0.2 }
      ],
      notes: `Case Number: ${c.caseNumber}\nDeceased: ${c.deceasedName}\nService Date: ${c.serviceDate}`
    });

    const element = document.createElement('a');
    const file = new Blob([docRes.formattedText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = docRes.fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white">Ralion Funeral</h1>
            <Badge variant="primary" className="gap-1 font-mono">
              <Shield className="w-3.5 h-3.5" /> Doves Funeral Demo (Build Prompt 5)
            </Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Ralion Funeral — Empowered to Prosper: Supporting families with dignity and efficiency.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" /> Create Funeral Case File
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-zinc-900 border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase">Active Cases</span>
            <Shield className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{cases.length} Cases</div>
          <p className="text-[10px] text-zinc-500 mt-1">Doves Funeral Parlour Registry</p>
        </Card>

        <Card className="p-4 bg-zinc-900 border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase">Hearse Fleet Dispatches</span>
            <Truck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400 mt-2">2 Vehicles Active</div>
          <p className="text-[10px] text-zinc-500 mt-1">Cadillac & Mercedes Fleet</p>
        </Card>

        <Card className="p-4 bg-zinc-900 border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase">Contract Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">
            ${cases.reduce((s, c) => s + c.totalCost, 0).toLocaleString()}
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">Total Case Contract Value</p>
        </Card>
      </div>

      {/* Cases Table */}
      <Card>
        <CardHeader>
          <CardTitle>Doves Funeral Case Registry</CardTitle>
          <CardDescription>Bereavement cases, casket selection, and family payment status</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Case #</th>
                  <th className="p-4">Deceased Name</th>
                  <th className="p-4">Family Contact</th>
                  <th className="p-4">Casket Selected</th>
                  <th className="p-4">Hearse Fleet</th>
                  <th className="p-4">Service Date</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-blue-400">{c.caseNumber}</td>
                    <td className="p-4 font-bold text-white">{c.deceasedName}</td>
                    <td className="p-4 text-zinc-300">{c.familyContact} <br /><span className="text-[10px] font-mono text-zinc-500">{c.phone}</span></td>
                    <td className="p-4 text-zinc-300">{c.casketSelected}</td>
                    <td className="p-4 text-purple-400 font-mono text-[11px]">{c.hearseAssigned}</td>
                    <td className="p-4 font-mono text-zinc-300">{c.serviceDate}</td>
                    <td className="p-4">
                      <Badge variant={c.paymentStatus === 'PAID' ? 'success' : 'primary'}>{c.paymentStatus}</Badge>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleExportPDF(c)}
                        className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white flex items-center gap-1 ml-auto text-[11px]"
                      >
                        <Download className="w-3.5 h-3.5" /> PDF Contract
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Doves Funeral Case Registration">
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-300">Late Deceased Name</label>
            <input
              type="text"
              value={newCase.deceasedName}
              onChange={(e) => setNewCase({ ...newCase, deceasedName: e.target.value })}
              placeholder="e.g. Late Kgosi Phiri"
              className="w-full mt-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-300">Family Representative</label>
              <input
                type="text"
                value={newCase.familyContact}
                onChange={(e) => setNewCase({ ...newCase, familyContact: e.target.value })}
                placeholder="e.g. Kagiso Phiri"
                className="w-full mt-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-300">Phone</label>
              <input
                type="text"
                value={newCase.phone}
                onChange={(e) => setNewCase({ ...newCase, phone: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-300">Service Date</label>
              <input
                type="date"
                value={newCase.serviceDate}
                onChange={(e) => setNewCase({ ...newCase, serviceDate: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-300">Package Cost ($)</label>
              <input
                type="number"
                value={newCase.totalCost}
                onChange={(e) => setNewCase({ ...newCase, totalCost: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleCreateCase} className="bg-blue-600 font-bold">
              Save Funeral Case
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
