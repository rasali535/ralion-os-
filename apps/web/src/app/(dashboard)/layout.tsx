'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar, Header } from '@ralion/ui';
import { MariAiDrawer } from '../../components/MariAiDrawer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMariOpen, setIsMariOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPath={pathname}
        orgName="Ras Ali Enterprises"
        onNavigate={(href) => router.push(href)}
        onOpenMariAI={() => setIsMariOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header
          userName="Ras Ali Admin"
          userRole="ORGANIZATION_OWNER"
          activeBranch="Gaborone Main Branch"
          onOpenMariAI={() => setIsMariOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-6 bg-zinc-950">
          {children}
        </main>
      </div>

      {/* Mari AI Drawer */}
      <MariAiDrawer
        isOpen={isMariOpen}
        onClose={() => setIsMariOpen(false)}
        onNavigate={(route) => {
          setIsMariOpen(false);
          router.push(route);
        }}
      />
    </div>
  );
}
