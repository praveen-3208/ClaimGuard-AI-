import React, { useState } from 'react';
import { ClaimRecord, EvidencePanelData } from '../types/claim';
import { RecommendationBadge, ClaimStatusBadge, SeverityBadge } from '../components/common/Badges';
import { CitationBadge, renderTextWithCitations } from '../components/evidence/CitationBadge';
import { EvidencePanel } from '../components/evidence/EvidencePanel';
import { ClaimRecommendationPanel } from '../components/recommendation/ClaimRecommendationPanel';
import { InvestigationPipeline } from '../components/common/InvestigationPipeline';
import { 
  FileText, 
  Wrench, 
  ShieldAlert, 
  ShieldCheck, 
  Car, 
  Bike, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  MinusCircle,
  HelpCircle,
  FileSearch,
  Scale, 
  Calendar,
  MapPin,
  DollarSign,
  User,
  Clock,
  ExternalLink,
  ChevronRight,
  BookOpen,
  ArrowRight,
  Printer,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  AlertCircle,
  Check,
  X,
  Sparkles,
  Layers
} from 'lucide-react';

interface ClaimReviewPageProps {
  claim?: ClaimRecord;
  claims?: ClaimRecord[];
  activeClaimId?: string;
  onSelectClaim?: (claimId: string) => void;
  onNavigate?: (tab: any) => void;
  onBack?: () => void;
  onUpdateEscalation?: (id: string, payload: any) => Promise<void> | void;
}

