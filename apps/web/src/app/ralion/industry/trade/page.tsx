'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge } from '@ralion/ui';
import { ShoppingBag, Plus, DollarSign, Package, CheckCircle2 } from 'lucide-react';
import { TradeOrder } from '@ralion/database';

const sampleTradeOrders: TradeOrder[] = [
  { id: 'to1', orgId: 'org-1', createdBy: 'u1', createdAt: '2026-07-24', updatedAt: '2026-07-24', orderNumber: 'PO-2026-012', supplierName: 'Southern Africa Industrial Supplies', orderItems: [{ itemName: 'Heavy Duty Motors', qty: 10, price: 1200 }, { itemName: 'Control Valves', qty: 50, price: 85 }], totalAmount: 16250, status: 'APPROVED' },
  { id: 'to2', orgId: 'org-1', createdBy: 'u1', createdAt: '2026-07-24', updatedAt: '2026-07-24', orderNumber: 'PO-2026-013', supplierName: 'Botswana Chemical Wholesale', orderItems: [{ itemName: 'Purification Agent B10', qty: 100, price: 45 }], totalAmount: 4500, status: 'PENDING' },
];

export default function TradePluginPage() {
  const [orders, setOrders] = useState<TradeOrder[]>(sampleTradeOrders);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white">Ralion Trade</h1>
            <Badge variant="purple" className="gap-1">
              <ShoppingBag className="w-3 h-3" /> Industry Plugin
            </Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            B2B marketplace, supplier catalog, procurement purchase orders, and wholesale order tracking.
          </p>
        </div>

        <Button variant="primary" size="sm">
          <Plus className="w-4 h-4" /> Create Purchase Order
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Procurement Orders & Supplier Marketplace</CardTitle>
          <CardDescription>B2B order execution and supplier approvals</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">PO #</th>
                  <th className="p-4">Supplier Name</th>
                  <th className="p-4">Items Summary</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-blue-400">{o.orderNumber}</td>
                    <td className="p-4 font-bold text-white">{o.supplierName}</td>
                    <td className="p-4 text-zinc-300">
                      {o.orderItems.map(i => `${i.itemName} (x${i.qty})`).join(', ')}
                    </td>
                    <td className="p-4 font-mono font-bold text-white">${o.totalAmount.toLocaleString()}</td>
                    <td className="p-4">
                      <Badge variant={o.status === 'APPROVED' ? 'success' : 'warning'}>{o.status}</Badge>
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
