'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge } from '@ralion/ui';
import { HeartPulse, Plus, FileText, Calendar, UserCheck, Activity } from 'lucide-react';
import { HealthRecord } from '@ralion/database';

const sampleRecords: HealthRecord[] = [
  { id: 'h1', orgId: 'org-1', createdBy: 'u1', createdAt: '2026-07-24', updatedAt: '2026-07-24', patientName: 'Thabo Motsumi', dob: '1988-04-12', gender: 'Male', phone: '+267 71223344', caseNotes: 'Patient experiencing mild anxiety; prescribed weekly counseling session.', assessmentSummary: 'Physical health stable. Wellness score 84/100.', nextAppointment: 'Jul 30, 2026' },
  { id: 'h2', orgId: 'org-1', createdBy: 'u1', createdAt: '2026-07-24', updatedAt: '2026-07-24', patientName: 'Mpho Khama', dob: '1995-11-03', gender: 'Female', phone: '+267 72998877', caseNotes: 'Initial wellness assessment intake complete.', assessmentSummary: 'Normal baseline indicators.', nextAppointment: 'Aug 04, 2026' },
];

export default function HealthPluginPage() {
  const [records, setRecords] = useState<HealthRecord[]>(sampleRecords);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white">Ralion Health</h1>
            <Badge variant="purple" className="gap-1">
              <HeartPulse className="w-3 h-3" /> Industry Plugin
            </Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Clinical client records, intake case notes, wellness assessments, and appointment schedules.
          </p>
        </div>

        <Button variant="primary" size="sm">
          <Plus className="w-4 h-4" /> New Patient Intake
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clinical Patient Records & Intake Notes</CardTitle>
          <CardDescription>Multi-tenant health records isolated per clinic facility</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Patient Name</th>
                  <th className="p-4">DOB / Gender</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Clinical Case Notes</th>
                  <th className="p-4">Next Appointment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      {rec.patientName}
                    </td>
                    <td className="p-4 text-zinc-400">{rec.dob} ({rec.gender})</td>
                    <td className="p-4 font-mono text-zinc-300">{rec.phone}</td>
                    <td className="p-4 text-zinc-300 max-w-md">{rec.caseNotes}</td>
                    <td className="p-4 font-mono text-blue-400">{rec.nextAppointment}</td>
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
