from typing import Dict, Any, List, Tuple
from backend.rules.contradiction_rules import check_cross_document_contradictions

class EvidenceService:
    @staticmethod
    def extract_evidence(claim_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extracts key evidence entities, compiles cross-document comparison matrix,
        and identifies factual discrepancies.
        """
        claim_form = claim_data.get("claimForm", {}) or {}
        est_or_fir = claim_data.get("repairEstimateOrFIR", {}) or {}
        statement = claim_data.get("customerStatement", {}) or {}

        # 1. Extracted Entities
        entities = {
            "Claim Number": claim_data.get("claimNumber", ""),
            "Policyholder": claim_form.get("insuredName", ""),
            "Vehicle": claim_form.get("vehicleMakeModel", ""),
            "Registration Plate": claim_form.get("licensePlate", ""),
            "Claim Form Incident Date": claim_form.get("dateOfLoss", ""),
            "Supporting Document Date": est_or_fir.get("dateOfIssue", ""),
            "Loss Location": claim_form.get("lossLocation", ""),
            "Claimed Amount": f"${float(claim_form.get('claimedAmount', 0)):,.2f}",
            "Operating Driver": statement.get("driverName", claim_form.get("insuredName", "")),
            "Issuing Authority": est_or_fir.get("issuingAuthority", "Certified Repair Center")
        }

        # 2. Cross-document contradictions & comparison matrix
        contradictions, comparison_matrix = check_cross_document_contradictions(claim_data)

        # 3. Formulate Evidence Dossier
        return {
            "extractedEntities": entities,
            "comparisonMatrix": comparison_matrix,
            "contradictions": contradictions,
            "documentCount": 3,
            "totalContradictions": len(contradictions)
        }
