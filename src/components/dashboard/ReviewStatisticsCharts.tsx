import React, { useState } from 'react';
import { ClaimRecord } from '../../types/claim';
import { PieChart, BarChart3, TrendingUp, ShieldCheck, AlertTriangle, Layers, Info } from 'lucide-react';
import { EvidenceStatusType } from '../common/Badges';

interface ReviewStatisticsChartsProps {
  claims: ClaimRecord[];
  onFilterRecommendation?: (rec: string) => void;
  onFilterEvidenceStatus?: (status: EvidenceStatusType) => void;
}

// Helper to determine evidence status for a claim record
export function getClaimEvidenceStatus(claim: ClaimRecord): EvidenceStatusType {
  if (claim.status.includes('Escalated') || claim.recommendation.requiresHumanEscalation) {
    return 'Escalated';
  }
  if (claim.contradictions && claim.contradictions.length > 0) {
    return 'Contradiction';
  }
  if ((claim.missingInformation && claim.missingInformation.length > 0) || !claim.claimForm.driverLicenseNumber) {
    return 'Missing';
  }
  if (claim.status === 'Under AI Review' || claim.status === 'Under Field Investigation') {
    return 'Under Review';
  }
  return 'Complete';
}

export const ReviewStatisticsCharts: React.FC<ReviewStatisticsChartsProps> = ({
  claims,
  onFilterRecommendation,
  onFilterEvidenceStatus,
}) => {
  const [activeView, setActiveView] = useState<'all' | 'recommendation' | 'evidence' | 'type'>('all');

  const total = claims.length || 1;

  // 1. Recommendation counts
  const approveCount = claims.filter(c => c.recommendation.decision === 'APPROVE').length;
  const rejectCount = claims.filter(c => c.recommendation.decision === 'REJECT').length;
  const rfiCount = claims.filter(c => c.recommendation.decision === 'REQUEST INFORMATION').length;
  const escalateCount = claims.filter(c => c.recommendation.decision === 'ESCALATE').length;

  const approvePct = Math.round((approveCount / total) * 100);
  const rejectPct = Math.round((rejectCount / total) * 100);
  const rfiPct = Math.round((rfiCount / total) * 100);
  const escalatePct = Math.round((escalateCount / total) * 100);

  // 2. Evidence Status counts
  const statusCounts: Record<EvidenceStatusType, number> = {
    'Complete': 0,
    'Missing': 0,
    'Contradiction': 0,
    'Escalated': 0,
    'Under Review': 0,
  };

  claims.forEach(c => {
    const s = getClaimEvidenceStatus(c);
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  });

  // 3. Claim Type counts
  const typeCounts: Record<string, { count: number; totalAmount: number }> = {};
  claims.forEach(c => {
    const t = c.claimForm?.policyType || 'Standard Comprehensive';
    if (!typeCounts[t]) {
      typeCounts[t] = { count: 0, totalAmount: 0 };
    }
    typeCounts[t].count += 1;
    typeCounts[t].totalAmount += Number(c.claimForm?.claimedAmount || 0);
  });

  return (
    <div className="bg-white rounded border border-slate-200 shadow-xs p-4">
      {/* Chart Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-600" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Review Statistics & Evidence Metrics
          </h2>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
            (N={claims.length} Active Records)
          </span>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded border border-slate-200 text-[11px] font-bold">
          <button
            onClick={() => setActiveView('all')}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
              activeView === 'all' ? 'bg-white text-slate-900 shadow-2xs border border-slate-200' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All Charts
          </button>
          <button
            onClick={() => setActiveView('recommendation')}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
              activeView === 'recommendation' ? 'bg-white text-slate-900 shadow-2xs border border-slate-200' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Recommendation
          </button>
          <button
            onClick={() => setActiveView('evidence')}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
              activeView === 'evidence' ? 'bg-white text-slate-900 shadow-2xs border border-slate-200' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Evidence Status
          </button>
          <button
            onClick={() => setActiveView('type')}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
              activeView === 'type' ? 'bg-white text-slate-900 shadow-2xs border border-slate-200' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Claim Type
          </button>
        </div>
      </div>

      {/* Grid of 3 Charts */}
      <div className={`grid gap-4 mt-3 ${
        activeView === 'all' 
          ? 'grid-cols-1 md:grid-cols-3' 
          : 'grid-cols-1'
      }`}>

        {/* Chart 1: Claims by Recommendation */}
        {(activeView === 'all' || activeView === 'recommendation') && (
          <div className="p-3 rounded border border-slate-100 bg-slate-50/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  1. Claims by Recommendation
                </span>
                <span className="text-[10px] font-mono text-slate-400 font-bold">{claims.length} total</span>
              </div>

              {/* Stacked Proportional Distribution Bar */}
              <div className="h-4 w-full bg-slate-200 rounded overflow-hidden flex shadow-inner mb-3">
                <div 
                  style={{ width: `${approvePct}%` }} 
                  title={`Approve: ${approveCount} (${approvePct}%)`}
                  className="bg-emerald-500 h-full transition-all hover:opacity-90"
                />
                <div 
                  style={{ width: `${rfiPct}%` }} 
                  title={`Request Info: ${rfiCount} (${rfiPct}%)`}
                  className="bg-amber-500 h-full transition-all hover:opacity-90"
                />
                <div 
                  style={{ width: `${rejectPct}%` }} 
                  title={`Reject: ${rejectCount} (${rejectPct}%)`}
                  className="bg-rose-500 h-full transition-all hover:opacity-90"
                />
                <div 
                  style={{ width: `${escalatePct}%` }} 
                  title={`Escalate: ${escalateCount} (${escalatePct}%)`}
                  className="bg-purple-500 h-full transition-all hover:opacity-90"
                />
              </div>

              {/* Detailed Breakdown List */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between bg-white p-2 rounded border border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                    <span className="font-semibold text-slate-800">APPROVE</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-slate-900">{approveCount}</span>
                    <span className="text-slate-400 text-[10px]">({approvePct}%)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-white p-2 rounded border border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                    <span className="font-semibold text-slate-800">REQUEST INFO</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-slate-900">{rfiCount}</span>
                    <span className="text-slate-400 text-[10px]">({rfiPct}%)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-white p-2 rounded border border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
                    <span className="font-semibold text-slate-800">REJECT</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-slate-900">{rejectCount}</span>
                    <span className="text-slate-400 text-[10px]">({rejectPct}%)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-white p-2 rounded border border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0"></span>
                    <span className="font-semibold text-slate-800">ESCALATE</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-slate-900">{escalateCount}</span>
                    <span className="text-slate-400 text-[10px]">({escalatePct}%)</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-200/80">
              Evaluated against statutory policy rules and evidence triangulation.
            </p>
          </div>
        )}

        {/* Chart 2: Claims by Evidence Status */}
        {(activeView === 'all' || activeView === 'evidence') && (
          <div className="p-3 rounded border border-slate-100 bg-slate-50/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  2. Claims by Evidence Status
                </span>
                <span className="text-[10px] font-mono text-slate-400 font-bold">5 Status Types</span>
              </div>

              {/* Status List with Progress Meters */}
              <div className="space-y-2 mt-1">
                {[
                  { status: 'Contradiction', count: statusCounts['Contradiction'], color: 'bg-rose-500', barColor: 'bg-rose-100', text: 'text-rose-700' },
                  { status: 'Escalated', count: statusCounts['Escalated'], color: 'bg-purple-500', barColor: 'bg-purple-100', text: 'text-purple-700' },
                  { status: 'Missing', count: statusCounts['Missing'], color: 'bg-amber-500', barColor: 'bg-amber-100', text: 'text-amber-700' },
                  { status: 'Under Review', count: statusCounts['Under Review'], color: 'bg-blue-500', barColor: 'bg-blue-100', text: 'text-blue-700' },
                  { status: 'Complete', count: statusCounts['Complete'], color: 'bg-emerald-500', barColor: 'bg-emerald-100', text: 'text-emerald-700' },
                ].map((item) => {
                  const pct = Math.round((item.count / total) * 100);
                  return (
                    <div key={item.status} className="bg-white p-2 rounded border border-slate-200">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${item.color}`}></span>
                          <span className="font-semibold text-slate-800">{item.status}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="font-bold text-slate-900">{item.count}</span>
                          <span className="text-slate-400 text-[10px]">({pct}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.color}`} 
                          style={{ width: `${pct}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-200/80">
              Categorized by SIU discrepancy checks and evidence completeness.
            </p>
          </div>
        )}

        {/* Chart 3: Claims by Claim Type */}
        {(activeView === 'all' || activeView === 'type') && (
          <div className="p-3 rounded border border-slate-100 bg-slate-50/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  3. Claims by Policy / Claim Type
                </span>
                <span className="text-[10px] font-mono text-slate-400 font-bold">Policy Distribution</span>
              </div>

              {/* List of Policy Types with Claim Volume */}
              <div className="space-y-2 mt-1">
                {Object.entries(typeCounts).map(([type, data]) => {
                  const pct = Math.round((data.count / total) * 100);
                  return (
                    <div key={type} className="bg-white p-2 rounded border border-slate-200">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-800 truncate max-w-[150px]" title={type}>
                          {type}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {data.count} <span className="text-[10px] text-slate-400 font-normal">({pct}%)</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mb-1">
                        <span>Total Claimed:</span>
                        <span className="font-bold text-slate-800">${Number(data.totalAmount || 0).toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-600" 
                          style={{ width: `${pct}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-200/80">
              Includes comprehensive add-ons and standard tariff endorsements.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
