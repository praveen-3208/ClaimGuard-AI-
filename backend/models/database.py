import sqlite3
import json
import os
from typing import List, Optional, Dict, Any

DB_PATH = os.environ.get("SQLITE_DB_PATH", os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "claimguard.db"))

def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS claims (
        id TEXT PRIMARY KEY,
        claim_number TEXT UNIQUE NOT NULL,
        status TEXT NOT NULL,
        insured_name TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        assigned_investigator TEXT,
        investigator_notes TEXT,
        data TEXT NOT NULL
    )
    """)
    
    cursor.execute("""
    CREATE INDEX IF NOT EXISTS idx_claims_number ON claims(claim_number);
    """)
    cursor.execute("""
    CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
    """)
    
    conn.commit()
    
    # Check if empty, then seed demo data
    cursor.execute("SELECT COUNT(*) as count FROM claims")
    row = cursor.fetchone()
    if row and row["count"] == 0:
        seed_demo_data(conn)
        
    conn.close()

def seed_demo_data(conn: sqlite3.Connection):
    # Seed canonical demo claims including CLM-1042
    demo_claims = [
        {
            "id": "clm-1042",
            "claimNumber": "CLM-1042",
            "createdAt": "2026-08-31T08:15:00Z",
            "updatedAt": "2026-08-31T09:40:00Z",
            "status": "In Escalation Queue",
            "assignedInvestigator": "Sarah Jenkins (Senior SIU Specialist)",
            "investigatorNotes": "CRITICAL CONTRADICTION: Incident date mismatch between sworn Claim Form (12/08/2026) and official Police FIR (13/08/2026). Values kept strictly unmerged for statutory audit.",
            "claimForm": {
                "claimNumber": "CLM-1042",
                "policyNumber": "APX-CAR-774019-B",
                "policyType": "Comprehensive Motor Policy",
                "insuredName": "David K. Reynolds",
                "vehicleMakeModel": "2023 Toyota Camry LE",
                "licensePlate": "8XYZ123",
                "dateOfLoss": "12/08/2026",
                "lossLocation": "Intersection of 4th Ave and Elm St, Seattle, WA",
                "incidentDescription": "Traveling westbound on Elm St during moderate rain. Approached 4th Ave intersection when a commercial utility van abruptly turned across my lane. Heavy impact to front bumper, hood crumpled, radiator ruptured.",
                "claimedAmount": 7850.0,
                "isSigned": True,
                "rawText": "I, David K. Reynolds, hereby declare under penalty of insurance fraud that on August 12, 2026 at approximately 18:30 hours...",
                "citations": ["[CLAIM_FORM: Page 1]", "[CLAIM_FORM: Page 2]"]
            },
            "repairEstimateOrFIR": {
                "documentType": "fir",
                "documentNumber": "FIR-SPD-2026-08942",
                "issuingAuthority": "Seattle Police Department - Traffic Collision Investigation Unit",
                "dateOfIssue": "13/08/2026",
                "totalEstimatedCost": 7850.0,
                "officerBadgeOrSurveyorLicense": "Officer Marcus Vance #4402",
                "findingsSummary": "Investigating officer arrived at 4th & Elm following 911 dispatch. Collision occurred August 13, 2026 at 09:15 hours.",
                "damageItems": [
                    {"part": "Front Bumper Assembly", "action": "REPLACE", "partsCost": 1250.0, "laborCost": 400.0, "totalCost": 1650.0},
                    {"part": "Radiator Support & Core", "action": "REPLACE", "partsCost": 980.0, "laborCost": 520.0, "totalCost": 1500.0},
                    {"part": "Hood Panel & Latch", "action": "REPAIR", "partsCost": 600.0, "laborCost": 550.0, "totalCost": 1150.0}
                ],
                "rawText": "POLICE INCIDENT REPORT (FIR). Date of Occurrence: 13/08/2026. Place: 4th Ave & Elm St...",
                "citations": ["[FIR: Page 1]"]
            },
            "customerStatement": {
                "submissionChannel": "Digital Intake Applet",
                "reportedDate": "2026-08-31",
                "incidentNarrative": "Incident happened on the evening of August 12, 2026 around 6:30 PM. I left my office downtown...",
                "driverName": "David K. Reynolds",
                "declaredSpeed": "Approx 30 mph in a 35 mph zone",
                "weatherConditions": "Wet roadway, moderate rainfall",
                "rawText": "Recorded statement: Incident occurred 12/08/2026 during rain. Speed was approx 30 mph.",
                "citations": ["[INCIDENT_STATEMENT: Page 1]"]
            },
            "contradictions": [
                {
                    "id": "cnt-1042-01",
                    "title": "Incident Date Discrepancy",
                    "sourceA": "Claim Form",
                    "valueA": "12/08/2026",
                    "citationA": "[CLAIM_FORM: Page 2]",
                    "sourceB": "FIR",
                    "valueB": "13/08/2026",
                    "citationB": "[FIR: Page 1]",
                    "impact": "Directly impacts Policy Notification Window (POLICY-005) and active policy validity window.",
                    "suggestedResolution": "Clarification required from Seattle Police Department (Officer Marcus Vance #4402) and review of 911 dispatch log.",
                    "severity": "CRITICAL",
                    "category": "TIMELINE_DISCREPANCY"
                }
            ],
            "policyEvaluations": [
                {
                    "clauseId": "POLICY-005",
                    "clauseTitle": "Claim Notification Window",
                    "relevantPolicyText": "Accidental damage claims must be communicated to insurer within 72 hours of occurrence.",
                    "evidenceSupportingFinding": "Sworn Claim Form records incident on 12/08/2026 [CLAIM_FORM: Page 2], but Police FIR certifies collision on 13/08/2026 [FIR: Page 1].",
                    "status": "VIOLATED",
                    "evidenceQuote": "Claim Form: 12/08/2026 vs FIR: 13/08/2026",
                    "reasoning": "Contradictory dates prevent verification of the statutory 72-hour notification requirement without human investigation.",
                    "financialImpact": "Claim held in escalation queue pending timeline reconciliation."
                },
                {
                    "clauseId": "POLICY-006",
                    "clauseTitle": "Required Documents",
                    "relevantPolicyText": "Every claim submission requires authenticated statutory records including Claim Form, Driver License, and Police FIR.",
                    "evidenceSupportingFinding": "Claim Form and FIR submitted, but contain unresolved timeline discrepancy [CLAIM_FORM: Page 2] vs [FIR: Page 1].",
                    "status": "UNCERTAIN",
                    "evidenceQuote": "Documents submitted with date contradiction.",
                    "reasoning": "Documentary proof requirement incomplete due to factual variance between records.",
                    "financialImpact": "Settlement disbursement suspended until timeline variance is verified."
                }
            ],
            "missingInformation": [
                {
                    "id": "mis-1042-01",
                    "fieldOrDocument": "Correct incident date confirmation",
                    "sourceDocument": "Police FIR Dispatch Records",
                    "rationale": "Resolve 24-hour discrepancy between Claim Form and Police FIR",
                    "recommendedAction": "Contact SPD Records Division requesting dispatch CAD log for Unit #4402",
                    "requirementLevel": "MANDATORY"
                }
            ],
            "recommendation": {
                "decision": "ESCALATE",
                "confidenceScore": 68.0,
                "requiresHumanEscalation": True,
                "escalationSeverity": "HIGH",
                "escalationReason": "Contradictory incident dates found.",
                "summaryRationale": "A critical date contradiction exists between the sworn Claim Form ([CLAIM_FORM: Page 2]: 12/08/2026) and the Police FIR ([FIR: Page 1]: 13/08/2026). Human investigator review required.",
                "suggestedSettlementEstimate": 0.0,
                "deductionsCalculated": 1000.0,
                "nextSteps": [
                    "Dispatch SIU investigator to reconcile FIR date with SPD Dispatch Logs",
                    "Hold settlement disbursement until timeline verified",
                    "Review policy in-force hours for August 12-13, 2026"
                ]
            },
            "auditLog": [
                {
                    "id": "aud-1042-1",
                    "timestamp": "2026-08-31T08:15:00Z",
                    "actor": "System Intake Router",
                    "action": "Claim Ingestion & Initial OCR Parse",
                    "note": "Parsed Claim Form and SPD Police FIR."
                },
                {
                    "id": "aud-1042-2",
                    "timestamp": "2026-08-31T08:16:30Z",
                    "actor": "Statutory Rules Engine",
                    "action": "Contradiction Flagged & Escalation Triggered",
                    "note": "Identified date mismatch: 12/08/2026 (Claim Form) vs 13/08/2026 (FIR). Autonomous approval suspended."
                }
            ]
        },
        {
            "id": "clm-3190",
            "claimNumber": "CLM-2026-3190",
            "createdAt": "2026-08-30T10:00:00Z",
            "updatedAt": "2026-08-30T14:20:00Z",
            "status": "Approved",
            "assignedInvestigator": None,
            "investigatorNotes": "Autonomous audit cleared all checks. Clean claim with zero deductible disputes.",
            "claimForm": {
                "claimNumber": "CLM-2026-3190",
                "policyNumber": "APX-CAR-552109-A",
                "policyType": "Comprehensive Motor Policy",
                "insuredName": "Michael Chang",
                "vehicleMakeModel": "2022 Tesla Model 3",
                "licensePlate": "6ABC456",
                "dateOfLoss": "28/08/2026",
                "lossLocation": "I-90 Eastbound Milepost 14, Bellevue, WA",
                "incidentDescription": "Rear-end collision in stop-and-go freeway traffic. Insured vehicle was rear-ended by a trailing pickup truck.",
                "claimedAmount": 4200.0,
                "isSigned": True,
                "citations": ["[CLAIM_FORM: Page 1]"]
            },
            "repairEstimateOrFIR": {
                "documentType": "repair_estimate",
                "documentNumber": "EST-2026-7812",
                "issuingAuthority": "Certified Tesla Collision Center",
                "dateOfIssue": "29/08/2026",
                "totalEstimatedCost": 4200.0,
                "damageItems": [
                    {"part": "Rear Bumper Cover", "action": "REPLACE", "partsCost": 1800.0, "laborCost": 600.0, "totalCost": 2400.0},
                    {"part": "Trunk Lid Alignment", "action": "REPAIR", "partsCost": 300.0, "laborCost": 500.0, "totalCost": 800.0},
                    {"part": "Rear Parking Ultrasonic Sensors", "action": "REPLACE", "partsCost": 700.0, "laborCost": 300.0, "totalCost": 1000.0}
                ],
                "citations": ["[ESTIMATE: Page 1]"]
            },
            "customerStatement": {
                "submissionChannel": "Mobile App",
                "reportedDate": "2026-08-28",
                "incidentNarrative": "Stationary in traffic, hit from behind.",
                "driverName": "Michael Chang",
                "declaredSpeed": "0 mph (stationary)",
                "citations": ["[STATEMENT: Page 1]"]
            },
            "contradictions": [],
            "policyEvaluations": [
                {
                    "clauseId": "POLICY-001",
                    "clauseTitle": "Accident Coverage",
                    "relevantPolicyText": "Sudden external violent collision covered.",
                    "evidenceSupportingFinding": "Rear impact confirmed by estimate.",
                    "status": "SATISFIED",
                    "reasoning": "Collision matches policy coverage criteria.",
                    "financialImpact": "Eligible for standard indemnification."
                },
                {
                    "clauseId": "POLICY-005",
                    "clauseTitle": "Claim Notification Window",
                    "relevantPolicyText": "Must report within 72 hours.",
                    "evidenceSupportingFinding": "Reported on day of loss (same-day notification).",
                    "status": "SATISFIED",
                    "reasoning": "Timely reporting confirmed.",
                    "financialImpact": "Full settlement payable."
                }
            ],
            "missingInformation": [],
            "recommendation": {
                "decision": "APPROVE",
                "confidenceScore": 96.0,
                "requiresHumanEscalation": False,
                "escalationSeverity": "NONE",
                "escalationReason": "",
                "summaryRationale": "All evidentiary requirements satisfied. Comprehensive motor coverage verified with timely notification and consistent damage profile.",
                "suggestedSettlementEstimate": 3700.0,
                "deductionsCalculated": 500.0,
                "nextSteps": ["Issue digital settlement payment via ACH"]
            },
            "auditLog": [
                {
                    "id": "aud-3190-1",
                    "timestamp": "2026-08-30T10:00:00Z",
                    "actor": "System Intake Router",
                    "action": "Intake Processed",
                    "note": "Documents verified."
                }
            ]
        }
    ]
    
    cursor = conn.cursor()
    for c in demo_claims:
        cursor.execute("""
        INSERT INTO claims (id, claim_number, status, insured_name, created_at, updated_at, assigned_investigator, investigator_notes, data)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            c["id"],
            c["claimNumber"],
            c["status"],
            c.get("claimForm", {}).get("insuredName", ""),
            c["createdAt"],
            c["updatedAt"],
            c.get("assignedInvestigator"),
            c.get("investigatorNotes"),
            json.dumps(c)
        ))
    conn.commit()

