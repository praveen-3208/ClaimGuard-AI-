export type VehicleCategory = 'car' | 'two_wheeler';

export type RecommendationDecision = 'APPROVE' | 'REJECT' | 'REQUEST INFORMATION' | 'ESCALATE';

export type EscalationSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

export type ClaimStatus = 
  | 'Under AI Review'
  | 'Pending Investigator Review'
  | 'Escalated to Senior Investigator'
  | 'Approved by Investigator'
  | 'Repudiated by Investigator'
  | 'Repudiated / Rejected'
  | 'Information Requested'
  | 'Pending Information Request'
  | 'Under Field Investigation'
  | 'In Escalation Queue'
  | string;

export type ContradictionSeverity = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'MEDIUM' | 'MINOR';

export type ContradictionCategory = 
  | 'DAMAGE_MISMATCH'
  | 'TIMELINE_DISCREPANCY'
  | 'DRIVER_ISSUE'
  | 'LOCATION_INCONSISTENCY'
  | 'POLICY_BREACH'
  | 'ESTIMATE_INFLATION'
  | string;

export interface ClaimFormInput {
  claimNumber: string;
  policyNumber: string;
  policyType: 'Comprehensive' | 'Comprehensive + Zero Dep' | 'Third Party Only' | 'Comprehensive + Engine Protect' | string;
  insuredName: string;
  contactNumber: string;
  email?: string;
  vehicleCategory: VehicleCategory;
  vehicleRegistrationNumber: string;
  vehicleMakeModel: string;
  vehicleManufacturingYear?: number;
  dateOfLoss: string;
  timeOfLoss: string;
  placeOfLoss: string;
  driverName: string;
  driverRelationship: 'Self' | 'Employed Driver' | 'Family Member' | 'Third Party / Friend' | string;
  driverLicenseNumber: string;
  licenseValidityDate?: string;
  driverLicenseExpiry?: string;
  incidentSummary: string;
  claimedAmount: number;
  claimType?: 'Accident' | 'Theft';
  insuredValue?: number;
  thirdPartyInvolved?: boolean;
  policeReportFiled?: boolean;
}

export interface RepairEstimateDamageItem {
  partName: string;
  materialType?: 'Metal' | 'Plastic' | 'Fibre Glass' | 'Rubber' | 'Glass' | 'Labour' | string;
  cost: number;
  isRepairOrReplace?: 'Repair' | 'Replace' | string;
  remarks?: string;
  isLabor?: boolean;
}

export interface RepairEstimateOrFIRInput {
  documentType: 'repair_estimate' | 'fir' | 'estimate';
  documentRefNumber?: string;
  documentNumber?: string;
  documentDate?: string;
  dateOfIssue?: string;
  issuingAuthority: string; // e.g. "Apex Certified Bodyworks & Service" or "North District Police Station"
  totalEstimateAmount?: number;
  totalEstimatedCost?: number;
  damageItems?: RepairEstimateDamageItem[];
  policeFIRDetails?: {
    firNumber: string;
    policeStation: string;
    sectionsInvoked: string[] | string;
    investigatingOfficer?: string;
    officerName?: string;
    officerBadgeNumber?: string;
    allegedCause: string;
    thirdPartyCasualties?: boolean;
    vehicleImpounded?: boolean;
  };
  narrativeOrInspectionRemarks: string;
}

export interface CustomerIncidentDescriptionInput {
  narrativeText: string;
  submissionDate?: string;
  incidentTimestamp?: string;
  locationDescription?: string;
  weatherConditions: string;
  estimatedSpeedKmh?: number;
  estimatedSpeedKmH?: number;
  thirdPartyInvolved: boolean;
  thirdPartyDetails?: string;
  passengerCount?: number;
  vehicleUsageAtTime: 'Personal / Commute' | 'Commercial Delivery' | 'Rental' | 'Other' | 'personal' | 'commercial_delivery' | string;
  delayedReportingReason?: string;
}

