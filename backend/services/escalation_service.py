import datetime
import random
from typing import Dict, Any, Optional
from backend.rules.escalation_rules import evaluate_escalation_triggers
from backend.models.database import get_claim_by_id, save_claim

class EscalationService:
    @staticmethod
    def evaluate_escalation(claim_data: Dict[str, Any]) -> Dict[str, Any]:
        contradictions = claim_data.get("contradictions", []) or []
        policy_evaluations = claim_data.get("policyEvaluations", []) or []
        missing_info = claim_data.get("missingInformation", []) or []
        rec = claim_data.get("recommendation", {}) or {}
        confidence = float(rec.get("confidenceScore", 80.0))

        return evaluate_escalation_triggers(
            claim_data=claim_data,
            contradictions=contradictions,
            policy_evaluations=policy_evaluations,
            missing_info=missing_info,
            confidence_score=confidence
        )

    @staticmethod
    def process_escalation_action(claim_id: str, action_payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        claim = get_claim_by_id(claim_id)
        if not claim:
            return None

        now_iso = datetime.datetime.utcnow().isoformat() + "Z"
        status = action_payload.get("status")
        assigned_investigator = action_payload.get("assignedInvestigator")
        investigator_notes = action_payload.get("investigatorNotes")
        investigator_decision = action_payload.get("investigatorDecision")
        actor = action_payload.get("actor", "Claims Investigator")
        action_note = action_payload.get("actionNote") or investigator_notes or "Updated via Human Escalation Console"

        if status:
            claim["status"] = status
        if assigned_investigator is not None:
            claim["assignedInvestigator"] = assigned_investigator
        if investigator_notes is not None:
            claim["investigatorNotes"] = investigator_notes
        if investigator_decision is not None:
            claim["investigatorDecision"] = investigator_decision
            claim["decisionDate"] = now_iso

        claim["updatedAt"] = now_iso

        # Append entry to audit trail
        audit_log = claim.setdefault("auditLog", [])
        action_title = (
            f"Decision Recorded: {investigator_decision}"
            if investigator_decision
            else (f"Assigned to {assigned_investigator}" if assigned_investigator else "Status / Note Updated")
        )
        audit_log.append({
            "id": f"aud-{random.randint(1000, 9999)}",
            "timestamp": now_iso,
            "actor": actor,
            "action": action_title,
            "note": action_note
        })

        return save_claim(claim)
