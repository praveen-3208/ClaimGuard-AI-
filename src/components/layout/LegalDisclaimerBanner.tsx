import React, { useState } from 'react';
import { ShieldAlert, Info, X } from 'lucide-react';

export const LegalDisclaimerBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-amber-50/90 border-b border-amber-200/90 px-3 sm:px-5 lg:px-6 py-1.5 text-[11px] text-amber-950 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-0.5 bg-amber-200/70 rounded text-amber-800 shrink-0">
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
          <p className="leading-tight truncate sm:whitespace-normal">
            <span className="font-bold text-amber-950 uppercase tracking-wider text-[10px] mr-1">Statutory Notice:</span>
            Evidence-review assistant for licensed adjusters only. Does <span className="underline font-semibold decoration-amber-500">not</span> render automated legal repudiations or binding verdicts.
          </p>
        </div>
        <button 
          onClick={() => setDismissed(true)} 
          className="text-amber-800 hover:text-amber-950 hover:bg-amber-200/60 p-0.5 rounded transition-colors shrink-0 cursor-pointer"
          title="Dismiss notification"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
