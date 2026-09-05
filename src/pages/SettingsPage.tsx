import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  ShieldCheck, 
  User, 
  Sliders, 
  RotateCcw, 
  FileCheck2, 
  Check, 
  Save, 
  Building2, 
  AlertTriangle,
  BadgeAlert
} from 'lucide-react';

interface SettingsPageProps {
  onResetDemoData: () => void;
  onNavigate: (tab: any) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onResetDemoData,
  onNavigate,
}) => {
  const [savedSuccess, setSavedSuccess] = useState(false);
  
  // Settings state
  const [investigatorName, setInvestigatorName] = useState('Marcus Vance');
  const [badgeId, setBadgeId] = useState('#IV-4809');
  const [department, setDepartment] = useState('Special Investigation Unit (SIU) - Motor Claims');
  const [confidenceThreshold, setConfidenceThreshold] = useState(85);
  const [requireFIRForThirdParty, setRequireFIRForThirdParty] = useState(true);
  const [requireDLMandatory, setRequireDLMandatory] = useState(true);
  const [autoFlagPartRust, setAutoFlagPartRust] = useState(true);
  const [highSpeedDeltaThresholdKmh, setHighSpeedDeltaThresholdKmh] = useState(25);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header */}
      <div className="h-12 flex items-center justify-between bg-white px-4 border border-slate-200 rounded shadow-xs">
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-4 h-4 text-blue-600" />
          <h1 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            SIU Investigation Settings & Thresholds
          </h1>
          <span className="h-4 w-[1px] bg-slate-200 mx-1 hidden sm:inline"></span>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest hidden sm:inline">
            Investigator Workspace Config
          </span>
        </div>

        <button
          onClick={() => onNavigate('dashboard')}
          className="text-xs text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
        >
          ← Return to Dashboard
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">Investigation parameters saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Left Column: Investigator Identity */}
        <div className="bg-white rounded border border-slate-200 shadow-xs p-4 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <User className="w-4 h-4 text-slate-700" />
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase">Investigator Profile & Signature</h2>
              <span className="text-[10px] text-slate-400">Attached to all forensic claim review reports</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                Investigator Full Name
              </label>
              <input
                type="text"
                value={investigatorName}
                onChange={e => setInvestigatorName(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-slate-200 text-xs font-semibold focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  SIU Badge / License ID
                </label>
                <input
                  type="text"
                  value={badgeId}
                  onChange={e => setBadgeId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200 text-xs font-mono font-bold focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Jurisdiction Authority
                </label>
                <input
                  type="text"
                  readOnly
                  value="IRDAI / ACFE Certified"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-slate-50 text-slate-600 text-xs font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                Department / Claims Bureau
              </label>
              <input
                type="text"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-slate-200 text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Digital Signature Stamp Preview</span>
              <p className="font-mono text-xs font-semibold text-slate-800">
                Digitally reviewed by {investigatorName} ({badgeId})
              </p>
              <p className="text-[10px] text-slate-400">
                Timestamp: UTC Standard • SIU Automated Grounding Engine Verified
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Triangulation Thresholds */}
        <div className="bg-white rounded border border-slate-200 shadow-xs p-4 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Sliders className="w-4 h-4 text-slate-700" />
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase">Triangulation & Discrepancy Thresholds</h2>
              <span className="text-[10px] text-slate-400">Automated rules governing evidence review</span>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold uppercase text-slate-500">
                  AI Decision Confidence Threshold
                </label>
                <span className="font-mono font-bold text-blue-600 text-xs">{confidenceThreshold}%</span>
              </div>
              <input
                type="range"
                min={60}
                max={99}
                value={confidenceThreshold}
                onChange={e => setConfidenceThreshold(Number(e.target.value))}
                className="w-full cursor-pointer accent-blue-600"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Claims with confidence score below {confidenceThreshold}% are automatically routed to human escalation.
              </span>
            </div>

            <div className="space-y-2 pt-1 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireFIRForThirdParty}
                  onChange={e => setRequireFIRForThirdParty(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-slate-800">
                  Mandatory Police FIR for Third-Party Injury / Fatality claims (POL-CND-301)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireDLMandatory}
                  onChange={e => setRequireDLMandatory(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-slate-800">
                  Flag missing Driver License as CRITICAL Missing Evidence
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoFlagPartRust}
                  onChange={e => setAutoFlagPartRust(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-slate-800">
                  Auto-flag pre-existing oxidation/corrosion on workshop replacement parts
                </span>
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded shadow-xs cursor-pointer transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Configuration</span>
              </button>
            </div>
          </div>
        </div>

        {/* Full Width Reset & Data Management Card */}
        <div className="lg:col-span-2 bg-white rounded border border-slate-200 shadow-xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase">Test Data Management</h3>
            <p className="text-[11px] text-slate-500">
              Restore the default motor claims dataset (sedan frontal/rear contradiction, clean motorcycle skid, commercial delivery breach, and unlicensed scooter).
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              onResetDemoData();
              setSavedSuccess(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
            <span>Reset All Scenarios</span>
          </button>
        </div>

      </form>
    </div>
  );
};
