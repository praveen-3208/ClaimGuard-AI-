import React, { useState } from 'react';
import { ClaimRecord } from '../../types/claim';
import { evaluateClaimEscalation } from '../../utils/escalationEngine';
import { CitationBadge } from '../evidence/CitationBadge';
import { 
  AlertOctagon, 
  ShieldAlert, 
  UserCheck, 
  FileText, 
  HelpCircle, 
  CheckCircle2, 
  BookOpen, 
  Scale, 
  PlusCircle, 
  Clock, 
  Send, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Info,
  X
} from 'lucide-react';

interface EscalationCardProps {
  claim: ClaimRecord;
  onUpdateEscalation?: (id: string, payload: any) => Promise<void> | void;
  onSelectCitation?: (citation: string) => void;
  onNavigate?: (tab: any) => void;
  className?: string;
  showTriggersBreakdown?: boolean;
}

export const EscalationCard: React.FC<EscalationCardProps> = ({
  claim,
  onUpdateEscalation,
  onSelectCitation,
  onNavigate,
  className = '',
  showTriggersBreakdown = true,
}) => {
  const dossier = evaluateClaimEscalation(claim);

  // Modals & form states
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [selectedInvestigator, setSelectedInvestigator] = useState('Sarah Jenkins (Senior SIU Specialist)');
  const [investigatorPriority, setInvestigatorPriority] = useState<'URGENT' | 'HIGH' | 'STANDARD'>('URGENT');
  const [investigatorBrief, setInvestigatorBrief] = useState(
    `Reconcile date variance between Claim Form (${dossier.whatIsKnown[0]?.value || '12/08/2026'}) and FIR (${dossier.whatIsKnown[1]?.value || '13/08/2026'}). Verify active policy coverage hours.`
  );
  const [customNote, setCustomNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'info'; text: string } | null>(null);
  const [showTriggersList, setShowTriggersList] = useState(false);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Handler 1: Assign Investigator
  const handleAssignInvestigator = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    try {
      if (onUpdateEscalation) {
        await onUpdateEscalation(claim.id, {
          assignedInvestigator: selectedInvestigator,
          status: 'Under Field Investigation',
          investigatorNotes: claim.investigatorNotes 
            ? `${claim.investigatorNotes}\n[${new Date().toLocaleTimeString()}]: Assigned to ${selectedInvestigator} (${investigatorPriority} priority). Brief: ${investigatorBrief}`
            : `[${new Date().toLocaleTimeString()}]: Assigned to ${selectedInvestigator} (${investigatorPriority} priority). Brief: ${investigatorBrief}`,
          actor: 'Senior Claims Supervisor',
          actionNote: `Assigned to ${selectedInvestigator} with priority ${investigatorPriority}`,
        });
      }
      setIsAssignModalOpen(false);
      showToast(`Assigned successfully to ${selectedInvestigator}`);
    } catch (err) {
      console.error('Failed to assign investigator:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler 2: Add Note
  const handleAddNote = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customNote.trim()) return;
    setIsSubmitting(true);
    try {
      const timestamp = new Date().toLocaleTimeString();
      const updatedNotes = claim.investigatorNotes 
        ? `${claim.investigatorNotes}\n[${timestamp} - Note Added]: ${customNote.trim()}`
        : `[${timestamp} - Note Added]: ${customNote.trim()}`;

      if (onUpdateEscalation) {
        await onUpdateEscalation(claim.id, {
          investigatorNotes: updatedNotes,
          actor: claim.assignedInvestigator || 'Claims Adjudicator',
          actionNote: `Investigator Note: ${customNote.trim()}`,
        });
      }
      setCustomNote('');
      setIsNoteModalOpen(false);
      showToast('Investigator note recorded and appended to audit trail.');
    } catch (err) {
      console.error('Failed to add note:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler 3: Mark Under Review
  const handleMarkUnderReview = async () => {
    setIsSubmitting(true);
    try {
      const timestamp = new Date().toLocaleTimeString();
      if (onUpdateEscalation) {
        await onUpdateEscalation(claim.id, {
          status: 'Under Review',
          investigatorNotes: claim.investigatorNotes 
            ? `${claim.investigatorNotes}\n[${timestamp}]: Claim marked 'Under Review' for contradiction reconciliation.`
            : `[${timestamp}]: Claim marked 'Under Review' for contradiction reconciliation.`,
          actor: claim.assignedInvestigator || 'Adjudicator',
          actionNote: "Claim status transitioned to 'Under Review'",
        });
      }
      showToast("Claim marked as 'Under Review'. Escalation workflow active.");
    } catch (err) {
      console.error('Failed to mark under review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg border-2 border-red-500 shadow-sm overflow-hidden ${className}`}>
      
      {/* ---------------------------------------------------- */}
      {/* CARD HEADER: ESCALATION REQUIRED                    */}
      {/* ---------------------------------------------------- */}
      <div className="bg-red-600 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-red-700 border border-red-400 flex items-center justify-center shrink-0">
            <AlertOctagon className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <span>ESCALATION REQUIRED</span>
              <span className="text-[10px] bg-red-800 text-red-100 px-2 py-0.5 rounded font-mono font-normal border border-red-500">
                Statutory Override
              </span>
            </h2>
            <p className="text-[11px] text-red-100 font-medium">
              Autonomous approval suspended • Human adjudicator sign-off strictly mandated
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-0.5 rounded bg-red-800 text-white font-mono font-bold text-[11px] border border-red-400">
            Status: {claim.status}
          </span>
          {claim.assignedInvestigator && (
            <span className="text-[10px] text-red-100 bg-red-700 px-2 py-0.5 rounded border border-red-500 truncate max-w-[180px]">
              Assigned: {claim.assignedInvestigator}
            </span>
          )}
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedbackMessage.text}</span>
          </div>
          <button 
            onClick={() => setFeedbackMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* CARD BODY: USER-SPECIFIED SECTIONS                   */}
      {/* ---------------------------------------------------- */}
      <div className="p-4 sm:p-5 space-y-4 text-xs">
        
        {/* ROW 1: Claim ID & Reason */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pb-3 border-b border-slate-200">
          
          {/* Claim ID: */}
          <div className="md:col-span-4 space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
              Claim ID:
            </span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black font-mono text-slate-900 bg-slate-100 px-2.5 py-1 rounded border border-slate-300">
                {dossier.claimId}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                ({claim.claimForm?.vehicleMakeModel || 'Motor Claim'})
              </span>
            </div>
          </div>

          {/* Reason: */}
          <div className="md:col-span-8 space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-red-600 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
              Reason:
            </span>
            <div className="p-2.5 rounded bg-red-50 border border-red-200 text-red-950 font-bold text-xs leading-relaxed">
              {dossier.reason}
            </div>
          </div>

        </div>

        {/* ROW 2: What is known & What is unknown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-3 border-b border-slate-200">
          
          {/* What is known: */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                What is known:
              </span>
              <span className="text-[10px] font-mono text-slate-400">Verified Evidence</span>
            </div>

            <div className="space-y-2 p-3 rounded bg-slate-50 border border-slate-200">
              {dossier.whatIsKnown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs bg-white p-2 rounded border border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{item.source}:</span>
                    <span className="font-mono font-semibold text-slate-800">{item.value}</span>
                  </div>
                  {item.citation && (
                    <CitationBadge 
                      citation={item.citation} 
                      size="xs" 
                      onClick={onSelectCitation}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* What is unknown: */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                What is unknown:
              </span>
              <span className="text-[10px] font-mono text-amber-600 font-bold">Requires Investigation</span>
            </div>

            <div className="space-y-2 p-3 rounded bg-amber-50/50 border border-amber-200">
              {dossier.whatIsUnknown.map((unknownItem, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs bg-white p-2 rounded border border-amber-200 text-amber-950 font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                  <span>{unknownItem}</span>
                </div>
              ))}
              <p className="text-[10px] text-amber-800 leading-snug">
                Unresolved variance directly affects Policy Notification compliance and in-force coverage validity.
              </p>
            </div>
          </div>

        </div>

        {/* ROW 3: Documents reviewed & Policy clauses reviewed */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-3 border-b border-slate-200">
          
          {/* Documents reviewed: */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              Documents reviewed:
            </span>

            <div className="flex flex-wrap gap-1.5">
              {dossier.documentsReviewed.map((docName, idx) => (
                <span 
                  key={idx}
                  className="px-2.5 py-1 rounded bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  {docName}
                </span>
              ))}
            </div>
          </div>

          {/* Policy clauses reviewed: */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-indigo-600" />
              Policy clauses reviewed:
            </span>

            <div className="flex flex-wrap gap-1.5">
              {dossier.policyClausesReviewed.map((clauseId, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectCitation ? onSelectCitation(`[${clauseId}]`) : (onNavigate && onNavigate('policy_rules'))}
                  className="px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-mono font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Click to view policy clause definition"
                >
                  <BookOpen className="w-3 h-3 text-indigo-700" />
                  {clauseId}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* ROW 4: AI Recommendation */}
        <div className="p-3.5 rounded bg-slate-900 text-white space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              AI Recommendation:
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Confidence Score: {claim.recommendation?.confidenceScore ?? 68}%
            </span>
          </div>

          <p className="text-sm font-black text-white tracking-wide">
            {dossier.aiRecommendation}
          </p>

          <p className="text-[11px] text-slate-300 leading-relaxed pt-1 border-t border-slate-800">
            {claim.recommendation?.summaryRationale || 
              'In strict accordance with statutory standards, contradictions are not merged or resolved algorithmically. A human investigator must verify the loss occurrence timestamp before financial disbursement.'}
          </p>
        </div>

        {/* ---------------------------------------------------- */}
        {/* BUTTONS: USER-SPECIFIED BUTTON ACTIONS               */}
        {/* ---------------------------------------------------- */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Execute human escalation protocol:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            
            {/* BUTTON 1: Assign Investigator */}
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="px-3.5 py-2 rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Assign Investigator</span>
            </button>

            {/* BUTTON 2: Add Note */}
            <button
              onClick={() => setIsNoteModalOpen(true)}
              className="px-3.5 py-2 rounded bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-slate-600" />
              <span>Add Note</span>
            </button>

            {/* BUTTON 3: Mark Under Review */}
            <button
              onClick={handleMarkUnderReview}
              disabled={isSubmitting || claim.status === 'Under Review'}
              className={`px-3.5 py-2 rounded font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                claim.status === 'Under Review'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300 cursor-default'
                  : 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white shadow-xs'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{claim.status === 'Under Review' ? 'Under Review ✓' : 'Mark Under Review'}</span>
            </button>

          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* THE 6 AUTOMATED ESCALATION TRIGGERS BREAKDOWN        */}
        {/* ---------------------------------------------------- */}
        {showTriggersBreakdown && (
          <div className="mt-4 pt-3 border-t border-slate-200">
            <button
              onClick={() => setShowTriggersList(prev => !prev)}
              className="w-full flex items-center justify-between text-left text-xs font-bold text-slate-700 hover:text-slate-900 py-1 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Statutory Escalation Rules Engine (6 Triggers Evaluated)</span>
                <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-800 text-[10px] font-mono font-bold">
                  {dossier.activeTriggerCount} Triggered
                </span>
              </span>
              {showTriggersList ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {showTriggersList && (
              <div className="mt-2 space-y-2 p-3 bg-slate-50 rounded border border-slate-200">
                <p className="text-[11px] text-slate-600">
                  The system evaluates each motor claim against 6 non-negotiable statutory triggers. If any trigger fires, autonomous resolution is prohibited.
                </p>

                <div className="space-y-1.5">
                  {dossier.triggers.map((rule, idx) => (
                    <div 
                      key={rule.key}
                      className={`p-2.5 rounded border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                        rule.isTriggered 
                          ? 'bg-red-50/70 border-red-200' 
                          : 'bg-white border-slate-200 opacity-80'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${rule.isTriggered ? 'bg-red-600' : 'bg-slate-300'}`}></span>
                          <span className="font-bold text-slate-900">
                            {idx + 1}. {rule.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 pl-4">
                          {rule.isTriggered ? rule.evidenceDetails : rule.description}
                        </p>
                      </div>

                      <div className="sm:text-right shrink-0 pl-4 sm:pl-0">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          rule.isTriggered 
                            ? 'bg-red-600 text-white' 
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}>
                          {rule.isTriggered ? 'TRIGGERED' : 'PASS'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ---------------------------------------------------- */}
      {/* MODAL 1: ASSIGN INVESTIGATOR                         */}
      {/* ---------------------------------------------------- */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-slate-300 max-w-lg w-full p-5 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Assign SIU Special Investigator
                </h3>
              </div>
              <button 
                onClick={() => setIsAssignModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignInvestigator} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Claim Dossier</label>
                <input 
                  type="text" 
                  disabled 
                  value={`${dossier.claimId} — ${claim.claimForm?.vehicleMakeModel || 'Vehicle'} ($${(claim.claimForm?.claimedAmount || 0).toLocaleString()})`}
                  className="w-full p-2 bg-slate-100 text-slate-600 rounded border border-slate-300 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Select SIU Investigator</label>
                <select
                  value={selectedInvestigator}
                  onChange={e => setSelectedInvestigator(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 bg-white font-medium text-xs cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="Sarah Jenkins (Senior SIU Specialist)">Sarah Jenkins (Senior SIU Specialist - Fraud & Timeline)</option>
                  <option value="David Chen (Technical Forensics Assessor)">David Chen (Technical Forensics Assessor - Impact Damage)</option>
                  <option value="Officer Marcus Vance (Field Surveyor)">Officer Marcus Vance (Field Surveyor - Highway Patrol Liaison)</option>
                  <option value="Priya Raman (Motor Legal Adjuster)">Priya Raman (Motor Legal Adjuster - Statutory Compliance)</option>
                  <option value="Elena Rostova (Lead Forensic Adjudicator)">Elena Rostova (Lead Forensic Adjudicator - Policy Breach)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assignment Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['URGENT', 'HIGH', 'STANDARD'] as const).map(p => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setInvestigatorPriority(p)}
                      className={`p-1.5 rounded font-bold text-xs uppercase border cursor-pointer ${
                        investigatorPriority === p
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Investigator Instructions & Brief</label>
                <textarea
                  rows={3}
                  value={investigatorBrief}
                  onChange={e => setInvestigatorBrief(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 font-medium text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  placeholder="Enter specific investigative instructions..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Dispatching...' : 'Dispatch Assignment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 2: ADD NOTE                                    */}
      {/* ---------------------------------------------------- */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-slate-300 max-w-lg w-full p-5 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Record Investigator Note / Finding
                </h3>
              </div>
              <button 
                onClick={() => setIsNoteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNote} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Claim Reference</label>
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded block border border-slate-200">
                  {dossier.claimId} • Reason: {dossier.reason}
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Investigator Note / Commentary</label>
                <textarea
                  rows={4}
                  value={customNote}
                  onChange={e => setCustomNote(e.target.value)}
                  placeholder="Enter findings, phone intimation log, or verification details..."
                  className="w-full p-2.5 rounded border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  autoFocus
                />
                <span className="text-[10px] text-slate-500">
                  This note is immutably appended to the claim audit trail and signed with your credentials.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !customNote.trim()}
                  className="px-4 py-1.5 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Recording...' : 'Save to Audit Log'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
