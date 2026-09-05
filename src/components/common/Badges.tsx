import React from 'react';
import { RecommendationDecision, EscalationSeverity, ContradictionSeverity, ClaimStatus } from '../../types/claim';
import { CheckCircle2, XCircle, HelpCircle, AlertTriangle, AlertOctagon, Info, ShieldCheck, UserCheck, Clock } from 'lucide-react';

export const RecommendationBadge: React.FC<{ decision: RecommendationDecision; size?: 'sm' | 'md' | 'lg' }> = ({ decision, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase',
    md: 'px-2.5 py-0.5 text-xs font-bold tracking-wide uppercase',
    lg: 'px-3 py-1 text-xs font-extrabold tracking-wider uppercase',
  }[size];

  if (decision === 'APPROVE') {
    return (
      <span className={`inline-flex items-center gap-1 rounded bg-green-50 text-green-700 border border-green-200 ${sizeClasses}`}>
        <CheckCircle2 className={size === 'lg' ? 'w-3.5 h-3.5' : 'w-3 h-3'} />
        APPROVE
      </span>
    );
  }

  if (decision === 'REJECT') {
    return (
      <span className={`inline-flex items-center gap-1 rounded bg-red-50 text-red-700 border border-red-200 ${sizeClasses}`}>
        <XCircle className={size === 'lg' ? 'w-3.5 h-3.5' : 'w-3 h-3'} />
        REJECT
      </span>
    );
  }

  if (decision === 'ESCALATE') {
    return (
      <span className={`inline-flex items-center gap-1 rounded bg-purple-50 text-purple-700 border border-purple-200 ${sizeClasses}`}>
        <AlertTriangle className={size === 'lg' ? 'w-3.5 h-3.5' : 'w-3 h-3'} />
        ESCALATE
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
      <HelpCircle className={size === 'lg' ? 'w-3.5 h-3.5' : 'w-3 h-3'} />
      REQUEST INFORMATION
    </span>
  );
};

export const SeverityBadge: React.FC<{ severity: EscalationSeverity | ContradictionSeverity }> = ({ severity }) => {
  switch (severity) {
    case 'CRITICAL':
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-200">
          <AlertOctagon className="w-3 h-3 text-red-600" />
          CRITICAL
        </span>
      );
    case 'HIGH':
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-800 border border-orange-200">
          <AlertTriangle className="w-3 h-3 text-orange-600" />
          HIGH
        </span>
      );
    case 'MODERATE':
    case 'MEDIUM':
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          MEDIUM
        </span>
      );
    case 'LOW':
    case 'MINOR':
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
          <Info className="w-3 h-3 text-blue-500" />
          LOW
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
          <CheckCircle2 className="w-3 h-3 text-slate-500" />
          NONE
        </span>
      );
  }
};

export const ClaimStatusBadge: React.FC<{ status: ClaimStatus }> = ({ status }) => {
  let color = 'bg-slate-100 text-slate-700 border-slate-200';
  let Icon = Clock;

  if (status === 'Approved by Investigator') {
    color = 'bg-green-50 text-green-700 border-green-200';
    Icon = ShieldCheck;
  } else if (status === 'Repudiated by Investigator') {
    color = 'bg-red-50 text-red-700 border-red-200';
    Icon = XCircle;
  } else if (status.includes('Escalated')) {
    color = 'bg-purple-50 text-purple-700 border-purple-200';
    Icon = AlertTriangle;
  } else if (status.includes('Information')) {
    color = 'bg-amber-100 text-amber-700 border-amber-200';
    Icon = HelpCircle;
  } else if (status.includes('Pending')) {
    color = 'bg-blue-50 text-blue-700 border-blue-200';
    Icon = UserCheck;
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${color}`}>
      <Icon className="w-3 h-3 shrink-0" />
      {status}
    </span>
  );
};

export type EvidenceStatusType = 'Complete' | 'Missing' | 'Contradiction' | 'Escalated' | 'Under Review';

export const EvidenceStatusBadge: React.FC<{ status: EvidenceStatusType; size?: 'sm' | 'md' }> = ({ status, size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  switch (status) {
    case 'Complete':
      return (
        <span className={`inline-flex items-center gap-1 rounded font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
          Complete
        </span>
      );
    case 'Missing':
      return (
        <span className={`inline-flex items-center gap-1 rounded font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 ${sizeClasses}`}>
          <HelpCircle className="w-3 h-3 text-amber-600 shrink-0" />
          Missing
        </span>
      );
    case 'Contradiction':
      return (
        <span className={`inline-flex items-center gap-1 rounded font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
          <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
          Contradiction
        </span>
      );
    case 'Escalated':
      return (
        <span className={`inline-flex items-center gap-1 rounded font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 ${sizeClasses}`}>
          <AlertOctagon className="w-3 h-3 text-purple-600 shrink-0" />
          Escalated
        </span>
      );
    case 'Under Review':
    default:
      return (
        <span className={`inline-flex items-center gap-1 rounded font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}>
          <Clock className="w-3 h-3 text-blue-600 shrink-0" />
          Under Review
        </span>
      );
  }
};

