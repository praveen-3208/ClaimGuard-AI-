from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field

class DamageItem(BaseModel):
    part: str
    action: str  # 'REPLACE' | 'REPAIR' | 'PAINT'
    partsCost: float = 0.0
    laborCost: float = 0.0
    totalCost: float = 0.0
    isExcluded: Optional[bool] = False
    exclusionReason: Optional[str] = None
    citation: Optional[str] = None

class ClaimFormModel(BaseModel):
    claimNumber: str = ""
    policyNumber: str = ""
    policyType: str = "Comprehensive Motor Policy"
    insuredName: str = ""
    vehicleMakeModel: str = ""
    licensePlate: str = ""
    dateOfLoss: str = ""
    lossLocation: str = ""
    incidentDescription: str = ""
    claimedAmount: float = 0.0
    isSigned: bool = True
    rawText: Optional[str] = ""
    citations: Optional[List[str]] = []

class RepairEstimateOrFIRModel(BaseModel):
    documentType: str = "repair_estimate"  # 'repair_estimate' | 'fir'
    documentNumber: str = ""
    issuingAuthority: str = ""
    dateOfIssue: str = ""
    totalEstimatedCost: float = 0.0
    damageItems: Optional[List[DamageItem]] = []
    officerBadgeOrSurveyorLicense: Optional[str] = ""
    findingsSummary: Optional[str] = ""
    rawText: Optional[str] = ""
    citations: Optional[List[str]] = []

class CustomerStatementModel(BaseModel):
    submissionChannel: str = "Digital Portal"
    reportedDate: str = ""
    incidentNarrative: str = ""
    driverName: str = ""
    declaredSpeed: Optional[str] = ""
    passengers: Optional[str] = ""
    weatherConditions: Optional[str] = ""
    rawText: Optional[str] = ""
    citations: Optional[List[str]] = []

class CrossDocumentComparisonItem(BaseModel):
    field: str
    claimFormValue: str
    crossCheckValue: str
    isConsistent: bool
    sourceBCitation: str
    notes: str
    confidence: float = 95.0

class ContradictionItem(BaseModel):
    id: str
    title: str
    sourceA: str
    valueA: str
    citationA: str
    sourceB: str
    valueB: str
    citationB: str
    impact: str
    suggestedResolution: str
    severity: str = "CRITICAL"  # 'CRITICAL' | 'HIGH' | 'MEDIUM'
    category: str = "TIMELINE_DISCREPANCY"

class PolicyEvaluationResult(BaseModel):
    clauseId: str
    clauseTitle: str
    relevantPolicyText: str
    evidenceSupportingFinding: str
    status: str  # 'SATISFIED' | 'VIOLATED' | 'UNCERTAIN' | 'NOT_APPLICABLE'
    evidenceQuote: Optional[str] = ""
    reasoning: str
    financialImpact: str
    confidence: Optional[float] = 95.0

class MissingInformationItem(BaseModel):
    id: str
    fieldOrDocument: str
    sourceDocument: str
    rationale: str
    recommendedAction: str
    requirementLevel: str = "MANDATORY"  # 'MANDATORY' | 'CONDITIONAL' | 'OPTIONAL'

class CalculationBreakdown(BaseModel):
    baseClaimAmount: float = 0.0
    laborTotal: float = 0.0
    partsTotal: float = 0.0
    deductibleApplied: float = 0.0
    deductibleReason: str = ""
    depreciationRatePercent: float = 0.0
    depreciationAmount: float = 0.0
    salvageAllowance: float = 0.0
    statutoryTax: float = 0.0
    netPayableSettlement: float = 0.0
    isFullLoss: bool = False

class ClaimRecommendation(BaseModel):
    decision: str  # 'APPROVE' | 'REJECT' | 'REQUEST INFORMATION' | 'ESCALATE'
    confidenceScore: float = 85.0
    requiresHumanEscalation: bool = False
    escalationSeverity: str = "LOW"  # 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    escalationReason: str = ""
    summaryRationale: str = ""
    suggestedSettlementEstimate: float = 0.0
    deductionsCalculated: float = 0.0
    calculationBreakdown: Optional[CalculationBreakdown] = None
    nextSteps: Optional[List[str]] = []

class AuditLogEntry(BaseModel):
    id: str
    timestamp: str
    actor: str
    action: str
    note: str

class ClaimRecordModel(BaseModel):
    id: str
    claimNumber: str
    createdAt: str
    updatedAt: str
    status: str = "Pending Review"
    assignedInvestigator: Optional[str] = None
    investigatorNotes: Optional[str] = None
    investigatorDecision: Optional[str] = None
    decisionDate: Optional[str] = None
    claimForm: Optional[ClaimFormModel] = None
    repairEstimateOrFIR: Optional[RepairEstimateOrFIRModel] = None
    customerStatement: Optional[CustomerStatementModel] = None
    extractedEntities: Optional[Dict[str, str]] = {}
    comparisonMatrix: Optional[List[CrossDocumentComparisonItem]] = []
    contradictions: Optional[List[ContradictionItem]] = []
    policyEvaluations: Optional[List[PolicyEvaluationResult]] = []
    missingInformation: Optional[List[MissingInformationItem]] = []
    recommendation: Optional[ClaimRecommendation] = None
    aiEvidenceReview: Optional[Dict[str, Any]] = None
    auditLog: Optional[List[AuditLogEntry]] = []

class ClaimCreateRequest(BaseModel):
    insuredName: Optional[str] = "Insured Customer"
    policyNumber: Optional[str] = "APX-CAR-994020-C"
    policyType: Optional[str] = "Comprehensive Motor Policy"
    vehicleMakeModel: Optional[str] = "2024 Honda Civic"
    licensePlate: Optional[str] = "7XYZ890"
    dateOfLoss: Optional[str] = "2026-08-30"
    lossLocation: Optional[str] = "Downtown Intersection"
    incidentDescription: Optional[str] = "Vehicle struck while stationary at traffic light."
    claimedAmount: Optional[float] = 4250.0
    claimForm: Optional[ClaimFormModel] = None
    repairEstimateOrFIR: Optional[RepairEstimateOrFIRModel] = None
    customerStatement: Optional[CustomerStatementModel] = None

class DocumentAttachmentRequest(BaseModel):
    documentType: str  # 'claim_form' | 'repair_estimate' | 'fir' | 'customer_statement' | 'other'
    documentNumber: Optional[str] = ""
    issuingAuthority: Optional[str] = ""
    dateOfIssue: Optional[str] = ""
    totalEstimatedCost: Optional[float] = 0.0
    damageItems: Optional[List[DamageItem]] = []
    rawText: Optional[str] = ""
    metadata: Optional[Dict[str, Any]] = {}

class EscalationRequest(BaseModel):
    status: Optional[str] = None
    assignedInvestigator: Optional[str] = None
    investigatorNotes: Optional[str] = None
    investigatorDecision: Optional[str] = None
    actor: Optional[str] = "Claims Adjudicator"
    actionNote: Optional[str] = None
    priority: Optional[str] = "URGENT"
    brief: Optional[str] = None
