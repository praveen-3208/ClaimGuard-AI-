import React from 'react';
import { 
  FileText, 
  Wrench, 
  User, 
  Scale, 
  ExternalLink,
  Shield,
  FileCheck
} from 'lucide-react';

interface CitationBadgeProps {
  citation: string;
  onClick?: (citation: string) => void;
  size?: 'xs' | 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
  interactive?: boolean;
}

export const CitationBadge: React.FC<CitationBadgeProps> = ({
  citation,
  onClick,
  size = 'sm',
  showIcon = true,
  className = '',
  interactive = true,
}) => {
  // Normalize citation string
  const cleanCitation = citation.trim();
  const upper = cleanCitation.toUpperCase();

  // Determine source styling and icon based on requested citation formats:
  // [CLAIM_FORM: Page 2]
  // [FIR: Page 1]
  // [REPAIR_ESTIMATE: Page 3]
  // [INCIDENT_DESCRIPTION: Paragraph 2]
  // [POLICY-005]
  let badgeStyle = 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200';
  let icon = <FileText className="w-2.5 h-2.5 shrink-0" />;
  let label = cleanCitation;

  if (upper.includes('CLAIM_FORM') || upper.includes('CLAIM FORM')) {
    badgeStyle = 'bg-blue-50 text-blue-900 border-blue-300 hover:bg-blue-100 shadow-2xs';
    icon = <FileText className="w-2.5 h-2.5 text-blue-700 shrink-0" />;
  } else if (upper.includes('FIR') || upper.includes('POLICE')) {
    badgeStyle = 'bg-purple-50 text-purple-900 border-purple-300 hover:bg-purple-100 shadow-2xs';
    icon = <Shield className="w-2.5 h-2.5 text-purple-700 shrink-0" />;
  } else if (upper.includes('REPAIR_ESTIMATE') || upper.includes('REPAIR ESTIMATE') || upper.includes('ESTIMATE')) {
    badgeStyle = 'bg-amber-50 text-amber-950 border-amber-300 hover:bg-amber-100 shadow-2xs';
    icon = <Wrench className="w-2.5 h-2.5 text-amber-700 shrink-0" />;
  } else if (upper.includes('INCIDENT_DESCRIPTION') || upper.includes('CUSTOMER') || upper.includes('NARRATIVE') || upper.includes('STATEMENT')) {
    badgeStyle = 'bg-emerald-50 text-emerald-950 border-emerald-300 hover:bg-emerald-100 shadow-2xs';
    icon = <User className="w-2.5 h-2.5 text-emerald-700 shrink-0" />;
  } else if (upper.includes('POLICY-') || upper.includes('POLICY')) {
    badgeStyle = 'bg-indigo-50 text-indigo-950 border-indigo-300 hover:bg-indigo-100 shadow-2xs';
    icon = <Scale className="w-2.5 h-2.5 text-indigo-700 shrink-0" />;
  }

  const sizeClass = {
    xs: 'text-[9px] px-1.5 py-0.5 gap-1',
    sm: 'text-[10px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
  }[size];

  const handleClick = (e: React.MouseEvent) => {
    if (!interactive) return;
    e.stopPropagation();
    if (onClick) {
      onClick(cleanCitation);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={`Click to inspect evidentiary source: ${cleanCitation}`}
      className={`inline-flex items-center font-mono font-bold tracking-tight rounded border transition-all duration-150 select-none ${sizeClass} ${badgeStyle} ${
        interactive ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : 'cursor-default'
      } ${className}`}
    >
      {showIcon && icon}
      <span className="truncate">{label}</span>
      {interactive && <ExternalLink className="w-2 h-2 opacity-60 ml-0.5 shrink-0" />}
    </button>
  );
};

/**
 * Utility to parse plain text containing bracketed citations like:
 * "[CLAIM_FORM: Page 2]", "[FIR: Page 1]", "[POLICY-005]", etc.
 * and render them as interactive CitationBadge components.
 */
export const renderTextWithCitations = (
  text: string,
  onCitationClick?: (citation: string) => void
): React.ReactNode => {
  if (!text) return null;

  // Regex matches citations like [CLAIM_FORM: Page 2], [FIR: Page 1], [POLICY-005], etc.
  const citationRegex = /(\[(?:CLAIM_FORM|FIR|REPAIR_ESTIMATE|INCIDENT_DESCRIPTION|POLICY)(?:[^\]]+)?\])/gi;
  const parts = text.split(citationRegex);

  if (parts.length === 1) {
    return text;
  }

  return (
    <>
      {parts.map((part, index) => {
        if (part.match(citationRegex)) {
          return (
            <span key={index} className="inline-block mx-1 align-baseline">
              <CitationBadge citation={part} onClick={onCitationClick} size="xs" />
            </span>
          );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
};
