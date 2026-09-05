import React, { useState, useEffect } from 'react';
import { ClaimRecord, PolicyClause } from './types/claim';
import { claimsApi } from './api/claimsApi';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { LegalDisclaimerBanner } from './components/layout/LegalDisclaimerBanner';
import { DashboardPage } from './pages/DashboardPage';
import { NewClaimReviewPage } from './pages/NewClaimReviewPage';
import { ClaimsListPage } from './pages/ClaimsListPage';
import { ClaimDetailsPage } from './pages/ClaimDetailsPage';
import { ClaimReviewPage } from './pages/ClaimReviewPage';
import { EvidenceComparisonPage } from './pages/EvidenceComparisonPage';
import { PolicyRulesPage } from './pages/PolicyRulesPage';
import { ReviewReportPage } from './pages/ReviewReportPage';
import { HumanEscalationPage } from './pages/HumanEscalationPage';
import { SettingsPage } from './pages/SettingsPage';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('claim_review');
  const [claims, setClaims] = useState<ClaimRecord[]>([]);
  const [policyRules, setPolicyRules] = useState<PolicyClause[]>([]);
  const [activeClaimId, setActiveClaimId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Initial load
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [loadedClaims, loadedRules] = await Promise.all([
          claimsApi.getClaims(),
          claimsApi.getPolicyRules(),
        ]);
        setClaims(loadedClaims);
        setPolicyRules(loadedRules);
        if (loadedClaims.length > 0) {
          setActiveClaimId(loadedClaims[0].id);
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSelectClaim = (claimId: string, targetTab: string = 'claim_review') => {
    setActiveClaimId(claimId);
    setActiveTab(targetTab);
  };

  const handleClaimCreated = (newClaim: ClaimRecord) => {
    setClaims(prev => [newClaim, ...prev]);
    setActiveClaimId(newClaim.id);
    setActiveTab('claim_review');
  };

  const handleUpdateEscalation = async (id: string, payload: any) => {
    try {
      const updated = await claimsApi.updateClaimEscalation(id, payload);
      setClaims(prev => prev.map(c => c.id === id ? updated : c));
    } catch (err) {
      console.error('Failed to update escalation status:', err);
      throw err;
    }
  };

  const handleResetData = async () => {
    try {
      setIsLoading(true);
      const resetClaims = await claimsApi.resetDemoData();
      setClaims(resetClaims);
      if (resetClaims.length > 0) {
        setActiveClaimId(resetClaims[0].id);
      }
      setActiveTab('claim_review');
    } catch (err) {
      console.error('Failed to reset demo data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const currentClaim = claims.find(c => c.id === activeClaimId) || claims[0];
  const pendingEscalationsCount = claims.filter(c => 
    c.recommendation.requiresHumanEscalation || c.status.includes('Escalated')
  ).length;
  const contradictionCount = claims.filter(c => c.contradictions && c.contradictions.length > 0).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      
      {/* Top Header: Logo/Name, Claims Evidence Review Assistant, Profile, Notifications */}
      <Header
        claims={claims}
        onSelectClaim={(id) => handleSelectClaim(id, 'claim_details')}
        onNavigate={setActiveTab}
        onResetDemoData={handleResetData}
        onToggleSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
        isSidebarOpen={isMobileSidebarOpen}
      />

      {/* Statutory Regulatory Disclaimer Banner */}
      <LegalDisclaimerBanner />

      {/* App Workspace Body: Sidebar + Main Content */}
      <div className="flex-1 flex w-full">
        {/* Left Sidebar: Dashboard, New Claim, Claims, Evidence Review, Policy Rules, Reports, Escalations, Settings */}
        <Sidebar
          activeTab={activeTab}
          onNavigate={setActiveTab}
          escalationCount={pendingEscalationsCount}
          totalClaimsCount={claims.length}
          contradictionCount={contradictionCount}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 px-3 sm:px-5 lg:px-6 py-4 overflow-x-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-xs font-semibold text-slate-500">Loading motor claims evidence engine...</p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardPage
                  claims={claims}
                  onSelectClaim={(id) => handleSelectClaim(id, 'claim_review')}
                  onNavigate={setActiveTab}
                  onResetDemoData={handleResetData}
                />
              )}

              {(activeTab === 'claims_list' || activeTab === 'claims') && (
                <ClaimsListPage
                  claims={claims}
                  onSelectClaim={(id) => handleSelectClaim(id, 'claim_review')}
                  onNavigate={setActiveTab}
                />
              )}

              {activeTab === 'new_claim' && (
                <NewClaimReviewPage
                  onClaimCreated={handleClaimCreated}
                  onNavigate={setActiveTab}
                />
              )}

              {activeTab === 'claim_details' && currentClaim && (
                <ClaimDetailsPage
                  claim={currentClaim}
                  onBack={() => setActiveTab('claim_review')}
                  onNavigate={setActiveTab}
                  onUpdateEscalation={handleUpdateEscalation}
                />
              )}

              {(activeTab === 'claim_review' || activeTab === 'evidence_comparison') && (
                <ClaimReviewPage
                  claims={claims}
                  activeClaimId={activeClaimId}
                  onSelectClaim={(id) => setActiveClaimId(id)}
                  onNavigate={setActiveTab}
                  onBack={() => setActiveTab('claims_list')}
                  onUpdateEscalation={handleUpdateEscalation}
                />
              )}

              {activeTab === 'policy_rules' && (
                <PolicyRulesPage policyRules={policyRules} />
              )}

              {activeTab === 'review_report' && (
                <ReviewReportPage
                  claims={claims}
                  activeClaimId={activeClaimId}
                  onSelectClaim={(id) => setActiveClaimId(id)}
                  onNavigate={setActiveTab}
                />
              )}

              {(activeTab === 'human_escalation' || activeTab === 'escalations') && (
                <HumanEscalationPage
                  claims={claims}
                  onSelectClaim={(id) => handleSelectClaim(id, 'claim_review')}
                  onNavigate={setActiveTab}
                  onUpdateEscalation={handleUpdateEscalation}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsPage
                  onResetDemoData={handleResetData}
                  onNavigate={setActiveTab}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* High Density Status Footer */}
      <footer className="h-8 bg-slate-900 border-t border-slate-800 px-4 flex items-center justify-between text-[11px] text-slate-400 shrink-0 select-none z-40">
        <div className="flex items-center gap-2">
          <span>System Status: <span className="text-emerald-400 font-bold">CONNECTED</span></span>
          <span className="text-slate-600">•</span>
          <span>Latency: <span className="text-slate-300 font-mono">24ms</span></span>
          <span className="text-slate-600 hidden md:inline">•</span>
          <span className="hidden md:inline">SIU Triangulation Engine: <span className="text-slate-300 font-medium">Grounded Motor Rules v2.4</span></span>
        </div>
        <div className="flex items-center gap-4 text-[10px]">
          <span>Claims Registered: <strong className="text-slate-300 font-mono">{claims.length}</strong></span>
          <span className="hidden sm:inline hover:text-slate-200 cursor-pointer">IRDAI Audit Trail Ready</span>
        </div>
      </footer>
    </div>
  );
}

