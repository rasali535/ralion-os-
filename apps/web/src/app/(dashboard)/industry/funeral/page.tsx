'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge } from '@ralion/ui';
import { Shield, Plus, Truck, Calendar, DollarSign, User } from 'lucide-react';
import { FuneralCase } from '@ralion/database';

const sampleCases: FuneralCase[] = [
  { id: 'fc1', orgId: 'org-1', createdBy: 'u1', createdAt: '2026-07-24', updatedAt: '2026-07-24', caseNumber: 'FUN-2026-089', deceasedName: 'Late Kealeboga Phiri', dateOfPassing: '2026-07-20', familyName: 'Phiri Family', primaryContactPhone: '+267 71889900', casketSelected: 'Executive Royal Mahogany Casket', hearseAssigned: 'Mercedes Funeral Hearse #1', serviceDate: 'Jul 27, 2026', status: 'PREPARATION' },
  { id: 'fc2', orgId: 'org-1', createdBy: 'u1', createdAt: '2026-07-24', updatedAt: '2026-07-24', caseNumber: 'FUN-2026-090', deceasedName: 'Late Neo Sechele', dateOfPassing: '2026-07-22', familyName: 'Sechele Family', primaryContactPhone: '+267 72445566', casketSelected: 'Standard Heritage Oak Casket', hearseAssigned: 'Cadillac Hearse #2', serviceDate: 'Jul 29, 2026', status: 'INTAKE' },
];

export default function FuneralPluginPage() {
  const [cases, setCases] = useState<FuneralCase[]>(sampleCases);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white">Ralion Funeral</h1>
            <Badge variant="purple" className="gap-1">
              <Shield className="w-3 h-3" /> Industry Plugin
            </Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Funeral cases, family intake, casket inventory, hearse fleet scheduling, and payment tracking.
          </p>
        </div>

        <Button variant="primary" size="sm">
          <Plus className="w-4 h-4" /> Register Funeral Case
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Funeral Cases & Dispatch Schedule</CardTitle>
          <CardDescription>Comprehensive funeral service management</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Case #</th>
                  <th className="p-4">Deceased Name</th>
                  <th className="p-4">Family / Phone</th>
                  <th className="p-4">Casket Selected</th>
                  <th className="p-4">Hearse Fleet Unit</th>
                  <th className="p-4">Service Date</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-blue-400">{c.caseNumber}</td>
                    <td className="p-4 font-bold text-white">{c.deceasedName}</td>
                    <td className="p-4 text-zinc-300">{c.familyName} <br /><span className="text-[10px] text-zinc-500 font-mono">{c.primaryContactPhone}</span></td>
                    <td className="p-4 text-zinc-300">{c.casketSelected}</td>
                    <td className="p-4 text-zinc-300 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-zinc-400" /> {c.hearseAssigned}
                    </td>
                    <td className="p-4 font-mono text-zinc-300">{c.serviceDate}</td>
                    <td className="p-4">
                      <Badge variant="purple">{c.status}</Badge>
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
