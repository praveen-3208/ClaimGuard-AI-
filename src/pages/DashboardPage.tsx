import React, { useState, useMemo } from 'react';
import { ClaimRecord } from '../types/claim';
import { 
  RecommendationBadge, 
  SeverityBadge, 
  ClaimStatusBadge, 
  EvidenceStatusBadge, 
  EvidenceStatusType 
} from '../components/common/Badges';
import { 
  ReviewStatisticsCharts, 
  getClaimEvidenceStatus 
} from '../components/dashboard/ReviewStatisticsCharts';
import { 
  FileCheck2, 
  AlertTriangle, 
  Scale, 
  TrendingUp, 
  Car, 
  Bike, 
  ArrowUpRight, 
  Sparkles, 
  ShieldAlert, 
  FileSearch, 
  CheckCircle2, 
  XCircle, 
  HelpCircle,
  RefreshCw,
  Clock,
  FileWarning,
  AlertOctagon,
  Eye,
  Filter,
  Search,
  Activity,
  Calendar,
  Layers,
  FileText
} from 'lucide-react';

interface DashboardPageProps {
  claims: ClaimRecord[];
  onSelectClaim: (claimId: string) => void;
  onNavigate: (tab: any) => void;
  onResetDemoData?: () => void;
}

// Helper to determine Policy Match string and badge color
function getPolicyMatchInfo(claim: ClaimRecord): { text: string; status: 'compliant' | 'violation' | 'uncertain' | 'tariff' } {
  // Check violated policies
  const violations = claim.policyEvaluations?.filter(p => p.status === 'VIOLATED') || [];
  if (violations.length > 0) {
    return {
      text: `Exclusion (${violations[0].clauseId})`,
      status: 'violation',
    };
  }

  // Check uncertain
  const uncertain = claim.policyEvaluations?.filter(p => p.status === 'UNCERTAIN') || [];
  if (uncertain.length > 0) {
    return {
      text: `Uncertain (${uncertain[0].clauseId})`,
      status: 'uncertain',
    };
  }

  // Check if zero dep or tariff
  if (claim.claimForm.policyType.includes('Zero Dep')) {
    return {
      text: '100% Zero-Dep Compliant',
      status: 'compliant',
    };
  }

  return {
    text: 'Tariff Compliant (Standard OD)',
    status: 'compliant',
  };
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  claims,
  onSelectClaim,
  onNavigate,
  onResetDemoData,
}) => {
  const [tableFilter, setTableFilter] = useState<'ALL' | 'CRITICAL' | 'CONTRADICTIONS' | 'MISSING' | 'ESCALATED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // ----------------------------------------------------
  // TOP KPI CARDS CALCULATION
  // ----------------------------------------------------
  // 1. Total Claims
  const totalClaims = claims.length;

  // 2. Pending Reviews (Claims requiring investigator review / under review)
  const pendingReviews = claims.filter(c => 
    c.status.includes('Pending') || 
    c.status === 'Under AI Review' || 
    c.status === 'Under Field Investigation' ||
    c.recommendation.decision === 'REQUEST INFORMATION'
  ).length;

  // 3. Missing Evidence (Claims with missing mandatory documents / fields)
  const missingEvidenceClaims = claims.filter(c => 
    getClaimEvidenceStatus(c) === 'Missing' ||
    (c.missingInformation && c.missingInformation.length > 0) ||
    !c.claimForm.driverLicenseNumber
  ).length;

  // 4. Contradictory Claims (Claims with detected discrepancies)
  const contradictoryClaims = claims.filter(c => 
    c.contradictions && c.contradictions.length > 0
  ).length;

  // 5. Escalated Cases (Claims requiring human / senior supervisor escalation)
  const escalatedClaims = claims.filter(c => 
    c.recommendation.requiresHumanEscalation ||
    c.status.includes('Escalated')
  ).length;

  // ----------------------------------------------------
  // FILTERED CLAIMS FOR "Claims Requiring Attention"
  // ----------------------------------------------------
  const filteredClaims = useMemo(() => {
    return claims.filter(c => {
      const evStatus = getClaimEvidenceStatus(c);
      const prio = c.recommendation.escalationSeverity;

      // Tab filter
      if (tableFilter === 'CRITICAL' && prio !== 'CRITICAL') return false;
      if (tableFilter === 'CONTRADICTIONS' && evStatus !== 'Contradiction') return false;
      if (tableFilter === 'MISSING' && evStatus !== 'Missing') return false;
      if (tableFilter === 'ESCALATED' && evStatus !== 'Escalated') return false;

      // Text query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = c.claimNumber.toLowerCase().includes(q);
        const matchVehicle = c.claimForm.vehicleMakeModel.toLowerCase().includes(q);
        const matchName = c.claimForm.insuredName.toLowerCase().includes(q);
        const matchType = c.claimForm.policyType.toLowerCase().includes(q);
        if (!matchId && !matchVehicle && !matchName && !matchType) return false;
      }

      return true;
    });
  }, [claims, tableFilter, searchQuery]);

  // ----------------------------------------------------
  // RECENT CLAIM ACTIVITY DATA
  // ----------------------------------------------------
  const recentActivities = [
    {
      id: 'act-1',
      claimId: 'clm-8801',
      claimNumber: 'CLM-2026-8801',
      eventType: 'CONTRADICTION_DETECTED',
      icon: AlertTriangle,
      iconColor: 'text-amber-500 bg-amber-50 border-amber-200',
      title: 'Structural Damage Contradiction Detected',
      description: 'Front curb collision at 15 km/h contradicts workshop estimate replacement of rear quarter panel ($3,200) and rear subframe camber arm ($1,400). Pre-existing seam oxidation flagged.',
      actor: 'ClaimGuard AI Engine v2.4',
      timestamp: '12m ago',
      severity: 'CRITICAL',
    },
    {
      id: 'act-2',
      claimId: 'clm-8803',
      claimNumber: 'CLM-2026-8803',
      eventType: 'EXCLUSION_CONFIRMED',
      icon: FileWarning,
      iconColor: 'text-rose-500 bg-rose-50 border-rose-200',
      title: 'Policy Exclusion POL-EXC-201 Triggered',
      description: 'Police FIR confirms private passenger vehicle was operating for commercial carriage of goods (SwiftDrop couriers) at moment of loss. Repudiation notice generated.',
      actor: 'Robert Chen (Senior Investigator)',
      timestamp: '35m ago',
      severity: 'CRITICAL',
    },
    {
      id: 'act-3',
      claimId: 'clm-8804',
      claimNumber: 'CLM-2026-8804',
      eventType: 'MISSING_EVIDENCE',
      icon: HelpCircle,
      iconColor: 'text-purple-500 bg-purple-50 border-purple-200',
      title: 'Driver License Missing / Unlicensed Operator Alert',
      description: 'Claim form submitted with blank driver license; insured incident statement mentions 16-year-old nephew was maneuvering scooter during third-party pedestrian strike.',
      actor: 'Elena Rostova (Claims Investigator)',
      timestamp: '1h ago',
      severity: 'HIGH',
    },
    {
      id: 'act-4',
      claimId: 'clm-8805',
      claimNumber: 'CLM-2026-8805',
      eventType: 'CONSEQUENTIAL_EXCLUSION',
      icon: AlertOctagon,
      iconColor: 'text-orange-500 bg-orange-50 border-orange-200',
      title: 'Hydrostatic Lock Consequential Loss Disallowed',
      description: 'Driver repeatedly cranked engine in flooded underpass dip; policy lacks Engine Protector endorsement. Disallowed $3,930 engine overhaul; net external bumper absorbed by deductible.',
      actor: 'ClaimGuard AI Engine v2.4',
      timestamp: '2h ago',
      severity: 'MEDIUM',
    },
    {
      id: 'act-5',
      claimId: 'clm-8802',
      claimNumber: 'CLM-2026-8802',
      eventType: 'VERIFICATION_PASSED',
      icon: CheckCircle2,
      iconColor: 'text-emerald-500 bg-emerald-50 border-emerald-200',
      title: 'Cross-Verification Consistent / Clean Approval',
      description: 'Motorcycle wet slide damage aligns 100% across customer statement and workshop estimate items. No statutory exclusions triggered. Settlement authorized at $520.',
      actor: 'Marcus Vance (Senior SIU)',
      timestamp: '4h ago',
      severity: 'NONE',
    },
  ];

  // ----------------------------------------------------
  // HIGH PRIORITY CASES SELECTION
  // (Missing documents, contradictions, policy exclusions, or uncertain results)
  // ----------------------------------------------------
  const highPriorityCases = useMemo(() => {
    return claims.filter(c => 
      c.recommendation.escalationSeverity === 'CRITICAL' ||
      c.recommendation.escalationSeverity === 'HIGH' ||
      c.contradictions.length > 0 ||
      (c.missingInformation && c.missingInformation.length > 0)
    ).slice(0, 4);
  }, [claims]);

  return (
    <div className="space-y-4 pb-12">
      
      {/* High Density Console Sub-Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-900 border border-slate-800 text-white px-4 py-2.5 rounded shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800/80">
            SIU TRIANGULATION TERMINAL
          </span>
          <span className="h-3.5 w-[1px] bg-slate-700 hidden sm:inline"></span>
          <span className="text-xs text-slate-300 font-semibold hidden sm:inline">
            Active Investigator Desk • Live Evidence Cross-Verification
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('new_claim')}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3 py-1.5 rounded shadow-sm shadow-blue-900/40 transition-colors cursor-pointer"
          >
            <FileSearch className="w-3.5 h-3.5" />
            <span>Intake New Claim</span>
          </button>
          {onResetDemoData && (
            <button
              onClick={onResetDemoData}
              title="Reset all demo test claims"
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold px-2.5 py-1.5 rounded border border-slate-700 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3 text-slate-400" />
              <span className="hidden sm:inline">Reset Scenarios</span>
            </button>
          )}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TOP KPI CARDS (Exact 5 cards requested) */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        
        {/* KPI 1: Total Claims */}
        <div className="bg-white p-3 rounded border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Claims</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded">
              <FileCheck2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">{totalClaims}</div>
            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500 font-medium">
              <span className="text-slate-700 font-semibold flex items-center gap-0.5">
                <Car className="w-3 h-3 text-slate-400 inline" /> {claims.filter(c => c.claimForm.vehicleCategory === 'car').length}
              </span>
              <span>•</span>
              <span className="text-slate-700 font-semibold flex items-center gap-0.5">
                <Bike className="w-3 h-3 text-slate-400 inline" /> {claims.filter(c => c.claimForm.vehicleCategory === 'two_wheeler').length}
              </span>
              <span className="text-slate-400 ml-auto font-mono text-[9px]">$23.8k vol</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Pending Reviews */}
        <div className="bg-white p-3 rounded border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Reviews</span>
            <div className="p-1.5 bg-sky-50 text-sky-600 rounded">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <div className="text-2xl font-black text-sky-800 font-mono tracking-tight">{pendingReviews}</div>
            <p className="mt-0.5 text-[10px] text-sky-700 font-medium truncate">
              Awaiting triage / intake review
            </p>
          </div>
        </div>

        {/* KPI 3: Missing Evidence */}
        <div className="bg-white p-3 rounded border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Missing Evidence</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded">
              <HelpCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <div className="text-2xl font-black text-amber-800 font-mono tracking-tight">{missingEvidenceClaims}</div>
            <p className="mt-0.5 text-[10px] text-amber-700 font-medium truncate">
              Mandatory statutory documents absent
            </p>
          </div>
        </div>

        {/* KPI 4: Contradictory Claims */}
        <div className="bg-white p-3 rounded border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contradictory Claims</span>
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <div className="text-2xl font-black text-rose-800 font-mono tracking-tight">{contradictoryClaims}</div>
            <p className="mt-0.5 text-[10px] text-rose-700 font-medium truncate">
              Damage mismatch & speed conflicts
            </p>
          </div>
        </div>

        {/* KPI 5: Escalated Cases */}
        <div className="bg-white p-3 rounded border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Escalated Cases</span>
            <div className="p-1.5 bg-purple-50 text-purple-600 rounded">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <div className="text-2xl font-black text-purple-800 font-mono tracking-tight">{escalatedClaims}</div>
            <p className="mt-0.5 text-[10px] text-purple-700 font-semibold truncate">
              Requires senior sign-off
            </p>
          </div>
        </div>

      </div>

      {/* ---------------------------------------------------- */}
      {/* 1. "Claims Requiring Attention" TABLE */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white rounded border border-slate-200 shadow-xs flex flex-col overflow-hidden">
        
        {/* Table Header & Controls Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-blue-600" />
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wide text-slate-900">
                Claims Requiring Attention
              </h2>
              <span className="text-[10px] text-slate-500">
                Active investigation register sorted by review priority and evidence discrepancy status
              </span>
            </div>
          </div>

          {/* Filter Pills & Search */}
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="relative">
              <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter table..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-6 pr-2 py-1 text-[11px] bg-white border border-slate-200 rounded text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 w-32 sm:w-40 font-medium"
              />
            </div>

            <div className="flex items-center bg-slate-200/70 p-0.5 rounded border border-slate-300 text-[10px] font-bold">
              <button
                onClick={() => setTableFilter('ALL')}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  tableFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({claims.length})
              </button>
              <button
                onClick={() => setTableFilter('CRITICAL')}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  tableFilter === 'CRITICAL' ? 'bg-red-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Critical
              </button>
              <button
                onClick={() => setTableFilter('CONTRADICTIONS')}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  tableFilter === 'CONTRADICTIONS' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Contradictions
              </button>
              <button
                onClick={() => setTableFilter('MISSING')}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  tableFilter === 'MISSING' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Missing
              </button>
              <button
                onClick={() => setTableFilter('ESCALATED')}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  tableFilter === 'ESCALATED' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Escalated
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/75 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 tracking-wider">
                <th className="py-2.5 px-3">Claim ID</th>
                <th className="py-2.5 px-3">Vehicle</th>
                <th className="py-2.5 px-3">Claim Type</th>
                <th className="py-2.5 px-3">Submitted Date</th>
                <th className="py-2.5 px-3">Evidence Status</th>
                <th className="py-2.5 px-3">Policy Match</th>
                <th className="py-2.5 px-3">Recommendation</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                    No claims match the active filter criteria.
                  </td>
                </tr>
              ) : (
                filteredClaims.map((claim) => {
                  const evStatus: EvidenceStatusType = getClaimEvidenceStatus(claim);
                  const policyInfo = getPolicyMatchInfo(claim);

                  return (
                    <tr 
                      key={claim.id} 
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => onSelectClaim(claim.id)}
                    >
                      {/* 1. Claim ID */}
                      <td className="py-2.5 px-3">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 group-hover:bg-blue-50 group-hover:text-blue-700 px-1.5 py-0.5 rounded border border-slate-200 transition-colors inline-block">
                          {claim.claimNumber}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {claim.claimForm.insuredName}
                        </div>
                      </td>

                      {/* 2. Vehicle */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          {claim.claimForm.vehicleCategory === 'car' ? (
                            <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          ) : (
                            <Bike className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span className="truncate max-w-[170px]" title={claim.claimForm.vehicleMakeModel}>
                            {claim.claimForm.vehicleMakeModel}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {claim.claimForm.vehicleRegistrationNumber}
                        </div>
                      </td>

                      {/* 3. Claim Type */}
                      <td className="py-2.5 px-3">
                        <span className="text-[11px] font-medium text-slate-700 block truncate max-w-[150px]" title={claim.claimForm.policyType}>
                          {claim.claimForm.policyType}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ${Number(claim.claimForm?.claimedAmount || 0).toLocaleString()} claimed
                        </span>
                      </td>

                      {/* 4. Submitted Date */}
                      <td className="py-2.5 px-3">
                        <div className="text-[11px] font-mono font-medium text-slate-800">
                          {claim.claimForm.dateOfLoss}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {claim.claimForm.timeOfLoss || 'Intake verified'}
                        </div>
                      </td>

                      {/* 5. Evidence Status (badges: Complete, Missing, Contradiction, Escalated, Under Review) */}
                      <td className="py-2.5 px-3">
                        <EvidenceStatusBadge status={evStatus} size="sm" />
                      </td>

                      {/* 6. Policy Match */}
                      <td className="py-2.5 px-3">
                        {policyInfo.status === 'violation' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded uppercase">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            {policyInfo.text}
                          </span>
                        ) : policyInfo.status === 'uncertain' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded uppercase">
                            <HelpCircle className="w-3 h-3 text-amber-600" />
                            {policyInfo.text}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded uppercase">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {policyInfo.text}
                          </span>
                        )}
                      </td>

                      {/* 7. Recommendation */}
                      <td className="py-2.5 px-3">
                        <RecommendationBadge decision={claim.recommendation.decision} size="sm" />
                      </td>

                      {/* 8. Priority */}
                      <td className="py-2.5 px-3">
                        <SeverityBadge severity={claim.recommendation.escalationSeverity} />
                      </td>

                      {/* Action */}
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectClaim(claim.id);
                          }}
                          className="text-xs font-bold text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-200 hover:border-blue-600 px-2.5 py-1 rounded transition-all cursor-pointer"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 flex items-center justify-between text-[11px] text-slate-500">
          <span>
            Displaying <strong>{filteredClaims.length}</strong> of <strong>{claims.length}</strong> registered motor claims
          </span>
          <button
            onClick={() => onNavigate('claims_list')}
            className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5 cursor-pointer"
          >
            <span>Open Comprehensive Claims Registry</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

      </div>

      {/* ---------------------------------------------------- */}
      {/* 3. "Review Statistics" CHARTS */}
      {/* ---------------------------------------------------- */}
      <ReviewStatisticsCharts claims={claims} />

      {/* ---------------------------------------------------- */}
      {/* TWO COLUMN GRID: 2. "Recent Claim Activity" & 4. "High Priority Cases" */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* 2. "Recent Claim Activity" */}
        <div className="bg-white rounded border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900">
                  Recent Claim Activity
                </h3>
                <span className="text-[10px] text-slate-500">Forensic review audit log and SIU trigger events</span>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded font-bold border border-blue-200 uppercase">
              Live Feed
            </span>
          </div>

          <div className="p-3 space-y-2.5 flex-1 overflow-y-auto max-h-[440px]">
            {recentActivities.map((act) => {
              const Icon = act.icon;
              return (
                <div
                  key={act.id}
                  onClick={() => onSelectClaim(act.claimId)}
                  className="p-2.5 rounded border border-slate-100 hover:border-blue-300 hover:bg-slate-50/80 transition-all cursor-pointer text-left group"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-1.5">
                      <div className={`p-1 rounded border ${act.iconColor}`}>
                        <Icon className="w-3 h-3" />
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-blue-600">
                        {act.claimNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 font-mono">{act.timestamp}</span>
                      <SeverityBadge severity={act.severity as any} />
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-slate-900 mt-1 leading-snug">
                    {act.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed line-clamp-2">
                    {act.description}
                  </p>

                  <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-medium">Actor: <strong className="text-slate-600">{act.actor}</strong></span>
                    <span className="text-blue-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Inspect Claim <ArrowUpRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
            <button
              onClick={() => onNavigate('evidence_comparison')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              Open Multi-Source Triangulation Matrix →
            </button>
          </div>
        </div>

        {/* 4. "High Priority Cases" */}
        <div className="bg-white rounded border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-600" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900">
                  High Priority Cases
                </h3>
                <span className="text-[10px] text-slate-500">
                  Claims with missing docs, contradictions, policy exclusions, or uncertain results
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-rose-50 text-rose-700 px-1.5 py-0.2 rounded font-bold border border-rose-200 uppercase">
              Action Required
            </span>
          </div>

          <div className="p-3 space-y-2.5 flex-1 overflow-y-auto max-h-[440px]">
            {highPriorityCases.map((claim) => {
              const primaryContradiction = claim.contradictions[0];
              const missingDoc = claim.missingInformation[0];
              const violatedPolicy = claim.policyEvaluations?.find(p => p.status === 'VIOLATED');

              return (
                <div
                  key={claim.id}
                  onClick={() => onSelectClaim(claim.id)}
                  className="p-3 rounded border border-slate-200 hover:border-rose-300 hover:bg-rose-50/20 transition-all cursor-pointer text-left group"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold bg-slate-100 group-hover:bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-900">
                        {claim.claimNumber}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-600 truncate max-w-[130px]">
                        {claim.claimForm.insuredName}
                      </span>
                    </div>
                    <SeverityBadge severity={claim.recommendation.escalationSeverity} />
                  </div>

                  <div className="text-xs font-bold text-slate-900 mb-1">
                    {claim.claimForm.vehicleMakeModel}
                  </div>

                  {/* Flagged Issue Highlight */}
                  {primaryContradiction && (
                    <div className="p-2 rounded bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 mb-1.5 space-y-0.5">
                      <div className="font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>Contradiction: {primaryContradiction.title}</span>
                      </div>
                      <p className="line-clamp-2 text-slate-600 leading-tight">
                        {primaryContradiction.analysisRationale}
                      </p>
                    </div>
                  )}

                  {!primaryContradiction && violatedPolicy && (
                    <div className="p-2 rounded bg-rose-50/70 border border-rose-200/80 text-[11px] text-rose-900 mb-1.5 space-y-0.5">
                      <div className="font-bold flex items-center gap-1">
                        <FileWarning className="w-3 h-3 text-rose-600 shrink-0" />
                        <span>Policy Exclusion: {violatedPolicy.clauseTitle}</span>
                      </div>
                      <p className="line-clamp-2 text-slate-600 leading-tight">
                        {violatedPolicy.reasoning}
                      </p>
                    </div>
                  )}

                  {!primaryContradiction && !violatedPolicy && missingDoc && (
                    <div className="p-2 rounded bg-purple-50/70 border border-purple-200/80 text-[11px] text-purple-900 mb-1.5 space-y-0.5">
                      <div className="font-bold flex items-center gap-1">
                        <HelpCircle className="w-3 h-3 text-purple-600 shrink-0" />
                        <span>Missing Doc: {missingDoc.fieldOrDocument}</span>
                      </div>
                      <p className="line-clamp-2 text-slate-600 leading-tight">
                        {missingDoc.rationale}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                    <div className="font-mono">
                      <span className="text-slate-400">Claimed: </span>
                      <strong className="text-slate-900">${Number(claim.claimForm?.claimedAmount || 0).toLocaleString()}</strong>
                    </div>
                    <span className="text-blue-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Adjudicate Case <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
            <button
              onClick={() => onNavigate('human_escalation')}
              className="text-xs font-bold text-rose-700 hover:text-rose-900 cursor-pointer"
            >
              Open Senior Investigator Adjudication Desk →
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
