from typing import Dict, Any, List
from backend.rag.retriever import PolicyRetriever
from backend.rag.knowledge_base import MOTOR_POLICY_KNOWLEDGE_BASE
from backend.rules.policy_rules import evaluate_policy_rules

class PolicyService:
    def __init__(self):
        self.retriever = PolicyRetriever(MOTOR_POLICY_KNOWLEDGE_BASE)

    def get_all_rules(self) -> List[Dict[str, Any]]:
        return MOTOR_POLICY_KNOWLEDGE_BASE

    def evaluate_claim(self, claim_data: Dict[str, Any], contradictions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Evaluates the claim against statutory policy rules and returns structured findings.
        """
        evaluations, missing_info = evaluate_policy_rules(claim_data, contradictions)
        
        satisfied = [e for e in evaluations if e["status"] == "SATISFIED"]
        violated = [e for e in evaluations if e["status"] == "VIOLATED"]
        uncertain = [e for e in evaluations if e["status"] == "UNCERTAIN"]

        return {
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

    def query_knowledge_base(self, query: str) -> Dict[str, Any]:
        """
        Retrieves matching policy clauses and formulates a grounded statutory answer.
        """
        matches = self.retriever.search_clauses(query, limit=5)
        
        if not matches:
            return {
                "answer": "No relevant policy clauses found for this query. The knowledge base contains clauses POLICY-001 through POLICY-012 covering Accident Coverage, Theft, Exclusions, Deductibles, 72-Hour Notification, Required Documents, Estimates, and Add-on Endorsements.",
                "matchedClauses": []
            }

        answer_lines = [
            f"### Statutory Motor Insurance Policy Findings ({len(matches)} Relevant Clauses Identified):\n"
        ]
        for m in matches:
            answer_lines.append(f"#### [{m['clauseId']}] {m['title']} ({m.get('applicableClaimType', 'Both')} Claims)")
            answer_lines.append(f"• **Statutory Policy Rule**: \"{m['policyText']}\"")
            answer_lines.append(f"• **Required Evidence**: {m.get('evidenceRequired', 'Standard evidentiary submission')}")
            answer_lines.append(f"• **Standard Deduction / Enforcement**: {m.get('standardDeductionOrRule', 'N/A')}")
            if m.get("conditions"):
                answer_lines.append("• **Enforceable Conditions**:")
                for c in m["conditions"][:3]:
                    answer_lines.append(f"  - {c}")
            answer_lines.append("")

        return {
            "answer": "\n".join(answer_lines),
            "matchedClauses": matches
        }
