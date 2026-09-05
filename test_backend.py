from fastapi.testclient import TestClient
from app import app
import json

client = TestClient(app)

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    print("✓ Health check endpoint PASSED")

def test_get_claims():
    response = client.get("/api/claims")
    assert response.status_code == 200
    data = response.json()
    assert "claims" in data
    assert len(data["claims"]) >= 2
    print(f"✓ GET /api/claims PASSED ({len(data['claims'])} claims found)")

def test_get_single_claim():
    response = client.get("/api/claims/clm-1042")
    assert response.status_code == 200
    data = response.json()
    assert data["claim"]["claimNumber"] == "CLM-1042"
    print("✓ GET /api/claims/{claim_id} PASSED for clm-1042")

def test_create_claim():
    new_claim_payload = {
        "insuredName": "Arthur Pendelton",
        "vehicleMakeModel": "2025 Ford Mustang Mach-E",
        "licensePlate": "9MACH01",
        "dateOfLoss": "2026-09-01",
        "lossLocation": "Westlake Ave & 9th St",
        "incidentDescription": "Side impact damage in parking structure.",
        "claimedAmount": 3800.0
    }
    response = client.post("/api/claims", json=new_claim_payload)
    assert response.status_code == 201
    data = response.json()
    claim_id = data["claim"]["id"]
    print(f"✓ POST /api/claims PASSED (created claim {claim_id})")
    return claim_id

def test_attach_document(claim_id: str):
    doc_payload = {
        "documentType": "repair_estimate",
        "documentNumber": "EST-MACH-2026",
        "issuingAuthority": "Certified Ford Collision Repair",
        "dateOfIssue": "2026-09-02",
        "totalEstimatedCost": 3800.0,
        "damageItems": [
            {"part": "Right Passenger Door Outer Skin", "action": "REPLACE", "partsCost": 1800.0, "laborCost": 600.0, "totalCost": 2400.0},
            {"part": "Rocker Panel Molding", "action": "REPAIR", "partsCost": 400.0, "laborCost": 500.0, "totalCost": 900.0},
            {"part": "Paint & Blending", "action": "PAINT", "partsCost": 200.0, "laborCost": 300.0, "totalCost": 500.0}
        ]
    }
    response = client.post(f"/api/claims/{claim_id}/documents", json=doc_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["claim"]["repairEstimateOrFIR"]["documentNumber"] == "EST-MACH-2026"
    print(f"✓ POST /api/claims/{claim_id}/documents PASSED")

def test_review_claim(claim_id: str):
    response = client.post(f"/api/claims/{claim_id}/review")
    assert response.status_code == 200
    data = response.json()
    assert "recommendation" in data
    assert "policyEvaluations" in data
    print(f"✓ POST /api/claims/{claim_id}/review PASSED (Decision: {data['recommendation']['decision']})")

def test_get_evidence(claim_id: str):
    response = client.get(f"/api/claims/{claim_id}/evidence")
    assert response.status_code == 200
    data = response.json()
    assert "evidence" in data
    assert "extractedEntities" in data["evidence"]
    assert "comparisonMatrix" in data["evidence"]
    print(f"✓ GET /api/claims/{claim_id}/evidence PASSED")

def test_get_policy_findings(claim_id: str):
    response = client.get(f"/api/claims/{claim_id}/policy-findings")
    assert response.status_code == 200
    data = response.json()
    assert "policyEvaluations" in data
    assert len(data["policyEvaluations"]) > 0
    print(f"✓ GET /api/claims/{claim_id}/policy-findings PASSED ({len(data['policyEvaluations'])} clauses evaluated)")

def test_escalate_claim(claim_id: str):
    escalate_payload = {
        "status": "Under Review",
        "assignedInvestigator": "Senior Fraud Specialist Vance",
        "investigatorNotes": "Dispatched for physical surveyor inspection and telematics check.",
        "actor": "Head of Adjudication"
    }
    response = client.post(f"/api/claims/{claim_id}/escalate", json=escalate_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["claim"]["status"] == "Under Review"
    assert data["claim"]["assignedInvestigator"] == "Senior Fraud Specialist Vance"
    print(f"✓ POST /api/claims/{claim_id}/escalate PASSED")

def test_escalate_demo_claim_clm1042():
    # Verify CLM-1042 has the date discrepancy and triggers
    response = client.get("/api/claims/clm-1042")
    assert response.status_code == 200
    claim = response.json()["claim"]
    assert len(claim["contradictions"]) > 0
    assert claim["recommendation"]["decision"] == "ESCALATE"
    print("✓ CLM-1042 verified as canonical ESCALATE case with date contradiction")

if __name__ == "__main__":
    print("--- Running ClaimGuard Backend Verification Tests ---")
    test_health()
    test_get_claims()
    test_get_single_claim()
    cid = test_create_claim()
    test_attach_document(cid)
    test_review_claim(cid)
    test_get_evidence(cid)
    test_get_policy_findings(cid)
    test_escalate_claim(cid)
    test_escalate_demo_claim_clm1042()
    print("\n ALL BACKEND ARCHITECTURE TESTS PASSED SUCCESSFULLY! ")
