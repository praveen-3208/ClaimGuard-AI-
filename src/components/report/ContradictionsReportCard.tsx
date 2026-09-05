import React from 'react';
import { ClaimRecord } from '../../types/claim';
import { CitationBadge } from '../evidence/CitationBadge';
import { SeverityBadge } from '../common/Badges';
import { AlertTriangle, CheckCircle2, ArrowRightLeft, ExternalLink } from 'lucide-react';

interface ContradictionsReportCardProps {
  claim: ClaimRecord;
  onSelectClaim?: (claimId: string) => void;
}

export const ContradictionsReportCard: React.FC<ContradictionsReportCardProps> = ({ 
  claim, 
  onSelectClaim 
}) => {
  const contradictions = claim.contradictions || [];
  const hasContradictions = contradictions.length > 0;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3 shadow-2xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-amber-600" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
            CONTRADICTIONS
          </h3>
        </div>
        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
          hasContradictions 
            ? 'bg-rose-50 text-rose-700 border border-rose-200' 
            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        }`}>
          {hasContradictions ? `${contradictions.length} CONFLICTING FIELD(S) IDENTIFIED` : '0 CONTRADICTIONS DETECTED'}
        </span>
      </div>

      {!hasContradictions ? (
        <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-emerald-950">
                Complete Concordance Across Available Statements
              </p>
              <p className="text-[11px] text-emerald-900/90 leading-relaxed mt-0.5">
                No factual discrepancy detected between the sworn Claim Form and the Insured Incident Narrative. Damage location, point of impact, vehicle details, and occurrence time match. The primary case issue is document incompleteness (missing FIR), not a factual contradiction.
              </p>
            </div>
          </div>

          {onSelectClaim && (
            <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between">
              <span className="text-[10.5px] text-emerald-800 font-medium">
                Want to review a claim with active factual contradictions?
              </span>
              <button
                onClick={() => onSelectClaim('clm-1003')}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Date Contradiction Demo (CLM-2026-1003)</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {contradictions.map((c, idx) => (
            <div
              key={c.id || idx}
              className="p-3.5 rounded-lg border border-rose-200 bg-rose-50/20 space-y-2.5"
            >
              {/* Header: Field title & Severity */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold">
                    !
                  </span>
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-tight">
                    Conflicting Field: <span className="text-rose-900 underline">{c.title}</span>
                  </span>
                </div>
                <SeverityBadge severity={c.severity} />
              </div>

              {/* Both values with source citations side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* Source A */}
                <div className="p-2.5 bg-white rounded border border-slate-200 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase">
                    <span>{c.sourceA || 'Document A'}</span>
                    <CitationBadge citation={c.citationA || '[CLAIM_FORM: Page 2]'} size="xs" />
                  </div>
                  <div className="text-[11px] font-semibold text-slate-900 bg-slate-50 p-1.5 rounded border border-slate-100 font-mono">
                    {c.valueA || c.quoteA}
                  </div>
                  <p className="text-[10px] text-slate-500 italic">
                    "{c.quoteA}"
                  </p>
                </div>

                {/* Source B */}
                <div className="p-2.5 bg-rose-50/60 rounded border border-rose-200 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-rose-800 font-bold uppercase">
                    <span>{c.sourceB || 'Document B'}</span>
                    <CitationBadge citation={c.citationB || '[FIR: Page 1]'} size="xs" />
                  </div>
                  <div className="text-[11px] font-semibold text-rose-950 bg-white p-1.5 rounded border border-rose-200 font-mono">
                    {c.valueB || c.quoteB}
                  </div>
                  <p className="text-[10px] text-rose-900 italic">
                    "{c.quoteB}"
                  </p>
                </div>
              </div>

              {/* Analysis & Recommended Action */}
              <div className="pt-1 text-[11px] space-y-1">
                <p className="text-slate-700 leading-relaxed">
                  <strong className="text-slate-900">Analysis Rationale: </strong>
                  {c.analysisRationale}
                </p>
                <p className="text-blue-900 font-semibold">
                  <strong>Investigator Protocol: </strong>
                  {c.suggestedInvestigatorAction}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
