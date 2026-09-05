import React from 'react';
import { 
  FileStack, 
  FileSearch, 
  BookOpen, 
  Cpu, 
  AlertTriangle, 
  UserCheck, 
  CheckCircle2, 
  AlertCircle,
  XCircle,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { ClaimRecord } from '../../types/claim';

interface InvestigationPipelineProps {
  claim: ClaimRecord;
  currentStep?: 'documents' | 'evidence' | 'policy' | 'analysis' | 'recommendation' | 'human_review';
  onStepClick?: (stepId: string) => void;
  className?: string;
}

export const InvestigationPipeline: React.FC<InvestigationPipelineProps> = ({
  claim,
  currentStep,
  onStepClick,
  className = '',
}) => {
  if (!claim) return null;

  // 1. Documents Status
  const hasMissingDocs = (claim.missingInformation && claim.missingInformation.length > 0) || 
    Boolean((claim.repairEstimateOrFIR as any)?.isMissing);
  const docsStatus = hasMissingDocs ? 'warning' : 'verified';
  const docsLabel = hasMissingDocs 
    ? `${claim.missingInformation?.length || 0} Missing Doc` 
    : 'All 3 Ingested';

  // 2. Evidence Status (Contradictions)
  const hasContradictions = Boolean(claim.contradictions && claim.contradictions.length > 0);
  const criticalContra = claim.contradictions?.some(c => c.severity === 'CRITICAL');
  const evidenceStatus = hasContradictions ? (criticalContra ? 'critical' : 'warning') : 'verified';
  const evidenceLabel = hasContradictions 
    ? `${claim.contradictions.length} Contradiction${claim.contradictions.length > 1 ? 's' : ''}` 
    : 'Verified Concordance';

  // 3. Policy Status
  const violatedPolicy = claim.policyEvaluations?.some(p => p.status === 'VIOLATED');
  const exceptionPolicy = claim.policyEvaluations?.some(p => (p.status as string) === 'EXCEPTION_DETECTED');
  const policyStatus = violatedPolicy ? 'critical' : (exceptionPolicy ? 'warning' : 'verified');
  const policyLabel = violatedPolicy 
    ? 'Exclusion Breached' 
    : (exceptionPolicy ? 'Limit Exceeded' : 'Coverage Compliant');

  // 4. Analysis Status
  const confidence = claim.recommendation?.confidenceScore ?? 85;
  const analysisStatus = confidence >= 80 ? 'verified' : (confidence >= 65 ? 'warning' : 'critical');
  const analysisLabel = `${confidence}% Confidence`;

  // 5. Recommendation Status
  const recDecision = claim.recommendation?.decision || 'APPROVE';
  let recStatus: 'verified' | 'warning' | 'critical' | 'escalate' = 'verified';
  if (recDecision === 'REJECT') recStatus = 'critical';
  else if (recDecision === 'REQUEST_INFO' || recDecision === 'REQUEST INFORMATION') recStatus = 'warning';
  else if (recDecision === 'ESCALATE') recStatus = 'escalate';

  // 6. Human Review Status
  const isReviewed = 
    Boolean((claim as any)?.escalationStatus?.reviewStage === 'RESOLVED') || 
    claim.status === 'Approved by Investigator' || 
    claim.status === 'Repudiated by Investigator' ||
    Boolean(claim.investigatorDecision);
  const requiresReview = Boolean(
    claim.recommendation?.requiresHumanEscalation || 
    (claim.recommendation as any)?.requiresHumanReview ||
    claim.status?.includes('Escalated') ||
    claim.status?.includes('Pending')
  );
  const humanStatus = isReviewed ? 'verified' : (requiresReview ? 'warning' : 'neutral');
  const humanLabel = isReviewed 
    ? 'Officer Signed' 
    : (requiresReview ? 'Review Required' : 'Auto-Cleared');

  const steps = [
    {
      id: 'documents',
      name: 'DOCUMENTS',
      subtitle: docsLabel,
      icon: FileStack,
      status: docsStatus,
      statusColor: docsStatus === 'verified' ? 'text-emerald-700 bg-emerald-50 border-emerald-300' : 'text-amber-700 bg-amber-50 border-amber-300',
      badgeIcon: docsStatus === 'verified' ? CheckCircle2 : AlertTriangle,
      badgeText: docsStatus === 'verified' ? 'VERIFIED' : 'ACTION',
    },
    {
      id: 'evidence',
      name: 'EVIDENCE',
      subtitle: evidenceLabel,
      icon: FileSearch,
      status: evidenceStatus,
      statusColor: evidenceStatus === 'critical' ? 'text-rose-700 bg-rose-50 border-rose-300' : (evidenceStatus === 'warning' ? 'text-amber-700 bg-amber-50 border-amber-300' : 'text-emerald-700 bg-emerald-50 border-emerald-300'),
      badgeIcon: evidenceStatus === 'critical' ? XCircle : (evidenceStatus === 'warning' ? AlertTriangle : CheckCircle2),
      badgeText: evidenceStatus === 'critical' ? 'CONFLICT' : (evidenceStatus === 'warning' ? 'WARN' : 'VERIFIED'),
    },
    {
      id: 'policy',
      name: 'POLICY',
      subtitle: policyLabel,
      icon: BookOpen,
      status: policyStatus,
      statusColor: policyStatus === 'critical' ? 'text-rose-700 bg-rose-50 border-rose-300' : (policyStatus === 'warning' ? 'text-amber-700 bg-amber-50 border-amber-300' : 'text-emerald-700 bg-emerald-50 border-emerald-300'),
      badgeIcon: policyStatus === 'critical' ? XCircle : (policyStatus === 'warning' ? AlertTriangle : CheckCircle2),
      badgeText: policyStatus === 'critical' ? 'EXCLUSION' : (policyStatus === 'warning' ? 'CAP' : 'APPLIES'),
    },
    {
      id: 'analysis',
      name: 'ANALYSIS',
      subtitle: analysisLabel,
      icon: Cpu,
      status: analysisStatus,
      statusColor: analysisStatus === 'verified' ? 'text-blue-700 bg-blue-50 border-blue-300' : 'text-amber-700 bg-amber-50 border-amber-300',
      badgeIcon: analysisStatus === 'verified' ? CheckCircle2 : AlertTriangle,
      badgeText: 'AI EVAL',
    },
    {
      id: 'recommendation',
      name: 'RECOMMENDATION',
      subtitle: recDecision.replace('_', ' '),
      icon: AlertTriangle,
      status: recStatus,
      statusColor: recStatus === 'verified' ? 'text-emerald-700 bg-emerald-50 border-emerald-300' : (recStatus === 'critical' ? 'text-rose-700 bg-rose-50 border-rose-300' : (recStatus === 'escalate' ? 'text-purple-700 bg-purple-50 border-purple-300' : 'text-amber-700 bg-amber-50 border-amber-300')),
      badgeIcon: recStatus === 'verified' ? CheckCircle2 : (recStatus === 'critical' ? XCircle : (recStatus === 'escalate' ? AlertTriangle : HelpCircle)),
      badgeText: recDecision === 'APPROVE' ? 'PASS' : (recDecision === 'REJECT' ? 'DENY' : (recDecision === 'ESCALATE' ? 'ESCALATE' : 'INFO')),
    },
    {
      id: 'human_review',
      name: 'HUMAN REVIEW',
      subtitle: humanLabel,
      icon: UserCheck,
      status: humanStatus,
      statusColor: humanStatus === 'verified' ? 'text-emerald-700 bg-emerald-50 border-emerald-300' : (humanStatus === 'warning' ? 'text-amber-700 bg-amber-50 border-amber-300' : 'text-slate-600 bg-slate-100 border-slate-300'),
      badgeIcon: humanStatus === 'verified' ? CheckCircle2 : AlertTriangle,
      badgeText: isReviewed ? 'SIGNED' : 'MANDATORY',
    },
  ];

  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden ${className}`}>
      {/* Header bar */}
      <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-200">
            Investigation Lifecycle Pipeline
          </span>
          <span className="text-[10px] font-mono text-slate-400 border-l border-slate-700 pl-2">
            DOCUMENTS → EVIDENCE → POLICY → ANALYSIS → RECOMMENDATION → HUMAN REVIEW
          </span>
        </div>
        <span className="text-[10px] font-bold text-slate-400 hidden sm:inline">
          Claim {claim.claimNumber}
        </span>
      </div>

      {/* Responsive Horizontal Stepper Grid */}
      <div className="p-3">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const BadgeIcon = step.badgeIcon;
            const isLast = idx === steps.length - 1;
            const isCurrent = currentStep === step.id;

            return (
              <div 
                key={step.id} 
                onClick={() => onStepClick && onStepClick(step.id)}
                className={`relative group rounded-lg border p-2.5 transition-all cursor-pointer select-none ${
                  isCurrent 
                    ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-xs' 
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                }`}
                title={`Click to inspect ${step.name} section`}
              >
                {/* Step number indicator */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-slate-900 text-white font-mono text-[9px] font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-800 truncate">
                      {step.name}
                    </span>
                  </div>
                  <Icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-600 transition-colors" />
                </div>

                {/* Subtitle / Status */}
                <div className="text-[11px] font-semibold text-slate-700 truncate mb-2">
                  {step.subtitle}
                </div>

                {/* Status Pill */}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide border ${step.statusColor}`}>
                    <BadgeIcon className="w-2.5 h-2.5 shrink-0" />
                    {step.badgeText}
                  </span>

                  {!isLast && (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors hidden lg:block" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
