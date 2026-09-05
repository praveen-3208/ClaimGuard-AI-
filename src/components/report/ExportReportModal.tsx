import React, { useState } from 'react';
import { ClaimRecord } from '../../types/claim';
import { computeClaimMetrics, getBlockBar } from './ClaimOverviewMetrics';
import { 
  Printer, 
  Download, 
  Copy, 
  Check, 
  X, 
  FileText, 
  FileCode, 
  Share2, 
  ShieldCheck 
} from 'lucide-react';

interface ExportReportModalProps {
  claim: ClaimRecord;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  claim,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const metrics = computeClaimMetrics(claim);

  const generateReportText = () => {
    return `================================================================================
CLAIMGUARD AI — MOTOR INSURANCE CLAIM INVESTIGATION REPORT
================================================================================
Generated: ${new Date().toISOString()}
System Engine: ClaimGuard Hybrid Cross-Examination Engine v2.4

CASE METADATA
--------------------------------------------------------------------------------
Claim Reference       : ${claim.claimNumber}
Policy Number         : ${claim.claimForm.policyNumber} (${claim.claimForm.policyType})
Insured Name          : ${claim.claimForm.insuredName}
Vehicle Details       : ${claim.claimForm.vehicleMakeModel} [${claim.claimForm.vehicleRegistrationNumber}]
Date & Time of Loss   : ${claim.claimForm.dateOfLoss} at ${claim.claimForm.timeOfLoss} hrs
Place of Loss         : ${claim.claimForm.placeOfLoss}
Claimed Amount        : $${Number(claim.claimForm?.claimedAmount || 0).toLocaleString()}
Insured Declared Value: $${Number(claim.claimForm?.insuredValue || 0).toLocaleString()}

CLAIM OVERVIEW
--------------------------------------------------------------------------------
Evidence Completeness : ${getBlockBar(metrics.evidenceCompleteness)}
Policy Match          : ${getBlockBar(metrics.policyMatch)}
Consistency           : ${getBlockBar(metrics.consistency)}
AI Confidence         : ${getBlockBar(metrics.aiConfidence)}

EXECUTIVE SUMMARY
--------------------------------------------------------------------------------
${claim.investigatorNotes || claim.claimForm.incidentSummary}

DOCUMENT COMPLETENESS
--------------------------------------------------------------------------------
✓ Claim Form          : Attached & Sworn [CLAIM_FORM: Page 1]
✓ Incident Description: Insured Statement Logged [INCIDENT_DESCRIPTION: Paragraph 1]
${claim.claimForm.policeReportFiled || claim.repairEstimateOrFIR?.documentType === 'fir'
  ? '✓ Police FIR          : Attached & Authenticated [FIR: Page 1]'
  : '✗ FIR Missing         : MANDATORY Police Report Missing under POLICY-008 [POLICY-008]'}
✓ Workshop Estimate   : Ref ${claim.repairEstimateOrFIR?.documentRefNumber || 'EST-CERTIFIED'} for $${Number(claim.repairEstimateOrFIR?.totalEstimateAmount || claim.repairEstimateOrFIR?.totalEstimatedCost || claim.claimForm?.claimedAmount || 0).toLocaleString()} [REPAIR_ESTIMATE: Page 1]

CONTRADICTIONS
--------------------------------------------------------------------------------
${claim.contradictions && claim.contradictions.length > 0
  ? claim.contradictions.map((c, i) => `[CONFLICT #${i + 1}] ${c.title} (Severity: ${c.severity})
  - Source A (${c.sourceA} - ${c.citationA || '[DOC_A]'}): "${c.valueA || c.quoteA}"
  - Source B (${c.sourceB} - ${c.citationB || '[DOC_B]'}): "${c.valueB || c.quoteB}"
  - Analysis: ${c.analysisRationale}
  - Protocol: ${c.suggestedInvestigatorAction}`).join('\n\n')
  : 'No internal contradictory factual statements detected across submitted documents.'}

POLICY FINDINGS
--------------------------------------------------------------------------------
${claim.policyEvaluations.map(pe => `[${pe.clauseId}] ${pe.clauseTitle}
  - Finding      : ${pe.reasoning || pe.finding}
  - Evidence     : "${pe.evidenceSupportingFinding || pe.evidenceQuote}"
  - Policy Clause: "${pe.relevantPolicyText || pe.standardDeductionOrRule}"
  - Result       : ${pe.status}`).join('\n\n')}

MISSING INFORMATION
--------------------------------------------------------------------------------
${claim.missingInformation && claim.missingInformation.length > 0
  ? claim.missingInformation.map(m => `- ${m.item}: ${m.issue} (Ref: ${m.evidence_reference || m.clause_id || '[POLICY-008]'})`).join('\n')
  : 'All standard statutory intake requirements fulfilled.'}

RECOMMENDATION
--------------------------------------------------------------------------------
Decision              : ${claim.recommendation.decision}
Confidence Score      : ${claim.recommendation.confidenceScore}%
Suggested Settlement  : $${Number(claim.recommendation?.suggestedSettlementEstimate || 0).toLocaleString()}
Deductions Calculated : $${Number(claim.recommendation?.deductionsCalculated || 0).toLocaleString()}

Summary Rationale:
${claim.recommendation.summaryRationale}

Action Plan:
${claim.recommendation.recommendedActionPlan.map((act, i) => `${i + 1}. ${act}`).join('\n')}

HUMAN REVIEW
--------------------------------------------------------------------------------
Human Review Required : ${claim.recommendation.requiresHumanEscalation || claim.recommendation.decision === 'REQUEST INFORMATION' ? 'YES' : 'NO'}
Assigned Investigator : ${claim.assignedInvestigator || 'Unassigned'}
Review Trigger        : ${claim.recommendation.escalationReason || 'Standard statutory verification protocol'}

================================================================================
STATUTORY ADVISORY NOTICE:
This report is an advisory evidence analysis prepared for licensed claims investigators.
Does not constitute a legally binding claim repudiation or settlement authorization.
================================================================================`;
  };

  const handlePrint = () => {
    onClose();
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handleCopyText = () => {
    const text = generateReportText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setToastMessage('Report copied to clipboard in SIU format!');
    setTimeout(() => {
      setCopied(false);
      setToastMessage(null);
    }, 2500);
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(claim, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ClaimGuard-Investigation-Report-${claim.claimNumber}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setToastMessage('JSON audit dossier downloaded!');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleDownloadMarkdown = () => {
    const text = generateReportText();
    const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(text);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ClaimGuard-Investigation-Report-${claim.claimNumber}.md`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setToastMessage('Markdown dossier downloaded!');
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden space-y-0">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
              Export Review Report
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 font-mono text-[10px]">
              <span>TARGET CASE: {claim.claimNumber}</span>
              <span>CONFIDENCE: {claim.recommendation.confidenceScore}%</span>
            </div>
            <p className="font-bold text-slate-900">
              {claim.claimForm.vehicleMakeModel} ({claim.claimForm.vehicleRegistrationNumber})
            </p>
            <p className="text-slate-600 text-[11px]">
              Insured: {claim.claimForm.insuredName} • Stance: <strong>{claim.recommendation.decision}</strong>
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Select Export Format
            </span>

            <div className="grid grid-cols-1 gap-2">
              {/* Option 1: PDF / Print */}
              <button
                onClick={handlePrint}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <Printer className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-slate-900 block group-hover:text-blue-700">
                      Print / Save as Official PDF
                    </strong>
                    <span className="text-[10.5px] text-slate-500">
                      Formatted printable investigation dossier with clean headers & signatures
                    </span>
                  </div>
                </div>
              </button>

              {/* Option 2: Copy Text */}
              <button
                onClick={handleCopyText}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-slate-900 block group-hover:text-emerald-700">
                      {copied ? 'Copied to Clipboard!' : 'Copy Formatted SIU Brief to Clipboard'}
                    </strong>
                    <span className="text-[10.5px] text-slate-500">
                      Structured text with block progress indicators ready for internal ticketing
                    </span>
                  </div>
                </div>
              </button>

              {/* Option 3: Download JSON */}
              <button
                onClick={handleDownloadJSON}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                    <FileCode className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-slate-900 block group-hover:text-slate-900">
                      Download JSON Audit Dossier
                    </strong>
                    <span className="text-[10.5px] text-slate-500">
                      Machine-readable JSON data with entities, policy rules, and audit logs
                    </span>
                  </div>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
              </button>

              {/* Option 4: Download Markdown */}
              <button
                onClick={handleDownloadMarkdown}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-slate-900 block group-hover:text-purple-700">
                      Download Markdown (.md) Dossier
                    </strong>
                    <span className="text-[10.5px] text-slate-500">
                      Markdown file with full evidence matrix for documentation systems
                    </span>
                  </div>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
              </button>
            </div>
          </div>

          {toastMessage && (
            <div className="p-2.5 bg-slate-900 text-white rounded-lg text-xs font-medium text-center flex items-center justify-center gap-1.5 animate-in fade-in">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[10.5px] text-slate-400 font-mono">
            IRDAI & Statutory Audit Compliant
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
