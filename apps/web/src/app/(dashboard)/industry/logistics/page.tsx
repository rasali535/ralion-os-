'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, Modal } from '@ralion/ui';
import { Truck, Plus, FileText, MapPin, CheckCircle2, Shield, Download, Sparkles, AlertTriangle } from 'lucide-react';
import { LogisticsShipment } from '@ralion/database';
import { generateEnterpriseDocument } from '@ralion/core';

interface ExtendedShipment extends LogisticsShipment {
  driverName: string;
  vehicleReg: string;
  weightKg: number;
}

const sampleDfsShipments: ExtendedShipment[] = [
  {
    id: 's1',
    orgId: 'dfs-group-logistics',
    createdBy: 'u-dfs-dispatcher',
    createdAt: '2026-07-24',
    updatedAt: '2026-07-24',
    trackingNumber: 'DFS-TRK-9901',
    origin: 'Gaborone HQ Depot',
    destination: 'Pioneer Border Post (Lobatse)',
    status: 'IN_TRANSIT',
    driverName: 'Emanuel Ndlovu',
    vehicleReg: 'B 412 ABN (Volvo FH16 Truck)',
    weightKg: 24500,
    customsCleared: true
  },
  {
    id: 's2',
    orgId: 'dfs-group-logistics',
    createdBy: 'u-dfs-dispatcher',
    createdAt: '2026-07-23',
    updatedAt: '2026-07-23',
    trackingNumber: 'DFS-TRK-9898',
    origin: 'Francistown Hub',
    destination: 'Kazungula Border Bridge',
    status: 'CUSTOMS_HOLD',
    driverName: 'Kagiso Phiri',
    vehicleReg: 'B 890 BCD (Scania R500)',
    weightKg: 18200,
    customsCleared: false
  }
];

export default function LogisticsPluginPage() {
  const [shipments, setShipments] = useState<ExtendedShipment[]>(sampleDfsShipments);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newShipment, setNewShipment] = useState({
    origin: 'Gaborone HQ Depot',
    destination: 'Pioneer Border Post',
    driverName: 'Emanuel Ndlovu',
    vehicleReg: 'B 412 ABN',
    weightKg: '20000'
  });

  const handleCreateShipment = () => {
    if (!newShipment.origin || !newShipment.destination) return;
    const created: ExtendedShipment = {
      id: `s-${Date.now()}`,
      orgId: 'dfs-group-logistics',
      createdBy: 'u-admin',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      trackingNumber: `DFS-TRK-${Math.floor(1000 + Math.random() * 9000)}`,
      origin: newShipment.origin,
      destination: newShipment.destination,
      status: 'DISPATCHED',
      driverName: newShipment.driverName,
      vehicleReg: newShipment.vehicleReg,
      weightKg: parseFloat(newShipment.weightKg) || 20000,
      customsCleared: true
    };
    setShipments(prev => [created, ...prev]);
    setIsModalOpen(false);
  };

  const handleExportPDF = (s: ExtendedShipment) => {
    const docRes = generateEnterpriseDocument({
      templateType: 'TRANSPORT_MANIFEST',
      orgName: 'DFS Group Freight & Logistics',
      clientName: s.driverName,
      clientEmail: s.vehicleReg,
      items: [
        { description: `Cross Border Haulage Cargo (${s.origin} → ${s.destination})`, qty: 1, unitPrice: 4800 }
      ],
      notes: `Tracking Number: ${s.trackingNumber}\nVehicle Reg: ${s.vehicleReg}\nCargo Weight: ${s.weightKg} kg\nCustoms Status: ${s.customsCleared ? 'CLEARED' : 'CUSTOMS HOLD'}`
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
            <h1 className="text-2xl font-black tracking-tight text-white">Ralion Logistics</h1>
            <Badge variant="success" className="gap-1 font-mono">
              <Truck className="w-3.5 h-3.5" /> DFS Group Demo (Build Prompt 5)
            </Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Ralion Logistics — Empowered to Prosper: Move business forward.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" /> Create Fleet Shipment
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-zinc-900 border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase">Active Fleet Cargo</span>
            <Truck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{shipments.length} Shipments</div>
          <p className="text-[10px] text-zinc-500 mt-1">DFS Group Logistics Registry</p>
        </Card>

        <Card className="p-4 bg-zinc-900 border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase">Customs Clearance</span>
            <Shield className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400 mt-2">
            {shipments.filter(s => s.customsCleared).length} / {shipments.length} Cleared
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">Pioneer & Kazungula Border Posts</p>
        </Card>

        <Card className="p-4 bg-zinc-900 border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase">Total Fleet Tonnage</span>
            <FileText className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400 mt-2">
            {(shipments.reduce((s, sh) => s + sh.weightKg, 0) / 1000).toFixed(1)} Tons
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">Total Cross-Border Cargo Weight</p>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>DFS Group Shipment Tracking Registry</CardTitle>
          <CardDescription>Live fleet positions, driver identification, and border customs clearance</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Tracking #</th>
                  <th className="p-4">Route (Origin → Destination)</th>
                  <th className="p-4">Driver & Vehicle</th>
                  <th className="p-4">Weight (kg)</th>
                  <th className="p-4">Customs Status</th>
                  <th className="p-4">Shipment Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {shipments.map((s) => (
                  <tr key={s.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-blue-400">{s.trackingNumber}</td>
                    <td className="p-4 font-bold text-white">{s.origin} → {s.destination}</td>
                    <td className="p-4 text-zinc-300">{s.driverName} <br /><span className="text-[10px] font-mono text-zinc-500">{s.vehicleReg}</span></td>
                    <td className="p-4 font-mono text-zinc-300">{s.weightKg.toLocaleString()} kg</td>
                    <td className="p-4">
                      {s.customsCleared ? (
                        <Badge variant="success">Cleared</Badge>
                      ) : (
                        <Badge variant="danger" className="gap-1">
                          <AlertTriangle className="w-3 h-3" /> Customs Hold
                        </Badge>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge variant="purple">{s.status}</Badge>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleExportPDF(s)}
                        className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white flex items-center gap-1 ml-auto text-[11px]"
                      >
                        <Download className="w-3.5 h-3.5" /> Manifest PDF
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
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="DFS Group Fleet Shipment Dispatch">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-300">Origin Depot</label>
              <input
                type="text"
                value={newShipment.origin}
                onChange={(e) => setNewShipment({ ...newShipment, origin: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-300">Destination Border</label>
              <input
                type="text"
                value={newShipment.destination}
                onChange={(e) => setNewShipment({ ...newShipment, destination: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-300">Driver Name</label>
              <input
                type="text"
                value={newShipment.driverName}
                onChange={(e) => setNewShipment({ ...newShipment, driverName: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-300">Vehicle Reg</label>
              <input
                type="text"
                value={newShipment.vehicleReg}
                onChange={(e) => setNewShipment({ ...newShipment, vehicleReg: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-300">Cargo Weight (kg)</label>
            <input
              type="number"
              value={newShipment.weightKg}
              onChange={(e) => setNewShipment({ ...newShipment, weightKg: e.target.value })}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white"
            />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleCreateShipment} className="bg-emerald-600 font-bold">
              Dispatch Shipment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
