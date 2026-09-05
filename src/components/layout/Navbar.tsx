import React from 'react';
import { 
  Shield, 
  LayoutDashboard, 
  FilePlus2, 
  Files, 
  FileSearch, 
  Scale, 
  BookOpen, 
  FileText, 
  ShieldAlert, 
  Cpu,
  RotateCcw
} from 'lucide-react';

export type NavigationTab = 
  | 'dashboard' 
  | 'new_claim' 
  | 'claims_list' 
  | 'claim_details' 
  | 'evidence_comparison' 
  | 'policy_rules' 
  | 'review_report' 
  | 'human_escalation';

interface NavbarProps {
  activeTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  escalationCount: number;
  activeClaimId?: string;
  serverStatus?: { connected: boolean; gemini: boolean };
  onResetDemoData?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onNavigate,
  escalationCount,
  activeClaimId,
  serverStatus,
  onResetDemoData,
}) => {
  const navItems: { id: NavigationTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new_claim', label: 'New Review', icon: FilePlus2 },
    { id: 'claims_list', label: 'Claims', icon: Files },
    { id: 'claim_details', label: 'Claim Details', icon: FileSearch },
    { id: 'evidence_comparison', label: 'Evidence Comparison', icon: Scale },
    { id: 'policy_rules', label: 'Policy Rules', icon: BookOpen },
    { id: 'review_report', label: 'Review Report', icon: FileText },
    { id: 'human_escalation', label: 'Human Escalation', icon: ShieldAlert, badge: escalationCount },
  ];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-4">
          
          {/* Brand */}
          <div className="flex items-center gap-2.5 cursor-pointer select-none shrink-0" onClick={() => onNavigate('dashboard')}>
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold text-base text-white shadow-sm shadow-blue-900/40">
              G
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold tracking-tight text-base text-white">ClaimGuard <span className="text-blue-400">AI</span></span>
              <span className="hidden sm:inline-block bg-slate-800 text-slate-300 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border border-slate-700">SIU Console</span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center space-x-1 border-x border-slate-800 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-slate-800 text-blue-400 shadow-inner' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-amber-500 text-slate-950' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Secondary Controls & Investigator Profile */}
          <div className="flex items-center gap-3 shrink-0">
            {onResetDemoData && (
              <button
                onClick={onResetDemoData}
                className="hidden xl:flex items-center gap-1 px-2.5 py-1 rounded border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                title="Reset all demo claims to standard test scenarios"
              >
                <RotateCcw className="w-3 h-3 text-slate-400" />
                <span>Reset</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('new_claim')}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded shadow-md shadow-blue-900/30 transition-all cursor-pointer"
            >
              <FilePlus2 className="w-3.5 h-3.5" />
              <span>New Review</span>
            </button>

            {/* Investigator badge matching High Density design */}
            <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-200 leading-tight">J. Investigator</p>
                <p className="text-[10px] text-slate-400 leading-tight">Senior Claims Specialist</p>
              </div>
              <div className="w-7 h-7 bg-slate-700 rounded-full border border-slate-600 flex items-center justify-center text-[10px] font-bold text-slate-300">
                JI
              </div>
            </div>
          </div>
        </div>

        {/* Mobile / Tablet secondary nav bar */}
        <div className="lg:hidden flex items-center space-x-1 overflow-x-auto py-1.5 border-t border-slate-800 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                  isActive 
                    ? 'bg-slate-800 text-blue-400 font-bold' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