export type ApplicableClaimType = 'Accident' | 'Theft' | 'Both';

export interface PolicyClause {
  clauseId: string; // e.g. "POLICY-001"
  title: string; // e.g. "Accident Coverage"
  policyText: string; // Statutory / contract rule text
  applicableClaimType: ApplicableClaimType;
  conditions: string[];
  evidenceRequired: string;
  category?: 'Coverage' | 'Theft' | 'Exclusion' | 'Valuation' | 'Notification' | 'Documentation' | 'Repair Standards' | 'Police & FIR' | 'Add-on Cover' | 'Deductible' | 'Depreciation' | 'Mandatory Condition';
  description?: string; // fallback alias to policyText
  standardDeductionOrRule?: string; // fallback alias
  appliesTo?: 'Both' | 'Car' | 'Two-Wheeler';
  riskWeight?: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface Contradiction {
  id: string;
  title: string;
  severity: ContradictionSeverity;
  category: ContradictionCategory;
  sourceA: string;
  quoteA: string;
  sourceB: string;
  quoteB: string;
  analysisRationale: string;
  suggestedInvestigatorAction: string;
  citationA?: string; // e.g. "[CLAIM_FORM: Page 2]"
  citationB?: string; // e.g. "[FIR: Page 1]"
  valueA?: string; // e.g. "Incident Date: 12/08/2026"
  valueB?: string; // e.g. "Incident Date: 13/08/2026"
  status?: 'CONTRADICTION' | 'INCONSISTENCY' | string;
}

export type CitationSourceType = 
  | 'CLAIM_FORM'
  | 'FIR'
  | 'REPAIR_ESTIMATE'
  | 'INCIDENT_DESCRIPTION'
  | 'POLICY';

export interface EvidenceCitationItem {
  id: string;
  citation: string; // e.g. "[CLAIM_FORM: Page 2]", "[FIR: Page 1]", "[POLICY-005]"
  sourceType: CitationSourceType;
  sourceDocumentName: string; // e.g. "Motor Claim Form", "First Information Report (FIR)"
  locator: string; // e.g. "Page 2", "Page 1", "Paragraph 2"
  extractedValue?: string;
  quoteText?: string;
  findingTitle?: string;
  contextNotes?: string;
}

export interface EvidencePanelData {
  finding: string; // e.g. "Incident date mismatch"
  sourceA: {
    name: string; // e.g. "Claim Form"
    label: string; // e.g. "Claim Form — Incident Date: 12/08/2026"
    citation: string; // e.g. "[CLAIM_FORM: Page 2]"
    field?: string;
    value: string; // e.g. "12/08/2026"
    quote?: string;
    pageOrSection?: string;
  };
  sourceB?: {
    name: string; // e.g. "FIR"
    label: string; // e.g. "FIR — Incident Date: 13/08/2026"
    citation: string; // e.g. "[FIR: Page 1]"
    field?: string;
    value: string; // e.g. "13/08/2026"
    quote?: string;
    pageOrSection?: string;
  };
  status: 'CONTRADICTION' | 'CONSISTENT' | 'COMPLIANT' | 'VIOLATED' | 'UNCERTAIN' | 'MISSING_INFO' | string;
  conflictAnalysis?: string;
  recommendedAction?: string;
}

export interface MissingInformationItem {
  id: string;
  fieldOrDocument: string;
  requirementLevel: 'MANDATORY' | 'RECOMMENDED';
  rationale: string;
  resolutionAction: string;
}

export interface PolicyRuleEvaluation {
  clauseId: string;
  clauseTitle: string;
  relevantPolicyText?: string;
  evidenceSupportingFinding?: string;
  status: 'COMPLIANT' | 'VIOLATED' | 'UNCERTAIN' | 'NOT_APPLICABLE';
  evidenceQuote: string;
  reasoning: string;
  financialImpact?: string;
}

export interface ComparisonPoint {
  attribute: string;
  claimFormValue: string;
  estimateOrFIRValue: string;
  customerStatementValue: string;
  isConsistent: boolean;
  notes: string;
}

export interface PolicyFindingBasis {
  clauseId: string;
  clauseTitle: string;
  relevantPolicyText: string;
  evidenceSupportingFinding: string;
  verdict?: 'COMPLIANT' | 'VIOLATED' | 'UNCERTAIN';
}

export interface ClaimRecommendation {
  decision: RecommendationDecision;
  confidenceScore: number; // 0 - 100
  requiresHumanEscalation: boolean;
  escalationSeverity: EscalationSeverity;
  escalationReason: string;
  summaryRationale: string;
  suggestedSettlementEstimate?: number;
  deductionsCalculated?: number;
  recommendedActionPlan: string[];
  policyBasis?: PolicyFindingBasis[];
}

export interface ExtractedClaimEntities {
  insuredName: string;
  vehicleNumber: string;
  vehicleCategory: VehicleCategory;
  vehicleMakeModel: string;
  dateOfLoss: string;
  timeOfLoss: string;
  placeOfLoss: string;
  driverName: string;
  driverLicenseNumber: string;
  primaryImpactZone: string;
  totalDamageClaimed: number;
  totalEstimateAmount: number;
  firFiled: boolean;
  hasZeroDepreciation: boolean;
}

export interface AIEvidenceReviewFinding {
  attribute?: string;
  item?: string;
  issue?: string;
  clause_id?: string;
  clause_title?: string;
  severity?: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'MINOR' | string;
  finding: string;
  evidence_reference: string;
  status?: string;
}

export interface AIEvidenceItem {
  source_document: 'Claim Form' | 'Repair Estimate or FIR' | 'Customer Incident Description' | 'Policy Clauses' | string;
  quote_or_datapoint: string;
  context?: string;
}

export type AIWorkflowRecommendation = 'APPROVE' | 'REJECT' | 'REQUEST INFORMATION' | 'ESCALATE';

export interface AIEvidenceReviewWorkflowResponse {
  claim_summary: string;
  document_completeness: string;
  consistency_findings: AIEvidenceReviewFinding[];
  policy_findings: AIEvidenceReviewFinding[];
  missing_information: AIEvidenceReviewFinding[];
  contradictions: AIEvidenceReviewFinding[];
  recommendation: AIWorkflowRecommendation;
  confidence: string;
  escalation_required: boolean;
  evidence: AIEvidenceItem[];
}

export interface ClaimRecord {
  id: string;
  claimNumber: string;
  createdAt: string;
  updatedAt: string;
  status: ClaimStatus;
  assignedInvestigator?: string;
  investigatorNotes?: string;
  investigatorDecision?: 'APPROVE' | 'REJECT' | 'REQUEST_INFO' | 'SPECIAL_INVESTIGATION';
  decisionDate?: string;
  
  // Inputs
  claimForm: ClaimFormInput;
  repairEstimateOrFIR: RepairEstimateOrFIRInput;
  customerStatement: CustomerIncidentDescriptionInput;
  
  // AI Outputs
  extractedEntities: ExtractedClaimEntities;
  comparisonMatrix: ComparisonPoint[];
  contradictions: Contradiction[];
  missingInformation: MissingInformationItem[];
  policyEvaluations: PolicyRuleEvaluation[];
  recommendation: ClaimRecommendation;
  
  // Dedicated Structured AI Evidence Review Workflow Result
  aiEvidenceReview?: AIEvidenceReviewWorkflowResponse;

  // Escalation & Review State
  escalationStatus?: {
    reviewStage?: 'UNASSIGNED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | string;
    status?: string;
    assignedTo?: string;
    resolvedAt?: string;
  };
  
  // Audit Trail
  auditLog: {
    id: string;
    timestamp: string;
    actor: string;
    action: string;
    note?: string;
  }[];
}
