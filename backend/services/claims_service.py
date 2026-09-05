import datetime
import random
from typing import List, Optional, Dict, Any
from backend.models.database import (
    get_all_claims,
    get_claim_by_id,
    save_claim,
    update_claim,
    delete_claim,
    reset_db_with_seed
)

class ClaimsService:
    @staticmethod
    def get_all(status: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
        return get_all_claims(status=status, search=search)

    @staticmethod
    def get_by_id(claim_id: str) -> Optional[Dict[str, Any]]:
        return get_claim_by_id(claim_id)

    @staticmethod
    def create(payload: Dict[str, Any]) -> Dict[str, Any]:
        now_iso = datetime.datetime.utcnow().isoformat() + "Z"
        
        # Generate clean ID and claim number if not provided
        claim_id = payload.get("id") or f"clm-{random.randint(1000, 9999)}"
        claim_number = payload.get("claimNumber") or f"CLM-2026-{random.randint(1000, 9999)}"
        
        # Base claim record
        new_claim = {
            "id": claim_id,
            "claimNumber": claim_number,
            "createdAt": now_iso,
            "updatedAt": now_iso,
            "status": payload.get("status", "Pending Review"),
            "assignedInvestigator": payload.get("assignedInvestigator"),
            "investigatorNotes": payload.get("investigatorNotes"),
            "claimForm": payload.get("claimForm") or {
                "claimNumber": claim_number,
                "policyNumber": payload.get("policyNumber", "APX-CAR-994020-C"),
                "policyType": payload.get("policyType", "Comprehensive Motor Policy"),
                "insuredName": payload.get("insuredName", "Insured Customer"),
                "vehicleMakeModel": payload.get("vehicleMakeModel", "2024 Honda Civic"),
                "licensePlate": payload.get("licensePlate", "7XYZ890"),
                "dateOfLoss": payload.get("dateOfLoss", datetime.date.today().strftime("%d/%m/%Y")),
                "lossLocation": payload.get("lossLocation", "Downtown Intersection"),
                "incidentDescription": payload.get("incidentDescription", "Vehicle struck in traffic."),
                "claimedAmount": float(payload.get("claimedAmount", 4250.0)),
                "isSigned": True,
                "citations": ["[CLAIM_FORM: Page 1]"]
            },
            "repairEstimateOrFIR": payload.get("repairEstimateOrFIR") or {
                "documentType": "repair_estimate",
                "documentNumber": f"EST-{random.randint(1000, 9999)}",
                "issuingAuthority": "Authorized OEM Collision Center",
                "dateOfIssue": payload.get("dateOfLoss", datetime.date.today().strftime("%d/%m/%Y")),
                "totalEstimatedCost": float(payload.get("claimedAmount", 4250.0)),
                "damageItems": [
                    {"part": "Front Bumper Assembly", "action": "REPLACE", "partsCost": 1200.0, "laborCost": 450.0, "totalCost": 1650.0},
                    {"part": "Front Grille & Emblems", "action": "REPLACE", "partsCost": 600.0, "laborCost": 200.0, "totalCost": 800.0},
                    {"part": "Radiator Support Check", "action": "REPAIR", "partsCost": 350.0, "laborCost": 450.0, "totalCost": 800.0}
                ],
                "citations": ["[ESTIMATE: Page 1]"]
            },
            "customerStatement": payload.get("customerStatement") or {
                "submissionChannel": "Digital Portal",
                "reportedDate": datetime.date.today().strftime("%Y-%m-%d"),
                "incidentNarrative": payload.get("incidentDescription", "Vehicle struck while stationary."),
                "driverName": payload.get("insuredName", "Insured Customer"),
                "declaredSpeed": "0 mph (stationary)",
                "citations": ["[STATEMENT: Page 1]"]
            },
            "extractedEntities": {
                "Policyholder": payload.get("insuredName", "Insured Customer"),
                "Vehicle": payload.get("vehicleMakeModel", "2024 Honda Civic"),
                "License Plate": payload.get("licensePlate", "7XYZ890"),
                "Date of Incident": payload.get("dateOfLoss", datetime.date.today().strftime("%d/%m/%Y")),
                "Claimed Total": f"${float(payload.get('claimedAmount', 4250.0)):,.2f}"
            },
            "comparisonMatrix": [],
            "contradictions": [],
            "policyEvaluations": [],
            "missingInformation": [],
            "recommendation": {
                "decision": "REQUEST INFORMATION",
                "confidenceScore": 82.0,
                "requiresHumanEscalation": False,
                "escalationSeverity": "NONE",
                "escalationReason": "",
                "summaryRationale": "Initial intake logged. Awaiting statutory automated evidence review.",
                "suggestedSettlementEstimate": float(payload.get("claimedAmount", 4250.0)) - 1000.0,
                "deductionsCalculated": 1000.0,
                "nextSteps": ["Execute evidence review workflow"]
            },
            "auditLog": [
                {
                    "id": f"aud-{random.randint(1000, 9999)}",
                    "timestamp": now_iso,
                    "actor": "System Intake Router",
                    "action": "Claim Ingested",
                    "note": f"Claim record created for {payload.get('insuredName', 'Insured Customer')}."
                }
            ]
        }

        return save_claim(new_claim)

    @staticmethod
    def attach_document(claim_id: str, doc_payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        claim = get_claim_by_id(claim_id)
        if not claim:
            return None

        doc_type = doc_payload.get("documentType", "other").lower()
        now_iso = datetime.datetime.utcnow().isoformat() + "Z"

        if doc_type in ["claim_form", "claimform"]:
            claim["claimForm"] = {
                **claim.get("claimForm", {}),
                **doc_payload,
                "citations": ["[CLAIM_FORM: Updated Page]"]
            }
        elif doc_type in ["repair_estimate", "estimate", "fir", "police_fir"]:
            claim["repairEstimateOrFIR"] = {
                **claim.get("repairEstimateOrFIR", {}),
                **doc_payload,
                "documentType": "fir" if "fir" in doc_type else "repair_estimate",
                "citations": [f"[{'FIR' if 'fir' in doc_type else 'ESTIMATE'}: Page 1]"]
            }
        elif doc_type in ["customer_statement", "statement"]:
            claim["customerStatement"] = {
                **claim.get("customerStatement", {}),
                **doc_payload,
                "citations": ["[STATEMENT: Page 1]"]
            }

        claim["updatedAt"] = now_iso
        claim["auditLog"].append({
            "id": f"aud-{random.randint(1000, 9999)}",
            "timestamp": now_iso,
            "actor": "Claims Document Portal",
            "action": f"Document Attached: {doc_type.upper()}",
            "note": f"Document {doc_payload.get('documentNumber', '')} successfully attached to claim dossier."
        })

        return save_claim(claim)

    @staticmethod
    def reset_demo() -> int:
        reset_db_with_seed()
        all_c = get_all_claims()
        return len(all_c)
