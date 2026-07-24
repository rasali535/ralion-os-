'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, Modal } from '@ralion/ui';
import { HeartPulse, Plus, FileText, Calendar, UserCheck, Activity, Download, Sparkles, X, User } from 'lucide-react';
import { HealthRecord } from '@ralion/database';
import { generateEnterpriseDocument } from '@ralion/core';

interface ExtendedHealthRecord extends HealthRecord {
  wellnessScore: number;
  emergencyContact: string;
  notesHistory: Array<{ date: string; author: string; note: string }>;
}

const samplePameltexRecords: ExtendedHealthRecord[] = [
  {
    id: 'h1',
    orgId: 'pameltex-healthcare',
    createdBy: 'u-dr-lesedi',
    createdAt: '2026-07-24',
    updatedAt: '2026-07-24',
    patientName: 'Thabo Motsumi',
    dob: '1988-04-12',
    gender: 'Male',
    phone: '+267 71223344',
    caseNotes: 'Patient experiencing mild anxiety; prescribed weekly counseling sessions.',
    assessmentSummary: 'Physical health stable. Counseling score 84/100.',
    nextAppointment: 'Jul 30, 2026',
    wellnessScore: 84,
    emergencyContact: 'Kagiso Motsumi (+267 71998877)',
    notesHistory: [
      { date: 'Jul 24, 2026', author: 'Dr. Lesedi Phiri', note: 'Initial clinical intake assessment complete. Baseline indicators normal.' },
      { date: 'Jul 20, 2026', author: 'Nurse Mpho', note: 'Patient phone consultation intake.' }
    ]
  },
  {
    id: 'h2',
    orgId: 'pameltex-healthcare',
    createdBy: 'u-dr-lesedi',
    createdAt: '2026-07-24',
    updatedAt: '2026-07-24',
    patientName: 'Mpho Khama',
    dob: '1995-11-03',
    gender: 'Female',
    phone: '+267 72998877',
    caseNotes: 'Initial wellness assessment intake complete.',
    assessmentSummary: 'Normal baseline indicators.',
    nextAppointment: 'Aug 04, 2026',
    wellnessScore: 92,
    emergencyContact: 'Tshepo Khama (+267 72110099)',
    notesHistory: [
      { date: 'Jul 22, 2026', author: 'Dr. Lesedi Phiri', note: 'Wellness intake evaluation. High compliance observed.' }
    ]
  },
];

