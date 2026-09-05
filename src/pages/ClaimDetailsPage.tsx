import React, { useState } from 'react';
import { ClaimRecord } from '../types/claim';
import { RecommendationBadge, SeverityBadge, ClaimStatusBadge } from '../components/common/Badges';
import { 
  Car, 
  Bike, 
  FileText, 
  Wrench, 
  User, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Scale, 
  FileCheck, 
  Clock, 
  Send,
  Printer,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  Calendar,
  MapPin,
  FileSearch
} from 'lucide-react';

import { ClaimReviewPage } from './ClaimReviewPage';

interface ClaimDetailsPageProps {
  claim: ClaimRecord;
  onBack: () => void;
  onNavigate: (page: any) => void;
  onUpdateEscalation: (id: string, payload: any) => Promise<void>;
}

export const ClaimDetailsPage: React.FC<ClaimDetailsPageProps> = ({
  claim,
  onBack,
  onNavigate,
  onUpdateEscalation,
}) => {
  const [viewMode, setViewMode] = useState<'review_dossier' | 'adjudication_desk'>('review_dossier');
  const [activeDocTab, setActiveDocTab] = useState<'claim_form' | 'repair_fir' | 'customer_narrative'>('claim_form');
  const [investigatorNote, setInvestigatorNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleSaveNote = async () => {
    if (!investigatorNote.trim()) return;
    setIsSaving(true);
    try {
      await onUpdateEscalation(claim.id, {
        investigatorNotes: claim.investigatorNotes 
          ? `${claim.investigatorNotes}\n[${new Date().toLocaleTimeString()}]: ${investigatorNote}`
          : investigatorNote,
        actor: 'Claims Investigator (Desk)',
        actionNote: 'Added investigator observation notes.',
      });
      setInvestigatorNote('');
      setActionSuccess('Investigator note added to audit trail');
      setTimeout(() => setActionSuccess(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickDecision = async (status: 'APPROVED' | 'REJECTED' | 'ESCALATED', note: string) => {
    setIsSaving(true);
    try {
      await onUpdateEscalation(claim.id, {
        status,
        investigatorNotes: claim.investigatorNotes 
          ? `${claim.investigatorNotes}\n[${new Date().toLocaleTimeString()}]: Action: ${status} - ${note}`
          : `[${new Date().toLocaleTimeString()}]: Action: ${status} - ${note}`,
        actor: 'Claims Investigator (Desk)',
        actionNote: `Investigator set status to ${status}`,
      });
      setActionSuccess(`Status updated to ${status}`);
      setTimeout(() => setActionSuccess(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const decisionRingColor = 
    claim.recommendation.decision === 'APPROVE' 
      ? 'border-green-500 text-green-400' 
      : claim.recommendation.decision === 'REJECT'
      ? 'border-red-500 text-red-400'
      : 'border-amber-500 text-amber-400';

  const decisionShortText = 
    claim.recommendation.decision === 'APPROVE' ? 'Pass' : claim.recommendation.decision === 'REJECT' ? 'Deny' : 'Hold';

  return (
    <div className="space-y-3 pb-12">
      {/* Top Case Bar */}
      <div className="h-12 flex items-center justify-between bg-white px-3.5 border border-slate-200 rounded shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-0.5 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <span className="h-4 w-[1px] bg-slate-200 mx-1"></span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Case ID</span>
          <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-900">
            {claim.claimNumber}
          </span>
          <span className="h-4 w-[1px] bg-slate-200 mx-1 hidden sm:inline"></span>
          <div className="hidden sm:flex items-center gap-1.5">
            <ClaimStatusBadge status={claim.status} />
            <RecommendationBadge decision={claim.recommendation.decision} size="sm" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented View Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('review_dossier')}
              className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'review_dossier'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Scale className="w-3 h-3" />
              <span>4-Section Claim Review</span>
            </button>
            <button
              onClick={() => setViewMode('adjudication_desk')}
              className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'adjudication_desk'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSearch className="w-3 h-3" />
              <span>Desk Adjudication & Notes</span>
            </button>
          </div>

          <button
            onClick={() => onNavigate('review_report')}
            className="bg-slate-800 text-white text-xs px-2.5 py-1 rounded font-bold hover:bg-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <FileCheck className="w-3 h-3" />
            <span className="hidden sm:inline">Audit Report</span>
          </button>
        </div>
      </div>

      {viewMode === 'review_dossier' ? (
        <ClaimReviewPage
          claim={claim}
          onNavigate={onNavigate}
          onBack={onBack}
          onUpdateEscalation={onUpdateEscalation}
        />
      ) : (
        <>
          {/* Escalation Warning if present */}
          {claim.recommendation.requiresHumanEscalation && (
            <div className="p-2.5 rounded bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-purple-600 shrink-0" />
                <div>
                  <strong className="font-bold">Investigator Escalation Alert: </strong>
                  <span>{claim.recommendation.escalationReason}</span>
                </div>
              </div>
              <button 
                onClick={() => onNavigate('human_escalation')} 
                className="text-[11px] font-bold text-purple-700 hover:text-purple-950 underline shrink-0 inline-flex items-center gap-0.5 cursor-pointer"
              >
                Escalation Desk <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* High Density 3-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        
        {/* Left Col (3/12): Claimant Profile & Structured Entities & Document Files */}
        <div className="lg:col-span-3 space-y-3">
          
          {/* Claimant Profile & Vehicle Specs Card */}
          <div className="bg-white rounded border border-slate-200 p-3.5 shadow-xs space-y-2.5">
            <h3 className="text-xs font-bold text-slate-500 uppercase border-b border-slate-100 pb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileSearch className="w-3.5 h-3.5 text-blue-600" />
                Claimant & Vehicle
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{claim.claimForm.vehicleRegistrationNumber}</span>
            </h3>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400 font-medium">Insured Name:</span>
                <span className="font-bold text-slate-800 text-right">{claim.claimForm.insuredName}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400 font-medium">Policy Type:</span>
                <span className="font-semibold text-slate-800 text-right">{claim.claimForm.policyType}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400 font-medium">Vehicle:</span>
                <span className="font-semibold text-slate-800 text-right flex items-center gap-1">
                  {claim.claimForm.vehicleCategory === 'car' ? <Car className="w-3 h-3 text-blue-600" /> : <Bike className="w-3 h-3 text-indigo-600" />}
                  {claim.claimForm.vehicleMakeModel}
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400 font-medium">Driver at Loss:</span>
                <span className="font-semibold text-slate-800 text-right">
                  {claim.claimForm.driverName} ({claim.claimForm.driverRelationship})
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400 font-medium">License (DL):</span>
                <span className={`font-mono font-bold ${claim.claimForm.driverLicenseNumber ? 'text-slate-800' : 'text-red-600'}`}>
                  {claim.claimForm.driverLicenseNumber || 'MISSING'}
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400 font-medium">Loss Date / Place:</span>
                <span className="font-semibold text-slate-800 text-right max-w-[150px] truncate" title={`${claim.claimForm.dateOfLoss} - ${claim.claimForm.placeOfLoss}`}>
                  {claim.claimForm.dateOfLoss} ({claim.claimForm.placeOfLoss})
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400 font-medium">Primary Impact:</span>
                <span className="font-semibold text-slate-800 text-right max-w-[150px] truncate" title={claim.extractedEntities.primaryImpactZone}>
                  {claim.extractedEntities.primaryImpactZone}
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-400 font-medium">Zero-Dep Rider:</span>
                <span className="font-bold text-green-700 text-right">
                  {claim.extractedEntities.hasZeroDepreciation ? 'Active (100% Parts)' : 'Standard Tariff'}
                </span>
              </div>
            </div>
          </div>

          {/* Uploaded Evidence Files (matches HTML design OCR OK style) */}
          <div className="bg-white rounded border border-slate-200 p-3.5 shadow-xs space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-500 uppercase">Uploaded Evidence</h3>
              <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 font-mono">
                3 FILES
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="p-2 bg-green-50/70 border border-green-200 rounded flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-green-600 text-white text-[9px] flex items-center justify-center rounded font-bold">PDF</span>
                  <div>
                    <span className="font-semibold text-slate-800 block text-[11px]">Claim_Form_Signed.pdf</span>
                    <span className="text-[10px] text-slate-400">Ref: {claim.claimForm.policyNumber}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded uppercase">OCR OK</span>
              </div>

              <div className="p-2 bg-green-50/70 border border-green-200 rounded flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-blue-600 text-white text-[9px] flex items-center justify-center rounded font-bold">PDF</span>
                  <div>
                    <span className="font-semibold text-slate-800 block text-[11px]">
                      {claim.repairEstimateOrFIR.documentType === 'fir' ? 'Certified_Police_FIR.pdf' : 'Estimate_Garage_Survey.pdf'}
                    </span>
                    <span className="text-[10px] text-slate-400">Ref: {claim.repairEstimateOrFIR.documentRefNumber}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded uppercase">OCR OK</span>
              </div>

              <div className="p-2 bg-green-50/70 border border-green-200 rounded flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-indigo-600 text-white text-[9px] flex items-center justify-center rounded font-bold">TXT</span>
                  <div>
                    <span className="font-semibold text-slate-800 block text-[11px]">Insured_Statement_Audio.txt</span>
                    <span className="text-[10px] text-slate-400">Recorded Incident Call</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded uppercase">TRANSCRIPT</span>
              </div>
            </div>
          </div>

          {/* Triggered Policy Clauses */}
          <div className="bg-white rounded border border-slate-200 p-3.5 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-indigo-600" />
                Policy Clauses
              </h3>
              <button
                onClick={() => onNavigate('policy_rules')}
                className="text-[10px] text-blue-600 hover:text-blue-800 font-bold uppercase cursor-pointer"
              >
                Rules KB
              </button>
            </div>

            <div className="space-y-2">
              {claim.policyEvaluations.map((pe) => {
                let borderStyle = 'border-l-4 border-green-500 bg-green-50/40';
                let tagStyle = 'bg-green-100 text-green-800 border-green-200';
                if (pe.status === 'VIOLATED') {
                  borderStyle = 'border-l-4 border-red-500 bg-red-50/40';
                  tagStyle = 'bg-red-100 text-red-800 border-red-200';
                } else if (pe.status === 'UNCERTAIN') {
                  borderStyle = 'border-l-4 border-amber-500 bg-amber-50/40';
                  tagStyle = 'bg-amber-100 text-amber-800 border-amber-200';
                }

                return (
                  <div key={pe.clauseId} className={`p-2 rounded-r border border-slate-100 ${borderStyle} text-xs`}>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-800 text-[11px]">{pe.clauseId}</span>
                      <span className={`px-1 py-0.2 text-[9px] font-bold border rounded uppercase ${tagStyle}`}>
                        {pe.status}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-900 mt-0.5 text-[11px]">{pe.clauseTitle}</div>
                    <p className="text-[10px] text-slate-600 mt-0.5 leading-snug">{pe.reasoning}</p>
                    {pe.financialImpact && (
                      <div className="text-[9px] text-slate-500 font-medium mt-1">
                        Impact: <span className="text-slate-800 font-bold">{pe.financialImpact}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Center Col (6/12): Three-Way Source Document Viewer & Contradictions */}
        <div className="lg:col-span-6 space-y-3">
          
          {/* Document Source Tabs */}
          <div className="bg-white rounded border border-slate-200 shadow-xs overflow-hidden">
            <div className="flex items-center border-b border-slate-200 bg-slate-50 px-2">
              <button
                onClick={() => setActiveDocTab('claim_form')}
                className={`flex items-center gap-1.5 py-2 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeDocTab === 'claim_form'
                    ? 'border-blue-600 text-blue-700 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>1. Claim Form</span>
              </button>

              <button
                onClick={() => setActiveDocTab('repair_fir')}
                className={`flex items-center gap-1.5 py-2 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeDocTab === 'repair_fir'
                    ? 'border-blue-600 text-blue-700 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>2. {claim.repairEstimateOrFIR.documentType === 'fir' ? 'Police FIR' : 'Repair Estimate'}</span>
              </button>

              <button
                onClick={() => setActiveDocTab('customer_narrative')}
                className={`flex items-center gap-1.5 py-2 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeDocTab === 'customer_narrative'
                    ? 'border-blue-600 text-blue-700 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>3. Insured Statement</span>
              </button>
            </div>

            <div className="p-3.5">
              {activeDocTab === 'claim_form' && (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-2.5 bg-slate-50 rounded border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Policy Number</span>
                      <span className="font-mono font-bold text-slate-800 text-[11px]">{claim.claimForm.policyNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Vehicle Reg</span>
                      <span className="font-mono font-bold text-slate-800 text-[11px]">{claim.claimForm.vehicleRegistrationNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Driver License</span>
                      <span className="font-mono font-bold text-slate-800 text-[11px]">{claim.claimForm.driverLicenseNumber || 'UNSPECIFIED'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Claimed Total</span>
                      <span className="font-extrabold text-slate-900 text-xs">${Number(claim.claimForm?.claimedAmount || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wider">Formal Incident Declaration:</h4>
                    <p className="p-2.5 bg-slate-50/60 border border-slate-200 rounded text-slate-700 leading-relaxed font-sans text-xs">
                      "{claim.claimForm.incidentSummary}"
                    </p>
                  </div>
                </div>
              )}

              {activeDocTab === 'repair_fir' && (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-2.5 bg-slate-50 rounded border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Document Ref</span>
                      <span className="font-mono font-bold text-slate-800 text-[11px]">{claim.repairEstimateOrFIR.documentRefNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Issuing Authority</span>
                      <span className="font-semibold text-slate-800 text-[11px]">{claim.repairEstimateOrFIR.issuingAuthority}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Date of Issue</span>
                      <span className="font-semibold text-slate-800 text-[11px]">{claim.repairEstimateOrFIR.documentDate}</span>
                    </div>
                  </div>

                  {claim.repairEstimateOrFIR.damageItems && claim.repairEstimateOrFIR.damageItems.length > 0 && (
                    <div>
                      <h4 className="font-bold text-slate-700 mb-1.5 text-[11px] uppercase tracking-wider">Itemized Damage & Parts Breakdown:</h4>
                      <div className="border border-slate-200 rounded overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] border-b border-slate-200">
                            <tr>
                              <th className="py-1.5 px-2.5 font-bold">Part Description</th>
                              <th className="py-1.5 px-2.5 font-bold">Material</th>
                              <th className="py-1.5 px-2.5 font-bold">Action</th>
                              <th className="py-1.5 px-2.5 font-bold">Cost</th>
                              <th className="py-1.5 px-2.5 font-bold">Surveyor Note</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {claim.repairEstimateOrFIR.damageItems.map((item, i) => (
                              <tr key={i} className="hover:bg-slate-50/60">
                                <td className="py-1.5 px-2.5 font-semibold text-slate-800">{item.partName}</td>
                                <td className="py-1.5 px-2.5 text-slate-500">{item.materialType}</td>
                                <td className="py-1.5 px-2.5 text-slate-600 font-mono text-[11px]">{item.isRepairOrReplace}</td>
                                <td className="py-1.5 px-2.5 font-bold text-slate-900">${item.cost}</td>
                                <td className="py-1.5 px-2.5 text-slate-500 text-[10px]">{item.remarks || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wider">Inspector / Officer Narrative Remarks:</h4>
                    <p className="p-2.5 bg-slate-50/60 border border-slate-200 rounded text-slate-700 leading-relaxed text-xs">
                      "{claim.repairEstimateOrFIR.narrativeOrInspectionRemarks}"
                    </p>
                  </div>
                </div>
              )}

              {activeDocTab === 'customer_narrative' && (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-2.5 bg-slate-50 rounded border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Stated Speed</span>
                      <span className="font-semibold text-slate-800 text-[11px]">{claim.customerStatement.estimatedSpeedKmh} km/h</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Weather Condition</span>
                      <span className="font-semibold text-slate-800 text-[11px]">{claim.customerStatement.weatherConditions}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Declared Usage</span>
                      <span className="font-semibold text-slate-800 text-[11px]">{claim.customerStatement.vehicleUsageAtTime}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Third-Party Hit</span>
                      <span className="font-semibold text-slate-800 text-[11px]">{claim.customerStatement.thirdPartyInvolved ? 'Yes' : 'No'}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wider">Insured First-Person Incident Narrative:</h4>
                    <div className="p-3 bg-slate-50/70 border border-slate-200 rounded text-slate-800 leading-relaxed italic text-xs">
                      "{claim.customerStatement.narrativeText}"
                    </div>
                  </div>

                  {claim.customerStatement.delayedReportingReason && (
                    <div className="p-2.5 bg-amber-50 rounded border border-amber-200 text-amber-900 text-xs">
                      <strong className="font-bold">Delayed Reporting Reason:</strong> {claim.customerStatement.delayedReportingReason}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Contradictions & Discrepancies Card */}
          <div className="bg-white rounded border border-slate-200 p-3.5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Cross-Document Contradictions & Conflicts
                </h3>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200 uppercase">
                {claim.contradictions.length} Conflict{claim.contradictions.length > 1 ? 's' : ''}
              </span>
            </div>

            {claim.contradictions.length === 0 ? (
              <div className="p-3 rounded bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                <span>Zero contradictions detected across the 3 document sources. Physical mechanics and driver statements align with policy terms.</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {claim.contradictions.map((c) => (
                  <div key={c.id} className="p-3 rounded border border-red-200 bg-red-50/30 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-red-950 text-xs">{c.title}</h4>
                      <SeverityBadge severity={c.severity} />
                    </div>

                    <p className="text-slate-700 leading-snug text-[11px]">{c.analysisRationale}</p>

                    {/* Source quotes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1 pt-1.5 border-t border-red-100 text-[10px]">
                      <div className="p-2 bg-white rounded border border-red-100">
                        <span className="font-bold text-slate-500 block uppercase text-[9px]">{c.sourceA}:</span>
                        <span className="text-slate-800 italic">"{c.quoteA}"</span>
                      </div>
                      <div className="p-2 bg-white rounded border border-red-100">
                        <span className="font-bold text-slate-500 block uppercase text-[9px]">{c.sourceB}:</span>
                        <span className="text-slate-800 italic">"{c.quoteB}"</span>
                      </div>
                    </div>

                    <div className="pt-1.5 text-[10px] text-red-900 font-medium border-t border-red-100">
                      <strong>Investigator Mandate:</strong> {c.suggestedInvestigatorAction}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Missing Information Checklist */}
          {claim.missingInformation.length > 0 && (
            <div className="bg-white rounded border border-amber-200 p-3.5 shadow-xs space-y-2">
              <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs uppercase tracking-wide pb-1.5 border-b border-amber-100">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Missing Evidence & Documents</span>
              </div>
              <div className="space-y-1.5">
                {claim.missingInformation.map((m) => (
                  <div key={m.id} className="p-2.5 bg-amber-50/50 rounded border border-amber-200 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-950 text-[11px]">{m.fieldOrDocument}</span>
                      <span className="px-1.5 py-0.2 text-[9px] font-bold bg-amber-200 text-amber-900 rounded uppercase">
                        {m.requirementLevel}
                      </span>
                    </div>
                    <p className="text-slate-700 mt-0.5 text-[10px] leading-snug">{m.rationale}</p>
                    <div className="text-[10px] text-amber-800 font-medium mt-1">
                      Action: {m.resolutionAction}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Col (3/12): AI Review Verdict & Investigator Working Notes */}
        <div className="lg:col-span-3 space-y-3">
          
          {/* AI Review Verdict (Matches Dark Box in High Density Theme) */}
          <div className="bg-slate-900 text-white rounded p-4 border border-slate-800 flex flex-col shadow-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              AI Review Verdict
            </div>

            <div className="flex items-center gap-3.5 mb-3 pb-3 border-b border-slate-800">
              <div className={`w-12 h-12 rounded-full border-4 ${decisionRingColor} flex items-center justify-center shrink-0`}>
                <span className={`text-[11px] font-black uppercase ${decisionRingColor}`}>{decisionShortText}</span>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Assistant Rec</p>
                <p className={`text-base font-extrabold uppercase tracking-tight ${decisionRingColor}`}>
                  {claim.recommendation.decision}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                  Confidence: <span className="text-white font-bold">{claim.recommendation.confidenceScore}%</span>
                </p>
              </div>
            </div>

            {/* Settlement Metrics */}
            <div className="grid grid-cols-2 gap-2 mb-3 p-2.5 bg-slate-950/60 rounded border border-slate-800 text-xs">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Claimed</span>
                <span className="text-sm font-bold text-white">${Number(claim.claimForm?.claimedAmount || 0).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Assessed</span>
                <span className="text-sm font-bold text-green-400">
                  ${Number(claim.recommendation?.suggestedSettlementEstimate || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Key Rationale */}
            <div className="space-y-1.5 text-xs flex-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Key Findings:</span>
              <ul className="space-y-1 text-[11px] text-slate-300 list-disc list-inside">
                {claim.recommendation.keyFindings.slice(0, 3).map((f, i) => (
                  <li key={i} className="leading-snug">{f}</li>
                ))}
              </ul>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Investigation Level:</span>
              <span className="font-mono text-white font-bold uppercase">{claim.recommendation.escalationSeverity}</span>
            </div>
          </div>

          {/* Investigator Working Notes & Direct Actions */}
          <div className="bg-white rounded border border-slate-200 p-3.5 shadow-xs space-y-2.5">
            <h3 className="text-xs font-bold text-slate-500 uppercase flex items-center justify-between">
              <span>Investigator Desk</span>
              <span className="text-[10px] text-slate-400">SIU Notes</span>
            </h3>

            {claim.investigatorNotes && (
              <div className="p-2 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed max-h-28 overflow-y-auto font-sans">
                {claim.investigatorNotes}
              </div>
            )}

            <div className="space-y-2">
              <textarea
                rows={2}
                placeholder="Log investigator notes or surveyor query..."
                value={investigatorNote}
                onChange={e => setInvestigatorNote(e.target.value)}
                className="w-full p-2 rounded border border-slate-200 text-xs resize-none outline-none focus:ring-1 focus:ring-blue-500"
              />
              
              <div className="flex items-center justify-between">
                {actionSuccess && (
                  <span className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {actionSuccess}
                  </span>
                )}
                <button
                  onClick={handleSaveNote}
                  disabled={isSaving || !investigatorNote.trim()}
                  className="ml-auto flex items-center gap-1 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-300 text-white text-[11px] font-bold px-2.5 py-1 rounded transition-colors cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Log Note</span>
                </button>
              </div>
            </div>

            {/* Direct Investigator Decision Buttons */}
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Fast Action:</span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => handleQuickDecision('ESCALATED', 'Escalated by desk investigator to Senior Surveyor.')}
                  disabled={isSaving}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold py-1.5 rounded transition-colors cursor-pointer"
                >
                  Escalate
                </button>
                <button
                  onClick={() => handleQuickDecision('APPROVED', 'Investigator verified and signed off settlement.')}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold py-1.5 rounded transition-colors cursor-pointer"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleQuickDecision('REJECTED', 'Investigator rejected claim due to policy exclusion.')}
                  disabled={isSaving}
                  className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold py-1.5 rounded transition-colors cursor-pointer"
                >
                  Reject
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
      </>
      )}
    </div>
  );
};
