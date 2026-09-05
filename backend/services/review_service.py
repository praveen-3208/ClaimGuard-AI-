import datetime
import random
from typing import Dict, Any, Optional
from backend.services.evidence_service import EvidenceService
from backend.services.policy_service import PolicyService
from backend.rules.escalation_rules import evaluate_escalation_triggers
from backend.models.database import get_claim_by_id, save_claim

class ReviewService:
    def __init__(self):
        self.evidence_service = EvidenceService()
        self.policy_service = PolicyService()

    def execute_claim_review(self, claim_id: str) -> Optional[Dict[str, Any]]:
        claim = get_claim_by_id(claim_id)
        if not claim:
            return None

        # 1. Evidence Extraction & Contradiction Detection
        evidence_result = self.evidence_service.extract_evidence(claim)
        contradictions = evidence_result["contradictions"]
        comparison_matrix = evidence_result["comparisonMatrix"]
        extracted_entities = evidence_result["extractedEntities"]

        # 2. Policy Rule Evaluation
        policy_result = self.policy_service.evaluate_claim(claim, contradictions)
        policy_evaluations = policy_result["policyEvaluations"]
        missing_info = policy_result["missingInformation"]

        # 3. Financial Calculation
        claimed_amount = float(claim.get("claimForm", {}).get("claimedAmount", 0.0))
        if claimed_amount == 0.0:
            claimed_amount = float(claim.get("repairEstimateOrFIR", {}).get("totalEstimatedCost", 4250.0))

        # Check deductible
        compulsory_deductible = 1000.0  # standard $1,000 / ₹1,000 for private cars
        depreciation_rate = 0.0
        depreciation_amount = 0.0
        salvage_allowance = 0.0

        net_payable = max(0.0, claimed_amount - compulsory_deductible - depreciation_amount)

        # 4. Confidence Score Calculation
        confidence = 98.0
        if contradictions:
            confidence -= (len(contradictions) * 20.0)
        if missing_info:
            confidence -= (len(missing_info) * 10.0)
        violated = [p for p in policy_evaluations if p["status"] == "VIOLATED"]
        uncertain = [p for p in policy_evaluations if p["status"] == "UNCERTAIN"]
        if violated:
            confidence -= 15.0
        if uncertain:
            confidence -= 10.0
        confidence = max(25.0, min(99.0, confidence))

        # 5. Escalation Trigger Evaluation
        escalation_result = evaluate_escalation_triggers(
            claim_data=claim,
            contradictions=contradictions,
            policy_evaluations=policy_evaluations,
            missing_info=missing_info,
            confidence_score=confidence
        )

        # 6. Recommendation Decision
        if escalation_result["requiresHumanEscalation"] or contradictions:
            decision = "ESCALATE"
            status = "In Escalation Queue"
            summary_rationale = (
                f"Contradictory incident dates found across sworn Claim Form and Police FIR. Human investigator review required under statutory guidelines."
                if any(c.get("category") == "TIMELINE_DISCREPANCY" for c in contradictions)
                else f"Escalation required: {escalation_result['escalationReason']}"
            )
            suggested_settlement = 0.0
        elif violated:
            decision = "REJECT"
            status = "Rejected"
            summary_rationale = f"Claim repudiated due to policy rule breach: {violated[0]['clauseTitle']}."
            suggested_settlement = 0.0
        elif missing_info:
            decision = "REQUEST INFORMATION"
            status = "Pending Information"
            summary_rationale = f"Mandatory evidence missing: {missing_info[0]['fieldOrDocument']}."
            suggested_settlement = 0.0
        else:
            decision = "APPROVE"
            status = "Approved"
            summary_rationale = "All statutory policy rules and documentary requirements satisfied without discrepancies."
            suggested_settlement = net_payable

        recommendation = {
            "decision": decision,
            "confidenceScore": round(confidence, 1),
            "requiresHumanEscalation": escalation_result["requiresHumanEscalation"],
            "escalationSeverity": escalation_result["escalationSeverity"],
            "escalationReason": escalation_result["escalationReason"],
            "summaryRationale": summary_rationale,
            "suggestedSettlementEstimate": suggested_settlement,
            "deductionsCalculated": compulsory_deductible + depreciation_amount,
            "calculationBreakdown": {
                "baseClaimAmount": claimed_amount,
                "laborTotal": claimed_amount * 0.35,
                "partsTotal": claimed_amount * 0.65,
                "deductibleApplied": compulsory_deductible,
                "deductibleReason": "Compulsory Policy Excess (POLICY-004)",
                "depreciationRatePercent": depreciation_rate,
                "depreciationAmount": depreciation_amount,
                "salvageAllowance": salvage_allowance,
                "statutoryTax": 0.0,
                "netPayableSettlement": suggested_settlement,
                "isFullLoss": False
            },
            "nextSteps": [
                "Investigator review dispatched to SIU" if decision == "ESCALATE" else "Disburse authorized indemnity"
            ]
        }

        # 7. Update Claim in SQLite
        now_iso = datetime.datetime.utcnow().isoformat() + "Z"
        claim["status"] = status
        claim["updatedAt"] = now_iso
        claim["extractedEntities"] = extracted_entities
        claim["comparisonMatrix"] = comparison_matrix
        claim["contradictions"] = contradictions
        claim["policyEvaluations"] = policy_evaluations
        claim["missingInformation"] = missing_info
        claim["recommendation"] = recommendation
        claim["escalationDossier"] = escalation_result

        # Audit Log
        claim.setdefault("auditLog", []).append({
            "id": f"aud-{random.randint(1000, 9999)}",
            "timestamp": now_iso,
            "actor": "Statutory Review Engine",
            "action": f"Review Completed: {decision}",
            "note": summary_rationale
        })

        return save_claim(claim)
