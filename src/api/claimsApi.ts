import { 
  ClaimRecord, 
  ClaimFormInput, 
  RepairEstimateOrFIRInput, 
  CustomerIncidentDescriptionInput,
  PolicyClause,
  ClaimStatus,
  AIEvidenceReviewWorkflowResponse
} from '../types/claim';

const BASE_URL = '/api';

export const claimsApi = {
  async checkHealth(): Promise<{ status: string; geminiConfigured: boolean; claimsCount: number }> {
    const res = await fetch(`${BASE_URL}/health`);
    if (!res.ok) throw new Error('Failed to connect to ClaimGuard server');
    return res.json();
  },

  async getAllClaims(): Promise<ClaimRecord[]> {
    const res = await fetch(`${BASE_URL}/claims`);
    if (!res.ok) throw new Error('Failed to fetch claims list');
    const data = await res.json();
    return data.claims;
  },

  async getClaimById(id: string): Promise<ClaimRecord> {
    const res = await fetch(`${BASE_URL}/claims/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch claim ${id}`);
    const data = await res.json();
    return data.claim;
  },

  async analyzeClaim(
    claimForm: ClaimFormInput,
    repairEstimateOrFIR: RepairEstimateOrFIRInput,
    customerStatement: CustomerIncidentDescriptionInput
  ): Promise<any> {
    const res = await fetch(`${BASE_URL}/claims/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claimForm, repairEstimateOrFIR, customerStatement }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Analysis failed' }));
      throw new Error(err.error || 'Claim analysis failed');
    }
    const data = await res.json();
    return data.analysis;
  },

  async saveClaim(claim: ClaimRecord): Promise<ClaimRecord> {
    const res = await fetch(`${BASE_URL}/claims`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(claim),
    });
    if (!res.ok) throw new Error('Failed to save claim record');
    const data = await res.json();
    return data.claim;
  },

  async updateEscalation(
    id: string,
    payload: {
      status?: ClaimStatus;
      assignedInvestigator?: string;
      investigatorNotes?: string;
      investigatorDecision?: 'APPROVE' | 'REJECT' | 'REQUEST_INFO' | 'SPECIAL_INVESTIGATION';
      actor?: string;
      actionNote?: string;
    }
  ): Promise<ClaimRecord> {
    const res = await fetch(`${BASE_URL}/claims/${id}/escalate`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to update escalation for ${id}`);
    const data = await res.json();
    return data.claim;
  },

  async getPolicyRules(): Promise<PolicyClause[]> {
    const res = await fetch(`${BASE_URL}/policy-rules`);
    if (!res.ok) throw new Error('Failed to load policy rules');
    const data = await res.json();
    return data.rules;
  },

  async queryPolicyRule(question: string): Promise<string> {
    const res = await fetch(`${BASE_URL}/policy-rules/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    if (!res.ok) throw new Error('Failed to query policy knowledge base');
    const data = await res.json();
    return data.answer;
  },

  async resetDemoClaims(): Promise<void> {
    await fetch(`${BASE_URL}/claims/reset`, { method: 'POST' });
  },

  async resetDemoData(): Promise<ClaimRecord[]> {
    await this.resetDemoClaims();
    return this.getAllClaims();
  },

  // Aliases for convenience
  async getClaims(): Promise<ClaimRecord[]> {
    return this.getAllClaims();
  },

  async updateClaimEscalation(id: string, payload: any): Promise<ClaimRecord> {
    return this.updateEscalation(id, payload);
  }
};
