from typing import Dict, Any, List

def evaluate_escalation_triggers(
    claim_data: Dict[str, Any],
    contradictions: List[Dict[str, Any]],
    policy_evaluations: List[Dict[str, Any]],
    missing_info: List[Dict[str, Any]],
    confidence_score: float
) -> Dict[str, Any]:
    """
    Evaluates the 6 statutory escalation triggers:
    1. Documents contain contradictions
    2. Required evidence is missing and cannot be resolved
    3. No applicable policy clause is found
    4. Evidence is ambiguous
    5. AI confidence is low (< 75%)
    6. The claim does not match the available policy rules
    """

    # 1. Documents contain contradictions
    has_contradictions = len(contradictions) > 0
    contradiction_details = (
        ", ".join([f"{c.get('title', 'Conflict')} ({c.get('sourceA')} vs {c.get('sourceB')})" for c in contradictions])
        if has_contradictions
        else "No evidentiary discrepancies detected across submitted documents."
    )

    # 2. Required evidence is missing and cannot be resolved
    mandatory_missing = [
        m for m in missing_info
        if m.get("requirementLevel") == "MANDATORY" or "mandatory" in m.get("rationale", "").lower()
    ]
    has_missing_evidence = len(mandatory_missing) > 0
    missing_details = (
        ", ".join([m.get("fieldOrDocument", "Required Document") for m in mandatory_missing])
        if has_missing_evidence
        else "All mandatory evidentiary submissions verified."
    )

    # 3. No applicable policy clause is found
    applicable_clauses = [
        p for p in policy_evaluations if p.get("status") in ["SATISFIED", "VIOLATED", "UNCERTAIN"]
    ]
    no_applicable_clause = len(applicable_clauses) == 0
    no_clause_details = (
        "Loss event or claimed peril cannot be categorized under standard motor policy clauses."
        if no_applicable_clause
        else f"Mapped to {len(applicable_clauses)} applicable policy clauses."
    )

    # 4. Evidence is ambiguous
    uncertain_evaluations = [p for p in policy_evaluations if p.get("status") == "UNCERTAIN"]
    is_ambiguous = len(uncertain_evaluations) > 0
    ambiguous_details = (
        ", ".join([f"{p.get('clauseTitle', p.get('clauseId'))} requires clarification" for p in uncertain_evaluations])
        if is_ambiguous
        else "Evidence is clear and conclusive."
    )

    # 5. AI confidence is low (< 75%)
    is_low_confidence = confidence_score < 75.0
    confidence_details = (
        f"Confidence score ({confidence_score:.1f}%) is below statutory autonomous threshold (75%)."
        if is_low_confidence
        else f"Confidence score ({confidence_score:.1f}%) meets statutory autonomous processing standards."
    )

    # 6. Claim does not match available policy rules
    violated_evaluations = [p for p in policy_evaluations if p.get("status") == "VIOLATED"]
    does_not_match_rules = len(violated_evaluations) > 0
    rules_mismatch_details = (
        ", ".join([f"{p.get('clauseTitle', p.get('clauseId'))} breach: {p.get('reasoning')}" for p in violated_evaluations])
        if does_not_match_rules
        else "Claim complies with all verified statutory policy provisions."
    )

    requires_escalation = (
        has_contradictions
        or has_missing_evidence
        or no_applicable_clause
        or is_ambiguous
        or is_low_confidence
        or does_not_match_rules
    )

    # Determine primary reason
    if has_contradictions:
        primary_reason = "Contradictory incident dates found." if any(c.get("category") == "TIMELINE_DISCREPANCY" for c in contradictions) else f"Document contradictions flagged: {contradictions[0].get('title')}."
    elif has_missing_evidence:
        primary_reason = f"Required evidence missing: {mandatory_missing[0].get('fieldOrDocument')}."
    elif does_not_match_rules:
        primary_reason = f"Policy rule violation: {violated_evaluations[0].get('clauseTitle')}."
    elif is_low_confidence:
        primary_reason = f"Low algorithmic confidence score ({confidence_score:.1f}%)."
    elif is_ambiguous:
        primary_reason = f"Evidentiary ambiguity: {uncertain_evaluations[0].get('clauseTitle')}."
    elif no_applicable_clause:
        primary_reason = "Unmapped peril: No applicable motor policy clause found."
    else:
        primary_reason = "Routine audit verification."

    # Build What is Known
    what_is_known = []
    cf = claim_data.get("claimForm", {}) or {}
    fir = claim_data.get("repairEstimateOrFIR", {}) or {}
    if cf.get("dateOfLoss"):
        what_is_known.append(f"Claim Form: {cf.get('dateOfLoss')} [CLAIM_FORM: Page 2]")
    if fir.get("dateOfIssue"):
        doc_label = "FIR" if fir.get("documentType") == "fir" else "Repair Estimate"
        what_is_known.append(f"{doc_label}: {fir.get('dateOfIssue')} [{doc_label.upper()}: Page 1]")

    # Build What is Unknown
    what_is_unknown = []
    if has_contradictions:
        if any(c.get("category") == "TIMELINE_DISCREPANCY" for c in contradictions):
            what_is_unknown.append("Correct incident date")
        else:
            what_is_unknown.append(f"Factual reconciliation for {contradictions[0].get('title')}")
    elif has_missing_evidence:
        what_is_unknown.extend([m.get("fieldOrDocument") for m in mandatory_missing])
    elif uncertain_evaluations:
        what_is_unknown.extend([f"Verification of {u.get('clauseTitle')} ({u.get('clauseId')})" for u in uncertain_evaluations])
    else:
        what_is_unknown.append("Final settlement disbursement clearance")

    # Documents reviewed
    documents_reviewed = ["Claim Form", "Repair Estimate" if fir.get("documentType") != "fir" else "FIR", "Incident Description"]

    # Policy clauses reviewed
    clauses_reviewed = [
        {"clauseId": p.get("clauseId"), "clauseTitle": p.get("clauseTitle"), "status": p.get("status")}
        for p in policy_evaluations
    ]

    triggers_breakdown = [
        {
            "trigger": "Documents contain contradictions",
            "triggered": has_contradictions,
            "details": contradiction_details,
            "severity": "CRITICAL" if has_contradictions else "LOW"
        },
        {
            "trigger": "Required evidence is missing and cannot be resolved",
            "triggered": has_missing_evidence,
            "details": missing_details,
            "severity": "HIGH" if has_missing_evidence else "LOW"
        },
        {
            "trigger": "No applicable policy clause is found",
            "triggered": no_applicable_clause,
            "details": no_clause_details,
            "severity": "HIGH" if no_applicable_clause else "LOW"
        },
        {
            "trigger": "Evidence is ambiguous",
            "triggered": is_ambiguous,
            "details": ambiguous_details,
            "severity": "MEDIUM" if is_ambiguous else "LOW"
        },
        {
            "trigger": "AI confidence is low",
            "triggered": is_low_confidence,
            "details": confidence_details,
            "severity": "MEDIUM" if is_low_confidence else "LOW"
        },
        {
            "trigger": "The claim does not match the available policy rules",
            "triggered": does_not_match_rules,
            "details": rules_mismatch_details,
            "severity": "CRITICAL" if does_not_match_rules else "LOW"
        }
    ]

    return {
        "requiresHumanEscalation": requires_escalation,
        "escalationReason": primary_reason,
        "escalationSeverity": "HIGH" if (has_contradictions or does_not_match_rules) else ("MEDIUM" if is_low_confidence else "LOW"),
        "whatIsKnown": what_is_known,
        "whatIsUnknown": what_is_unknown,
        "documentsReviewed": documents_reviewed,
        "policyClausesReviewed": clauses_reviewed,
        "triggersBreakdown": triggers_breakdown
    }
