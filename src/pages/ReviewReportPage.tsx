import React, { useState } from 'react';
import { ClaimRecord } from '../types/claim';
import { RecommendationBadge, ClaimStatusBadge, SeverityBadge } from '../components/common/Badges';
import { CitationBadge } from '../components/evidence/CitationBadge';
import { ClaimOverviewMetrics } from '../components/report/ClaimOverviewMetrics';
import { DocumentCompletenessCard } from '../components/report/DocumentCompletenessCard';
import { ContradictionsReportCard } from '../components/report/ContradictionsReportCard';
import { PolicyFindingsReportCard } from '../components/report/PolicyFindingsReportCard';
import { EvidenceTraceTable } from '../components/report/EvidenceTraceTable';
import { ExportReportModal } from '../components/report/ExportReportModal';
import { 
  FileText, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle,
  FileQuestion,
  UserCheck,
  Send,
  Building2,
  Calendar,
  Clock,
  Car,
  ChevronRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface ReviewReportPageProps {
  claims: ClaimRecord[];
  activeClaimId?: string;
  onSelectClaim: (claimId: string) => void;
  onNavigate?: (tab: string) => void;
}

export const ReviewReportPage: React.FC<ReviewReportPageProps> = ({
  claims,
  activeClaimId,
  onSelectClaim,
  onNavigate,
}) => {
  // If activeClaimId is passed, use it, otherwise default to Claim 2 (the missing document case that exemplifies the prompt)
  const selectedClaim = claims.find(c => c.id === activeClaimId) || 
    claims.find(c => c.claimNumber === 'CLM-2026-1002') || 
    claims[0];

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [copiedQuick, setCopiedQuick] = useState(false);
  const [rfiSent, setRfiSent] = useState(false);

  // Quick copy summary
  const handleQuickCopy = () => {
    const text = `CLAIMGUARD AI REPORT: ${selectedClaim.claimNumber}
Vehicle: ${selectedClaim.claimForm.vehicleMakeModel} (${selectedClaim.claimForm.vehicleRegistrationNumber})
Recommendation: ${selectedClaim.recommendation.decision} (Confidence: ${selectedClaim.recommendation.confidenceScore}%)
Rationale: ${selectedClaim.recommendation.summaryRationale}`;
    navigator.clipboard.writeText(text);
    setCopiedQuick(true);
    setTimeout(() => setCopiedQuick(false), 2000);
  };

  // Determine human review necessity
  const isHumanReviewRequired = 
    selectedClaim.recommendation.requiresHumanEscalation || 
    selectedClaim.recommendation.decision === 'REQUEST INFORMATION' ||
    selectedClaim.recommendation.decision === 'ESCALATE' ||
    (selectedClaim.missingInformation && selectedClaim.missingInformation.length > 0) ||
    (selectedClaim.contradictions && selectedClaim.contradictions.length > 0);

  const humanReviewReason = 
    selectedClaim.recommendation.escalationReason ||
    (selectedClaim.missingInformation && selectedClaim.missingInformation.length > 0
      ? 'Mandatory manual outreach required to procure missing statutory Police First Information Report (FIR) under POLICY-008.'
      : selectedClaim.contradictions && selectedClaim.contradictions.length > 0
      ? 'Factual contradiction between sworn claim form and official police record requires human investigator adjudication.'
      : 'Standard secondary quality assurance audit.');

  return (
    <div className="space-y-4 pb-20 max-w-5xl mx-auto">
      {/* ========================================================================= */}
      {/* 1. TOP ACTION TOOLBAR (Hidden during printing)                           */}
      {/* ========================================================================= */}
      <div className="bg-white px-4 py-3 border border-slate-200 rounded-lg shadow-2xs flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-2xs">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              AI Claim Investigation Report
              <span className="text-[9.5px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-mono font-bold">
                SIU AUDIT SYNTHESIS
              </span>
            </h1>
            <p className="text-[10.5px] text-slate-500 font-medium">
              Multi-source evidentiary cross-examination & policy adjudication dossier
            </p>
          </div>
        </div>

        {/* Claim Selector & Export Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Claim Picker */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase hidden sm:inline">
              Select Claim:
            </span>
            <select
              value={selectedClaim.id}
              onChange={(e) => onSelectClaim(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-xs font-mono font-bold text-slate-800 outline-none hover:border-slate-400 focus:border-blue-600 transition-all cursor-pointer max-w-[260px] sm:max-w-xs truncate"
            >
              {claims.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.claimNumber} — {c.claimForm.vehicleMakeModel} ({c.recommendation.decision})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleQuickCopy}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            title="Quick copy summary"
          >
            {copiedQuick ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span className="hidden sm:inline">{copiedQuick ? 'Copied' : 'Copy'}</span>
          </button>

          {/* User Requested: "Export Review Report" button */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-black tracking-tight shadow-xs hover:shadow transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Review Report</span>
          </button>

          {onNavigate && (
            <button
              onClick={() => onNavigate('claim_review')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title="Return to interactive Claim Review dossier"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Evidence Workspace</span>
            </button>
          )}
        </div>
      </div>

      {/* Fast Scenario Switcher Chips (Hidden during printing) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-thin print:hidden">
        <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Demo Scenarios:</span>
        {claims.map(c => {
          const isSelected = c.id === selectedClaim.id;
          let label = c.claimNumber;
          if (c.claimNumber === 'CLM-2026-1002') label += ' (Missing FIR)';
          else if (c.claimNumber === 'CLM-2026-1003') label += ' (Contradiction)';
          else if (c.claimNumber === 'CLM-2026-1004') label += ' (Exclusion)';
          else if (c.claimNumber === 'CLM-2026-1005') label += ' (Insured Value)';
          else if (c.claimNumber === 'CLM-2026-1001') label += ' (Normal Accident)';
          else if (c.claimNumber === 'CLM-2026-1006') label += ' (Autonomous Unknown)';

          return (
            <button
              key={c.id}
              onClick={() => onSelectClaim(c.id)}
              className={`px-2 py-1 rounded-md text-[10.5px] font-mono font-bold shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* FORMAL REPORT CANVAS (Printable document layout)                         */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5 print:border-none print:shadow-none print:p-0">
        
        {/* Document Header & Case Dossier Title */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b-2 border-slate-900 pb-3.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-tight text-slate-900 font-mono">
                CLAIMGUARD <span className="text-blue-600">AI</span>
              </span>
              <span className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded font-mono font-bold uppercase">
                OFFICIAL REPORT
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Special Investigation Unit (SIU) Comprehensive Evidence Review & Statutory Policy Verification
            </p>
          </div>

          <div className="sm:text-right text-[11px] space-y-0.5">
            <div className="font-mono font-black text-sm text-slate-900">
              REPORT REF: CG-INV-{selectedClaim.claimNumber}
            </div>
            <div className="text-slate-500 font-mono text-[10.5px]">
              Case Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </div>
            <div className="text-slate-400 font-mono text-[9.5px]">
              Engine: ClaimGuard Hybrid Core v2.4 (IRDAI Audit Compliant)
            </div>
          </div>
        </div>

        {/* Regulatory Advisory Notice */}
        <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-300 text-amber-950 text-[11px] leading-relaxed space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-amber-900 uppercase text-[10.5px]">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
            STATUTORY ADVISORY DISCLAIMER
          </div>
          <p className="text-[10.5px] text-amber-900/90 leading-normal">
            This investigation brief is an AI-assisted evidentiary synthesis generated for licensed human insurance claims adjusters. 
            All citations, findings, and confidence ratings are strictly advisory. Final legally binding decisions remain the statutory 
            responsibility of the designated human claims adjudicator.
          </p>
        </div>

        {/* ===================================================================== */}
        {/* SECTION 1: CLAIM OVERVIEW                                            */}
        {/* ===================================================================== */}
        <section id="claim-overview" className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <span>CLAIM OVERVIEW</span>
            </h2>
            <span className="text-[10px] font-mono text-slate-400">
              CASE #{selectedClaim.claimNumber}
            </span>
          </div>

          {/* Primary Case Identifiers Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-200 space-y-0.5">
              <span className="text-slate-400 text-[9px] uppercase font-bold block">Policyholder</span>
              <span className="font-bold text-slate-900 text-xs block">{selectedClaim.claimForm.insuredName}</span>
              <span className="text-slate-500 font-mono text-[10px]">{selectedClaim.claimForm.contactNumber}</span>
            </div>

            <div className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-200 space-y-0.5">
              <span className="text-slate-400 text-[9px] uppercase font-bold block">Insured Vehicle</span>
              <span className="font-bold text-slate-900 text-xs block truncate">{selectedClaim.claimForm.vehicleMakeModel}</span>
              <span className="text-slate-500 font-mono text-[10px]">{selectedClaim.claimForm.vehicleRegistrationNumber}</span>
            </div>

            <div className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-200 space-y-0.5">
              <span className="text-slate-400 text-[9px] uppercase font-bold block">Policy Contract</span>
              <span className="font-bold text-slate-900 text-xs block truncate">{selectedClaim.claimForm.policyType}</span>
              <span className="text-slate-500 font-mono text-[10px]">{selectedClaim.claimForm.policyNumber}</span>
            </div>

            <div className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-200 space-y-0.5">
              <span className="text-slate-400 text-[9px] uppercase font-bold block">Date & Place of Loss</span>
              <span className="font-bold text-slate-900 text-xs block">{selectedClaim.claimForm.dateOfLoss}</span>
              <span className="text-slate-500 text-[10px] font-mono">{selectedClaim.claimForm.timeOfLoss} hrs</span>
            </div>
          </div>

          {/* User Requested: Evidence Completeness, Policy Match, Consistency, AI Confidence */}
          <ClaimOverviewMetrics claim={selectedClaim} />
        </section>

        {/* ===================================================================== */}
        {/* SECTION 2: EXECUTIVE SUMMARY                                          */}
        {/* ===================================================================== */}
        <section id="executive-summary" className="space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
              EXECUTIVE SUMMARY
            </h2>
            <RecommendationBadge decision={selectedClaim.recommendation.decision} size="sm" />
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <p className="text-slate-800 leading-relaxed font-medium">
              {selectedClaim.investigatorNotes || selectedClaim.claimForm.incidentSummary}
            </p>
            <div className="pt-1.5 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-600">
              <div>
                <span className="text-slate-400 text-[9px] font-bold uppercase block">Claimed Damage:</span>
                <span className="font-mono font-bold text-slate-900">
                  ${Number(selectedClaim.claimForm?.claimedAmount || 0).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[9px] font-bold uppercase block">Insured Declared Value (IDV):</span>
                <span className="font-mono font-bold text-slate-900">
                  ${Number(selectedClaim.claimForm?.insuredValue || 0).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[9px] font-bold uppercase block">Third-Party Involvement:</span>
                <span className="font-bold text-slate-900">
                  {selectedClaim.claimForm.thirdPartyInvolved ? 'Yes (Hit-and-Run / Other Party)' : 'No (Single-Vehicle)'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* SECTION 3: DOCUMENT COMPLETENESS                                      */}
        {/* ===================================================================== */}
        <section id="document-completeness">
          <DocumentCompletenessCard claim={selectedClaim} />
        </section>

        {/* ===================================================================== */}
        {/* SECTION 4: CONTRADICTIONS                                             */}
        {/* ===================================================================== */}
        <section id="contradictions">
          <ContradictionsReportCard claim={selectedClaim} onSelectClaim={onSelectClaim} />
        </section>

        {/* ===================================================================== */}
        {/* SECTION 5: POLICY FINDINGS                                            */}
        {/* ===================================================================== */}
        <section id="policy-findings">
          <PolicyFindingsReportCard claim={selectedClaim} />
        </section>

        {/* ===================================================================== */}
        {/* SECTION 6: MISSING INFORMATION                                        */}
        {/* ===================================================================== */}
        <section id="missing-information" className="space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <FileQuestion className="w-4 h-4 text-blue-600" />
              <span>MISSING INFORMATION</span>
            </h2>
            <span className="text-[10px] font-mono text-slate-400 font-semibold">
              INVESTIGATOR ACTION CHECKLIST
            </span>
          </div>

          {selectedClaim.missingInformation && selectedClaim.missingInformation.length > 0 ? (
            <div className="space-y-2.5">
              {selectedClaim.missingInformation.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg border border-amber-300 bg-amber-50/40 text-xs space-y-2"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-600 inline-block"></span>
                        <strong className="text-xs font-bold text-amber-950 uppercase">
                          Required: {m.item}
                        </strong>
                      </div>
                      <p className="text-[11px] text-amber-900 font-medium pl-3.5">
                        {m.issue}
                      </p>
                    </div>

                    <CitationBadge 
                      citation={m.evidence_reference || m.clause_id || '[POLICY-008]'} 
                      size="sm" 
                    />
                  </div>

                  <div className="bg-white/80 p-2.5 rounded border border-amber-200 text-[10.5px] space-y-1 text-slate-700">
                    <p>
                      <strong>What the investigator needs: </strong>
                      Obtain authenticated certified copy of the Police First Information Report (FIR) or California Highway Patrol / Local Police Collision Report from the policyholder within 14 calendar days.
                    </p>
                    <p className="text-slate-500 font-mono text-[10px]">
                      Mandated by POLICY-008 for third-party hit-and-run claims to substantiate loss authenticity and enable subrogation.
                    </p>
                  </div>

                  {/* Action Button */}
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[10.5px] text-amber-950 font-bold">
                      Protocol: Issue Formal Request for Information (RFI) Notice
                    </span>
                    <button
                      onClick={() => setRfiSent(true)}
                      disabled={rfiSent}
                      className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        rfiSent 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      {rfiSent ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>RFI Sent to Policyholder</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3 h-3" />
                          <span>Send RFI Notice</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                All required statutory and evidentiary documents are present in the dossier. No pending information requests.
              </span>
            </div>
          )}
        </section>

        {/* ===================================================================== */}
        {/* SECTION 7: RECOMMENDATION                                             */}
        {/* ===================================================================== */}
        <section id="recommendation" className="space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
              RECOMMENDATION
            </h2>
            <span className="text-[10px] font-mono text-slate-500">
              SYNTHESIZED STANCE
            </span>
          </div>

          <div className="p-4 rounded-xl border border-slate-300 bg-slate-50/80 space-y-3">
            {/* Prominent Recommendation Display */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                  AI Adjudication Stance:
                </span>
                <div className="flex items-center gap-2.5 mt-1">
                  <span className={`px-3 py-1 rounded-md text-sm font-black tracking-tight font-mono uppercase ${
                    selectedClaim.recommendation.decision === 'APPROVE'
                      ? 'bg-emerald-600 text-white'
                      : selectedClaim.recommendation.decision === 'REJECT'
                      ? 'bg-rose-600 text-white'
                      : selectedClaim.recommendation.decision === 'REQUEST INFORMATION'
                      ? 'bg-blue-600 text-white'
                      : 'bg-purple-600 text-white'
                  }`}>
                    {selectedClaim.recommendation.decision}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-700">
                    Confidence: {selectedClaim.recommendation.confidenceScore}%
                  </span>
                </div>
              </div>

              <div className="sm:text-right">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                  Suggested Settlement Assessment:
                </span>
                <span className="text-xl font-mono font-black text-slate-900">
                  ${Number(selectedClaim.recommendation?.suggestedSettlementEstimate || 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 font-mono block">
                  Compulsory Deductibles: ${Number(selectedClaim.recommendation?.deductionsCalculated || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Rationale Statement */}
            <div className="space-y-1">
              <h4 className="text-[10.5px] font-bold text-slate-900 uppercase">
                Adjudicator Rationale:
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                {selectedClaim.recommendation.summaryRationale}
              </p>
            </div>

            {/* Recommended Action Plan */}
            <div className="space-y-1 pt-1">
              <h4 className="text-[10.5px] font-bold text-slate-900 uppercase">
                Recommended Action Plan:
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 font-medium">
                {selectedClaim.recommendation.recommendedActionPlan.map((act, i) => (
                  <li key={i}>{act}</li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* SECTION 8: HUMAN REVIEW                                               */}
        {/* ===================================================================== */}
        <section id="human-review" className="space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-purple-600" />
              <span>HUMAN REVIEW</span>
            </h2>
            <span className="text-[10px] font-mono text-slate-400 font-semibold">
              STATUTORY SIGN-OFF REQUIREMENT
            </span>
          </div>

          <div className={`p-4 rounded-xl border space-y-3 ${
            isHumanReviewRequired 
              ? 'bg-purple-50/40 border-purple-200' 
              : 'bg-emerald-50/40 border-emerald-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-200/60 pb-2.5">
              <div>
                <span className="text-[10px] font-bold uppercase text-purple-900 tracking-wider block">
                  Human Review Required:
                </span>
                <span className={`text-sm font-mono font-black uppercase mt-0.5 inline-block ${
                  isHumanReviewRequired ? 'text-purple-900' : 'text-emerald-800'
                }`}>
                  {isHumanReviewRequired ? 'YES — HUMAN REVIEW MANDATORY' : 'NO — FAST-TRACK PASS-THROUGH ELIGIBLE'}
                </span>
              </div>

              <div className="sm:text-right text-xs">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Assigned Adjuster:</span>
                <span className="font-bold text-slate-900">{selectedClaim.assignedInvestigator || 'Sarah Jenkins (Claims Intake Specialist)'}</span>
              </div>
            </div>

            <div className="text-xs space-y-1.5 text-slate-700">
              <p>
                <strong>Justification / Trigger: </strong>
                {humanReviewReason}
              </p>
              <p className="text-[11px] text-slate-500">
                In compliance with IRDAI regulatory standards, automated algorithms cannot unilaterally deny or hold claims without licensed human investigator sign-off.
              </p>
            </div>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* SECTION 9: EVIDENCE TRACE                                             */}
        {/* ===================================================================== */}
        <section id="evidence-trace">
          <EvidenceTraceTable claim={selectedClaim} />
        </section>

        {/* ===================================================================== */}
        {/* SECTION 10: INVESTIGATOR SIGN-OFF FOOTER                              */}
        {/* ===================================================================== */}
        <div className="pt-4 border-t-2 border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
          <div>
            <span className="block text-[9.5px] uppercase font-bold text-slate-400">Assigned Investigator</span>
            <span className="font-bold text-slate-900 text-xs">{selectedClaim.assignedInvestigator || 'Sarah Jenkins'}</span>
            <span className="text-[10px] text-slate-500 block">Senior Claims Adjudication Desk</span>
          </div>

          <div>
            <span className="block text-[9.5px] uppercase font-bold text-slate-400">Review Status</span>
            <span className="font-bold text-slate-900 text-xs">{selectedClaim.status}</span>
            <span className="text-[10px] text-slate-500 block">IRDAI Audit Dossier Logged</span>
          </div>

          <div className="sm:text-right space-y-1">
            <span className="block text-[9.5px] uppercase font-bold text-slate-400">Claims Officer Signature</span>
            <div className="italic font-serif text-slate-800 text-sm border-b border-slate-300 pb-0.5 inline-block min-w-[160px] text-center">
              Sarah Jenkins
            </div>
            <span className="text-[9.5px] text-slate-400 block font-mono">Date: {new Date().toISOString().split('T')[0]}</span>
          </div>
        </div>

        {/* User Requested: Prominent "Export Review Report" button in canvas footer */}
        <div className="pt-2 flex items-center justify-between print:hidden">
          <span className="text-[11px] text-slate-500 font-medium">
            Ready to export this formal investigation report for litigation, audit, or insurer records?
          </span>
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Review Report</span>
          </button>
        </div>

      </div>

      {/* Export Report Modal */}
      <ExportReportModal
        claim={selectedClaim}
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
};
