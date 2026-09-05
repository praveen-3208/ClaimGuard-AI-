import React, { useState } from 'react';
import { PolicyClause } from '../types/claim';
import { claimsApi } from '../api/claimsApi';
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  Scale, 
  AlertCircle, 
  Car, 
  Bike, 
  CheckCircle2, 
  HelpCircle,
  Loader2,
  Send,
  ExternalLink
} from 'lucide-react';

interface PolicyRulesPageProps {
  policyRules: PolicyClause[];
}

export const PolicyRulesPage: React.FC<PolicyRulesPageProps> = ({ policyRules }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedClaimType, setSelectedClaimType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [question, setQuestion] = useState<string>('');
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);

  const categories = ['all', 'Coverage', 'Exclusion', 'Mandatory Condition', 'Add-on Cover', 'Deductible', 'Depreciation'];
  const claimTypes = [
    { id: 'all', label: 'All Claim Types' },
    { id: 'Accident', label: 'Accident' },
    { id: 'Theft', label: 'Theft' },
  ];

  const filteredRules = policyRules.filter(rule => {
    const matchesCat = selectedCategory === 'all' || rule.category === selectedCategory;
    const matchesClaimType = selectedClaimType === 'all' || 
      rule.applicableClaimType === 'Accident & Theft' || 
      rule.applicableClaimType?.toLowerCase().includes(selectedClaimType.toLowerCase());

    const lowerQuery = searchQuery.toLowerCase();
    const matchesSearch = 
      !searchQuery ||
      rule.clauseId.toLowerCase().includes(lowerQuery) ||
      rule.title.toLowerCase().includes(lowerQuery) ||
      (rule.policyText && rule.policyText.toLowerCase().includes(lowerQuery)) ||
      (rule.evidenceRequired && rule.evidenceRequired.toLowerCase().includes(lowerQuery)) ||
      (rule.conditions && rule.conditions.some(c => c.toLowerCase().includes(lowerQuery))) ||
      rule.description.toLowerCase().includes(lowerQuery) ||
      rule.standardDeductionOrRule.toLowerCase().includes(lowerQuery);

    return matchesCat && matchesClaimType && matchesSearch;
  });

  const handleAskPolicyQuestion = async (queryText?: string) => {
    const q = queryText || question;
    if (!q.trim()) return;

    setIsQuerying(true);
    setAiAnswer(null);
    try {
      const response = await claimsApi.queryPolicyRule(q);
      setAiAnswer(response);
    } catch (err: any) {
      setAiAnswer(`Error querying policy rules: ${err.message}`);
    } finally {
      setIsQuerying(false);
    }
  };

  const sampleQueries = [
    'What is the notification window for accident vs theft claims (POLICY-005)?',
    'What evidence is required for partial accidental repair estimates (POLICY-007)?',
    'Can we repudiate a claim if a private car was used for commercial delivery (POLICY-003)?',
    'What are the mandatory police FIR requirements for theft claims (POLICY-008)?',
  ];

  return (
    <div className="space-y-4 pb-12">
      {/* High Density Header */}
      <div className="h-12 flex items-center justify-between bg-white px-3.5 border border-slate-200 rounded shadow-xs">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <h1 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            Synthetic Motor Insurance Policy Knowledge Base
          </h1>
          <span className="h-4 w-[1px] bg-slate-200 mx-1 hidden sm:inline"></span>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest hidden sm:inline">
            POLICY-001 TO POLICY-012
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded hidden md:inline">
            Zero Hallucination Rule: AI Never Invents Clauses
          </span>
          <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {policyRules.length} Verified Clauses
          </span>
        </div>
      </div>

      {/* Interactive Policy Query Assistant (Ask the KB) */}
      <div className="bg-slate-900 text-white rounded border border-slate-800 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-blue-500/20 text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-white">Investigator Policy Query Assistant</h2>
              <p className="text-[10px] text-slate-400">Grounded exclusively in synthetic motor policy clauses (POLICY-001 through POLICY-012)</p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
            STRICT CITATION MANDATE
          </span>
        </div>
        
        <p className="text-[11px] text-slate-300 leading-relaxed">
          Ask questions regarding coverage eligibility, exclusion enforcement, notice windows, or required evidentiary proofs. The assistant cites the exact Clause ID, Title, Policy Text, and Required Evidence.
        </p>

        {/* Input bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="e.g. What are the required documents and notification time for a total theft claim?"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAskPolicyQuestion(); }}
              className="w-full px-3 py-2 rounded bg-slate-800 text-white text-xs border border-slate-700 focus:border-blue-400 outline-none placeholder:text-slate-500 font-sans"
            />
          </div>
          <button
            onClick={() => handleAskPolicyQuestion()}
            disabled={isQuerying || !question.trim()}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded shadow-sm transition-all cursor-pointer shrink-0"
          >
            {isQuerying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Consult Policy</span>
          </button>
        </div>

        {/* Sample queries */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs pt-0.5">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Common Scenarios:</span>
          {sampleQueries.map((sq, i) => (
            <button
              key={i}
              onClick={() => { setQuestion(sq); handleAskPolicyQuestion(sq); }}
              className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded border border-slate-700 transition-colors text-left cursor-pointer"
            >
              {sq}
            </button>
          ))}
        </div>

        {/* AI Answer Box */}
        {aiAnswer && (
          <div className="p-3.5 rounded bg-slate-800/90 border border-slate-700 text-xs space-y-2 mt-2">
            <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
              <div className="flex items-center gap-1.5 text-blue-400 font-bold uppercase tracking-wider text-[10px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                Evidence-Grounded Policy Finding
              </div>
              <span className="text-[10px] font-mono text-slate-400">Never Invented Policy Clauses</span>
            </div>
            <div className="text-slate-200 whitespace-pre-wrap leading-relaxed font-sans text-xs">
              {aiAnswer}
            </div>
          </div>
        )}
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="bg-white p-3 rounded border border-slate-200 shadow-xs space-y-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* Claim Type Filter Tabs */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">Claim Type:</span>
            {claimTypes.map(ct => (
              <button
                key={ct.id}
                onClick={() => setSelectedClaimType(ct.id)}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  selectedClaimType === ct.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {ct.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative md:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search clause ID, title, text, or required evidence..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded border border-slate-200 text-xs bg-slate-50 outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Section:</span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-2 py-0.5 rounded text-[11px] font-medium capitalize transition-all cursor-pointer ${
                selectedCategory === cat 
                  ? 'bg-slate-900 text-white font-bold' 
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Sections' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Policy Clauses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredRules.map(clause => {
          let categoryBadge = 'bg-blue-50 text-blue-800 border-blue-200';
          if (clause.category === 'Exclusion') categoryBadge = 'bg-red-50 text-red-800 border-red-200';
          if (clause.category === 'Mandatory Condition') categoryBadge = 'bg-amber-50 text-amber-800 border-amber-200';
          if (clause.category === 'Add-on Cover') categoryBadge = 'bg-green-50 text-green-800 border-green-200';
          if (clause.category === 'Depreciation') categoryBadge = 'bg-purple-50 text-purple-800 border-purple-200';
          if (clause.category === 'Deductible') categoryBadge = 'bg-slate-100 text-slate-800 border-slate-300';

          return (
            <div 
              key={clause.clauseId}
              className="bg-white rounded border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden"
            >
              {/* Header Bar */}
              <div className="p-3.5 border-b border-slate-100 bg-slate-50/70">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300 text-xs shadow-xs">
                      {clause.clauseId}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${categoryBadge}`}>
                      {clause.category}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                    {clause.applicableClaimType || 'Accident & Theft'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {clause.title}
                </h3>
              </div>

              {/* Body Content */}
              <div className="p-3.5 space-y-3 text-xs flex-1">
                
                {/* 1. Policy Text (Verbatim Rule) */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Policy Text (Statutory Rule)
                  </span>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-slate-800 font-serif text-[11px] leading-relaxed italic">
                    "{clause.policyText || clause.description}"
                  </div>
                </div>

                {/* 2. Enforceable Conditions */}
                {clause.conditions && clause.conditions.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Enforceable Conditions
                    </span>
                    <ul className="space-y-1 text-[11px] text-slate-700 list-disc list-inside bg-white p-2 rounded border border-slate-100">
                      {clause.conditions.map((cond, idx) => (
                        <li key={idx} className="leading-snug">
                          {cond}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 3. Evidence Required */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Required Evidence for Adjudication
                  </span>
                  <div className="p-2 rounded bg-amber-50/60 border border-amber-200 text-amber-950 font-mono text-[11px] leading-snug flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                    <span>{clause.evidenceRequired || 'Incident date, loss description, and valid driving license.'}</span>
                  </div>
                </div>

              </div>

              {/* Footer Summary Bar */}
              <div className="px-3.5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                <span className="font-mono text-[10px]">
                  Applies to: <strong className="text-slate-800">{clause.appliesTo}</strong>
                </span>
                <span className="font-mono text-[10px]">
                  Risk Weight: <strong className="text-slate-800">{clause.riskWeight}</strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredRules.length === 0 && (
        <div className="bg-white rounded border border-slate-200 p-8 text-center text-slate-500 space-y-2">
          <p className="font-bold text-sm text-slate-700">No matching policy clauses found.</p>
          <p className="text-xs">Try clearing the search query or selecting "All Claim Types".</p>
        </div>
      )}
    </div>
  );
};
