import React from 'react';
import { 
  LayoutDashboard, 
  FilePlus2, 
  Files, 
  Scale, 
  BookOpen, 
  FileText, 
  ShieldAlert, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Car,
  FileStack,
  FileSearch,
  Cpu,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { NavigationTab } from './Navbar';

export type SidebarTab = 
  | 'dashboard'
  | 'claim_review'
  | 'new_claim'
  | 'claims'
  | 'claims_list'
  | 'evidence_comparison'
  | 'policy_rules'
  | 'review_report'
  | 'escalations'
  | 'human_escalation'
  | 'settings';

interface SidebarProps {
  activeTab: string;
  onNavigate: (tab: any) => void;
  escalationCount: number;
  totalClaimsCount: number;
  contradictionCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onNavigate,
  escalationCount,
  totalClaimsCount,
  contradictionCount,
  isCollapsed,
  onToggleCollapse,
  isOpenMobile,
  onCloseMobile,
}) => {
  // Exact user-specified items:
  // Claim Review, Dashboard, Claims, Policy Rules, Reports, Escalations, Settings
  const navItems = [
    {
      id: 'claim_review',
      alias: 'evidence_comparison',
      label: 'Claim Review',
      icon: Scale,
      badge: contradictionCount > 0 ? `${contradictionCount} alerts` : 'MAIN FOCUS',
      badgeColor: contradictionCount > 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-600/30 text-blue-300 border border-blue-500/40',
      description: 'Main interactive claim investigation desk',
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: undefined,
      description: 'Overview & KPIs',
    },
    {
      id: 'claims_list',
      alias: 'claims',
      label: 'Claims Queue',
      icon: Files,
      badge: totalClaimsCount > 0 ? totalClaimsCount : undefined,
      badgeColor: 'bg-slate-800 text-slate-300 border border-slate-700',
      description: 'All registered claim records',
    },
    {
      id: 'review_report',
      label: 'Audit Reports',
      icon: FileText,
      badge: undefined,
      description: 'IRDAI formal claims audit report',
    },
    {
      id: 'human_escalation',
      alias: 'escalations',
      label: 'Escalations',
      icon: ShieldAlert,
      badge: escalationCount > 0 ? escalationCount : undefined,
      badgeColor: 'bg-red-500 text-white font-black',
      description: 'Senior adjudicator sign-off queue',
    },
    {
      id: 'policy_rules',
      label: 'Policy Rules',
      icon: BookOpen,
      badge: '12 Rules',
      badgeColor: 'bg-slate-800 text-slate-400 border border-slate-700',
      description: 'Standard motor clauses & exclusions',
    },
    {
      id: 'new_claim',
      label: 'New Claim Intake',
      icon: FilePlus2,
      badge: 'INTAKE',
      badgeColor: 'bg-blue-600 text-white',
      description: 'Ingest 3 evidence documents',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: undefined,
      description: 'SIU thresholds & investigator config',
    },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    if (onCloseMobile) onCloseMobile();
  };

  const isTabActive = (item: typeof navItems[0]) => {
    if (activeTab === item.id) return true;
    if (item.alias && activeTab === item.alias) return true;
    if (item.id === 'claim_review' && (activeTab === 'evidence_comparison' || activeTab === 'claim_review')) return true;
    if (item.id === 'claims_list' && (activeTab === 'claims' || activeTab === 'claims_list' || activeTab === 'claim_details')) return true;
    if (item.id === 'human_escalation' && (activeTab === 'escalations' || activeTab === 'human_escalation')) return true;
    return false;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-300 select-none">
      
      {/* Sidebar Top Title / Collapse Toggle Header */}
      <div className={`h-11 border-b border-slate-800 flex items-center px-3.5 transition-all ${
        isCollapsed ? 'justify-center' : 'justify-between'
      }`}>
        {!isCollapsed && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Navigation Desk
            </span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer hidden lg:flex items-center justify-center"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 py-2 px-2 space-y-1 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isTabActive(item);

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded text-xs font-semibold transition-all group relative cursor-pointer ${
                active 
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-900/40 font-bold' 
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
              } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                  active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                }`} />
                {!isCollapsed && (
                  <span className="truncate tracking-wide">{item.label}</span>
                )}
              </div>

              {!isCollapsed && item.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider shrink-0 ${
                  active ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-800 text-slate-300'
                }`}>
                  {item.badge}
                </span>
              )}

              {/* Tooltip for collapsed mode */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-950 text-white text-xs font-medium rounded shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-slate-700">
                  <div className="font-bold">{item.label}</div>
                  <div className="text-[10px] text-slate-400">{item.description}</div>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* 6-Stage Investigation Visual Workflow */}
      {!isCollapsed && (
        <div className="px-3 py-2 border-t border-slate-800 bg-slate-950/50 text-[10px]">
          <div className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
            <span>Investigation Lifecycle</span>
            <span className="text-[8px] font-mono text-blue-400 font-bold bg-blue-950/60 px-1 py-0.2 rounded border border-blue-800/40">
              6 STAGES
            </span>
          </div>
          <div className="grid grid-cols-6 gap-1 text-center">
            <button
              onClick={() => {
                onNavigate('claim_review');
                setTimeout(() => {
                  document.getElementById('section-documents')?.scrollIntoView({ behavior: 'smooth' });
                }, 50);
              }}
              title="Documents (Claim Form, FIR, Repair Estimate)" 
              className="p-1 rounded bg-slate-850 hover:bg-slate-800 hover:text-white flex flex-col items-center cursor-pointer transition-colors"
            >
              <FileStack className="w-3 h-3 text-blue-400 mb-0.5" />
              <span className="text-[7px] text-slate-400">DOCS</span>
            </button>
            <button
              onClick={() => {
                onNavigate('claim_review');
                setTimeout(() => {
                  document.getElementById('section-evidence')?.scrollIntoView({ behavior: 'smooth' });
                }, 50);
              }}
              title="Evidence Consistency & Triangulation" 
              className="p-1 rounded bg-slate-850 hover:bg-slate-800 hover:text-white flex flex-col items-center cursor-pointer transition-colors"
            >
              <FileSearch className="w-3 h-3 text-emerald-400 mb-0.5" />
              <span className="text-[7px] text-slate-400">EVID</span>
            </button>
            <button
              onClick={() => {
                onNavigate('claim_review');
                setTimeout(() => {
                  document.getElementById('section-policy')?.scrollIntoView({ behavior: 'smooth' });
                }, 50);
              }}
              title="Policy Rules & Clauses" 
              className="p-1 rounded bg-slate-850 hover:bg-slate-800 hover:text-white flex flex-col items-center cursor-pointer transition-colors"
            >
              <BookOpen className="w-3 h-3 text-indigo-400 mb-0.5" />
              <span className="text-[7px] text-slate-400">POL</span>
            </button>
            <button
              onClick={() => {
                onNavigate('claim_review');
                setTimeout(() => {
                  document.getElementById('section-analysis')?.scrollIntoView({ behavior: 'smooth' });
                }, 50);
              }}
              title="AI Analysis & Damage Extraction" 
              className="p-1 rounded bg-slate-850 hover:bg-slate-800 hover:text-white flex flex-col items-center cursor-pointer transition-colors"
            >
              <Cpu className="w-3 h-3 text-cyan-400 mb-0.5" />
              <span className="text-[7px] text-slate-400">ANAL</span>
            </button>
            <button
              onClick={() => {
                onNavigate('claim_review');
                setTimeout(() => {
                  document.getElementById('section-recommendation')?.scrollIntoView({ behavior: 'smooth' });
                }, 50);
              }}
              title="Advisory Recommendation" 
              className="p-1 rounded bg-slate-850 hover:bg-slate-800 hover:text-white flex flex-col items-center cursor-pointer transition-colors"
            >
              <AlertTriangle className="w-3 h-3 text-amber-400 mb-0.5" />
              <span className="text-[7px] text-slate-400">REC</span>
            </button>
            <button
              onClick={() => {
                onNavigate('human_escalation');
              }}
              title="Human Investigator Adjudication" 
              className="p-1 rounded bg-slate-850 hover:bg-slate-800 hover:text-white flex flex-col items-center cursor-pointer transition-colors"
            >
              <UserCheck className="w-3 h-3 text-emerald-400 mb-0.5" />
              <span className="text-[7px] text-slate-400">REV</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom SIU Engine Telemetry Card */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-[11px] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">SIU Core Engine</span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-800/60">
              ACTIVE
            </span>
          </div>
          <div className="space-y-1 text-slate-400 text-[10px] font-mono">
            <div className="flex justify-between">
              <span>Triangulation:</span>
              <span className="text-slate-200">Grounded v2.4</span>
            </div>
            <div className="flex justify-between">
              <span>Motor Rules:</span>
              <span className="text-slate-200">12 Clauses</span>
            </div>
          </div>
          <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-blue-400" />
              <span>IRDAI Audit Ready</span>
            </span>
          </div>
        </div>
      )}

    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden lg:block shrink-0 transition-all duration-200 sticky top-14 h-[calc(100vh-3.5rem)] z-30 ${
          isCollapsed ? 'w-16' : 'w-56'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-xs h-full z-50 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
