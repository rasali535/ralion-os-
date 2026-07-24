'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge } from '@ralion/ui';
import { Truck, Plus, MapPin, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { FleetShipment } from '@ralion/database';

const sampleShipments: FleetShipment[] = [
  { id: 'ls1', orgId: 'org-1', createdBy: 'u1', createdAt: '2026-07-24', updatedAt: '2026-07-24', trackingNumber: 'LOG-BW-8821', origin: 'Gaborone Hub', destination: 'Francistown Port', driverId: 'd101', driverName: 'Kabo Sebeke', vehicleRegistration: 'B 412 ABN (Scania 480)', status: 'IN_TRANSIT', customsCleared: true, eta: 'Today 18:30' },
  { id: 'ls2', orgId: 'org-1', createdBy: 'u1', createdAt: '2026-07-24', updatedAt: '2026-07-24', trackingNumber: 'LOG-BW-8822', origin: 'Pioneer Border', destination: 'Lobaste Distribution', driverId: 'd102', driverName: 'Emanuel Ndlovu', vehicleRegistration: 'B 904 ABC (Volvo FH)', status: 'CUSTOMS_HOLD', customsCleared: false, eta: 'Tomorrow 10:00' },
];

export default function LogisticsPluginPage() {
  const [shipments, setShipments] = useState<FleetShipment[]>(sampleShipments);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white">Ralion Logistics</h1>
            <Badge variant="purple" className="gap-1">
              <Truck className="w-3 h-3" /> Industry Plugin
            </Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Fleet tracking, driver management, shipment routes, customs border compliance, and transport documents.
          </p>
        </div>

        <Button variant="primary" size="sm">
          <Plus className="w-4 h-4" /> Dispatch Shipment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fleet Manifest & Active Shipments</CardTitle>
          <CardDescription>Real-time vehicle tracking & border clearance verification</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Tracking #</th>
                  <th className="p-4">Route (Origin → Destination)</th>
                  <th className="p-4">Driver / Vehicle</th>
                  <th className="p-4">Customs Status</th>
                  <th className="p-4">ETA</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {shipments.map((s) => (
                  <tr key={s.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-blue-400">{s.trackingNumber}</td>
                    <td className="p-4 font-semibold text-white">{s.origin} → {s.destination}</td>
                    <td className="p-4 text-zinc-300">{s.driverName} <br /><span className="text-[10px] text-zinc-500 font-mono">{s.vehicleRegistration}</span></td>
                    <td className="p-4">
                      {s.customsCleared ? (
                        <Badge variant="success" className="gap-1"><ShieldCheck className="w-3 h-3" /> Cleared</Badge>
                      ) : (
                        <Badge variant="danger" className="gap-1"><AlertTriangle className="w-3 h-3" /> Customs Hold</Badge>
                      )}
                    </td>
                    <td className="p-4 font-mono text-zinc-300">{s.eta}</td>
                    <td className="p-4">
                      <Badge variant={s.status === 'IN_TRANSIT' ? 'primary' : 'warning'}>{s.status}</Badge>
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
