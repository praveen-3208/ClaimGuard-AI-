import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { INITIAL_MOCK_CLAIMS } from './src/data/mockClaims';
import { MOTOR_POLICY_KNOWLEDGE_BASE } from './src/data/policyKnowledgeBase';
import { analyzeClaimWithGemini, getGeminiClient, executeAIEvidenceReviewWorkflow } from './server/geminiService';
import { ClaimRecord } from './src/types/claim';

dotenv.config();

// In-memory data store for claims
let claimsDatabase: ClaimRecord[] = JSON.parse(JSON.stringify(INITIAL_MOCK_CLAIMS));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    const hasApiKey = Boolean(process.env.GEMINI_API_KEY);
    res.json({ 
      status: 'ok', 
      service: 'ClaimGuard AI Backend',
      timestamp: new Date().toISOString(),
      geminiConfigured: hasApiKey,
      claimsCount: claimsDatabase.length 
    });
  });

  // Get all claims
  app.get('/api/claims', (req, res) => {
    res.json({ claims: claimsDatabase });
  });

  // Get single claim by ID or Claim Number
  app.get('/api/claims/:id', (req, res) => {
    const claim = claimsDatabase.find(
      c => c.id === req.params.id || c.claimNumber.toLowerCase() === req.params.id.toLowerCase()
    );
    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }
    res.json({ claim });
  });

  // Analyze claim documents with Gemini / Evidence Engine
  app.post('/api/claims/analyze', async (req, res) => {
    try {
      const { claimForm, repairEstimateOrFIR, customerStatement } = req.body;

      if (!claimForm || !repairEstimateOrFIR || !customerStatement) {
        return res.status(400).json({ error: 'Missing one or more required documents: claimForm, repairEstimateOrFIR, customerStatement' });
      }

      const analysisResult = await analyzeClaimWithGemini(claimForm, repairEstimateOrFIR, customerStatement);
      const workflowResult = await executeAIEvidenceReviewWorkflow(claimForm, repairEstimateOrFIR, customerStatement, MOTOR_POLICY_KNOWLEDGE_BASE);

      res.json({ 
        analysis: {
          ...analysisResult,
          aiEvidenceReview: workflowResult
        } 
      });
    } catch (err: any) {
      console.error('Error analyzing claim:', err);
      res.status(500).json({ error: 'Failed to analyze claim documents', details: err.message });
    }
  });

  // Dedicated AI-Powered Evidence Review Workflow
  app.post('/api/claims/review-workflow', async (req, res) => {
    try {
      const { claimForm, repairEstimateOrFIR, customerStatement, claimId } = req.body;

      let effectiveClaimForm = claimForm;
      let effectiveEstimateOrFIR = repairEstimateOrFIR;
      let effectiveStatement = customerStatement;

      // If claimId provided, load missing parts from existing claim if not supplied in body
      if (claimId) {
        const existingClaim = claimsDatabase.find(
          c => c.id === claimId || c.claimNumber.toLowerCase() === claimId.toLowerCase()
        );
        if (existingClaim) {
          effectiveClaimForm = effectiveClaimForm || existingClaim.claimForm;
          effectiveEstimateOrFIR = effectiveEstimateOrFIR || existingClaim.repairEstimateOrFIR;
          effectiveStatement = effectiveStatement || existingClaim.customerStatement;
        }
      }

      if (!effectiveClaimForm || !effectiveEstimateOrFIR || !effectiveStatement) {
        return res.status(400).json({ 
          error: 'Missing required inputs: claimForm, repairEstimateOrFIR, customerStatement are all required.' 
        });
      }

      const workflowResult = await executeAIEvidenceReviewWorkflow(
        effectiveClaimForm,
        effectiveEstimateOrFIR,
        effectiveStatement,
        MOTOR_POLICY_KNOWLEDGE_BASE
      );

      // If claimId is provided, persist the review into the claim record
      if (claimId) {
        const claimIndex = claimsDatabase.findIndex(
          c => c.id === claimId || c.claimNumber.toLowerCase() === claimId.toLowerCase()
        );
        if (claimIndex !== -1) {
          claimsDatabase[claimIndex].aiEvidenceReview = workflowResult;
          claimsDatabase[claimIndex].updatedAt = new Date().toISOString();
        }
      }

      res.json({
        success: true,
        workflow: workflowResult
      });
    } catch (err: any) {
      console.error('Error executing evidence review workflow:', err);
      res.status(500).json({ error: 'Failed to execute evidence review workflow', details: err.message });
    }
  });

  // Create new claim record in the registry
  app.post('/api/claims', (req, res) => {
    try {
      const newClaim: ClaimRecord = req.body;
      if (!newClaim.id || !newClaim.claimNumber) {
        newClaim.id = `clm-${Date.now().toString().slice(-4)}`;
        newClaim.claimNumber = `CLM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      }
      newClaim.createdAt = newClaim.createdAt || new Date().toISOString();
      newClaim.updatedAt = new Date().toISOString();

      // Add to front of claims list
      claimsDatabase.unshift(newClaim);
      res.status(201).json({ claim: newClaim });
    } catch (err: any) {
      res.status(400).json({ error: 'Invalid claim data', details: err.message });
    }
  });

  // Update claim escalation / investigator decision
  app.patch('/api/claims/:id/escalate', (req, res) => {
    const claimIndex = claimsDatabase.findIndex(
      c => c.id === req.params.id || c.claimNumber.toLowerCase() === req.params.id.toLowerCase()
    );
    if (claimIndex === -1) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    const { 
      status, 
      assignedInvestigator, 
      investigatorNotes, 
      investigatorDecision, 
      actor,
      actionNote 
    } = req.body;

    const claim = claimsDatabase[claimIndex];
    if (status) claim.status = status;
    if (assignedInvestigator !== undefined) claim.assignedInvestigator = assignedInvestigator;
    if (investigatorNotes !== undefined) claim.investigatorNotes = investigatorNotes;
    if (investigatorDecision !== undefined) {
      claim.investigatorDecision = investigatorDecision;
      claim.decisionDate = new Date().toISOString();
    }
    claim.updatedAt = new Date().toISOString();

    claim.auditLog.push({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: actor || 'Claims Investigator',
      action: investigatorDecision ? `Decision Recorded: ${investigatorDecision}` : 'Status / Assignment Updated',
      note: actionNote || investigatorNotes || 'Updated via Human Escalation Console',
    });

    claimsDatabase[claimIndex] = claim;
    res.json({ claim });
  });

  // Get policy knowledge base rules
  app.get('/api/policy-rules', (req, res) => {
    res.json({ rules: MOTOR_POLICY_KNOWLEDGE_BASE });
  });

  // Ask / query policy knowledge base
  app.post('/api/policy-rules/query', async (req, res) => {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question query required' });
    }

    const client = getGeminiClient();
    if (client) {
      try {
        const prompt = `You are a certified motor insurance legal and policy underwriting consultant.
Answer the following investigator query using ONLY the provided synthetic motor insurance policy knowledge base:

=== MOTOR INSURANCE POLICY KNOWLEDGE BASE ===
${JSON.stringify(MOTOR_POLICY_KNOWLEDGE_BASE, null, 2)}

=== INVESTIGATOR QUERY ===
"${question}"

CRITICAL MANDATE:
The AI must NEVER invent policy clauses.
You must ONLY cite from the synthetic motor insurance policy clauses provided (POLICY-001 through POLICY-012).

Whenever you formulate an answer or recommendation, always show:
- Clause ID (e.g. POLICY-001, POLICY-005)
- Clause title (e.g. Claim Notification Window)
- Relevant policy text (the exact rule text from the knowledge base)
- Evidence supporting the finding / Required evidence

Structure your answer with:
1. Direct Answer
2. Relevant Policy Clauses (Clause ID, Title, Policy Text)
3. Required Evidence & Enforceable Conditions
4. Investigator Action Plan`;

        const response = await client.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            temperature: 0.2,
          }
        });

        return res.json({ answer: response.text?.trim() || 'No answer generated.' });
      } catch (err) {
        console.warn('Gemini query error, falling back to keyword policy search:', err);
      }
    }

    // Fallback search match
    const lower = question.toLowerCase();
    const matches = MOTOR_POLICY_KNOWLEDGE_BASE.filter(
      r => r.title.toLowerCase().includes(lower) || 
           (r.policyText && r.policyText.toLowerCase().includes(lower)) ||
           (r.description && r.description.toLowerCase().includes(lower)) ||
           (r.evidenceRequired && r.evidenceRequired.toLowerCase().includes(lower)) ||
           (r.conditions && r.conditions.some(c => c.toLowerCase().includes(lower))) ||
           lower.includes(r.clauseId.toLowerCase())
    );

    const answer = matches.length > 0
      ? `Policy Knowledge Base Grounded Analysis (Rule-Based Citation):\n\n` +
        matches.map(m => `### [${m.clauseId}] ${m.title} (${m.applicableClaimType} Claims)\n` +
          `• Policy Text: "${m.policyText}"\n` +
          `• Evidence Required: ${m.evidenceRequired}\n` +
          `• Enforceable Conditions:\n` +
          m.conditions.map(c => `  - ${c}`).join('\n')
        ).join('\n\n') +
        `\n\nInvestigator Guidance: Verify whether endorsements (e.g. Zero-Depreciation POLICY-009, Engine Protector POLICY-010) are active in the claim policy schedule before final assessment.`
      : `Based on the synthetic motor insurance policy clauses (POLICY-001 through POLICY-012), claims are evaluated against Accident Coverage (POLICY-001), Exclusions (POLICY-003), Insured Value & Excess (POLICY-004), 72-Hour Notification Window (POLICY-005), Required Documents (POLICY-006), Itemized Repair Estimates (POLICY-007), and Police FIR Requirements (POLICY-008). Please search by clause ID or specific keyword.`;

    res.json({ answer });
  });

  // Reset demo claims
  app.post('/api/claims/reset', (req, res) => {
    claimsDatabase = JSON.parse(JSON.stringify(INITIAL_MOCK_CLAIMS));
    res.json({ message: 'Claims reset to original realistic synthetic scenarios', count: claimsDatabase.length });
  });

  // --- VITE MIDDLEWARE SETUP ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ClaimGuard AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
