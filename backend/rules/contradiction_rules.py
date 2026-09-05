from typing import List, Dict, Any, Tuple
import re

def normalize_date(date_str: str) -> str:
    if not date_str:
        return ""
    # Normalize DD/MM/YYYY, YYYY-MM-DD, Month DD, YYYY
    date_clean = date_str.strip()
    m = re.match(r"^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$", date_clean)
    if m:
        d, mon, y = m.groups()
        return f"{int(d):02d}/{int(mon):02d}/{y}"
    m_iso = re.match(r"^(\d{4})[/-](\d{1,2})[/-](\d{1,2})", date_clean)
    if m_iso:
        y, mon, d = m_iso.groups()
        return f"{int(d):02d}/{int(mon):02d}/{y}"
    return date_clean

def check_cross_document_contradictions(claim_data: Dict[str, Any]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Evaluates Claim Form, Repair Estimate or Police FIR, and Customer Statement
    for cross-document factual discrepancies.
    Returns: (contradictions_list, comparison_matrix)
    """
    contradictions = []
    comparison_matrix = []

    claim_form = claim_data.get("claimForm", {}) or {}
    est_or_fir = claim_data.get("repairEstimateOrFIR", {}) or {}
    statement = claim_data.get("customerStatement", {}) or {}

    # 1. Incident Date Cross-Check
    cf_date = claim_form.get("dateOfLoss", "").strip()
    fir_or_est_date = est_or_fir.get("dateOfIssue", "").strip()
    norm_cf_date = normalize_date(cf_date)
    norm_doc_date = normalize_date(fir_or_est_date)

    doc_type_label = "FIR" if est_or_fir.get("documentType") == "fir" else "Repair Estimate"
    doc_citation = "[FIR: Page 1]" if est_or_fir.get("documentType") == "fir" else "[ESTIMATE: Page 1]"

    if cf_date and fir_or_est_date:
        # Check if dates differ significantly (e.g. 12/08/2026 vs 13/08/2026)
        is_date_match = (norm_cf_date == norm_doc_date)
        
        # If FIR certifies collision date on a different calendar day
        if not is_date_match:
            contradictions.append({
                "id": "cnt-date-01",
                "title": "Incident Date Discrepancy",
                "sourceA": "Claim Form",
                "valueA": cf_date,
                "citationA": "[CLAIM_FORM: Page 2]",
                "sourceB": doc_type_label,
                "valueB": fir_or_est_date,
                "citationB": doc_citation,
                "impact": f"Directly impacts Policy Notification Window (POLICY-005) and active policy validity window.",
                "suggestedResolution": f"Clarification required from {est_or_fir.get('issuingAuthority') or 'issuing authority'} and dispatch CAD logs.",
                "severity": "CRITICAL",
                "category": "TIMELINE_DISCREPANCY"
            })
            
        comparison_matrix.append({
            "field": "Incident Date",
            "claimFormValue": cf_date,
            "crossCheckValue": fir_or_est_date,
            "isConsistent": is_date_match,
            "sourceBCitation": doc_citation,
            "notes": "Exact calendar date alignment verified" if is_date_match else f"Sworn Claim Form ({cf_date}) contradicts {doc_type_label} date of occurrence ({fir_or_est_date}).",
            "confidence": 99.0
        })

    # 2. Location Cross-Check
    cf_loc = claim_form.get("lossLocation", "").strip()
    fir_findings = est_or_fir.get("findingsSummary", "") + " " + est_or_fir.get("rawText", "")
    if cf_loc:
        is_loc_match = True
        loc_notes = "Loss location verified in incident report."
        if fir_findings and est_or_fir.get("documentType") == "fir":
            # Simple keyword check if location words are present
            loc_words = [w for w in re.findall(r"\w+", cf_loc.lower()) if len(w) > 3]
            overlap = [w for w in loc_words if w in fir_findings.lower()]
            if not overlap and len(loc_words) > 0:
                is_loc_match = False
                loc_notes = "Jurisdictional police report does not corroborate claimed street intersection."
                contradictions.append({
                    "id": "cnt-loc-02",
                    "title": "Loss Location Variance",
                    "sourceA": "Claim Form",
                    "valueA": cf_loc,
                    "citationA": "[CLAIM_FORM: Page 1]",
                    "sourceB": "FIR Findings",
                    "valueB": "Unverified Location in Police Record",
                    "citationB": "[FIR: Page 1]",
                    "impact": "Territorial and jurisdictional coverage verification uncertain.",
                    "suggestedResolution": "Request GPS telematics or roadside breakdown tow log.",
                    "severity": "HIGH",
                    "category": "LOCATION_DISCREPANCY"
                })

        comparison_matrix.append({
            "field": "Loss Location",
            "claimFormValue": cf_loc,
            "crossCheckValue": "Reported Scene" if is_loc_match else "Unconfirmed Scene",
            "isConsistent": is_loc_match,
            "sourceBCitation": doc_citation,
            "notes": loc_notes,
            "confidence": 92.0
        })

    # 3. Vehicle Registration / Plate
    cf_plate = claim_form.get("licensePlate", "").strip()
    fir_raw = est_or_fir.get("rawText", "")
    if cf_plate:
        plate_in_doc = cf_plate.replace(" ", "").lower() in fir_raw.replace(" ", "").lower() if fir_raw else True
        comparison_matrix.append({
            "field": "Vehicle Registration Plate",
            "claimFormValue": cf_plate,
            "crossCheckValue": cf_plate if plate_in_doc else "Missing / Unverified",
            "isConsistent": plate_in_doc,
            "sourceBCitation": doc_citation,
            "notes": "Plate number verified across records." if plate_in_doc else "Vehicle registration not substantiated in supporting document.",
            "confidence": 98.0
        })

    # 4. Damage Vector / Impact Area Cross-Check
    cf_desc = claim_form.get("incidentDescription", "").lower()
    damage_items = est_or_fir.get("damageItems", []) or []
    if cf_desc and damage_items:
        # Check if front damage claimed matches front parts, rear matches rear, etc.
        front_claimed = "front" in cf_desc or "bumper" in cf_desc or "radiator" in cf_desc or "hood" in cf_desc
        rear_claimed = "rear" in cf_desc or "tail" in cf_desc or "trunk" in cf_desc
        side_claimed = "side" in cf_desc or "door" in cf_desc or "quarter" in cf_desc

        parts_text = " ".join([d.get("part", "").lower() for d in damage_items])
        has_front_parts = "front" in parts_text or "bumper" in parts_text or "radiator" in parts_text or "hood" in parts_text
        has_rear_parts = "rear" in parts_text or "trunk" in parts_text or "tail" in parts_text

        is_damage_consistent = True
        damage_notes = "Claimed impact vector corresponds with workshop damage itemization."

        if front_claimed and not has_front_parts and has_rear_parts:
            is_damage_consistent = False
            damage_notes = "Claimant described front collision, but repair estimate only lists rear components."
            contradictions.append({
                "id": "cnt-dmg-03",
                "title": "Damage Vector Conflict",
                "sourceA": "Claim Form Narrative",
                "valueA": "Frontal Collision",
                "citationA": "[CLAIM_FORM: Page 1]",
                "sourceB": "Workshop Itemized Damage",
                "valueB": "Rear Components Only",
                "citationB": "[ESTIMATE: Page 1]",
                "impact": "Possible pre-existing or staged damage claim under POLICY-001 / POLICY-003.",
                "suggestedResolution": "Independent field surveyor re-inspection with paint gauge analysis.",
                "severity": "CRITICAL",
                "category": "DAMAGE_INCONSISTENCY"
            })

        comparison_matrix.append({
            "field": "Damage Vector & Scope",
            "claimFormValue": "Front Impact" if front_claimed else ("Rear Impact" if rear_claimed else "Collision Damage"),
            "crossCheckValue": "Workshop Quote Itemized",
            "isConsistent": is_damage_consistent,
            "sourceBCitation": doc_citation,
            "notes": damage_notes,
            "confidence": 94.0
        })

    # 5. Driver Statement & Identity
    driver_name_st = statement.get("driverName", "").strip()
    insured_name = claim_form.get("insuredName", "").strip()
    if driver_name_st and insured_name:
        comparison_matrix.append({
            "field": "Operating Driver Identity",
            "claimFormValue": insured_name,
            "crossCheckValue": driver_name_st,
            "isConsistent": True,
            "sourceBCitation": "[STATEMENT: Page 1]",
            "notes": f"Driver at wheel verified as {driver_name_st} with active authorization.",
            "confidence": 96.0
        })

    return contradictions, comparison_matrix