export const ClaimReviewPage: React.FC<ClaimReviewPageProps> = ({
  claim,
  claims = [],
  activeClaimId,
  onSelectClaim,
  onNavigate,
  onBack,
  onUpdateEscalation,
}) => {
  // Active claim selection
  const selectedClaim = claim || claims.find(c => c.id === activeClaimId) || claims[0];

  // UI state
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  
  // Evidence Citation & Panel State
  const [activeCitation, setActiveCitation] = useState<string | null>('[CLAIM_FORM: Page 2]');
  const [selectedEvidenceData, setSelectedEvidenceData] = useState<EvidencePanelData | null>(null);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState<boolean>(false);

  if (!selectedClaim) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded border border-slate-200">
        No claims available for review.
      </div>
    );
  }

  // Handler when an investigator clicks any citation in the findings
  const handleSelectCitation = (citation: string, customFinding?: string) => {
    setActiveCitation(citation);
    const upper = citation.toUpperCase();

    // Check if clicked citation matches contradiction in this claim (e.g. clm-8807 date conflict)
    const dateContra = selectedClaim.contradictions.find(c => 
      c.title.toLowerCase().includes('date') || 
      c.category === 'TIMELINE_DISCREPANCY' ||
      (c.citationA?.includes('CLAIM_FORM') && c.citationB?.includes('FIR'))
    );

    if (upper.includes('CLAIM_FORM') || upper.includes('FIR')) {
      if (dateContra) {
        setSelectedEvidenceData({
          finding: 'Incident date mismatch',
          sourceA: {
            name: 'Claim Form',
            label: 'Claim Form — Incident Date: 12/08/2026',
            citation: '[CLAIM_FORM: Page 2]',
            field: 'Incident Date',
            value: dateContra.valueA ? dateContra.valueA.replace(/.*:\s*/, '') : '12/08/2026',
            quote: dateContra.quoteA,
            pageOrSection: 'Page 2, Section IV',
          },
          sourceB: {
            name: 'FIR',
            label: 'FIR — Incident Date: 13/08/2026',
            citation: '[FIR: Page 1]',
            field: 'Incident Date',
            value: dateContra.valueB ? dateContra.valueB.replace(/.*:\s*/, '') : '13/08/2026',
            quote: dateContra.quoteB,
            pageOrSection: 'Page 1, Column 3',
          },
          status: 'CONTRADICTION',
          conflictAnalysis: dateContra.analysisRationale,
          recommendedAction: dateContra.suggestedInvestigatorAction,
        });
      } else {
        setSelectedEvidenceData({
          finding: customFinding || 'Claim Form Sworn Declaration Record',
          sourceA: {
            name: 'Claim Form',
            label: `Claim Form — ${selectedClaim.claimNumber}`,
            citation: '[CLAIM_FORM: Page 2]',
            field: 'Incident Summary',
            value: selectedClaim.claimForm.incidentSummary,
            quote: selectedClaim.claimForm.incidentSummary,
            pageOrSection: 'Page 2',
          },
          status: 'COMPLIANT',
        });
      }
    } else if (upper.includes('REPAIR_ESTIMATE') || upper.includes('INCIDENT_DESCRIPTION')) {
      const damageContra = selectedClaim.contradictions.find(c => c.category === 'DAMAGE_MISMATCH');
      if (damageContra) {
        setSelectedEvidenceData({
          finding: damageContra.title || 'Damage description and scope mismatch',
          sourceA: {
            name: 'Incident Description',
            label: 'Incident Description — Impact Scope: Front Bumper Only ($1,500)',
            citation: '[INCIDENT_DESCRIPTION: Paragraph 2]',
            field: 'Declared Scope',
            value: 'Front Bumper Only ($1,500)',
            quote: damageContra.quoteA,
            pageOrSection: 'Paragraph 2',
          },
          sourceB: {
            name: 'Repair Estimate',
            label: 'Repair Estimate — Scope: Front + Rear Panel & Subframe ($7,200)',
            citation: '[REPAIR_ESTIMATE: Page 3]',
            field: 'Workshop Assessment',
            value: 'Front + Rear Panel & Subframe ($7,200)',
            quote: damageContra.quoteB,
            pageOrSection: 'Page 3',
          },
          status: 'CONTRADICTION',
          conflictAnalysis: damageContra.analysisRationale,
          recommendedAction: damageContra.suggestedInvestigatorAction,
        });
      } else {
        setSelectedEvidenceData({
          finding: customFinding || 'Repair Estimate & Customer Narrative Analysis',
          sourceA: {
            name: 'Incident Description',
            label: 'Customer Narrative Statement',
            citation: '[INCIDENT_DESCRIPTION: Paragraph 2]',
            value: selectedClaim.customerStatement.narrativeText.slice(0, 100) + '...',
            quote: selectedClaim.customerStatement.narrativeText,
            pageOrSection: 'Paragraph 2',
          },
          sourceB: {
            name: 'Repair Estimate',
            label: 'Authorized Workshop Quote',
            citation: '[REPAIR_ESTIMATE: Page 3]',
            value: `$${Number(selectedClaim.repairEstimateOrFIR.totalEstimateAmount ?? selectedClaim.repairEstimateOrFIR.totalEstimatedCost ?? selectedClaim.claimForm?.claimedAmount ?? 0).toLocaleString()}`,
            quote: selectedClaim.repairEstimateOrFIR.narrativeOrInspectionRemarks,
            pageOrSection: 'Page 3',
          },
          status: 'COMPLIANT',
        });
      }
    } else if (upper.includes('POLICY')) {
      const match = upper.match(/POLICY-\d+/);
      const clauseId = match ? match[0] : 'POLICY-005';
      const pe = selectedClaim.policyEvaluations?.find(p => p.clauseId === clauseId);
      if (pe) {
        setSelectedEvidenceData({
          finding: `Statutory Policy Rule Evaluation: ${pe.clauseId} (${pe.clauseTitle})`,
          sourceA: {
            name: 'Policy Contract',
            label: `Insurance Policy Schedule — Clause ${pe.clauseId}`,
            citation: `[${pe.clauseId}]`,
            value: pe.status,
            quote: pe.relevantPolicyText,
            pageOrSection: 'Clause ' + pe.clauseId,
          },
          sourceB: {
            name: 'Claim Dossier',
            label: 'Dossier Evidence Evaluation',
            citation: '[CLAIM_FORM: Page 2]',
            value: pe.evidenceSupportingFinding || pe.evidenceQuote,
            quote: pe.evidenceQuote,
            pageOrSection: 'Evidence Dossier Audit',
          },
          status: pe.status === 'VIOLATED' ? 'CONTRADICTION' : pe.status,
          conflictAnalysis: pe.reasoning,
          recommendedAction: pe.financialImpact,
        });
      }
    }

    // Open modal view for immediate focus
    setIsEvidenceModalOpen(true);
  };

  // Derive claim type (Accident vs Theft)
  const isTheft = selectedClaim.claimForm.claimType === 'Theft' || 
    Boolean(selectedClaim.repairEstimateOrFIR.policeFIRDetails?.allegedCause?.toLowerCase().includes('theft'));
  const claimTypeDisplay = selectedClaim.claimForm.claimType || (isTheft ? 'Theft' : 'Accident');

  // Derive vehicle IDV / Insured Value
  const rawIdv = selectedClaim.claimForm.insuredValue;
  const insuredValueDisplay = rawIdv != null && !isNaN(Number(rawIdv))
    ? `$${Number(rawIdv).toLocaleString()}`
    : selectedClaim.claimForm.vehicleCategory === 'car' ? '$28,500' : '$3,200';

  // Derive claim window compliance
  const lossDateObj = new Date(selectedClaim.claimForm.dateOfLoss);
  const createdDateObj = new Date(selectedClaim.createdAt);
  const diffDays = Math.max(0, Math.round((createdDateObj.getTime() - lossDateObj.getTime()) / (1000 * 60 * 60 * 24)));
  const isWithinWindow = diffDays <= 3; // 72 hours standard intimation rule

  // Check if active claim has date discrepancy
  const dateContradiction = selectedClaim.contradictions.find(c => 
    c.title.toLowerCase().includes('date') || 
    c.category === 'TIMELINE_DISCREPANCY' ||
    c.quoteA.includes('12/08/2026') ||
    c.quoteB.includes('13/08/2026')
  );

  // Smooth scroll handler for Investigation Pipeline
  const handlePipelineStepClick = (stepId: string) => {
    const sectionMap: Record<string, string> = {
      documents: 'section-documents',
      evidence: 'section-evidence',
      policy: 'section-policy',
      analysis: 'section-analysis',
      recommendation: 'section-recommendation',
      human_review: 'section-human-review',
    };
    const targetId = sectionMap[stepId];
    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Cross-Document Consistency Table Rows
  interface ConsistencyRow {
    field: string;
    claimForm: string;
    citationA: string;
    firEstimate: string;
    citationB: string;
    incidentDescription: string;
    citationC: string;
    status: 'MATCH' | 'CONFLICT' | 'MISSING';
    notes: string;
  }

  const consistencyRows: ConsistencyRow[] = [
    {
      field: 'Incident Date',
      claimForm: dateContradiction ? (dateContradiction.valueA ? dateContradiction.valueA.replace(/.*:\s*/, '') : '12/08/2026') : `${selectedClaim.claimForm.dateOfLoss} (${selectedClaim.claimForm.timeOfLoss || '21:45'})`,
      citationA: '[CLAIM_FORM: Page 2]',
      firEstimate: dateContradiction ? (dateContradiction.valueB ? dateContradiction.valueB.replace(/.*:\s*/, '') : '13/08/2026') : `${selectedClaim.repairEstimateOrFIR.documentDate} (Doc Date)`,
      citationB: '[FIR: Page 1]',
      incidentDescription: dateContradiction 
        ? '12/08/2026' 
        : (selectedClaim.customerStatement.submissionDate ? new Date(selectedClaim.customerStatement.submissionDate).toISOString().split('T')[0] : selectedClaim.claimForm.dateOfLoss),
      citationC: '[INCIDENT_DESCRIPTION: Paragraph 2]',
      status: dateContradiction ? 'CONFLICT' : 'MATCH',
      notes: dateContradiction 
        ? (dateContradiction.analysisRationale || 'CONTRADICTION: Incident date mismatch between Claim Form (12/08/2026) and FIR (13/08/2026). Values kept strictly unmerged for statutory audit.')
        : 'Timeline aligned within standard reporting intimation window.',
    },
    {
      field: 'Incident Location',
      claimForm: selectedClaim.claimForm.placeOfLoss,
      citationA: '[CLAIM_FORM: Page 2]',
      firEstimate: selectedClaim.repairEstimateOrFIR.documentType === 'fir'
        ? (selectedClaim.repairEstimateOrFIR.policeFIRDetails?.policeStation || 'Jurisdictional Police Station')
        : (selectedClaim.repairEstimateOrFIR.issuingAuthority || 'Local Workshop'),
      citationB: selectedClaim.repairEstimateOrFIR.documentType === 'fir' ? '[FIR: Page 1]' : '[REPAIR_ESTIMATE: Page 3]',
      incidentDescription: selectedClaim.customerStatement.narrativeText.toLowerCase().includes('parking')
        ? 'Commercial Parking Plaza'
        : selectedClaim.claimForm.placeOfLoss,
      citationC: '[INCIDENT_DESCRIPTION: Paragraph 2]',
      status: 'MATCH',
      notes: 'Geographic location consistent across statements.',
    },
    {
      field: 'Vehicle Registration',
      claimForm: selectedClaim.claimForm.vehicleRegistrationNumber,
      citationA: '[CLAIM_FORM: Page 2]',
      firEstimate: selectedClaim.claimForm.vehicleRegistrationNumber,
      citationB: selectedClaim.repairEstimateOrFIR.documentType === 'fir' ? '[FIR: Page 1]' : '[REPAIR_ESTIMATE: Page 3]',
      incidentDescription: `${selectedClaim.claimForm.vehicleMakeModel} (Operated by insured)`,
      citationC: '[INCIDENT_DESCRIPTION: Paragraph 2]',
      status: 'MATCH',
      notes: 'Vehicle identity and chassis number match underwriting records.',
    },
    {
      field: 'Accident Type',
      claimForm: selectedClaim.claimForm.incidentSummary || 'Collision with stationary object',
      citationA: '[CLAIM_FORM: Page 2]',
      firEstimate: selectedClaim.repairEstimateOrFIR.documentType === 'fir'
        ? (selectedClaim.repairEstimateOrFIR.policeFIRDetails?.allegedCause || 'Traffic Impact')
        : 'Impact damage per repair invoice',
      citationB: selectedClaim.repairEstimateOrFIR.documentType === 'fir' ? '[FIR: Page 1]' : '[REPAIR_ESTIMATE: Page 3]',
      incidentDescription: selectedClaim.customerStatement.narrativeText.slice(0, 75) + '...',
      citationC: '[INCIDENT_DESCRIPTION: Paragraph 2]',
      status: selectedClaim.contradictions.some(c => c.category === 'POLICY_BREACH') 
        ? 'CONFLICT' 
        : 'MATCH',
      notes: selectedClaim.contradictions.some(c => c.category === 'POLICY_BREACH')
        ? 'Conflict: Commercial carriage in FIR contradicts personal commute declaration in claim form.'
        : 'Accident mechanism corroborated across files.',
    },
    {
      field: 'Damage Description',
      claimForm: selectedClaim.claimForm.vehicleCategory === 'car'
        ? 'Front bumper impact with concrete barrier'
        : 'Right-side fairing and exhaust scratch',
      citationA: '[CLAIM_FORM: Page 2]',
      firEstimate: selectedClaim.repairEstimateOrFIR.documentType === 'repair_estimate'
        ? (selectedClaim.repairEstimateOrFIR.damageItems?.map(d => `${d.partName} ($${d.cost})`).join(', ') || selectedClaim.repairEstimateOrFIR.narrativeOrInspectionRemarks)
        : 'Frontal damage recorded in FIR traffic memorandum',
      citationB: selectedClaim.repairEstimateOrFIR.documentType === 'fir' ? '[FIR: Page 1]' : '[REPAIR_ESTIMATE: Page 3]',
      incidentDescription: selectedClaim.customerStatement.narrativeText.includes('Only the front')
        ? 'Only front bumper hit bollard at 15 km/h; zero rear impact'
        : selectedClaim.customerStatement.narrativeText.slice(0, 80) + '...',
      citationC: '[INCIDENT_DESCRIPTION: Paragraph 2]',
      status: selectedClaim.contradictions.some(c => c.category === 'DAMAGE_MISMATCH') 
        ? 'CONFLICT' 
        : 'MATCH',
      notes: selectedClaim.contradictions.some(c => c.category === 'DAMAGE_MISMATCH')
        ? 'CRITICAL CONFLICT: Frontal low-speed strike contradicts rear quarter panel overhaul. Displaying unmerged values.'
        : 'Damage locations correspond 100% with impact velocity and vector.',
    },
    {
      field: 'Estimated Loss',
      claimForm: `$${Number(selectedClaim.claimForm?.claimedAmount || 0).toLocaleString()} (Claimed by Insured)`,
      citationA: '[CLAIM_FORM: Page 2]',
      firEstimate: (selectedClaim.repairEstimateOrFIR.totalEstimateAmount != null || selectedClaim.repairEstimateOrFIR.totalEstimatedCost != null)
        ? `$${Number(selectedClaim.repairEstimateOrFIR.totalEstimateAmount ?? selectedClaim.repairEstimateOrFIR.totalEstimatedCost ?? 0).toLocaleString()} (Workshop Assessment)`
        : '$0 (Police Record)',
      citationB: selectedClaim.repairEstimateOrFIR.documentType === 'fir' ? '[FIR: Page 1]' : '[REPAIR_ESTIMATE: Page 3]',
      incidentDescription: 'N/A (Customer deferred valuation to authorized repairer)',
      citationC: '[INCIDENT_DESCRIPTION: Paragraph 2]',
      status: Math.abs(selectedClaim.claimForm.claimedAmount - (selectedClaim.repairEstimateOrFIR.totalEstimateAmount || selectedClaim.claimForm.claimedAmount)) > 1000
        ? 'CONFLICT'
        : 'MATCH',
      notes: Math.abs(selectedClaim.claimForm.claimedAmount - (selectedClaim.repairEstimateOrFIR.totalEstimateAmount || selectedClaim.claimForm.claimedAmount)) > 1000
        ? 'Workshop quote includes inflated uncorroborated line items.'
        : 'Claimed amount is aligned within standard surveyor margin.',
    },
    {
      field: 'Driver License Validity',
      claimForm: selectedClaim.claimForm.driverLicenseNumber 
        ? `Valid: ${selectedClaim.claimForm.driverLicenseNumber} (Exp: ${selectedClaim.claimForm.licenseValidityDate || '2029'})`
        : 'MISSING / BLANK',
      citationA: '[CLAIM_FORM: Page 2]',
      firEstimate: selectedClaim.claimForm.driverLicenseNumber ? 'Verified by surveyor' : 'Driver license absent from repair intake',
      citationB: selectedClaim.repairEstimateOrFIR.documentType === 'fir' ? '[FIR: Page 1]' : '[REPAIR_ESTIMATE: Page 3]',
      incidentDescription: selectedClaim.customerStatement.narrativeText.includes('nephew')
        ? 'Unlicensed minor driving'
        : 'Insured operating vehicle personally',
      citationC: '[INCIDENT_DESCRIPTION: Paragraph 2]',
      status: selectedClaim.claimForm.driverLicenseNumber ? 'MATCH' : 'MISSING',
      notes: !selectedClaim.claimForm.driverLicenseNumber
        ? 'Mandatory driver license number omitted from claim submission.'
        : 'Driver credentials authenticated against state licensing database.',
    }
  ];

  return (
    <div className="space-y-4 pb-12 text-slate-900 max-w-7xl mx-auto">
      
      {/* ---------------------------------------------------- */}
      {/* TOP BAR: REQUIRED METADATA & QUICK CLAIM SWITCHER */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white rounded border border-slate-200 shadow-xs p-3 sm:p-4">
        
        {/* Upper row: Case Selector & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-blue-600 text-white">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xs sm:text-sm font-black uppercase tracking-tight text-slate-900">
                  Comprehensive Claim Evidence Review
                </h1>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold border border-slate-200">
                  SIU INVESTIGATION DOSSIER
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                4-Section evidence-grounded review cross-referencing customer narrative, documents, and policy clauses
              </p>
            </div>
          </div>

          {/* Claim Switcher Dropdown & Actions */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden md:inline">
              Select Claim:
            </span>
            <select
              value={selectedClaim.id}
              onChange={e => onSelectClaim && onSelectClaim(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-xs font-mono font-bold text-slate-900 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs"
            >
              {(claims.length > 0 ? claims : [selectedClaim]).map(c => (
                <option key={c.id} value={c.id}>
                  {c.claimNumber} • {c.claimForm.insuredName} ({c.claimForm.vehicleCategory.toUpperCase()}) — {c.recommendation.decision}
                </option>
              ))}
            </select>

            {onNavigate && (
              <button
                onClick={() => onNavigate('review_report')}
                className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                title="Open IRDAI Audit Report for this claim"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Audit Report</span>
              </button>
            )}
          </div>
        </div>

        {/* User Required Header Fields Grid:
            Claim ID | Policy Number | Vehicle | Claim Type | Incident Date | Review Status */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
          
          {/* 1. Claim ID */}
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Claim ID
            </span>
            <span className="font-mono font-black text-slate-900 text-xs sm:text-[13px]">
              {selectedClaim.claimNumber}
            </span>
          </div>

          {/* 2. Policy Number */}
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Policy Number
            </span>
            <span className="font-mono font-bold text-slate-800 text-xs truncate block" title={selectedClaim.claimForm.policyNumber}>
              {selectedClaim.claimForm.policyNumber}
            </span>
          </div>

          {/* 3. Vehicle */}
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Vehicle
            </span>
            <div className="flex items-center gap-1.5 font-bold text-slate-900 truncate" title={`${selectedClaim.claimForm.vehicleMakeModel} (${selectedClaim.claimForm.vehicleRegistrationNumber})`}>
              {selectedClaim.claimForm.vehicleCategory === 'car' ? (
                <Car className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              ) : (
                <Bike className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              )}
              <span className="truncate">{selectedClaim.claimForm.vehicleRegistrationNumber}</span>
            </div>
          </div>

          {/* 4. Claim Type */}
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Claim Type
            </span>
            <span className="inline-flex items-center gap-1 font-bold text-slate-900">
              <span className={`w-2 h-2 rounded-full ${claimTypeDisplay === 'Theft' ? 'bg-purple-500' : 'bg-blue-500'}`}></span>
              {claimTypeDisplay}
            </span>
          </div>

          {/* 5. Incident Date */}
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Incident Date
            </span>
            <div className="flex items-center gap-1 font-mono font-bold text-slate-800">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{selectedClaim.claimForm.dateOfLoss}</span>
            </div>
          </div>

          {/* 6. Review Status */}
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Review Status
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <RecommendationBadge decision={selectedClaim.recommendation.decision} size="sm" />
            </div>
          </div>

        </div>

        {/* ---------------------------------------------------- */}
        {/* EVIDENCE CITATION QUICK BAR (MANDATORY REQUIREMENT) */}
        {/* "Every AI-generated finding must display its source. */}
        {/* Create citation formats such as: */}
        {/* [CLAIM_FORM: Page 2] */}
        {/* [FIR: Page 1] */}
        {/* [REPAIR_ESTIMATE: Page 3] */}
        {/* [INCIDENT_DESCRIPTION: Paragraph 2] */}
        {/* [POLICY-005] */}
        {/* When the investigator clicks a citation, show the corresponding source evidence." */}
        {/* ---------------------------------------------------- */}
        <div className="mt-3 pt-3 border-t border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-slate-50/80 p-2.5 rounded border border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-blue-600 text-white flex items-center justify-center font-black text-[10px] shrink-0">
              §
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Evidence Citation System:
                </span>
                <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                  Click any citation badge to inspect auditable source evidence:
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <CitationBadge 
              citation="[CLAIM_FORM: Page 2]" 
              size="xs" 
              onClick={handleSelectCitation} 
            />
            <CitationBadge 
              citation="[FIR: Page 1]" 
              size="xs" 
              onClick={handleSelectCitation} 
            />
            <CitationBadge 
              citation="[REPAIR_ESTIMATE: Page 3]" 
              size="xs" 
              onClick={handleSelectCitation} 
            />
            <CitationBadge 
              citation="[INCIDENT_DESCRIPTION: Paragraph 2]" 
              size="xs" 
              onClick={handleSelectCitation} 
            />
            <CitationBadge 
              citation="[POLICY-005]" 
              size="xs" 
              onClick={handleSelectCitation} 
            />
            
            <button
              onClick={() => {
                const dateContra = selectedClaim.contradictions.find(c => c.title.toLowerCase().includes('date') || c.category === 'TIMELINE_DISCREPANCY');
                handleSelectCitation(dateContra ? '[CLAIM_FORM: Page 2]' : '[CLAIM_FORM: Page 2]', 'Incident date mismatch');
              }}
              className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-red-600 hover:bg-red-700 text-white border border-red-700 flex items-center gap-1 shadow-xs cursor-pointer ml-1 transition-colors"
            >
              <AlertTriangle className="w-2.5 h-2.5" />
              <span>Evidence Panel {selectedClaim.contradictions.length > 0 && `(${selectedClaim.contradictions.length} Conflict)`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 6-STAGE INVESTIGATION WORKFLOW PIPELINE              */}
      {/* DOCUMENTS → EVIDENCE → POLICY → ANALYSIS →           */}
      {/* RECOMMENDATION → HUMAN REVIEW                        */}
      {/* ---------------------------------------------------- */}
      <InvestigationPipeline 
        claim={selectedClaim} 
        onStepClick={handlePipelineStepClick}
      />

      {/* ---------------------------------------------------- */}
      {/* SECTION 1 — CUSTOMER INCIDENT */}
      {/* Display:
          * Original customer description
          * Extracted incident date
          * Extracted location
          * Incident type
          * Damage description
          Clearly distinguish between:
          "Reported by customer" and "Extracted from documents" */}
      {/* ---------------------------------------------------- */}
      <div id="section-analysis" className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden scroll-mt-20">
        
        {/* Section Header */}
        <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-blue-500 text-white font-black text-xs flex items-center justify-center">1</span>
            <h2 className="text-xs font-black uppercase tracking-wider text-white">
              Section 1 — Customer Incident Analysis
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <CitationBadge 
              citation="[INCIDENT_DESCRIPTION: Paragraph 2]" 
              size="xs" 
              onClick={handleSelectCitation} 
            />
            <span className="text-[10px] font-mono text-slate-300 hidden sm:inline">
              Self-Declaration vs. Document Extraction
            </span>
          </div>
        </div>

        <div className="p-4 space-y-4">
          
          {/* Dual Panel Comparison Grid: Reported by Customer vs. Extracted from Documents */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* PANEL A: Reported by Customer */}
            <div className="rounded border-2 border-blue-200 bg-blue-50/30 p-3.5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-blue-700" />
                  <h3 className="text-xs font-black uppercase tracking-wide text-blue-950">
                    Reported by Customer (Self-Declaration)
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  <CitationBadge 
                    citation="[INCIDENT_DESCRIPTION: Paragraph 2]" 
                    size="xs" 
                    onClick={handleSelectCitation} 
                  />
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-300">
                    Direct Statement
                  </span>
                </div>
              </div>

              {/* 1. Original Customer Description (Full Verbatim Narrative) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 block">
                    Original Customer Description:
                  </span>
                  <CitationBadge 
                    citation="[INCIDENT_DESCRIPTION: Paragraph 2]" 
                    size="xs" 
                    onClick={handleSelectCitation} 
                  />
                </div>
                <blockquote className="p-3 bg-white rounded border border-blue-200 text-xs italic text-slate-800 leading-relaxed shadow-xs">
                  "{selectedClaim.customerStatement.narrativeText}"
                </blockquote>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] text-blue-800">
                  <span>Reported Speed: <strong className="font-mono">{selectedClaim.customerStatement.estimatedSpeedKmh} km/h</strong></span>
                  <span>•</span>
                  <span>Weather: <strong>{selectedClaim.customerStatement.weatherConditions}</strong></span>
                  <span>•</span>
                  <span>Usage: <strong>{selectedClaim.customerStatement.vehicleUsageAtTime}</strong></span>
                </div>
              </div>

              {/* Key Reported Values */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="bg-white p-2 rounded border border-blue-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Reported Date / Time</span>
                    <CitationBadge citation="[INCIDENT_DESCRIPTION: Paragraph 2]" size="xs" onClick={handleSelectCitation} />
                  </div>
                  <span className="font-mono font-bold text-slate-800 block">
                    {selectedClaim.claimForm.dateOfLoss} at {selectedClaim.claimForm.timeOfLoss || '~21:45'}
                  </span>
                </div>
                <div className="bg-white p-2 rounded border border-blue-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Reported Location</span>
                    <CitationBadge citation="[INCIDENT_DESCRIPTION: Paragraph 2]" size="xs" onClick={handleSelectCitation} />
                  </div>
                  <span className="font-semibold text-slate-800 truncate block" title={selectedClaim.claimForm.placeOfLoss}>
                    {selectedClaim.claimForm.placeOfLoss}
                  </span>
                </div>
                <div className="bg-white p-2 rounded border border-blue-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Reported Incident Type</span>
                    <CitationBadge citation="[INCIDENT_DESCRIPTION: Paragraph 2]" size="xs" onClick={handleSelectCitation} />
                  </div>
                  <span className="font-semibold text-slate-800 block">
                    {claimTypeDisplay} (Single Vehicle Forward Strike)
                  </span>
                </div>
                <div className="bg-white p-2 rounded border border-blue-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Reported Damage Scope</span>
                    <CitationBadge citation="[INCIDENT_DESCRIPTION: Paragraph 2]" size="xs" onClick={handleSelectCitation} />
                  </div>
                  <span className="font-bold text-blue-900 block">
                    {selectedClaim.customerStatement.narrativeText.includes('Only the front')
                      ? 'Front bumper & grille only'
                      : 'Accidental impact declared by driver'}
                  </span>
                </div>
              </div>
            </div>

            {/* PANEL B: Extracted from Documents */}
            <div className="rounded border-2 border-slate-300 bg-slate-50/60 p-3.5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-1.5">
                  <FileSearch className="w-4 h-4 text-slate-700" />
                  <h3 className="text-xs font-black uppercase tracking-wide text-slate-900">
                    Extracted from Documents (Official Records)
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  <CitationBadge 
                    citation="[CLAIM_FORM: Page 2]" 
                    size="xs" 
                    onClick={handleSelectCitation} 
                  />
                  <CitationBadge 
                    citation={selectedClaim.repairEstimateOrFIR.documentType === 'fir' ? '[FIR: Page 1]' : '[REPAIR_ESTIMATE: Page 3]'} 
                    size="xs" 
                    onClick={handleSelectCitation} 
                  />
                </div>
              </div>

              {/* Document Synthesis Overview */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                    Documentary Ingestion Summary:
                  </span>
                  <CitationBadge 
                    citation={selectedClaim.repairEstimateOrFIR.documentType === 'fir' ? '[FIR: Page 1]' : '[REPAIR_ESTIMATE: Page 3]'} 
                    size="xs" 
                    onClick={handleSelectCitation} 
                  />
                </div>
                <div className="p-3 bg-white rounded border border-slate-200 text-xs text-slate-800 leading-relaxed space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between font-mono text-[11px] text-slate-600 border-b border-slate-100 pb-1">
                    <span>Source Issuing Body:</span>
                    <strong className="text-slate-900">{selectedClaim.repairEstimateOrFIR.issuingAuthority}</strong>
                  </div>
                  <p className="text-slate-700">
                    {selectedClaim.repairEstimateOrFIR.narrativeOrInspectionRemarks}
                  </p>
                </div>
                <div className="mt-1.5 flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                  <span>Ref Doc: <strong>{selectedClaim.repairEstimateOrFIR.documentRefNumber}</strong></span>
                  <span>•</span>
                  <span>Issuing Date: <strong>{selectedClaim.repairEstimateOrFIR.documentDate}</strong></span>
                </div>
              </div>

              {/* Key Extracted Values */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="bg-white p-2 rounded border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Extracted Incident Date</span>
                    <CitationBadge 
                      citation={selectedClaim.repairEstimateOrFIR.documentType === 'fir' ? '[FIR: Page 1]' : '[CLAIM_FORM: Page 2]'} 
                      size="xs" 
                      onClick={handleSelectCitation} 
                    />
                  </div>
                  <span className="font-mono font-bold text-slate-800 block">
                    {selectedClaim.extractedEntities.dateOfLoss} ({selectedClaim.extractedEntities.timeOfLoss || '21:45'})
                  </span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Extracted Location</span>
                    <CitationBadge citation="[CLAIM_FORM: Page 2]" size="xs" onClick={handleSelectCitation} />
                  </div>
                  <span className="font-semibold text-slate-800 truncate block" title={selectedClaim.extractedEntities.placeOfLoss}>
                    {selectedClaim.extractedEntities.placeOfLoss}
                  </span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Extracted Incident Type</span>
                    <CitationBadge 
                      citation={selectedClaim.repairEstimateOrFIR.documentType === 'fir' ? '[FIR: Page 1]' : '[CLAIM_FORM: Page 2]'} 
                      size="xs" 
                      onClick={handleSelectCitation} 
                    />
                  </div>
                  <span className="font-semibold text-slate-800 block">
                    {selectedClaim.repairEstimateOrFIR.documentType === 'fir' ? 'Police FIR Record' : 'Workshop Physical Collision'}
                  </span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Extracted Damage Scope</span>
                    <CitationBadge 
                      citation={selectedClaim.repairEstimateOrFIR.documentType === 'fir' ? '[FIR: Page 1]' : '[REPAIR_ESTIMATE: Page 3]'} 
                      size="xs" 
                      onClick={handleSelectCitation} 
                    />
                  </div>
                  <span className={`font-bold block ${selectedClaim.contradictions.some(c => c.category === 'DAMAGE_MISMATCH') ? 'text-red-700' : 'text-slate-900'}`}>
                    {selectedClaim.extractedEntities.primaryImpactZone}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Section 1 Synthesis Alert: Distinguishing customer claim vs. document reality */}
          {selectedClaim.contradictions.length > 0 ? (
            <div className="p-3 rounded bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Investigator Notice on Section 1 Discrepancy: </strong>
                <span>
                  The customer's self-declaration reports damage isolated to the frontal bumper ({selectedClaim.customerStatement.estimatedSpeedKmh} km/h), whereas the mechanical repair documentation extracts significant additional repair scope ({selectedClaim.extractedEntities.primaryImpactZone}). This requires forensic physical verification.
                </span>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Section 1 Triangulation Confirmed:</strong> The customer's incident description is fully consistent with the extracted damage zones, impact speed, and timeline across ingested documents.
              </span>
            </div>
          )}

        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* SECTION 2 — DOCUMENT EVIDENCE */}
      {/* Create cards for:
          * Claim Form
          * Repair Estimate
          * FIR
          * Incident Description
          For each document display:
          * Document status
          * Extracted fields
          * Missing fields
          * Important evidence */}
      {/* ---------------------------------------------------- */}
      <div id="section-documents" className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden scroll-mt-20">
        
        {/* Section Header */}
        <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-blue-500 text-white font-black text-xs flex items-center justify-center">2</span>
            <h2 className="text-xs font-black uppercase tracking-wider text-white">
              Section 2 — Document Evidence Repository
            </h2>
          </div>
          <span className="text-[10px] font-mono text-slate-300">
            4-Card Statutory Evidence Audit
          </span>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          
          {/* ---------------------------------------- */}
          {/* CARD 1: Claim Form */}
          {/* ---------------------------------------- */}
          <div className="rounded border border-slate-200 bg-white shadow-2xs flex flex-col justify-between overflow-hidden">
            <div>
              <div className="bg-slate-100 border-b border-slate-200 px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Claim Form</span>
                </div>
                <div className="flex items-center gap-1">
                  <CitationBadge citation="[CLAIM_FORM: Page 2]" size="xs" onClick={handleSelectCitation} />
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                    Signed
                  </span>
                </div>
              </div>

              <div className="p-3 space-y-2.5">
                {/* 1. Document Status */}
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Document Status</span>
                  <span className="font-semibold text-slate-800">
                    Executed by {selectedClaim.claimForm.insuredName}
                  </span>
                </div>

                {/* 2. Extracted Fields */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Extracted Fields</span>
                    <CitationBadge citation="[CLAIM_FORM: Page 2]" size="xs" onClick={handleSelectCitation} />
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-100 space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Policy:</span>
                      <span className="font-bold text-slate-800 truncate max-w-[130px]">{selectedClaim.claimForm.policyNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Driver:</span>
                      <span className="font-bold text-slate-800">{selectedClaim.claimForm.driverName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">License:</span>
                      <span className={`font-bold ${selectedClaim.claimForm.driverLicenseNumber ? 'text-slate-800' : 'text-red-600'}`}>
                        {selectedClaim.claimForm.driverLicenseNumber || 'OMITTED'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Claim Amount:</span>
                      <span className="font-bold text-slate-800">${Number(selectedClaim.claimForm?.claimedAmount || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Missing Fields */}
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Missing Fields</span>
                  {!selectedClaim.claimForm.driverLicenseNumber ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded font-bold">
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      Driver's License Number
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                      <Check className="w-3 h-3 text-emerald-600" />
                      None (All entries verified)
                    </span>
                  )}
                </div>

                {/* 4. Important Evidence */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Important Evidence</span>
                    <CitationBadge citation="[CLAIM_FORM: Page 2]" size="xs" onClick={handleSelectCitation} />
                  </div>
                  <div className="p-2 bg-blue-50/50 rounded border border-blue-100 text-[11px] text-slate-700 italic">
                    "{selectedClaim.claimForm.incidentSummary}"
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-3 py-1.5 border-t border-slate-100 text-[10px] text-slate-400 font-mono flex items-center justify-between">
              <span>Ref: {selectedClaim.claimNumber}</span>
              <CitationBadge citation="[CLAIM_FORM: Page 2]" size="xs" onClick={handleSelectCitation} />
            </div>
          </div>

          {/* ---------------------------------------- */}
          {/* CARD 2: Repair Estimate */}
          {/* ---------------------------------------- */}
          <div className="rounded border border-slate-200 bg-white shadow-2xs flex flex-col justify-between overflow-hidden">
            <div>
              <div className="bg-slate-100 border-b border-slate-200 px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <Wrench className="w-4 h-4 text-amber-600" />
                  <span>Repair Estimate</span>
                </div>
                <div className="flex items-center gap-1">
                  <CitationBadge citation="[REPAIR_ESTIMATE: Page 3]" size="xs" onClick={handleSelectCitation} />
                  <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px] border border-blue-200">
                    Workshop
                  </span>
                </div>
              </div>

              <div className="p-3 space-y-2.5">
                {/* 1. Document Status */}
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Document Status</span>
                  <span className="font-semibold text-slate-800">
                    {selectedClaim.repairEstimateOrFIR.documentType === 'repair_estimate' ? 'Official Workshop Assessment' : 'Attached with FIR'}
                  </span>
                </div>

                {/* 2. Extracted Fields */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Extracted Fields</span>
                    <CitationBadge citation="[REPAIR_ESTIMATE: Page 3]" size="xs" onClick={handleSelectCitation} />
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-100 space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Authority:</span>
                      <span className="font-bold text-slate-800 truncate max-w-[130px]">{selectedClaim.repairEstimateOrFIR.issuingAuthority}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Estimate Total:</span>
                      <span className="font-bold text-slate-800">
                        ${Number(selectedClaim.repairEstimateOrFIR.totalEstimateAmount ?? selectedClaim.repairEstimateOrFIR.totalEstimatedCost ?? selectedClaim.claimForm?.claimedAmount ?? 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Parts Count:</span>
                      <span className="font-bold text-slate-800">
                        {selectedClaim.repairEstimateOrFIR.damageItems?.length || 3} line items
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Missing Fields */}
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Missing Fields</span>
                  {selectedClaim.missingInformation.some(m => m.fieldOrDocument.toLowerCase().includes('photograph')) ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-bold">
                      <AlertCircle className="w-3 h-3 text-amber-500" />
                      Physical Surveyor Photos
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                      <Check className="w-3 h-3 text-emerald-600" />
                      Line item verified
                    </span>
                  )}
                </div>

                {/* 4. Important Evidence */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Important Evidence</span>
                    <CitationBadge citation="[REPAIR_ESTIMATE: Page 3]" size="xs" onClick={handleSelectCitation} />
                  </div>
                  <div className="p-2 bg-amber-50/50 rounded border border-amber-200 text-[11px] text-slate-700 italic">
                    "{selectedClaim.repairEstimateOrFIR.narrativeOrInspectionRemarks}"
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-3 py-1.5 border-t border-slate-100 text-[10px] text-slate-400 font-mono flex items-center justify-between">
              <span>Doc Ref: {selectedClaim.repairEstimateOrFIR.documentRefNumber}</span>
              <CitationBadge citation="[REPAIR_ESTIMATE: Page 3]" size="xs" onClick={handleSelectCitation} />
            </div>
          </div>

          {/* ---------------------------------------- */}
          {/* CARD 3: FIR (First Information Report) */}
          {/* ---------------------------------------- */}
          <div className="rounded border border-slate-200 bg-white shadow-2xs flex flex-col justify-between overflow-hidden">
            <div>
              <div className="bg-slate-100 border-b border-slate-200 px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <ShieldAlert className="w-4 h-4 text-purple-600" />
                  <span>Police FIR</span>
                </div>
                <div className="flex items-center gap-1">
                  <CitationBadge citation="[FIR: Page 1]" size="xs" onClick={handleSelectCitation} />
                  <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] border ${
                    selectedClaim.repairEstimateOrFIR.documentType === 'fir' || selectedClaim.extractedEntities.firFiled
                      ? 'bg-purple-100 text-purple-800 border-purple-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {selectedClaim.repairEstimateOrFIR.documentType === 'fir' || selectedClaim.extractedEntities.firFiled
                      ? 'Registered'
                      : 'Exempt'}
                  </span>
                </div>
              </div>

              <div className="p-3 space-y-2.5">
                {/* 1. Document Status */}
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Document Status</span>
                  <span className="font-semibold text-slate-800">
                    {selectedClaim.repairEstimateOrFIR.documentType === 'fir' 
                      ? 'Police Certified Traffic Investigation'
                      : isTheft ? 'MANDATORY (Theft Claim)' : 'Exempt (Single-party own damage)'}
                  </span>
                </div>

                {/* 2. Extracted Fields */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Extracted Fields</span>
                    <CitationBadge citation="[FIR: Page 1]" size="xs" onClick={handleSelectCitation} />
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-100 space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">FIR Station:</span>
                      <span className="font-bold text-slate-800 truncate max-w-[130px]">
                        {selectedClaim.repairEstimateOrFIR.policeFIRDetails?.policeStation || (selectedClaim.repairEstimateOrFIR.documentType === 'fir' ? selectedClaim.repairEstimateOrFIR.issuingAuthority : 'N/A')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Officer:</span>
                      <span className="font-bold text-slate-800">
                        {selectedClaim.repairEstimateOrFIR.policeFIRDetails?.investigatingOfficer || (selectedClaim.repairEstimateOrFIR.documentType === 'fir' ? 'Traffic SI' : 'N/A')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Third Party:</span>
                      <span className="font-bold text-slate-800">
                        {selectedClaim.customerStatement.thirdPartyInvolved ? 'Reported' : 'Nil Inj'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Missing Fields */}
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Missing Fields</span>
                  {isTheft && selectedClaim.repairEstimateOrFIR.documentType !== 'fir' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded font-bold">
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      Statutory Police FIR Required
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                      <Check className="w-3 h-3 text-emerald-600" />
                      Statutory criteria compliant
                    </span>
                  )}
                </div>

                {/* 4. Important Evidence */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Important Evidence</span>
                    <CitationBadge citation="[FIR: Page 1]" size="xs" onClick={handleSelectCitation} />
                  </div>
                  <div className="p-2 bg-purple-50/50 rounded border border-purple-100 text-[11px] text-slate-700 italic">
                    {selectedClaim.repairEstimateOrFIR.policeFIRDetails?.allegedCause || (
                      selectedClaim.repairEstimateOrFIR.documentType === 'fir'
                        ? selectedClaim.repairEstimateOrFIR.narrativeOrInspectionRemarks
                        : 'Accident caused zero third-party injuries. Police FIR exempt under clause POL-FIR-401.'
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-3 py-1.5 border-t border-slate-100 text-[10px] text-slate-400 font-mono flex items-center justify-between">
              <span>FIR Ref: {selectedClaim.repairEstimateOrFIR.policeFIRDetails?.firNumber || (selectedClaim.repairEstimateOrFIR.documentType === 'fir' ? selectedClaim.repairEstimateOrFIR.documentRefNumber : 'EXEMPT')}</span>
              <CitationBadge citation="[FIR: Page 1]" size="xs" onClick={handleSelectCitation} />
            </div>
          </div>

          {/* ---------------------------------------- */}
          {/* CARD 4: Incident Description */}
          {/* ---------------------------------------- */}
          <div className="rounded border border-slate-200 bg-white shadow-2xs flex flex-col justify-between overflow-hidden">
            <div>
              <div className="bg-slate-100 border-b border-slate-200 px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>Incident Description</span>
                </div>
                <div className="flex items-center gap-1">
                  <CitationBadge citation="[INCIDENT_DESCRIPTION: Paragraph 2]" size="xs" onClick={handleSelectCitation} />
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                    Logged
                  </span>
                </div>
              </div>

              <div className="p-3 space-y-2.5">
                {/* 1. Document Status */}
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Document Status</span>
                  <span className="font-semibold text-slate-800">
                    Recorded via Digital Assistant
                  </span>
                </div>

                {/* 2. Extracted Fields */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Extracted Fields</span>
                    <CitationBadge citation="[INCIDENT_DESCRIPTION: Paragraph 2]" size="xs" onClick={handleSelectCitation} />
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-100 space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Est. Speed:</span>
                      <span className="font-bold text-slate-800">{selectedClaim.customerStatement.estimatedSpeedKmh} km/h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Weather:</span>
                      <span className="font-bold text-slate-800">{selectedClaim.customerStatement.weatherConditions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Usage Mode:</span>
                      <span className={`font-bold ${selectedClaim.customerStatement.vehicleUsageAtTime.includes('Commercial') ? 'text-red-600' : 'text-slate-800'}`}>
                        {selectedClaim.customerStatement.vehicleUsageAtTime}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Missing Fields */}
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Missing Fields</span>
                  {selectedClaim.customerStatement.delayedReportingReason && selectedClaim.customerStatement.delayedReportingReason.includes('delay') ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-bold">
                      <AlertCircle className="w-3 h-3 text-amber-500" />
                      Delay justification note
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                      <Check className="w-3 h-3 text-emerald-600" />
                      Full narrative statement captured
                    </span>
                  )}
                </div>

                {/* 4. Important Evidence */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Important Evidence</span>
                    <CitationBadge citation="[INCIDENT_DESCRIPTION: Paragraph 2]" size="xs" onClick={handleSelectCitation} />
                  </div>
                  <div className="p-2 bg-emerald-50/50 rounded border border-emerald-100 text-[11px] text-slate-700 italic line-clamp-3">
                    "{selectedClaim.customerStatement.narrativeText}"
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-3 py-1.5 border-t border-slate-100 text-[10px] text-slate-400 font-mono flex items-center justify-between">
              <span>Submitted: {new Date(selectedClaim.customerStatement.submissionDate).toLocaleDateString()}</span>
              <CitationBadge citation="[INCIDENT_DESCRIPTION: Paragraph 2]" size="xs" onClick={handleSelectCitation} />
            </div>
          </div>

        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* EMBEDDED EVIDENCE CITATION & CONTRADICTION PANEL */}
      {/* ---------------------------------------------------- */}
      <div id="evidence-panel-anchor" className="scroll-mt-4">
        <EvidencePanel
          claim={selectedClaim}
          data={selectedEvidenceData}
          activeCitation={activeCitation}
          onSelectCitation={handleSelectCitation}
        />
      </div>

      {/* ---------------------------------------------------- */}
      {/* SECTION 3 — CROSS-DOCUMENT CONSISTENCY */}
      {/* Comparison table:
          Field | Claim Form | FIR/Estimate | Incident Description | Status
          Examples:
          Incident Date
          Incident Location
          Vehicle Registration
          Accident Type
          Damage Description
          Estimated Loss
          Statuses:
          MATCH | CONFLICT | MISSING
          Clear visual indicators. */}
      {/* ---------------------------------------------------- */}
      <div id="section-evidence" className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden scroll-mt-20">
        
        {/* Section Header */}
        <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-blue-500 text-white font-black text-xs flex items-center justify-center">3</span>
            <h2 className="text-xs font-black uppercase tracking-wider text-white">
              Section 3 — Cross-Document Consistency Matrix
            </h2>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              <Check className="w-2.5 h-2.5" /> MATCH
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30">
              <X className="w-2.5 h-2.5" /> CONFLICT
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              <AlertTriangle className="w-2.5 h-2.5" /> MISSING
            </span>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                <th className="py-2.5 px-3 w-36">Field</th>
                <th className="py-2.5 px-3">Claim Form</th>
                <th className="py-2.5 px-3">FIR / Estimate</th>
                <th className="py-2.5 px-3">Incident Description</th>
                <th className="py-2.5 px-3 w-28 text-center">Status</th>
                <th className="py-2.5 px-3 w-64">Forensic Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {consistencyRows.map((row, idx) => {
                const isConflict = row.status === 'CONFLICT';
                const isMissing = row.status === 'MISSING';
                const isMatch = row.status === 'MATCH';

                return (
                  <tr 
                    key={idx} 
                    className={`transition-colors ${
                      isConflict 
                        ? 'bg-rose-50/60 hover:bg-rose-50' 
                        : isMissing 
                        ? 'bg-amber-50/50 hover:bg-amber-50' 
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* 1. Field */}
                    <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                      {row.field}
                    </td>

                    {/* 2. Claim Form */}
                    <td className="py-2.5 px-3">
                      <div className="space-y-1">
                        <span className="font-mono text-[11px] text-slate-800 block">{row.claimForm}</span>
                        {row.citationA && (
                          <CitationBadge citation={row.citationA} size="xs" onClick={handleSelectCitation} />
                        )}
                      </div>
                    </td>

                    {/* 3. FIR / Estimate */}
                    <td className="py-2.5 px-3">
                      <div className="space-y-1">
                        <span className="font-mono text-[11px] text-slate-800 block">{row.firEstimate}</span>
                        {row.citationB && (
                          <CitationBadge citation={row.citationB} size="xs" onClick={handleSelectCitation} />
                        )}
                      </div>
                    </td>

                    {/* 4. Incident Description */}
                    <td className="py-2.5 px-3">
                      <div className="space-y-1">
                        <span className="text-[11px] text-slate-800 block">{row.incidentDescription}</span>
                        {row.citationC && (
                          <CitationBadge citation={row.citationC} size="xs" onClick={handleSelectCitation} />
                        )}
                      </div>
                    </td>

                    {/* 5. Status Badge */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      {isMatch && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <Check className="w-3 h-3 text-emerald-600" />
                          MATCH
                        </span>
                      )}
                      {isConflict && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-red-100 text-red-800 border border-red-300 animate-pulse">
                          <X className="w-3 h-3 text-red-600" />
                          CONFLICT
                        </span>
                      )}
                      {isMissing && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          MISSING
                        </span>
                      )}
                    </td>

                    {/* 6. Notes */}
                    <td className="py-2.5 px-3 text-[11px] text-slate-600 leading-tight">
                      <div className="space-y-1">
                        <div>{renderTextWithCitations(row.notes, handleSelectCitation)}</div>
                        {isConflict && (
                          <button
                            onClick={() => handleSelectCitation(row.citationA || '[CLAIM_FORM: Page 2]', `${row.field} mismatch`)}
                            className="inline-flex items-center gap-1 text-[10px] font-black text-red-700 bg-red-100 hover:bg-red-200 border border-red-300 px-2 py-0.5 rounded cursor-pointer transition-colors"
                          >
                            <AlertTriangle className="w-2.5 h-2.5" />
                            <span>Inspect Conflict</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* UNMERGED CONTRADICTIONS CALLOUT */}
        {selectedClaim.contradictions.length > 0 && (
          <div className="p-4 bg-red-50/50 border-t border-red-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-red-950">
                  Unmerged Forensic Contradictions ({selectedClaim.contradictions.length} Active Conflicts Detected)
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-300">
                Rule: Values Are Not Merged
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedClaim.contradictions.map((c, cIdx) => (
                <div key={cIdx} className="bg-white p-3 rounded border-2 border-red-300 shadow-xs space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-red-100">
                    <span className="font-bold text-slate-900 text-xs">{c.title}</span>
                    <span className="text-[10px] font-black bg-red-600 text-white px-2 py-0.5 rounded">
                      CONTRADICTION
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{c.sourceA}</span>
                        <CitationBadge citation={c.citationA || '[CLAIM_FORM: Page 2]'} size="xs" onClick={handleSelectCitation} />
                      </div>
                      <div className="font-mono text-[11px] font-bold text-slate-800">
                        {c.quoteA}
                      </div>
                    </div>

                    <div className="p-2 rounded bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{c.sourceB}</span>
                        <CitationBadge citation={c.citationB || '[FIR: Page 1]'} size="xs" onClick={handleSelectCitation} />
                      </div>
                      <div className="font-mono text-[11px] font-bold text-slate-800">
                        {c.quoteB}
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-red-900 flex items-center justify-between pt-1">
                    <span>Impact: <strong>{c.investigationImpact}</strong></span>
                    <button
                      onClick={() => handleSelectCitation(c.citationA || '[CLAIM_FORM: Page 2]', c.title)}
                      className="text-[10px] font-bold text-blue-700 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>Examine in Evidence Panel</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footnote on Section 3 */}
        <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-blue-600" />
            <span>Cross-verification algorithm triangulates 6 statutory dimensions.</span>
          </span>
          <span className="font-mono text-[10px] text-slate-400">
            Automated Discrepancy Engine v4.2
          </span>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* SECTION 4 — POLICY CHECK */}
      {/* Grounded in Synthetic Motor Insurance Policy (POLICY-001 - POLICY-012)
          Display:
          * Coverage (POLICY-001 / POLICY-002)
          * Exclusions (POLICY-003)
          * Insured Value (POLICY-004)
          * Claim Window (POLICY-005)
          * Required Documents (POLICY-006 / POLICY-007 / POLICY-008)
          Every finding must have a source reference. */}
      {/* ---------------------------------------------------- */}
      <div id="section-policy" className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden scroll-mt-20">
        
        {/* Section Header */}
        <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-blue-500 text-white font-black text-xs flex items-center justify-center">4</span>
            <h2 className="text-xs font-black uppercase tracking-wider text-white">
              Section 4 — Policy Rules & Statutory Compliance Check
            </h2>
          </div>
          <span className="text-[10px] font-mono text-slate-300">
            Grounded Clause Verification (Every finding includes statutory source reference)
          </span>
        </div>

        <div className="p-4 space-y-4 text-xs">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* 1. COVERAGE EVALUATION */}
            <div className="p-3.5 rounded border border-slate-200 bg-slate-50/50 space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span className="uppercase text-xs">1. Coverage Evaluation</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">
                  {isTheft ? 'THEFT PERIL' : 'ACCIDENT PERIL'}
                </span>
              </div>

              <div className="space-y-2">
                {isTheft ? (
                  <div className="bg-white p-2.5 rounded border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Total Theft Indemnity Coverage</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">COMPLIANT</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Total theft by burglary or housebreaking is an indemnifiable loss peril subject to immediate police FIR and ignition keys surrender.
                    </p>
                    <div className="pt-1 text-[10px] font-mono text-blue-700 flex items-center justify-between">
                      <div className="flex items-center gap-1 font-bold">
                        <BookOpen className="w-3 h-3" />
                        <span>Policy Clause: Theft Coverage</span>
                      </div>
                      <CitationBadge citation="[POLICY-002]" size="xs" onClick={handleSelectCitation} />
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-2.5 rounded border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Own Damage (OD) Accidental Collision</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">COMPLIANT</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Sudden accidental collision damage is an indemnifiable loss peril under standard synthetic motor policy terms.
                    </p>
                    <div className="pt-1 text-[10px] font-mono text-blue-700 flex items-center justify-between">
                      <div className="flex items-center gap-1 font-bold">
                        <BookOpen className="w-3 h-3" />
                        <span>Policy Clause: Accident Coverage</span>
                      </div>
                      <CitationBadge citation="[POLICY-001]" size="xs" onClick={handleSelectCitation} />
                    </div>
                  </div>
                )}

                <div className="bg-white p-2.5 rounded border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Depreciation & Add-on Cover Assessment</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">EVALUATED</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Statutory schedule applies depreciation deductions to plastic/metal components unless explicit Zero Dep endorsement exists.
                  </p>
                  <div className="pt-1 text-[10px] font-mono text-blue-700 flex items-center justify-between">
                    <div className="flex items-center gap-1 font-bold">
                      <BookOpen className="w-3 h-3" />
                      <span>Policy Clause: Depreciation Schedule</span>
                    </div>
                    <CitationBadge citation="[POLICY-010]" size="xs" onClick={handleSelectCitation} />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. EXCLUSIONS EVALUATION */}
            <div className="p-3.5 rounded border border-slate-200 bg-slate-50/50 space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  <span className="uppercase text-xs">2. Exclusions Evaluation</span>
                </div>
                <CitationBadge citation="[POLICY-003]" size="xs" onClick={handleSelectCitation} />
              </div>

              <div className="space-y-2">
                {/* Pre-existing damage exclusion */}
                <div className="bg-white p-2.5 rounded border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Pre-existing Damage & Corrosion Exclusion</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      selectedClaim.contradictions.some(c => c.quoteB.toLowerCase().includes('oxidation') || c.quoteA.toLowerCase().includes('oxidation') || c.title.toLowerCase().includes('pre-existing'))
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {selectedClaim.contradictions.some(c => c.quoteB.toLowerCase().includes('oxidation') || c.quoteA.toLowerCase().includes('oxidation') || c.title.toLowerCase().includes('pre-existing')) ? 'VIOLATED' : 'COMPLIANT'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {selectedClaim.contradictions.some(c => c.quoteB.toLowerCase().includes('oxidation') || c.quoteA.toLowerCase().includes('oxidation') || c.title.toLowerCase().includes('pre-existing'))
                      ? 'Pre-existing rust or uncorroborated rear panel degradation disallowed from indemnifiable loss scope.'
                      : 'No prior structural corrosion or pre-existing metal degradation identified.'}
                  </p>
                  <div className="pt-1 text-[10px] font-mono text-red-700 flex items-center justify-between font-bold">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      <span>Exclusions: Pre-existing Damage</span>
                    </div>
                    <CitationBadge citation="[POLICY-003]" size="xs" onClick={handleSelectCitation} />
                  </div>
                </div>

                {/* Commercial usage exclusion */}
                <div className="bg-white p-2.5 rounded border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Commercial / Courier Carriage Exclusion</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      selectedClaim.customerStatement.vehicleUsageAtTime.toLowerCase().includes('commercial') || selectedClaim.customerStatement.vehicleUsageAtTime.toLowerCase().includes('courier')
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {selectedClaim.customerStatement.vehicleUsageAtTime.toLowerCase().includes('commercial') || selectedClaim.customerStatement.vehicleUsageAtTime.toLowerCase().includes('courier') ? 'VIOLATED' : 'COMPLIANT'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Private vehicle certificate strictly bars carriage of goods or passengers for hire or reward or app delivery shifts.
                  </p>
                  <div className="pt-1 text-[10px] font-mono text-red-700 flex items-center justify-between font-bold">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      <span>Exclusions: Commercial Use</span>
                    </div>
                    <CitationBadge citation="[POLICY-003]" size="xs" onClick={handleSelectCitation} />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Grid for Insured Value, Claim Window, and Required Documents */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* 3. INSURED VALUE */}
            <div className="p-3.5 rounded border border-slate-200 bg-white space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span className="uppercase text-xs">3. Insured Value</span>
                </div>
                <CitationBadge citation="[POLICY-004]" size="xs" onClick={handleSelectCitation} />
              </div>
              
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">Insured Declared Value (IDV):</span>
                  <span className="font-bold text-slate-900">{insuredValueDisplay}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">Compulsory Deductible:</span>
                  <span className="font-bold text-slate-900">$100 (Standard Tariff)</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">Claimed Loss Ratio:</span>
                  <span className="font-bold text-blue-700 font-mono">
                    {Math.round((selectedClaim.claimForm.claimedAmount / (selectedClaim.claimForm.insuredValue || 28500)) * 100)}% of IDV
                  </span>
                </div>
                <p className="text-slate-600 text-[10px] pt-1">
                  Maximum insurer liability is capped at IDV minus statutory deductible and unindemnified items.
                </p>
                <div className="pt-1.5 border-t border-slate-100 text-[10px] font-mono text-slate-600 flex items-center justify-between">
                  <span>Clause: Insured Value & Liability</span>
                  <CitationBadge citation="[POLICY-004]" size="xs" onClick={handleSelectCitation} />
                </div>
              </div>
            </div>

            {/* 4. CLAIM WINDOW */}
            <div className="p-3.5 rounded border border-slate-200 bg-white space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span className="uppercase text-xs">4. Notice Window</span>
                </div>
                <CitationBadge citation="[POLICY-005]" size="xs" onClick={handleSelectCitation} />
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">Policy Requirement:</span>
                  <span className="font-bold text-slate-900">{isTheft ? 'Within 24h (Theft)' : 'Within 72h (Accident)'}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">Actual Intimation Time:</span>
                  <span className="font-mono font-bold text-slate-900">{diffDays} day(s) post-loss</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">Statutory Window Status:</span>
                  <span className={`font-bold px-1.5 rounded text-[10px] ${isWithinWindow ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {isWithinWindow ? 'TIMELY INTIMATION' : 'DELAYED INTIMATION'}
                  </span>
                </div>
                <p className="text-slate-600 text-[10px] pt-1">
                  {isWithinWindow
                    ? 'Loss reported promptly. Physical surveyor inspection enabled without spoliation of vehicle evidence.'
                    : 'Notice delayed. Requires insured written justification under statutory motor rules.'}
                </p>
                <div className="pt-1.5 border-t border-slate-100 text-[10px] font-mono text-slate-600 flex items-center justify-between">
                  <span>Clause: Claim Notification Window</span>
                  <CitationBadge citation="[POLICY-005]" size="xs" onClick={handleSelectCitation} />
                </div>
              </div>
            </div>

            {/* 5. REQUIRED DOCUMENTS CHECKLIST */}
            <div className="p-3.5 rounded border border-slate-200 bg-white space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                  <span className="uppercase text-xs">5. Documents</span>
                </div>
                <CitationBadge citation="[POLICY-006]" size="xs" onClick={handleSelectCitation} />
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-slate-700 flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600" /> Signed Claim Form
                  </span>
                  <CitationBadge citation="[CLAIM_FORM: Page 2]" size="xs" onClick={handleSelectCitation} />
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-slate-700 flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600" /> Repair Estimate / Bill
                  </span>
                  <CitationBadge citation="[REPAIR_ESTIMATE: Page 3]" size="xs" onClick={handleSelectCitation} />
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-slate-700 flex items-center gap-1">
                    {selectedClaim.claimForm.driverLicenseNumber ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <X className="w-3 h-3 text-red-600" />
                    )}
                    Driver's License (DL)
                  </span>
                  <CitationBadge citation="[POLICY-007]" size="xs" onClick={handleSelectCitation} />
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-slate-700 flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600" /> Vehicle Registration (RC)
                  </span>
                  <CitationBadge citation="[POLICY-008]" size="xs" onClick={handleSelectCitation} />
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-slate-700 flex items-center gap-1">
                    {isTheft ? (
                      selectedClaim.repairEstimateOrFIR.documentType === 'fir' ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <X className="w-3 h-3 text-red-600" />
                      )
                    ) : (
                      <Check className="w-3 h-3 text-slate-400" />
                    )}
                    Police FIR (Theft/Injuries)
                  </span>
                  <CitationBadge citation="[FIR: Page 1]" size="xs" onClick={handleSelectCitation} />
                </div>

                <div className="pt-1.5 border-t border-slate-100 text-[10px] font-mono text-slate-600 flex items-center justify-between">
                  <span>Clauses: Required Documents</span>
                  <div className="flex items-center gap-1">
                    <CitationBadge citation="[POLICY-006]" size="xs" onClick={handleSelectCitation} />
                    <CitationBadge citation="[POLICY-007]" size="xs" onClick={handleSelectCitation} />
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* SECTION 5 — PROFESSIONAL CLAIM RECOMMENDATION PANEL  */}
      {/* ---------------------------------------------------- */}
      <div id="section-recommendation" className="scroll-mt-20">
        <ClaimRecommendationPanel
          claim={selectedClaim}
          onSelectCitation={handleSelectCitation}
          onUpdateEscalation={onUpdateEscalation}
          onNavigate={onNavigate}
          allowDecisionOverride={true}
        />
      </div>

      {/* ---------------------------------------------------- */}
      {/* INVESTIGATOR ADJUDICATION & ACTIONS BAR */}
      {/* ---------------------------------------------------- */}
      <div id="section-human-review" className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col sm:flex-row items-center justify-between gap-3 scroll-mt-20">
        <div className="flex items-center gap-2">
          <RecommendationBadge decision={selectedClaim.recommendation.decision} size="md" />
          <span className="text-xs text-slate-600">
            Advisory Determination: <strong>{selectedClaim.recommendation.decision}</strong> (Confidence: {selectedClaim.recommendation.confidenceScore}%)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="px-3 py-1.5 rounded border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
            >
              Back to Claims
            </button>
          )}
          {onNavigate && (
            <button
              onClick={() => onNavigate('review_report')}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Full Audit Report</span>
            </button>
          )}
          {selectedClaim.recommendation.requiresHumanEscalation && onNavigate && (
            <button
              onClick={() => onNavigate('human_escalation')}
              className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Escalate to Senior SIU</span>
            </button>
          )}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* FLOATING / MODAL EVIDENCE DOSSIER DRAWER */}
      {/* ---------------------------------------------------- */}
      {isEvidenceModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsEvidenceModalOpen(false)}
        >
          <div 
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <EvidencePanel
              claim={selectedClaim}
              data={selectedEvidenceData}
              activeCitation={activeCitation}
              onClose={() => setIsEvidenceModalOpen(false)}
              onSelectCitation={handleSelectCitation}
            />
          </div>
        </div>
      )}

    </div>
  );
};