export default function HealthPluginPage() {
  const [records, setRecords] = useState<ExtendedHealthRecord[]>(samplePameltexRecords);
  const [selectedRecord, setSelectedRecord] = useState<ExtendedHealthRecord | null>(null);
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({
    patientName: '',
    dob: '1990-01-01',
    gender: 'Female',
    phone: '+267 70000000',
    caseNotes: '',
    wellnessScore: '85',
    emergencyContact: ''
  });

  const handleCreateIntake = () => {
    if (!newPatient.patientName || !newPatient.caseNotes) return;

    const created: ExtendedHealthRecord = {
      id: `h-${Date.now()}`,
      orgId: 'pameltex-healthcare',
      createdBy: 'u-admin',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      patientName: newPatient.patientName,
      dob: newPatient.dob,
      gender: newPatient.gender,
      phone: newPatient.phone,
      caseNotes: newPatient.caseNotes,
      assessmentSummary: `Physical & Mental Wellness Score ${newPatient.wellnessScore}/100`,
      nextAppointment: 'Aug 10, 2026',
      wellnessScore: parseInt(newPatient.wellnessScore) || 85,
      emergencyContact: newPatient.emergencyContact || 'Not specified',
      notesHistory: [
        { date: 'Today', author: 'Clinical Intake Staff', note: newPatient.caseNotes }
      ]
    };

    setRecords(prev => [created, ...prev]);
    setIsIntakeModalOpen(false);
    setNewPatient({ patientName: '', dob: '1990-01-01', gender: 'Female', phone: '+267 70000000', caseNotes: '', wellnessScore: '85', emergencyContact: '' });
  };

  const handleExportPDF = (record: ExtendedHealthRecord) => {
    const docRes = generateEnterpriseDocument({
      templateType: 'CLINICAL_INTAKE',
      orgName: 'Pameltex Healthcare Services',
      clientName: record.patientName,
      clientEmail: record.phone,
      items: [
        { description: 'Clinical Patient Intake & Evaluation Session', qty: 1, unitPrice: 150 },
        { description: 'Mental & Physical Wellness Assessment Pack', qty: 1, unitPrice: 250 }
      ],
      notes: `Clinical Case Notes:\n${record.caseNotes}\n\nEmergency Contact: ${record.emergencyContact}`
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
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white">Ralion Health</h1>
            <Badge variant="purple" className="gap-1 font-mono">
              <HeartPulse className="w-3.5 h-3.5" /> Pameltex Client Module (Build Prompt 5)
            </Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Ralion Health — Empowered to Prosper: Better care through intelligent technology.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsIntakeModalOpen(true)}>
          <Plus className="w-4 h-4" /> New Clinical Patient Intake
        </Button>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-zinc-900 border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase">Active Patients</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{records.length}</div>
          <p className="text-[10px] text-zinc-500 mt-1">Pameltex Healthcare Registry</p>
        </Card>

        <Card className="p-4 bg-zinc-900 border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase">Average Wellness Score</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400 mt-2">
            {Math.round(records.reduce((s, r) => s + r.wellnessScore, 0) / records.length)}/100
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">Mari AI Clinical Assessment Average</p>
        </Card>

        <Card className="p-4 bg-zinc-900 border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase">Mari RAG Protocol</span>
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xs font-bold text-white mt-2">Pameltex Clinical Protocol v1</div>
          <p className="text-[10px] text-zinc-500 mt-1">Vector Indexed for Mari AI</p>
        </Card>
      </div>

      {/* Patient Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pameltex Clinical Patient Records</CardTitle>
          <CardDescription>Multi-tenant health records isolated for Pameltex Healthcare</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Patient Name</th>
                  <th className="p-4">DOB / Gender</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Wellness Score</th>
                  <th className="p-4">Clinical Case Notes</th>
                  <th className="p-4">Next Appointment</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {records.map((rec) => (
                  <tr
                    key={rec.id}
                    onClick={() => setSelectedRecord(rec)}
                    className="hover:bg-zinc-800/40 cursor-pointer transition-colors"
                  >
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      {rec.patientName}
                    </td>
                    <td className="p-4 text-zinc-400">{rec.dob} ({rec.gender})</td>
                    <td className="p-4 font-mono text-zinc-300">{rec.phone}</td>
                    <td className="p-4 font-mono font-bold text-purple-400">{rec.wellnessScore}/100</td>
                    <td className="p-4 text-zinc-300 max-w-md">{rec.caseNotes}</td>
                    <td className="p-4 font-mono text-blue-400">{rec.nextAppointment}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportPDF(rec);
                        }}
                        className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white flex items-center gap-1 ml-auto text-[11px]"
                      >
                        <Download className="w-3.5 h-3.5" /> PDF Pack
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Patient Detail Drawer */}
      {selectedRecord && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-zinc-950/95 backdrop-blur-2xl border-l border-zinc-800 shadow-2xl z-50 flex flex-col justify-between animate-in slide-in-from-right duration-300">
          <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {selectedRecord.patientName}
                <Badge variant="purple">Score: {selectedRecord.wellnessScore}/100</Badge>
              </h2>
              <p className="text-xs text-zinc-400">Pameltex Healthcare Client Record</p>
            </div>
            <button
              onClick={() => setSelectedRecord(null)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-5">
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col gap-2 text-xs">
              <span className="text-zinc-400">DOB: <strong className="text-white">{selectedRecord.dob}</strong> ({selectedRecord.gender})</span>
              <span className="text-zinc-400">Contact Phone: <strong className="text-white font-mono">{selectedRecord.phone}</strong></span>
              <span className="text-zinc-400">Emergency Contact: <strong className="text-white font-mono">{selectedRecord.emergencyContact}</strong></span>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Clinical Progress Notes</h3>
              {selectedRecord.notesHistory.map((n, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col gap-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-400">{n.author}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{n.date}</span>
                  </div>
                  <p className="text-zinc-300 text-[11px] mt-1">{n.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => setSelectedRecord(null)}>Close</Button>
            <Button variant="primary" size="sm" onClick={() => handleExportPDF(selectedRecord)}>
              <Download className="w-3.5 h-3.5" /> Export PDF Record
            </Button>
          </div>
        </div>
      )}

      {/* New Patient Intake Modal */}
      <Modal isOpen={isIntakeModalOpen} onClose={() => setIsIntakeModalOpen(false)} title="Pameltex Patient Intake Registration">
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-300">Patient Full Name</label>
            <input
              type="text"
              value={newPatient.patientName}
              onChange={(e) => setNewPatient({ ...newPatient, patientName: e.target.value })}
              placeholder="e.g. Boitumelo Phiri"
              className="w-full mt-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-300">Date of Birth</label>
              <input
                type="date"
                value={newPatient.dob}
                onChange={(e) => setNewPatient({ ...newPatient, dob: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-300">Gender</label>
              <select
                value={newPatient.gender}
                onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-300">Phone Number</label>
              <input
                type="text"
                value={newPatient.phone}
                onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-300">Initial Wellness Score (0 - 100)</label>
              <input
                type="number"
                value={newPatient.wellnessScore}
                onChange={(e) => setNewPatient({ ...newPatient, wellnessScore: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300">Emergency Contact</label>
            <input
              type="text"
              value={newPatient.emergencyContact}
              onChange={(e) => setNewPatient({ ...newPatient, emergencyContact: e.target.value })}
              placeholder="Name & Phone"
              className="w-full mt-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300">Clinical Case Intake Notes</label>
            <textarea
              rows={3}
              value={newPatient.caseNotes}
              onChange={(e) => setNewPatient({ ...newPatient, caseNotes: e.target.value })}
              placeholder="Initial consultation observations..."
              className="w-full mt-1 p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white"
            />
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsIntakeModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleCreateIntake} className="bg-purple-600 hover:bg-purple-500 font-bold">
              Save Patient Intake
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
