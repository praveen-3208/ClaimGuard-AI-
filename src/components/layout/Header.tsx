import React, { useState, useRef, useEffect } from 'react';
import { 
  Shield, 
  Bell, 
  Search, 
  User, 
  Check, 
  AlertTriangle, 
  FileWarning, 
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  BadgeCheck,
  Building2,
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { ClaimRecord } from '../../types/claim';

interface HeaderProps {
  claims: ClaimRecord[];
  onSelectClaim: (claimId: string) => void;
  onNavigate: (tab: any) => void;
  onResetDemoData: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  claims,
  onSelectClaim,
  onNavigate,
  onResetDemoData,
  onToggleSidebar,
  isSidebarOpen,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ClaimRecord[]>([]);
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Critical Evidence Contradiction',
      message: 'Front curb collision contradicts $4,600 rear quarter panel replacement.',
      claimId: 'clm-8801',
      claimNumber: 'CLM-2026-8801',
      time: '12m ago',
      type: 'contradiction',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Commercial Policy Breach Detected',
      message: 'Police FIR confirms vehicle was carrying commercial courier parcels.',
      claimId: 'clm-8803',
      claimNumber: 'CLM-2026-8803',
      time: '35m ago',
      type: 'exclusion',
      read: false,
    },
    {
      id: 'notif-3',
      title: 'Missing Statutory Document (DL)',
      message: 'Driver license field blank; customer statement mentions unlicensed minor.',
      claimId: 'clm-8804',
      claimNumber: 'CLM-2026-8804',
      time: '1h ago',
      type: 'missing',
      read: false,
    },
  ]);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Search filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const matches = claims.filter(c => 
      c.claimNumber.toLowerCase().includes(q) ||
      c.claimForm.insuredName.toLowerCase().includes(q) ||
      c.claimForm.vehicleRegistrationNumber.toLowerCase().includes(q) ||
      c.claimForm.vehicleMakeModel.toLowerCase().includes(q)
    );
    setSearchResults(matches.slice(0, 5));
  }, [searchQuery, claims]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchResults([]);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (claimId: string, notifId: string) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? ({ ...n, read: true }) : n));
    setShowNotifications(false);
    onSelectClaim(claimId);
  };

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 flex items-center justify-between px-3 sm:px-4 lg:px-6 shrink-0 shadow-md">
      
      {/* Left: Hamburger & Brand Title */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle Navigation Sidebar"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}

        {/* ClaimGuard AI Logo & Subtitle */}
        <div 
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-black text-white shadow-sm shadow-blue-900/50 border border-blue-400/30 group-hover:brightness-110 transition-all">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-black tracking-tight text-sm sm:text-base text-white">
                ClaimGuard <span className="text-blue-400 font-extrabold">AI</span>
              </span>
              <span className="hidden md:inline-flex items-center text-[9px] font-mono font-bold uppercase tracking-wider bg-blue-950/90 text-blue-300 px-1.5 py-0.2 rounded border border-blue-800/80">
                SIU DESK
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide leading-none mt-0.5 hidden xs:inline">
              Claims Evidence Review Assistant
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Global Fast Search for Claims */}
      <div className="hidden md:block relative flex-1 max-w-xs lg:max-w-md mx-4" ref={searchRef}>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Quick search claims (e.g. CLM-8801, Marcus, TX...)"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-800/90 border border-slate-700 rounded text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium transition-colors"
          />
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded shadow-2xl overflow-hidden z-50 divide-y divide-slate-800">
            {searchResults.map(claim => (
              <div
                key={claim.id}
                onClick={() => {
                  onSelectClaim(claim.id);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="p-2.5 hover:bg-slate-800/90 cursor-pointer transition-colors flex items-center justify-between text-xs text-left"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-blue-400">{claim.claimNumber}</span>
                    <span className="text-[10px] text-slate-400">• {claim.claimForm.insuredName}</span>
                  </div>
                  <div className="text-[11px] text-slate-300">{claim.claimForm.vehicleMakeModel} ({claim.claimForm.vehicleRegistrationNumber})</div>
                </div>
                <div className="text-right font-mono text-[11px] font-bold text-slate-300">
                  ${Number(claim.claimForm?.claimedAmount || 0).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Controls: Notifications & Investigator Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Reset Demo Data Button */}
        <button
          onClick={onResetDemoData}
          title="Reset claims test data"
          className="hidden xl:flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3 text-slate-400" />
          <span>Reset Demo</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Claims notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Menu */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl overflow-hidden z-50 text-left animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="p-3 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-white">Investigation Alerts</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.2 rounded font-bold">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-800 max-h-72 overflow-y-auto">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n.claimId, n.id)}
                    className={`p-3 hover:bg-slate-800/70 cursor-pointer transition-colors ${
                      !n.read ? 'bg-slate-800/40' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        {n.type === 'contradiction' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                        {n.type === 'exclusion' && <FileWarning className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                        {n.type === 'missing' && <AlertTriangle className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                        <span className="text-slate-200">{n.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                      {n.message}
                    </p>
                    <div className="mt-1.5 flex items-center justify-between text-[10px]">
                      <span className="font-mono font-bold text-blue-400">{n.claimNumber}</span>
                      <span className="text-slate-400 hover:text-white flex items-center gap-0.5">
                        Inspect <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-2 bg-slate-800/60 border-t border-slate-700 text-center">
                <button
                  onClick={() => { setShowNotifications(false); onNavigate('human_escalation'); }}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 cursor-pointer"
                >
                  View All Escalations Queue →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-[1px] bg-slate-800"></div>

        {/* Investigator Profile Badge with Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer group text-left"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-gradient-to-tr from-slate-700 to-slate-600 border border-slate-500/80 flex items-center justify-center text-xs font-black text-slate-100 shadow-inner shrink-0">
              MV
            </div>
            <div className="hidden sm:block leading-tight">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-200 group-hover:text-white">Marcus Vance</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Senior SIU Investigator</span>
            </div>
          </button>

          {/* Profile Dropdown */}
          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-3 z-50 text-left divide-y divide-slate-800 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded bg-blue-600 border border-blue-400 flex items-center justify-center font-bold text-white text-sm">
                    MV
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1">
                      Marcus Vance, CFE <BadgeCheck className="w-3.5 h-3.5 text-blue-400" />
                    </h4>
                    <p className="text-[11px] text-slate-400">Badge ID: <strong className="text-slate-200 font-mono">#IV-4809</strong></p>
                    <span className="inline-block text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 rounded border border-emerald-500/30 mt-0.5">
                      ACTIVE DUTY
                    </span>
                  </div>
                </div>
              </div>

              <div className="py-2.5 space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Jurisdiction:</span>
                  <span className="font-semibold text-slate-200">Motor Claims SIU</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Statutory Authority:</span>
                  <span className="font-semibold text-slate-200">IRDAI / ACFE Cert</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Active Caseload:</span>
                  <span className="font-bold text-blue-400 font-mono">{claims.length} Cases</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-1.5">
                <button
                  onClick={() => { setShowProfile(false); onNavigate('settings'); }}
                  className="w-full text-left text-xs font-semibold text-slate-300 hover:text-white px-2 py-1.5 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Adjust SIU Investigation Settings
                </button>
                <button
                  onClick={() => { setShowProfile(false); onNavigate('human_escalation'); }}
                  className="w-full text-left text-xs font-semibold text-slate-300 hover:text-white px-2 py-1.5 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Senior Escalation Desk
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
