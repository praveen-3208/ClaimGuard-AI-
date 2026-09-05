from typing import List, Dict, Any, Optional
import re
from backend.rag.knowledge_base import MOTOR_POLICY_KNOWLEDGE_BASE

class PolicyRetriever:
    def __init__(self, knowledge_base: Optional[List[Dict[str, Any]]] = None):
        self.knowledge_base = knowledge_base or MOTOR_POLICY_KNOWLEDGE_BASE

    def get_clause_by_id(self, clause_id: str) -> Optional[Dict[str, Any]]:
        norm_id = clause_id.strip().upper()
        for clause in self.knowledge_base:
            if clause["clauseId"].upper() == norm_id:
                return clause
        return None

    def search_clauses(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        if not query or not query.strip():
            return self.knowledge_base[:limit]

        query_lower = query.lower()
        terms = re.findall(r"\w+", query_lower)
        
        scored_clauses = []
        for clause in self.knowledge_base:
            score = 0
            
            # Exact ID match gets highest priority
            if clause["clauseId"].lower() in query_lower:
                score += 100
                
            # Exact title match
            if clause["title"].lower() in query_lower:
                score += 40
                
            # Category match
            if clause.get("category", "").lower() in query_lower:
                score += 20
                
            # Search terms in policy text, conditions, and required evidence
            searchable_text = f"{clause['title']} {clause['policyText']} {' '.join(clause.get('conditions', []))} {clause.get('evidenceRequired', '')}".lower()
            
            for term in terms:
                if len(term) < 3:
                    continue
                if term in clause["clauseId"].lower():
                    score += 25
                if term in clause["title"].lower():
                    score += 15
                count = searchable_text.count(term)
                score += min(count * 3, 20)
                
            if score > 0:
                scored_clauses.append((score, clause))
                
        scored_clauses.sort(key=lambda x: x[0], reverse=True)
        return [c for score, c in scored_clauses[:limit]]

    def retrieve_for_claim(self, claim_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Retrieve relevant clauses for a claim based on claim type, loss description, and documents."""
        results = []
        # Mandatory clauses for all claims
        mandatory_ids = ["POLICY-005", "POLICY-006"]
        for mid in mandatory_ids:
            c = self.get_clause_by_id(mid)
            if c and c not in results:
                results.append(c)

        # Check claim type
        claim_type = claim_data.get("claimType", "Accident")
        if "theft" in claim_type.lower() or "theft" in json_summary(claim_data).lower():
            theft_clauses = ["POLICY-002", "POLICY-008"]
            for tid in theft_clauses:
                c = self.get_clause_by_id(tid)
                if c and c not in results:
                    results.append(c)
        else:
            acc_clauses = ["POLICY-001", "POLICY-004", "POLICY-007"]
            for aid in acc_clauses:
                c = self.get_clause_by_id(aid)
                if c and c not in results:
                    results.append(c)

        # Exclusions always relevant
        excl = self.get_clause_by_id("POLICY-003")
        if excl and excl not in results:
            results.append(excl)

        return results

def json_summary(data: Dict[str, Any]) -> str:
    cf = data.get("claimForm", {}) or {}
    narrative = cf.get("incidentDescription", "")
    st = data.get("customerStatement", {}) or {}
    narrative += " " + st.get("incidentNarrative", "")
    return narrative
