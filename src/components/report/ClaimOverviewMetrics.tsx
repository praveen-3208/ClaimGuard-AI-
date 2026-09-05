import React from 'react';
import { ClaimRecord } from '../../types/claim';
import { ShieldCheck, Scale, CheckCircle2, Cpu } from 'lucide-react';

interface ClaimOverviewMetricsProps {
  claim: ClaimRecord;
}

export function getBlockBar(score: number, total: number = 10): string {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const filled = Math.round((clamped / 100) * total);
  const empty = total - filled;
  return `${'█'.repeat(filled)}${'░'.repeat(empty)} ${clamped}%`;
}

export function computeClaimMetrics(claim: ClaimRecord): {
  evidenceCompleteness: number;
  policyMatch: number;
  consistency: number;
  aiConfidence: number;
} {
  // Specific scenario mapping to ensure realistic, grounded metrics
  if (claim.claimNumber === 'CLM-2026-1002' || claim.id === 'clm-1002') {
    // Missing Document scenario specifically requested:
    // Evidence Completeness: 80%
    // Policy Match: 90%
    // Consistency: 60%
    // AI Confidence: 82%
    return {
      evidenceCompleteness: 80,
      policyMatch: 90,
      consistency: 60,
      aiConfidence: 82,
    };
  }

  if (claim.claimNumber === 'CLM-2026-1001' || claim.id === 'clm-1001') {
    return {
      evidenceCompleteness: 100,
      policyMatch: 95,
      consistency: 100,
      aiConfidence: 96,
    };
  }

  if (claim.claimNumber === 'CLM-2026-1003' || claim.id === 'clm-1003') {
    return {
      evidenceCompleteness: 95,
      policyMatch: 75,
      consistency: 40,
      aiConfidence: 65,
    };
  }

  if (claim.claimNumber === 'CLM-2026-1004' || claim.id === 'clm-1004') {
    return {
      evidenceCompleteness: 98,
      policyMatch: 25,
      consistency: 85,
      aiConfidence: 98,
    };
  }

  if (claim.claimNumber === 'CLM-2026-1005' || claim.id === 'clm-1005') {
    return {
      evidenceCompleteness: 100,
      policyMatch: 45,
      consistency: 88,
      aiConfidence: 95,
    };
  }

  if (claim.claimNumber === 'CLM-2026-1006' || claim.id === 'clm-1006') {
    return {
      evidenceCompleteness: 70,
      policyMatch: 30,
      consistency: 50,
      aiConfidence: 42,
    };
  }

  // Default dynamic calculation
  const hasMissing = claim.missingInformation && claim.missingInformation.length > 0;
  const hasContradictions = claim.contradictions && claim.contradictions.length > 0;
  const compliantRules = (claim.policyEvaluations || []).filter(p => p.status === 'COMPLIANT').length;
  const totalRules = Math.max(1, (claim.policyEvaluations || []).length);

  return {
    evidenceCompleteness: hasMissing ? 80 : 100,
    policyMatch: Math.round((compliantRules / totalRules) * 100),
    consistency: hasContradictions ? 50 : 95,
    aiConfidence: claim.recommendation.confidenceScore || 85,
  };
}

export const ClaimOverviewMetrics: React.FC<ClaimOverviewMetricsProps> = ({ claim }) => {
  const metrics = computeClaimMetrics(claim);

  const metricCards = [
    {
      id: 'evidence-completeness',
      label: 'Evidence Completeness',
      score: metrics.evidenceCompleteness,
      blockBar: getBlockBar(metrics.evidenceCompleteness),
      icon: CheckCircle2,
      note: metrics.evidenceCompleteness < 100 ? 'Missing mandatory Police FIR' : 'All required intake documents present',
      barColor: metrics.evidenceCompleteness >= 90 ? 'bg-emerald-600' : 'bg-blue-600',
      textColor: 'text-blue-900',
    },
    {
      id: 'policy-match',
      label: 'Policy Match',
      score: metrics.policyMatch,
      blockBar: getBlockBar(metrics.policyMatch),
      icon: Scale,
      note: metrics.policyMatch >= 80 ? 'Accidental collision coverage applies' : 'Policy exclusion or limit concern',
      barColor: metrics.policyMatch >= 80 ? 'bg-indigo-600' : 'bg-amber-600',
      textColor: 'text-indigo-900',
    },
    {
      id: 'consistency',
      label: 'Consistency',
      score: metrics.consistency,
      blockBar: getBlockBar(metrics.consistency),
      icon: ShieldCheck,
      note: metrics.consistency >= 80 ? 'Cross-document facts concordant' : 'Uncorroborated third-party statement',
      barColor: metrics.consistency >= 80 ? 'bg-emerald-600' : 'bg-amber-600',
      textColor: 'text-amber-900',
    },
    {
      id: 'ai-confidence',
      label: 'AI Confidence',
      score: metrics.aiConfidence,
      blockBar: getBlockBar(metrics.aiConfidence),
      icon: Cpu,
      note: 'Model confidence in recommendation',
      barColor: metrics.aiConfidence >= 80 ? 'bg-blue-600' : 'bg-purple-600',
      textColor: 'text-blue-900',
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
          CLAIM OVERVIEW & INTEGRITY INDEX
        </h3>
        <span className="text-[10px] font-mono text-slate-400 font-semibold">
          EVALUATED AGAINST 12 MOTOR POLICY CLAUSES
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {metricCards.map((m) => (
          <div
            key={m.id}
            id={m.id}
            className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-1 mb-1">
              <span className="text-[11px] font-bold text-slate-700 tracking-tight">{m.label}</span>
              <m.icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </div>

            {/* Exact terminal/block bar rendering requested: ████████░░ 80% */}
            <div className="my-1.5 p-1.5 bg-slate-900 text-emerald-400 rounded font-mono text-[11px] font-bold tracking-tight flex items-center justify-between border border-slate-800 select-all">
              <span className="text-emerald-400">{m.blockBar.split(' ')[0]}</span>
              <span className="text-slate-200 ml-1">{m.score}%</span>
            </div>

            {/* Graphical progress bar */}
            <div className="space-y-1 mt-1">
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full ${m.barColor} transition-all duration-500 rounded-full`}
                  style={{ width: `${m.score}%` }}
                />
              </div>
              <p className="text-[9.5px] text-slate-500 font-medium leading-tight truncate">
                {m.note}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
