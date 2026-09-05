from fastapi import APIRouter, HTTPException, Query, status
from typing import Optional, Dict, Any, List
from backend.services.claims_service import ClaimsService
from backend.services.evidence_service import EvidenceService
from backend.services.policy_service import PolicyService
from backend.services.review_service import ReviewService
from backend.services.escalation_service import EscalationService
from backend.models.claim import ClaimCreateRequest, DocumentAttachmentRequest, EscalationRequest

router = APIRouter(prefix="/api", tags=["claims"])

claims_service = ClaimsService()
evidence_service = EvidenceService()
policy_service = PolicyService()
review_service = ReviewService()
escalation_service = EscalationService()

# ----------------------------------------------------
# 1. GET /api/claims
# ----------------------------------------------------
@router.get("/claims")
def list_claims(
    status: Optional[str] = Query(None, description="Filter claims by status"),
    search: Optional[str] = Query(None, description="Search by claim number or policyholder")
):
    claims = claims_service.get_all(status=status, search=search)
    return {"claims": claims, "count": len(claims)}

# ----------------------------------------------------
# 2. POST /api/claims
# ----------------------------------------------------
@router.post("/claims", status_code=status.HTTP_201_CREATED)
def create_claim(payload: Dict[str, Any]):
    new_claim = claims_service.create(payload)
    return {"claim": new_claim, "message": "Claim created successfully"}

# ----------------------------------------------------
# 3. GET /api/claims/{claim_id}
# ----------------------------------------------------
@router.get("/claims/{claim_id}")
def get_claim(claim_id: str):
    claim = claims_service.get_by_id(claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail=f"Claim '{claim_id}' not found")
    return {"claim": claim}

# ----------------------------------------------------
# 4. POST /api/claims/{claim_id}/documents
# ----------------------------------------------------
@router.post("/claims/{claim_id}/documents")
def attach_document(claim_id: str, document: Dict[str, Any]):
    updated_claim = claims_service.attach_document(claim_id, document)
    if not updated_claim:
        raise HTTPException(status_code=404, detail=f"Claim '{claim_id}' not found")
    return {
        "claim": updated_claim,
        "message": f"Document '{document.get('documentType', 'document')}' successfully attached to claim {claim_id}"
    }

# ----------------------------------------------------
# 5. POST /api/claims/{claim_id}/review
# ----------------------------------------------------
@router.post("/claims/{claim_id}/review")
def review_claim(claim_id: str):
    updated_claim = review_service.execute_claim_review(claim_id)
    if not updated_claim:
        raise HTTPException(status_code=404, detail=f"Claim '{claim_id}' not found")
    return {
        "claim": updated_claim,
        "recommendation": updated_claim.get("recommendation"),
        "contradictions": updated_claim.get("contradictions"),
        "policyEvaluations": updated_claim.get("policyEvaluations"),
        "message": f"Claim {claim_id} review completed successfully"
    }

# ----------------------------------------------------
# 6. GET /api/claims/{claim_id}/evidence
# ----------------------------------------------------
@router.get("/claims/{claim_id}/evidence")
def get_claim_evidence(claim_id: str):
    claim = claims_service.get_by_id(claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail=f"Claim '{claim_id}' not found")
    
    evidence_data = evidence_service.extract_evidence(claim)
    return {
        "claimId": claim.get("id"),
        "claimNumber": claim.get("claimNumber"),
        "evidence": evidence_data
    }

# ----------------------------------------------------
# 7. GET /api/claims/{claim_id}/policy-findings
# ----------------------------------------------------
@router.get("/claims/{claim_id}/policy-findings")
def get_claim_policy_findings(claim_id: str):
    claim = claims_service.get_by_id(claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail=f"Claim '{claim_id}' not found")

    # If policyEvaluations are already saved, return them; otherwise evaluate
    evaluations = claim.get("policyEvaluations")
    if not evaluations:
        contradictions = claim.get("contradictions") or []
        findings = policy_service.evaluate_claim(claim, contradictions)
        return {
            "claimId": claim.get("id"),
            "claimNumber": claim.get("claimNumber"),
            **findings
        }

    missing_info = claim.get("missingInformation") or []
    satisfied = [e for e in evaluations if e.get("status") == "SATISFIED"]
    violated = [e for e in evaluations if e.get("status") == "VIOLATED"]
    uncertain = [e for e in evaluations if e.get("status") == "UNCERTAIN"]

    return {
        "claimId": claim.get("id"),
        "claimNumber": claim.get("claimNumber"),
        "policyEvaluations": evaluations,
        "missingInformation": missing_info,
        "summary": {
            "totalClausesEvaluated": len(evaluations),
            "satisfiedCount": len(satisfied),
            "violatedCount": len(violated),
            "uncertainCount": len(uncertain),
            "complianceStatus": "NON_COMPLIANT" if violated else ("REQUIRES_CLARIFICATION" if uncertain else "COMPLIANT")
        }
    }

# ----------------------------------------------------
# 8. POST /api/claims/{claim_id}/escalate
# ----------------------------------------------------
@router.post("/claims/{claim_id}/escalate")
def escalate_claim_post(claim_id: str, payload: Dict[str, Any]):
    updated_claim = escalation_service.process_escalation_action(claim_id, payload)
    if not updated_claim:
        raise HTTPException(status_code=404, detail=f"Claim '{claim_id}' not found")
    return {
        "claim": updated_claim,
        "message": f"Escalation details updated for claim {claim_id}"
    }

# Also support PATCH for backward-compatibility with UI
@router.patch("/claims/{claim_id}/escalate")
def escalate_claim_patch(claim_id: str, payload: Dict[str, Any]):
    return escalate_claim_post(claim_id, payload)

# ----------------------------------------------------
# Additional Helpful Endpoints
# ----------------------------------------------------
@router.get("/policy-rules")
def get_policy_rules():
    rules = policy_service.get_all_rules()
    return {"rules": rules, "count": len(rules)}

@router.post("/policy-rules/query")
def query_policy_rules(payload: Dict[str, Any]):
    query = payload.get("question") or payload.get("query", "")
    return policy_service.query_knowledge_base(query)

@router.post("/claims/reset")
def reset_claims():
    count = claims_service.reset_demo()
    return {"message": "Demo claims reset to initial statutory test scenarios", "count": count}

@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "ClaimGuard AI FastAPI Backend",
        "database": "SQLite (claimguard.db)",
        "framework": "FastAPI"
    }
