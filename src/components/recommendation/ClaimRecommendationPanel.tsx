import React, { useState } from 'react';
import { ClaimRecord, RecommendationDecision } from '../../types/claim';
import { CitationBadge } from '../evidence/CitationBadge';
import { EscalationCard } from '../escalation/EscalationCard';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  AlertTriangle, 
  ShieldAlert, 
  Send, 
  FileText, 
  Scale, 
  UserCheck, 
  Clock, 
  Check, 
  AlertOctagon, 
  X, 
  FileCheck2, 
  ArrowRight,
  Sparkles,
  Info,
  ChevronRight,
  ShieldCheck,
  Building2,
  ExternalLink
} from 'lucide-react';

interface ClaimRecommendationPanelProps {
  claim: ClaimRecord;
  onSelectCitation?: (citation: string, findingTitle?: string) => void;
  onUpdateEscalation?: (id: string, payload: any) => Promise<void> | void;
  onNavigate?: (page: any) => void;
  className?: string;
  allowDecisionOverride?: boolean;
}

export const ClaimRecommendationPanel: React.FC<ClaimRecommendationPanelProps> = ({
  claim,
  onSelectCitation,
  onUpdateEscalation,
  onNavigate,
  className = '',
  allowDecisionOverride = false,
}) => {
  // Local state for interactive decision preview/override if needed
  const [activeDecision, setActiveDecision] = useState<RecommendationDecision>(
    claim.recommendation.decision || 'REQUEST INFORMATION'
  );

  // Investigator Dispatch Modal state
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [assignedInvestigator, setAssignedInvestigator] = useState('Officer Marcus Vance (Senior SIU)');
  const [dispatchPriority, setDispatchPriority] = useState<'URGENT' | 'HIGH' | 'ROUTINE'>('HIGH');
  const [dispatchInstructions, setDispatchInstructions] = useState('');
  const [isSubmittingDispatch, setIsSubmittingDispatch] = useState(false);
  const [dispatchSuccessNotice, setDispatchSuccessNotice] = useState<{
    investigator: string;
    ticketId: string;
    timestamp: string;
  } | null>(null);

  // Calculate confidence tier
  const score = claim.recommendation.confidenceScore ?? 85;
  const confidenceTier: 'High' | 'Medium' | 'Low' = 
    score >= 80 ? 'High' : score >= 60 ? 'Medium' : 'Low';

  const confidenceBadgeColor = {
    High: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    Medium: 'bg-amber-100 text-amber-900 border-amber-300',
    Low: 'bg-rose-100 text-rose-900 border-rose-300',
  }[confidenceTier];

  // Derive relevant supporting citations
  const supportingCitations: { citation: string; label: string; excerpt?: string }[] = [];

  // Check claim form
  supportingCitations.push({
    citation: '[CLAIM_FORM: Page 2]',
    label: 'Claim Form Declaration',
    excerpt: `Loss reported: ${claim.claimForm.dateOfLoss} at ${claim.claimForm.placeOfLoss}. Driver: ${claim.claimForm.driverName}.`,
  });

  // Check FIR or Repair Estimate
  if (claim.repairEstimateOrFIR.documentType === 'fir') {
    supportingCitations.push({
      citation: '[FIR: Page 1]',
      label: 'Police FIR Record',
      excerpt: `FIR ${claim.repairEstimateOrFIR.policeFIRDetails?.firNumber || claim.repairEstimateOrFIR.documentRefNumber || 'FIR-OFFICIAL'} filed at ${claim.repairEstimateOrFIR.policeFIRDetails?.policeStation || claim.repairEstimateOrFIR.issuingAuthority}.`,
    });
  } else {
    const estAmount = claim.repairEstimateOrFIR.totalEstimateAmount ?? claim.repairEstimateOrFIR.totalEstimatedCost ?? claim.claimForm?.claimedAmount ?? 0;
    supportingCitations.push({
      citation: '[REPAIR_ESTIMATE: Page 3]',
      label: 'Surveyor Repair Estimate',
      excerpt: `Estimate Ref: ${claim.repairEstimateOrFIR.documentRefNumber || 'EST-OFFICIAL'}. Total: $${Number(estAmount || 0).toLocaleString()}.`,
    });
  }

  // Applicable policy citation
  const primaryClause = claim.recommendation.policyBasis?.[0]?.clauseId || 'POLICY-006';
  supportingCitations.push({
    citation: `[${primaryClause}]`,
    label: 'Synthetic Policy Clause',
    excerpt: claim.recommendation.policyBasis?.[0]?.relevantPolicyText || 'Statutory requirement for complete substantiating documents.',
  });

  // Narrative citation if present
  supportingCitations.push({
    citation: '[INCIDENT_DESCRIPTION: Paragraph 2]',
    label: 'Insured Incident Narrative',
    excerpt: `Stated: "${claim.customerStatement.narrativeText.slice(0, 110)}..."`,
  });

  // Collect policy clauses
  const policyClauses = (claim.recommendation.policyBasis && claim.recommendation.policyBasis.length > 0)
    ? claim.recommendation.policyBasis
    : claim.policyEvaluations.map(pe => ({
        clauseId: pe.clauseId,
        clauseTitle: pe.clauseTitle,
        relevantPolicyText: pe.relevantPolicyText || pe.reasoning,
        evidenceSupportingFinding: pe.evidenceSupportingFinding || pe.evidenceQuote,
        verdict: pe.status as any,
      }));

  // Missing items list
  const missingItems = claim.missingInformation.length > 0
    ? claim.missingInformation.map(m => ({
        title: m.fieldOrDocument,
        level: m.requirementLevel,
        rationale: m.rationale,
        action: m.resolutionAction,
      }))
    : activeDecision === 'REQUEST INFORMATION'
    ? [
        {
          title: 'Police FIR copy (Certified)',
          level: 'MANDATORY' as const,
          rationale: 'Required to reconcile incident timeline discrepancy.',
          action: 'Request Station House Officer certified FIR extract.',
        },
        {
          title: 'Police complaint reference & General Diary Entry',
          level: 'MANDATORY' as const,
          rationale: 'Substantiates loss timestamp before midnight.',
          action: 'Contact issuing authority for diary transcript.',
        }
      ]
    : [];

  // Handle open dispatch modal with prefilled data
  const handleOpenDispatchModal = () => {
    const defaultNotes = `DISPATCH BRIEFING FOR CLAIM #${claim.claimForm.claimNumber} (${claim.claimForm.vehicleRegistrationNumber}):\n` +
      `- Recommendation: ${activeDecision} (Confidence: ${confidenceTier} [${score}%])\n` +
      `- Reason: ${claim.recommendation.escalationReason || claim.recommendation.summaryRationale}\n` +
      (missingItems.length > 0 ? `- Missing Information: ${missingItems.map(m => m.title).join(', ')}\n` : '') +
      `- Directives: Reconcile evidence discrepancies, contact issuing authority, and verify driver statement.`;
    setDispatchInstructions(defaultNotes);
    setIsDispatchModalOpen(true);
  };

  // Submit dispatch action
  const handleConfirmDispatch = async () => {
    setIsSubmittingDispatch(true);
    const ticketId = `DISP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const timestamp = new Date().toLocaleTimeString();

    try {
      if (onUpdateEscalation) {
        await onUpdateEscalation(claim.id, {
          status: 'Under Field Investigation',
          investigatorNotes: claim.investigatorNotes
            ? `${claim.investigatorNotes}\n[${timestamp}] DISPATCHED to ${assignedInvestigator} (${dispatchPriority} Priority) [Ticket: ${ticketId}]:\n${dispatchInstructions}`
            : `[${timestamp}] DISPATCHED to ${assignedInvestigator} (${dispatchPriority} Priority) [Ticket: ${ticketId}]:\n${dispatchInstructions}`,
          actor: 'Claims Recommendation Engine',
          actionNote: `Dispatched claim to ${assignedInvestigator} (Ticket: ${ticketId})`,
        });
      }

      setDispatchSuccessNotice({
        investigator: assignedInvestigator,
        ticketId,
        timestamp,
      });
      setIsDispatchModalOpen(false);
    } catch (err) {
      console.error('Error dispatching to investigator:', err);
    } finally {
      setIsSubmittingDispatch(false);
    }
  };

  // Styling configurations for the 4 large recommendation statuses
  const decisionTheme = {
    APPROVE: {
      bg: 'bg-emerald-600',
      lightBg: 'bg-emerald-50',
      border: 'border-emerald-500',
      lightBorder: 'border-emerald-200',
      text: 'text-emerald-950',
      badgeText: 'text-emerald-700',
      icon: <CheckCircle2 className="w-8 h-8 text-white" />,
      subIcon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
      headline: 'Claim Eligible for Indemnity & Settlement',
      tagline: 'All documents corroborated. Damage scope strictly consistent with reported collision.',
    },
    REJECT: {
      bg: 'bg-rose-600',
      lightBg: 'bg-rose-50',
      border: 'border-rose-500',
      lightBorder: 'border-rose-200',
      text: 'text-rose-950',
      badgeText: 'text-rose-700',
      icon: <XCircle className="w-8 h-8 text-white" />,
      subIcon: <XCircle className="w-4 h-4 text-rose-600" />,
      headline: 'Claim Repudiation Recommended',
      tagline: 'Loss peril excluded or irreconcilable evidence contradiction identified under policy terms.',
    },
    'REQUEST INFORMATION': {
      bg: 'bg-amber-500',
      lightBg: 'bg-amber-50',
      border: 'border-amber-400',
      lightBorder: 'border-amber-200',
      text: 'text-amber-950',
      badgeText: 'text-amber-800',
      icon: <HelpCircle className="w-8 h-8 text-white" />,
      subIcon: <HelpCircle className="w-4 h-4 text-amber-600" />,
      headline: 'Additional Evidence Required',
      tagline: 'Repair estimate is present, but mandatory substantiating documents remain outstanding.',
    },
    ESCALATE: {
      bg: 'bg-purple-700',
      lightBg: 'bg-purple-50',
      border: 'border-purple-600',
      lightBorder: 'border-purple-200',
      text: 'text-purple-950',
      badgeText: 'text-purple-800',
      icon: <ShieldAlert className="w-8 h-8 text-white" />,
      subIcon: <ShieldAlert className="w-4 h-4 text-purple-600" />,
      headline: 'Senior SIU Escalation Required',
      tagline: 'High-severity conflict or potential fraud vector detected requiring senior forensic investigator sign-off.',
    },
  }[activeDecision] || {
    bg: 'bg-amber-500',
    lightBg: 'bg-amber-50',
    border: 'border-amber-400',
    lightBorder: 'border-amber-200',
    text: 'text-amber-950',
    badgeText: 'text-amber-800',
    icon: <HelpCircle className="w-8 h-8 text-white" />,
    subIcon: <HelpCircle className="w-4 h-4 text-amber-600" />,
    headline: 'Additional Evidence Required',
    tagline: 'Repair estimate is present, but mandatory substantiating documents remain outstanding.',
  };

  return (
    <div className={`bg-white rounded border border-slate-300 shadow-sm overflow-hidden ${className}`}>
      
      {/* ---------------------------------------------------- */}
      {/* TOP HEADER: CATEGORY LABEL */}
      {/* ---------------------------------------------------- */}
      <div className="bg-slate-900 text-white px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-mono font-bold tracking-widest text-slate-400 uppercase block">
            STATUTORY CLAIMS ADJUDICATION
          </span>
          <h2 className="text-base font-extrabold text-white tracking-wide flex items-center gap-2">
            <span>Professional Claim Recommendation</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-blue-300 border border-slate-700">
              Claim #{claim.claimForm.claimNumber}
            </span>
          </h2>
        </div>

        {/* Optional status preview selector if investigator wants to switch views */}
        {allowDecisionOverride && (
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded border border-slate-800 text-[10px]">
            <span className="text-slate-400 px-1 font-mono uppercase text-[9px]">Simulate:</span>
            {(['APPROVE', 'REJECT', 'REQUEST INFORMATION', 'ESCALATE'] as RecommendationDecision[]).map((d) => (
              <button
                key={d}
                onClick={() => setActiveDecision(d)}
                className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                  activeDecision === d
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {d === 'REQUEST INFORMATION' ? 'REQ INFO' : d}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* LARGE RECOMMENDATION STATUS DISPLAY */}
      {/* ---------------------------------------------------- */}
      <div className="p-5 bg-slate-50 border-b border-slate-200">
        <div className="text-[11px] font-mono font-black text-slate-500 tracking-wider uppercase mb-2">
          RECOMMENDATION
        </div>

        <div className={`p-5 rounded-lg border-2 shadow-xs transition-all ${decisionTheme.lightBg} ${decisionTheme.border}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Status Title with Giant Typography */}
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-lg ${decisionTheme.bg} flex items-center justify-center shrink-0 shadow-md`}>
                {decisionTheme.icon}
              </div>

              <div>
                <div className="text-xs font-mono font-bold tracking-widest text-slate-600 uppercase">
                  ADVISORY DETERMINATION
                </div>
                <h1 className={`text-2xl sm:text-3xl font-black uppercase tracking-tight ${decisionTheme.text}`}>
                  {activeDecision}
                </h1>
                <p className="text-xs text-slate-700 font-medium mt-0.5">
                  {decisionTheme.headline}
                </p>
              </div>
            </div>

            {/* Quick action: Send to Investigator button prominently right next to status */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <button
                onClick={handleOpenDispatchModal}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm hover:shadow transition-all cursor-pointer border border-slate-700"
              >
                <Send className="w-3.5 h-3.5 text-blue-400" />
                <span className="tracking-wide">Send to Investigator</span>
              </button>
            </div>

          </div>

          {/* Tagline note */}
          <div className="mt-3 pt-3 border-t border-slate-200/60 text-xs text-slate-600 flex items-center gap-2">
            <span className="font-semibold text-slate-900">Summary:</span>
            <span>{decisionTheme.tagline}</span>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* HUMAN ESCALATION CARD (ESCALATION REQUIRED)           */}
      {/* ---------------------------------------------------- */}
      {(activeDecision === 'ESCALATE' || claim.recommendation.requiresHumanEscalation || claim.contradictions.length > 0) && (
        <div className="p-5 pb-0">
          <EscalationCard
            claim={claim}
            onUpdateEscalation={onUpdateEscalation}
            onSelectCitation={onSelectCitation}
            onNavigate={onNavigate}
            showTriggersBreakdown={true}
          />
        </div>
      )}

      {/* Dispatch Success Alert if triggered */}
      {dispatchSuccessNotice && (
        <div className="mx-5 mt-4 p-3 rounded bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold">Successfully Dispatched to Investigator: </span>
              <span>{dispatchSuccessNotice.investigator} at {dispatchSuccessNotice.timestamp}. </span>
              <span className="font-mono text-[11px] font-bold text-emerald-800">
                (Docket Ref: {dispatchSuccessNotice.ticketId})
              </span>
            </div>
          </div>
          <button
            onClick={() => setDispatchSuccessNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-0.5 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* STRUCTURED SECTIONS ACCORDING TO SPECIFICATION */}
      {/* ---------------------------------------------------- */}
      <div className="p-5 space-y-6 text-xs">

        {/* 1. RECOMMENDATION SUMMARY (REASON) */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
            <FileText className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Recommendation Summary
            </h3>
          </div>

          <div className="p-3.5 rounded bg-slate-50 border border-slate-200 space-y-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Reason:
              </span>
              <p className="text-sm font-bold text-slate-900 mt-0.5 leading-snug">
                {activeDecision === 'REQUEST INFORMATION'
                  ? 'Repair estimate is present, but the required FIR information is missing or timeline is conflicting.'
                  : activeDecision === 'REJECT'
                  ? 'Excluded damage scope or uncorroborated pre-existing condition identified under policy exclusions.'
                  : activeDecision === 'APPROVE'
                  ? 'Repair estimate and claim declarations fully corroborate accidental impact mechanics with no exclusions violated.'
                  : 'Critical evidentiary contradiction identified between sworn statement and police log requiring senior SIU investigation.'}
              </p>
            </div>

            {claim.recommendation.summaryRationale && (
              <div className="pt-2 border-t border-slate-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Detailed Adjudication Analysis:
                </span>
                <p className="text-slate-700 leading-relaxed mt-1 text-xs">
                  {claim.recommendation.summaryRationale}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 2. EVIDENCE SUPPORTING RECOMMENDATION */}
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Evidence Supporting Recommendation
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              Click any citation to view dossier
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {supportingCitations.map((item, idx) => (
              <div 
                key={idx} 
                className="p-3 rounded border border-slate-200 bg-white hover:border-blue-300 transition-all flex flex-col justify-between space-y-2 shadow-2xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      {item.label}
                    </span>
                    <CitationBadge 
                      citation={item.citation} 
                      size="xs" 
                      onClick={onSelectCitation} 
                    />
                  </div>
                  {item.excerpt && (
                    <p className="text-[11px] text-slate-800 leading-relaxed font-sans">
                      {item.excerpt}
                    </p>
                  )}
                </div>

                <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 font-mono">{item.citation}</span>
                  {onSelectCitation && (
                    <button
                      onClick={() => onSelectCitation(item.citation, item.label)}
                      className="text-blue-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>Verify Extract</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. APPLICABLE POLICY CLAUSES */}
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Applicable Policy Clauses
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              Synthetic Policy Grounding
            </span>
          </div>

          <div className="space-y-2">
            {policyClauses.map((clause, idx) => {
              const isViolated = clause.verdict === 'VIOLATED';
              const isCompliant = clause.verdict === 'COMPLIANT';

              return (
                <div 
                  key={idx}
                  className={`p-3 rounded border transition-all ${
                    isViolated
                      ? 'bg-rose-50/40 border-rose-200'
                      : isCompliant
                      ? 'bg-emerald-50/30 border-emerald-200'
                      : 'bg-amber-50/30 border-amber-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-slate-200/60">
                    <div className="flex items-center gap-2">
                      <CitationBadge 
                        citation={`[${clause.clauseId}]`} 
                        size="xs" 
                        onClick={onSelectCitation} 
                      />
                      <span className="font-bold text-xs text-slate-900">
                        {clause.clauseId} — {clause.clauseTitle}
                      </span>
                    </div>

                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                      isViolated
                        ? 'bg-red-600 text-white'
                        : isCompliant
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-500 text-white'
                    }`}>
                      {clause.verdict || 'EVALUATED'}
                    </span>
                  </div>

                  <div className="pt-2 space-y-1.5">
                    <div className="text-[11px] font-serif italic text-slate-700 bg-white/70 p-2 rounded border border-slate-200/60">
                      "{clause.relevantPolicyText}"
                    </div>
                    {clause.evidenceSupportingFinding && (
                      <p className="text-[11px] text-slate-800">
                        <strong className="text-slate-900 font-semibold">Corroboration: </strong>
                        {clause.evidenceSupportingFinding}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. MISSING INFORMATION */}
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Missing Information
              </h3>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              missingItems.length > 0 
                ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}>
              {missingItems.length} Item{missingItems.length === 1 ? '' : 's'}
            </span>
          </div>

          {missingItems.length === 0 ? (
            <div className="p-3 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2 text-xs">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>All mandatory documentary evidence, FIR references, and repair invoices are submitted and verified.</span>
            </div>
          ) : (
            <div className="p-3.5 rounded bg-amber-50/50 border border-amber-200 space-y-2.5">
              <p className="text-[11px] font-semibold text-amber-950">
                The following documents or verification references must be obtained prior to claim adjudication:
              </p>
              <ul className="space-y-2">
                {missingItems.map((item, idx) => (
                  <li key={idx} className="p-2.5 rounded bg-white border border-amber-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        {item.title}
                      </span>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">
                        {item.level}
                      </span>
                    </div>
                    {item.rationale && (
                      <p className="text-[11px] text-slate-600 leading-snug">
                        {item.rationale}
                      </p>
                    )}
                    {item.action && (
                      <div className="text-[10px] font-medium text-blue-800 pt-1 border-t border-slate-100">
                        <strong>Required Action:</strong> {item.action}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 5. CONTRADICTIONS */}
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-red-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Contradictions (Cross-Document Conflicts)
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              Forensic Integrity: Unmerged
            </span>
          </div>

          {claim.contradictions.length === 0 ? (
            <div className="p-3 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Zero contradictions detected across the 3 document sources. Physical mechanics, driver declarations, and repair estimates align.</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {claim.contradictions.map((c, cIdx) => (
                <div key={cIdx} className="p-3 rounded bg-white border-2 border-red-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-red-100">
                    <span className="font-bold text-slate-900 text-xs">{c.title}</span>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-red-600 text-white">
                      CONTRADICTION
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-700 leading-snug">
                    {c.analysisRationale}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2 rounded bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-slate-500 uppercase">{c.sourceA}</span>
                        <CitationBadge citation={c.citationA || '[CLAIM_FORM: Page 2]'} size="xs" onClick={onSelectCitation} />
                      </div>
                      <span className="font-mono text-[11px] font-bold text-slate-800 block">
                        "{c.quoteA}"
                      </span>
                    </div>

                    <div className="p-2 rounded bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-slate-500 uppercase">{c.sourceB}</span>
                        <CitationBadge citation={c.citationB || '[FIR: Page 1]'} size="xs" onClick={onSelectCitation} />
                      </div>
                      <span className="font-mono text-[11px] font-bold text-slate-800 block">
                        "{c.quoteB}"
                      </span>
                    </div>
                  </div>

                  <div className="pt-1 text-[10px] text-red-900 flex items-center justify-between">
                    <span>Impact: <strong>{c.investigationImpact}</strong></span>
                    {onSelectCitation && (
                      <button
                        onClick={() => onSelectCitation(c.citationA || '[CLAIM_FORM: Page 2]', c.title)}
                        className="text-blue-700 font-bold hover:underline cursor-pointer"
                      >
                        Examine in Evidence Panel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 6. CONFIDENCE & 7. HUMAN REVIEW REQUIREMENT (SIDE-BY-SIDE CARDS) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          
          {/* CONFIDENCE CARD */}
          <div className="p-4 rounded border border-slate-200 bg-slate-50 space-y-2">
            <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase block">
              Confidence:
            </span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-black text-slate-900">
                {confidenceTier}
              </span>
              <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded border ${confidenceBadgeColor}`}>
                {score}% Score
              </span>
            </div>

            {/* Confidence Progress Meter */}
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  score >= 80 ? 'bg-emerald-600' : score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${score}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-600 leading-snug">
              Based on multi-document cross-referencing against {policyClauses.length} synthetic motor policy clauses.
            </p>
          </div>

          {/* HUMAN REVIEW REQUIREMENT CARD */}
          <div className="p-4 rounded border border-purple-200 bg-purple-50/60 space-y-2">
            <div className="flex items-center gap-1.5 text-purple-950 font-bold">
              <UserCheck className="w-4 h-4 text-purple-700" />
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase">
                Human Review:
              </span>
            </div>

            <div>
              <span className="text-sm font-black text-purple-950 block">
                Required before final decision.
              </span>
              <p className="text-[11px] text-purple-900/90 leading-snug mt-1">
                AI recommendations are strictly decision-support advisory. Statutory motor claims guidelines mandate human claims investigator sign-off prior to disbursement or repudiation.
              </p>
            </div>

            <div className="pt-2 border-t border-purple-200/80 flex items-center justify-between text-[10px] text-purple-900">
              <span className="font-semibold">Compliance Status: Mandated Sign-off</span>
              <span className="font-mono font-bold text-purple-800">HITL-Active</span>
            </div>
          </div>

        </div>

        {/* ---------------------------------------------------- */}
        {/* BOTTOM ACTION BAR WITH "SEND TO INVESTIGATOR" BUTTON */}
        {/* ---------------------------------------------------- */}
        <div className="p-4 rounded-lg bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-blue-600 flex items-center justify-center font-bold text-white shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-white">
                Human-in-the-Loop Adjudication Action
              </h4>
              <p className="text-[11px] text-slate-400">
                Dispatch this claim docket directly to the specialized investigator field desk.
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenDispatchModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-md transition-all cursor-pointer tracking-wider uppercase"
          >
            <Send className="w-4 h-4 text-white" />
            <span>Send to Investigator</span>
          </button>
        </div>

      </div>

      {/* ---------------------------------------------------- */}
      {/* INVESTIGATOR DISPATCH MODAL */}
      {/* ---------------------------------------------------- */}
      {isDispatchModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsDispatchModalOpen(false)}
        >
          <div 
            className="w-full max-w-xl bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold">
                  <Send className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white tracking-wide">
                    Dispatch Claim to Specialized Investigator
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Docket #{claim.claimForm.claimNumber} • {claim.claimForm.vehicleRegistrationNumber}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsDispatchModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              
              {/* Target Investigator */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Select Assigned Investigator:
                </label>
                <select
                  value={assignedInvestigator}
                  onChange={(e) => setAssignedInvestigator(e.target.value)}
                  className="w-full p-2.5 rounded border border-slate-300 text-xs font-medium text-slate-800 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Officer Marcus Vance (Senior SIU)">Officer Marcus Vance (Senior SIU Investigator - Austin Patrol Liaison)</option>
                  <option value="Elena Rostova (Forensic Damage Surveyor)">Elena Rostova (Forensic Damage Surveyor - Mechanical Specialist)</option>
                  <option value="David Miller (Desk Audit Investigator)">David Miller (Desk Audit Investigator - Policy Compliance)</option>
                  <option value="Dr. Aris Thorne (Accident Reconstructionist)">Dr. Aris Thorne (Accident Reconstruction Specialist)</option>
                </select>
              </div>

              {/* Priority Selection */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Investigation Priority & SLA:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'URGENT', label: 'Urgent (24h SLA)', color: 'border-red-400 bg-red-50 text-red-900' },
                    { id: 'HIGH', label: 'High (48h SLA)', color: 'border-amber-400 bg-amber-50 text-amber-900' },
                    { id: 'ROUTINE', label: 'Routine (5 Days)', color: 'border-slate-300 bg-slate-50 text-slate-800' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setDispatchPriority(p.id as any)}
                      className={`p-2 rounded border text-center font-bold text-xs cursor-pointer transition-all ${
                        dispatchPriority === p.id 
                          ? `${p.color} ring-2 ring-blue-500 shadow-xs` 
                          : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pre-populated Briefing Notes */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Investigator Briefing & Directives:
                </label>
                <textarea
                  rows={5}
                  value={dispatchInstructions}
                  onChange={(e) => setDispatchInstructions(e.target.value)}
                  className="w-full p-2.5 rounded border border-slate-300 text-xs font-mono text-slate-800 resize-none outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[10px] text-slate-500 block">
                  Automatically incorporates the active recommendation, missing info checklist, and contradictory evidence.
                </span>
              </div>

              {/* Statutory Confirmation Warning */}
              <div className="p-3 rounded bg-blue-50 border border-blue-200 text-[11px] text-blue-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <span>
                  Dispatching logs this action into the immutable audit trail and transitions claim docket status to <strong>Under Field Investigation</strong>.
                </span>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsDispatchModalOpen(false)}
                disabled={isSubmittingDispatch}
                className="px-4 py-2 rounded border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDispatch}
                disabled={isSubmittingDispatch}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer shadow-sm disabled:bg-blue-300"
              >
                {isSubmittingDispatch ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Confirm & Dispatch to Investigator</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