def get_all_claims(status: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "SELECT data FROM claims"
    params = []
    
    conditions = []
    if status:
        conditions.append("status = ?")
        params.append(status)
    if search:
        conditions.append("(claim_number LIKE ? OR insured_name LIKE ? OR id LIKE ?)")
        search_pattern = f"%{search}%"
        params.extend([search_pattern, search_pattern, search_pattern])
        
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
        
    query += " ORDER BY updated_at DESC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    return [json.loads(row["data"]) for row in rows]

def get_claim_by_id(claim_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT data FROM claims WHERE id = ? OR LOWER(claim_number) = LOWER(?)", (claim_id, claim_id))
    row = cursor.fetchone()
    conn.close()
    if row:
        return json.loads(row["data"])
    return None

def save_claim(claim_data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    claim_id = claim_data.get("id")
    claim_number = claim_data.get("claimNumber", claim_id)
    status = claim_data.get("status", "Pending Review")
    insured_name = claim_data.get("claimForm", {}).get("insuredName", "")
    created_at = claim_data.get("createdAt")
    updated_at = claim_data.get("updatedAt")
    assigned_investigator = claim_data.get("assignedInvestigator")
    investigator_notes = claim_data.get("investigatorNotes")
    
    cursor.execute("""
    INSERT OR REPLACE INTO claims (id, claim_number, status, insured_name, created_at, updated_at, assigned_investigator, investigator_notes, data)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        claim_id,
        claim_number,
        status,
        insured_name,
        created_at,
        updated_at,
        assigned_investigator,
        investigator_notes,
        json.dumps(claim_data)
    ))
    conn.commit()
    conn.close()
    return claim_data

def update_claim(claim_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    existing = get_claim_by_id(claim_id)
    if not existing:
        return None
        
    existing.update(updates)
    return save_claim(existing)

def delete_claim(claim_id: str) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM claims WHERE id = ? OR LOWER(claim_number) = LOWER(?)", (claim_id, claim_id))
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    return rows_affected > 0

def reset_db_with_seed():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DROP TABLE IF EXISTS claims")
    conn.commit()
    conn.close()
    init_db()
