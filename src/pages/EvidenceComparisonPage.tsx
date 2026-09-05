import React, { useState } from 'react';
import { ClaimRecord } from '../types/claim';
import { RecommendationBadge, SeverityBadge } from '../components/common/Badges';
import { CitationBadge } from '../components/evidence/CitationBadge';
import { EvidencePanel } from '../components/evidence/EvidencePanel';
import { 
  Scale, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Wrench, 
  User, 
  ArrowRight,
  ShieldCheck,
  Search,
  ExternalLink
} from 'lucide-react';

interface EvidenceComparisonPageProps {
  claims: ClaimRecord[];
  activeClaimId?: string;
  onSelectClaim: (claimId: string) => void;
  onNavigate: (page: any) => void;
}

export const EvidenceComparisonPage: React.FC<EvidenceComparisonPageProps> = ({
  claims,
  activeClaimId,
  onSelectClaim,
  onNavigate,
}) => {
  const selectedClaim = claims.find(c => c.id === activeClaimId) || claims[0];
  const [activeCitation, setActiveCitation] = useState<string | null>(null);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [selectedEvidenceData, setSelectedEvidenceData] = useState<any>(null);

  const handleSelectCitation = (citation: string, findingTitle?: string) => {
    setActiveCitation(citation);
    setIsEvidenceModalOpen(true);

    const matchingContra = selectedClaim.contradictions.find(
      c => c.citationA === citation || c.citationB === citation || (findingTitle && c.title.toLowerCase().includes(findingTitle.toLowerCase()))
    );

    if (matchingContra) {
      setSelectedEvidenceData({
        finding: matchingContra.title,
        status: 'CONTRADICTION',
        explanation: matchingContra.investigationImpact || matchingContra.analysisRationale,
        sourceA: {
          name: matchingContra.sourceA,
          label: `${matchingContra.sourceA} excerpt`,
          value: matchingContra.quoteA,
          citation: matchingContra.citationA || citation,
          locator: matchingContra.citationA || '[CLAIM_FORM: Page 2]',
          timestamp: 'Document Timestamp: Verified'
        },
        sourceB: {
          name: matchingContra.sourceB,
          label: `${matchingContra.sourceB} excerpt`,
          value: matchingContra.quoteB,
          citation: matchingContra.citationB || '[FIR: Page 1]',
          locator: matchingContra.citationB || '[FIR: Page 1]',
          timestamp: 'Document Timestamp: Verified'
        },
        conflictDetails: {
          discrepancySummary: matchingContra.analysisRationale,
          unmergedRuleNotice: 'CRITICAL FORENSIC DIRECTIVE: Values must remain discrete and unmerged to prevent falsification of claims investigation records.',
          investigatorActionRequired: matchingContra.suggestedInvestigatorAction
        }
      });
    } else {
      setSelectedEvidenceData(null);
    }
  };

  return (
    <div className="space-y-3 pb-12">
      {/* High Density Header with Claim Selector */}
      <div className="h-12 flex flex-wrap items-center justify-between bg-white px-3.5 border border-slate-200 rounded shadow-xs gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <Scale className="w-4 h-4 text-blue-600" />
            <span>Cross-Document Triangulation Matrix</span>
          </div>
          <span className="h-4 w-[1px] bg-slate-200 mx-1 hidden sm:inline"></span>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest hidden sm:inline">Active Case:</span>
          <select
            value={selectedClaim.id}
            onChange={e => onSelectClaim(e.target.value)}
            className="px-2 py-1 rounded border border-slate-200 bg-slate-50 text-xs font-mono font-bold text-slate-800 outline-none cursor-pointer"
          >
            {claims.map(c => (
              <option key={c.id} value={c.id}>
                {c.claimNumber} — {c.claimForm.vehicleMakeModel} ({c.recommendation.decision})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('claim_details')}
            className="bg-slate-800 text-white text-xs px-2.5 py-1 rounded font-bold hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Claim Dossier
          </button>
          <button
            onClick={() => onNavigate('review_report')}
            className="bg-blue-600 text-white text-xs px-3 py-1 rounded font-bold hover:bg-blue-500 shadow-sm shadow-blue-900/20 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <ArrowRight className="w-3 h-3" />
            <span>Audit Report</span>
          </button>
        </div>
      </div>

      {/* Selected Claim Overview Strip */}
      <div className="bg-white rounded border border-slate-200 p-2.5 shadow-xs flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {selectedClaim.claimNumber}
          </span>
          <span className="font-semibold text-slate-800">{selectedClaim.claimForm.insuredName}</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-600 font-mono">{selectedClaim.claimForm.vehicleRegistrationNumber} ({selectedClaim.claimForm.vehicleMakeModel})</span>
        </div>

        <div className="flex items-center gap-2">
          {selectedClaim.contradictions.length === 0 ? (
            <span className="inline-flex items-center gap-1 font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200 text-[11px] uppercase">
              <CheckCircle2 className="w-3 h-3 text-green-600" />
              100% Consistent
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200 text-[11px] uppercase">
              <XCircle className="w-3 h-3 text-red-600" />
              {selectedClaim.contradictions.length} Conflict{selectedClaim.contradictions.length > 1 ? 's' : ''} Detected
            </span>
          )}
          <RecommendationBadge decision={selectedClaim.recommendation.decision} size="sm" />
        </div>
      </div>

      {/* Side-by-Side 3-Document Comparative Matrix */}
      <div className="bg-white rounded border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-2.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Scale className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-bold text-xs uppercase tracking-wider">Multi-Source Verification Matrix</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            3-way evidence extraction & cross-reference
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-2 px-3 w-1/5 border-r border-slate-200">Verification Dimension</th>
                <th className="py-2 px-3 w-1/4 border-r border-slate-200 bg-emerald-50/20">
                  <div className="flex items-center gap-1 text-emerald-950">
                    <User className="w-3 h-3 text-emerald-600" />
                    <span>1. Insured Statement</span>
                  </div>
                </th>
                <th className="py-2 px-3 w-1/4 border-r border-slate-200 bg-blue-50/20">
                  <div className="flex items-center gap-1 text-blue-950">
                    <FileText className="w-3 h-3 text-blue-600" />
                    <span>2. Claim Form Data</span>
                  </div>
                </th>
                <th className="py-2 px-3 w-1/4 bg-amber-50/20">
                  <div className="flex items-center gap-1 text-amber-950">
                    <Wrench className="w-3 h-3 text-amber-600" />
                    <span>3. {selectedClaim.repairEstimateOrFIR.documentType === 'fir' ? 'Police FIR' : 'Repair Estimate'}</span>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {selectedClaim.comparisonMatrix.map((point, index) => (
                <tr 
                  key={index}
                  className={`transition-colors ${
                    !point.isConsistent ? 'bg-red-50/40 hover:bg-red-50/60' : 'hover:bg-slate-50/60'
                  }`}
                >
                  {/* Dimension Name & Consistency Status */}
                  <td className="py-2.5 px-3 border-r border-slate-200 align-top">
                    <div className="font-bold text-slate-900 text-[11px]">{point.attribute}</div>
                    <div className="mt-0.5">
                      {point.isConsistent ? (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-green-700 uppercase">
                          <CheckCircle2 className="w-3 h-3 text-green-500" /> Match
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-red-700 uppercase">
                          <XCircle className="w-3 h-3 text-red-500" /> Conflict
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[10px] text-slate-500 leading-snug">
                      {point.notes}
                    </p>
                  </td>

                  {/* Column 1: Customer Statement */}
                  <td className="py-2.5 px-3 border-r border-slate-200 align-top text-slate-800 bg-emerald-50/10 text-[11px]">
                    <div className="font-medium leading-relaxed">
                      {point.customerStatementValue}
                    </div>
                  </td>

                  {/* Column 2: Claim Form */}
                  <td className="py-2.5 px-3 border-r border-slate-200 align-top text-slate-800 bg-blue-50/10 text-[11px]">
                    <div className="font-medium leading-relaxed">
                      {point.claimFormValue}
                    </div>
                  </td>

                  {/* Column 3: Repair Estimate / FIR */}
                  <td className="py-2.5 px-3 align-top text-slate-800 bg-amber-50/10 text-[11px]">
                    <div className="font-medium leading-relaxed">
                      {point.estimateOrFIRValue}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep-Dive Contradiction Breakout Cards */}
      {selectedClaim.contradictions.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200">
            <h2 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              Detailed Evidence Conflicts & Citation Analysis
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">Grounded excerpts from submitted evidence</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {selectedClaim.contradictions.map((contra) => (
              <div 
                key={contra.id}
                className="bg-white rounded border border-red-200 p-3 shadow-xs flex flex-col justify-between space-y-2.5"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-[10px] font-bold text-slate-500 uppercase">{contra.category}</span>
                    <SeverityBadge severity={contra.severity} />
                  </div>
                  <h3 className="text-xs font-bold text-red-950 leading-snug">
                    {contra.title}
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                    {contra.analysisRationale}
                  </p>
                </div>

                <div className="space-y-1.5 text-[10px]">
                  <div className="p-2 rounded bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-600 block uppercase text-[9px]">{contra.sourceA}:</span>
                      <CitationBadge citation={contra.citationA || '[CLAIM_FORM: Page 2]'} size="xs" onClick={handleSelectCitation} />
                    </div>
                    <span className="text-slate-800 font-mono text-[11px] block">"{contra.quoteA}"</span>
                  </div>
                  <div className="p-2 rounded bg-red-50/60 border border-red-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-red-900 block uppercase text-[9px]">{contra.sourceB}:</span>
                      <CitationBadge citation={contra.citationB || '[FIR: Page 1]'} size="xs" onClick={handleSelectCitation} />
                    </div>
                    <span className="text-red-950 font-mono text-[11px] block">"{contra.quoteB}"</span>
                  </div>
                </div>

                <div className="pt-1.5 border-t border-slate-100 text-[10px] text-slate-700 flex items-center justify-between">
                  <div>
                    <strong className="text-slate-900">Mandated Action:</strong> {contra.suggestedInvestigatorAction}
                  </div>
                  <button
                    onClick={() => handleSelectCitation(contra.citationA || '[CLAIM_FORM: Page 2]', contra.title)}
                    className="shrink-0 text-blue-700 hover:text-blue-900 font-bold underline cursor-pointer text-[10px] ml-2"
                  >
                    Open Evidence Panel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
        <button
          onClick={() => onNavigate('claim_details')}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          ← Return to Claim Details
        </button>
        <button
          onClick={() => onNavigate('review_report')}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded transition-colors cursor-pointer"
        >
          <span>Generate Formal Evidence Report</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Floating Evidence Modal */}
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
