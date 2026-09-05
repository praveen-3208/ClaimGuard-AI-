import React, { useState } from 'react';
import { ClaimRecord, ClaimStatus } from '../types/claim';
import { evaluateClaimEscalation, EscalationTriggerKey } from '../utils/escalationEngine';
import { EscalationCard } from '../components/escalation/EscalationCard';
import { 
  ShieldAlert, 
  UserCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  ArrowRight, 
  Clock,
  Filter,
  FileQuestion,
  Scale,
  Sparkles,
  Layers,
  History,
  AlertOctagon,
  ExternalLink
} from 'lucide-react';

interface HumanEscalationPageProps {
  claims: ClaimRecord[];
  onSelectClaim: (claimId: string) => void;
  onNavigate: (page: any) => void;
  onUpdateEscalation: (id: string, payload: any) => Promise<void>;
}

export const HumanEscalationPage: React.FC<HumanEscalationPageProps> = ({
  claims,
  onSelectClaim,
  onNavigate,
  onUpdateEscalation,
}) => {
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [filterRule, setFilterRule] = useState<EscalationTriggerKey | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Evaluate escalation for all claims
  const claimsWithEvaluation = claims.map(claim => {
    const dossier = evaluateClaimEscalation(claim);
    return {
      claim,
      dossier,
    };
  });

  // Filter claims where escalation is required (or already flagged by AI/system)
  const escalatedClaims = claimsWithEvaluation.filter(
    ({ claim, dossier }) => dossier.isEscalationRequired || claim.recommendation?.requiresHumanEscalation
  );

  // Apply trigger-rule filter and search query
  const filteredClaims = escalatedClaims.filter(({ claim, dossier }) => {
    const matchesSearch = 
      claim.claimNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dossier.claimId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.claimForm?.insuredName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dossier.reason.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterRule === 'ALL') return true;

    return dossier.triggers.some(t => t.key === filterRule && t.isTriggered);
  });

  // Determine active claim: default to CLM-1042 if available, or selected, or first in list
  const activeClaimItem = 
    filteredClaims.find(c => c.claim.id === selectedClaimId) ||
    filteredClaims.find(c => c.claim.claimNumber === 'CLM-1042' || c.claim.id === 'clm-1042') ||
    filteredClaims[0] ||
    escalatedClaims[0];

  const activeClaim = activeClaimItem ? activeClaimItem.claim : null;

  // Criteria definition list for filter toolbar
  const filterCriteria: { key: EscalationTriggerKey | 'ALL'; label: string; icon: React.ReactNode }[] = [
    { key: 'ALL', label: 'All Escalations', icon: <Layers className="w-3 h-3" /> },
    { key: 'CONTRADICTIONS', label: 'Contradictions Found', icon: <AlertOctagon className="w-3 h-3 text-red-500" /> },
    { key: 'MISSING_EVIDENCE', label: 'Missing Required Evidence', icon: <FileQuestion className="w-3 h-3 text-amber-500" /> },
    { key: 'NO_POLICY_CLAUSE', label: 'No Policy Clause', icon: <Scale className="w-3 h-3 text-purple-500" /> },
    { key: 'AMBIGUOUS_EVIDENCE', label: 'Ambiguous Evidence', icon: <AlertTriangle className="w-3 h-3 text-amber-500" /> },
    { key: 'LOW_CONFIDENCE', label: 'Low AI Confidence', icon: <Sparkles className="w-3 h-3 text-blue-500" /> },
    { key: 'POLICY_RULE_MISMATCH', label: 'Policy Rule Mismatch', icon: <ShieldAlert className="w-3 h-3 text-red-500" /> },
  ];

  return (
    <div className="space-y-4 pb-12">
      
      {/* ---------------------------------------------------- */}
      {/* 1. TOP STATUTORY HEADER                              */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white px-4 py-3 border border-slate-200 rounded-lg shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-red-600 text-white flex items-center justify-center font-bold">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <span>Human Escalation Workflow</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">
                  SIU Priority Queue
                </span>
              </h1>
              <p className="text-[11px] text-slate-500">
                Automated escalation protocol enforces senior human sign-off when claims trigger strict evidentiary thresholds.
              </p>
            </div>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded bg-red-50 border border-red-200 text-red-900 font-bold flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5 text-red-600" />
            <span>{escalatedClaims.length} Active Escalation{escalatedClaims.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="px-3 py-1.5 rounded bg-slate-100 border border-slate-300 text-slate-700 font-medium">
            <span>6 Statutory Rules Active</span>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 2. THE 6 AUTOMATED ESCALATION TRIGGERS FILTER BAR    */}
      {/* ---------------------------------------------------- */}
      <div className="bg-slate-900 text-white p-3 rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-blue-400" />
            System Escalation Rule Criteria (Filter by Trigger):
          </span>
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            Autonomous adjudication suspended when any rule triggers
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {filterCriteria.map(crit => {
            const isSelected = filterRule === crit.key;
            // Count matching claims
            const matchCount = crit.key === 'ALL'
              ? escalatedClaims.length
              : escalatedClaims.filter(({ dossier }) => dossier.triggers.some(t => t.key === crit.key && t.isTriggered)).length;

            return (
              <button
                key={crit.key}
                onClick={() => setFilterRule(crit.key)}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-400 shadow-xs'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {crit.icon}
                <span>{crit.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  isSelected ? 'bg-blue-800 text-white' : 'bg-slate-900 text-slate-400'
                }`}>
                  {matchCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 3. MAIN WORKSPACE: QUEUE LIST (LEFT) & CARD (RIGHT)  */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Escalation Queue (4/12) */}
        <div className="lg:col-span-4 space-y-3">
          
          {/* Search bar inside queue */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Claim ID, Insured, or Reason..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-white rounded border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          {/* Quick shortcut for CLM-1042 if not selected */}
          {claims.some(c => c.claimNumber === 'CLM-1042' || c.id === 'clm-1042') && (
            <div className="p-2.5 rounded bg-red-50 border border-red-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                <span className="font-mono font-bold text-red-950">CLM-1042</span>
                <span className="text-[11px] text-red-800">Date Discrepancy Case</span>
              </div>
              <button
                onClick={() => {
                  const target = claims.find(c => c.claimNumber === 'CLM-1042' || c.id === 'clm-1042');
                  if (target) setSelectedClaimId(target.id);
                }}
                className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] cursor-pointer"
              >
                Inspect
              </button>
            </div>
          )}

          {/* List of Escalated Claims */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
              <span>Escalated Dossiers ({filteredClaims.length})</span>
              <span className="text-[10px] text-slate-400">Select to View Card</span>
            </div>

            {filteredClaims.length === 0 ? (
              <div className="p-6 bg-white rounded border border-slate-200 text-center text-xs text-slate-500 space-y-1">
                <p className="font-bold">No claims match this trigger filter.</p>
                <p className="text-[11px]">Select another trigger or reset filter.</p>
              </div>
            ) : (
              filteredClaims.map(({ claim, dossier }) => {
                const isSelected = activeClaim && activeClaim.id === claim.id;
                return (
                  <button
                    key={claim.id}
                    onClick={() => {
                      setSelectedClaimId(claim.id);
                      onSelectClaim(claim.id);
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-red-500/50'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                        isSelected ? 'bg-slate-800 text-red-400 border border-slate-700' : 'bg-slate-100 text-slate-900'
                      }`}>
                        {dossier.claimId}
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                        isSelected ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'
                      }`}>
                        {dossier.activeTriggerCount} Trigger{dossier.activeTriggerCount !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <p className={`text-xs font-bold line-clamp-1 ${
                      isSelected ? 'text-white' : 'text-slate-900'
                    }`}>
                      {dossier.reason}
                    </p>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/40">
                      <span className={isSelected ? 'text-slate-300' : 'text-slate-600'}>
                        {claim.claimForm?.vehicleMakeModel || 'Vehicle Claim'}
                      </span>
                      <span className={`font-mono font-semibold ${
                        isSelected ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        ${(claim.claimForm?.claimedAmount || 0).toLocaleString()}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: The Escalation Card & Active Dossier (8/12) */}
        <div className="lg:col-span-8 space-y-4">
          {activeClaim ? (
            <div className="space-y-4">
              
              {/* ------------------------------------------------ */}
              {/* THE REQUESTED ESCALATION CARD COMPONENT          */}
              {/* ------------------------------------------------ */}
              <EscalationCard
                claim={activeClaim}
                onUpdateEscalation={onUpdateEscalation}
                onNavigate={onNavigate}
                onSelectCitation={(citation) => {
                  onSelectClaim(activeClaim.id);
                  onNavigate('evidence_comparison');
                }}
                showTriggersBreakdown={true}
              />

              {/* Quick links to Evidence Review & Full Dossier */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  <span>Investigator Quick Access:</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onSelectClaim(activeClaim.id);
                      onNavigate('evidence_comparison');
                    }}
                    className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Inspect Dual Source Extracts</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      onSelectClaim(activeClaim.id);
                      onNavigate('claims');
                    }}
                    className="px-3 py-1.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>View Complete Claim File</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Audit Trail & Investigator Notes History */}
              <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-slate-600" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Escalation Audit Trail & Chain of Custody
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Statutory Compliance Log
                  </span>
                </div>

                {activeClaim.investigatorNotes && (
                  <div className="p-3 rounded bg-amber-50/60 border border-amber-200 text-xs space-y-1">
                    <span className="font-bold text-amber-900 uppercase text-[10px] tracking-wider block">
                      Active Investigator Notes:
                    </span>
                    <pre className="font-sans text-xs text-amber-950 whitespace-pre-wrap leading-relaxed">
                      {activeClaim.investigatorNotes}
                    </pre>
                  </div>
                )}

                <div className="space-y-2">
                  {activeClaim.auditLog && activeClaim.auditLog.length > 0 ? (
                    activeClaim.auditLog.map((log) => (
                      <div key={log.id} className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{log.action}</span>
                          <span className="font-mono text-[10px] text-slate-500">
                            {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">{log.note}</p>
                        <span className="text-[10px] font-mono text-slate-400 block pt-0.5">
                          Actor: {log.actor}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">No previous audit entries logged.</p>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 bg-white rounded-lg border border-slate-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">No Claim Selected</h3>
              <p className="text-xs text-slate-500">Select a claim from the escalation queue on the left to view its Escalation Card.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
