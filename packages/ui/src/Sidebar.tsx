import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck,
  CheckSquare, 
  Calendar, 
  Folder, 
  Zap, 
  CreditCard, 
  TrendingUp, 
  Sparkles, 
  HeartPulse, 
  Shield, 
  Truck, 
  ShoppingBag, 
  Settings, 
  ChevronRight,
  Building2,
  BarChart2,
  Filter,
  Layers,
  Code,
  Globe,
  Store,
  ArrowLeft,
  User
} from 'lucide-react';
import { cn } from './utils';

export interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  isIndustryPlugin?: boolean;
}

export interface SidebarProps {
  currentPath: string;
  orgName?: string;
  onNavigate: (href: string) => void;
  onOpenMariAI?: () => void;
  enabledModules?: string[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  orgName = "Enterprise Suite",
  onNavigate,
  onOpenMariAI,
  enabledModules = ['mari', 'demos', 'customers', 'leads', 'crm', 'tasks', 'calendar', 'documents', 'reports', 'workflows', 'billing', 'growth', 'health', 'funeral', 'logistics', 'trade', 'marketplace', 'developer', 'enterprise', 'government']
}) => {
  const platformUrl = process.env.NEXT_PUBLIC_RASALI_PLATFORM_URL || 'https://rasalilabs.com';

  const demoNav: SidebarItem[] = [
    { id: 'demos', label: 'Showcase Demos', href: '/ralion/demos', icon: <Layers className="w-4 h-4 text-purple-400" />, badge: 'Phase 1' },
  ];

  const coreNav: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', href: '/ralion/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'customers', label: 'Customers', href: '/ralion/customers', icon: <Users className="w-4 h-4 text-blue-400" /> },
    { id: 'leads', label: 'Leads', href: '/ralion/leads', icon: <Filter className="w-4 h-4 text-amber-400" /> },
    { id: 'crm', label: 'Sales Pipeline (CRM)', href: '/ralion/crm', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'tasks', label: 'Tasks', href: '/ralion/tasks', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'calendar', label: 'Calendar', href: '/ralion/calendar', icon: <Calendar className="w-4 h-4" /> },
    { id: 'documents', label: 'Documents', href: '/ralion/documents', icon: <Folder className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports', href: '/ralion/reports', icon: <BarChart2 className="w-4 h-4 text-emerald-400" /> },
    { id: 'workflows', label: 'No-Code Workflows', href: '/ralion/workflows', icon: <Zap className="w-4 h-4" /> },
    { id: 'billing', label: 'Billing & Licenses', href: '/ralion/billing', icon: <CreditCard className="w-4 h-4" /> },
  ];

  const growthNav: SidebarItem[] = [
    { id: 'growth', label: 'Ralion Growth AI', href: '/ralion/growth', icon: <TrendingUp className="w-4 h-4" />, badge: 'AI' },
  ];

  const industryNav: SidebarItem[] = [
    { id: 'health', label: 'Ralion Health (Pameltex)', href: '/ralion/industry/health', icon: <HeartPulse className="w-4 h-4" />, isIndustryPlugin: true },
    { id: 'funeral', label: 'Ralion Funeral (Doves)', href: '/ralion/industry/funeral', icon: <Shield className="w-4 h-4" />, isIndustryPlugin: true },
    { id: 'logistics', label: 'Ralion Logistics (DFS)', href: '/ralion/industry/logistics', icon: <Truck className="w-4 h-4" />, isIndustryPlugin: true },
    { id: 'trade', label: 'Ralion Trade', href: '/ralion/industry/trade', icon: <ShoppingBag className="w-4 h-4" />, isIndustryPlugin: true },
  ];

  const ecosystemNav: SidebarItem[] = [
    { id: 'marketplace', label: 'Marketplace', href: '/ralion/marketplace', icon: <Store className="w-4 h-4 text-purple-400" /> },
    { id: 'developer', label: 'Developer Platform', href: '/ralion/developer', icon: <Code className="w-4 h-4 text-blue-400" /> },
    { id: 'enterprise', label: 'Enterprise SSO', href: '/ralion/enterprise', icon: <Shield className="w-4 h-4 text-emerald-400" /> },
    { id: 'government', label: 'Government Edition', href: '/ralion/government', icon: <Globe className="w-4 h-4 text-amber-400" /> },
  ];

  const renderNavSection = (items: SidebarItem[]) => {
    return items
      .filter(item => item.id === 'dashboard' || enabledModules.includes(item.id))
      .map((item) => {
        const isActive = currentPath === item.href || (item.href !== '/' && currentPath.startsWith(item.href));
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.href)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 group",
              isActive
                ? "bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold"
                : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
            )}
          >
            <div className="flex items-center gap-2.5">
              <span className={cn(isActive ? "text-blue-400" : "text-zinc-500 group-hover:text-zinc-300")}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                {item.badge}
              </span>
            )}
          </button>
        );
      });
  };

  return (
    <aside className="w-64 h-screen bg-zinc-950/95 border-r border-zinc-800/80 flex flex-col justify-between select-none shrink-0">
      <div className="p-4 flex flex-col gap-5 overflow-y-auto">
        {/* Brand Header */}
        <div className="flex flex-col gap-1 border-b border-zinc-800/60 pb-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-widest font-black uppercase text-blue-400">RAS ALI LABS</span>
            <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-400">v1.0</span>
          </div>
          <h1 className="text-xl font-black text-white tracking-wider flex items-center gap-1.5">
            RALION
          </h1>
          <p className="text-[11px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 italic">
            Empowered to Prosper
          </p>
          <div className="mt-2 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
            <Building2 className="w-3.5 h-3.5 text-zinc-500" />
            <span className="truncate font-medium">{orgName}</span>
          </div>
        </div>

        {/* Mari AI Drawer Trigger */}
        <button
          onClick={onOpenMariAI}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/10 border border-blue-500/30 hover:border-purple-500/50 transition-all duration-300 group shadow-lg shadow-blue-500/5"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                Mari AI Assistant
              </div>
              <div className="text-[10px] text-zinc-400">Powered by Mari AI</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
        </button>

        {/* Validation Demos */}
        <div className="flex flex-col gap-1">
          <div className="px-3 text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-1">
            Validation Demos
          </div>
          {renderNavSection(demoNav)}
        </div>

        {/* Core Modules Section */}
        <div className="flex flex-col gap-1">
          <div className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
            Ralion Core
          </div>
          {renderNavSection(coreNav)}
        </div>

        {/* Growth Section */}
        <div className="flex flex-col gap-1">
          <div className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
            Marketing & Social
          </div>
          {renderNavSection(growthNav)}
        </div>

        {/* Industry Modules Section */}
        <div className="flex flex-col gap-1">
          <div className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
            Industry Plugins
          </div>
          {renderNavSection(industryNav)}
        </div>

        {/* Ecosystem Section */}
        <div className="flex flex-col gap-1">
          <div className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
            Platform Ecosystem
          </div>
          {renderNavSection(ecosystemNav)}
        </div>
      </div>

      {/* Footer Settings & Platform Link */}
      <div className="p-4 border-t border-zinc-800/80 bg-zinc-950 flex flex-col gap-1.5">
        <button
          onClick={() => onNavigate('/portal')}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
          )}
        >
          <User className="w-4 h-4 text-blue-400" />
          <span>Account & Portal</span>
        </button>

        <button
          onClick={() => onNavigate('/ralion/settings')}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150",
            currentPath === '/ralion/settings'
              ? "bg-zinc-800 text-white font-semibold"
              : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
          )}
        >
          <Settings className="w-4 h-4" />
          <span>Organization Settings</span>
        </button>

        <a
          href={platformUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-purple-400 hover:text-purple-300 hover:bg-purple-950/30 transition-all duration-150 border border-purple-500/20 mt-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Ras Ali Labs</span>
        </a>
      </div>
    </aside>
  );
};
