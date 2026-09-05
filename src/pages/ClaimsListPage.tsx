import React, { useState, useMemo } from 'react';
import { ClaimRecord, VehicleCategory, RecommendationDecision } from '../types/claim';
import { RecommendationBadge, SeverityBadge, ClaimStatusBadge } from '../components/common/Badges';
import { 
  Search, 
  Filter, 
  Car, 
  Bike, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpDown,
  ExternalLink,
  Plus
} from 'lucide-react';

interface ClaimsListPageProps {
  claims: ClaimRecord[];
  onSelectClaim: (claimId: string) => void;
  onNavigate: (page: any) => void;
}

export const ClaimsListPage: React.FC<ClaimsListPageProps> = ({
  claims,
  onSelectClaim,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState<'all' | VehicleCategory>('all');
  const [recommendationFilter, setRecommendationFilter] = useState<'all' | RecommendationDecision>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'contradictions'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredClaims = useMemo(() => {
    return claims.filter(c => {
      const matchesSearch = 
        c.claimNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.claimForm.insuredName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.claimForm.vehicleRegistrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.claimForm.vehicleMakeModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.claimForm.driverName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesVehicle = vehicleFilter === 'all' || c.claimForm.vehicleCategory === vehicleFilter;
      const matchesRec = recommendationFilter === 'all' || c.recommendation.decision === recommendationFilter;
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

      return matchesSearch && matchesVehicle && matchesRec && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === 'amount') {
        return sortOrder === 'desc' 
          ? b.claimForm.claimedAmount - a.claimForm.claimedAmount
          : a.claimForm.claimedAmount - b.claimForm.claimedAmount;
      }
      if (sortBy === 'contradictions') {
        return sortOrder === 'desc'
          ? b.contradictions.length - a.contradictions.length
          : a.contradictions.length - b.contradictions.length;
      }
      // default date
      return sortOrder === 'desc'
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [claims, searchQuery, vehicleFilter, recommendationFilter, statusFilter, sortBy, sortOrder]);

  return (
    <div className="space-y-3 pb-12">
      {/* High Density Header */}
      <div className="h-12 flex items-center justify-between bg-white px-3.5 border border-slate-200 rounded shadow-xs">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600" />
          <h1 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Claims Evidence Register</h1>
          <span className="h-4 w-[1px] bg-slate-200 mx-1"></span>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest hidden sm:inline">Active SIU Inventory</span>
        </div>
        <button
          onClick={() => onNavigate('new_claim')}
          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded shadow-sm shadow-blue-900/20 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Claim</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-2.5 rounded border border-slate-200 shadow-xs space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          
          {/* Search Bar */}
          <div className="relative md:col-span-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search Claim ID, Insured, Vehicle Reg, Driver..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1 rounded border border-slate-200 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Vehicle Type Filter */}
          <div>
            <select
              value={vehicleFilter}
              onChange={e => setVehicleFilter(e.target.value as any)}
              className="w-full px-2.5 py-1 rounded border border-slate-200 text-xs bg-white text-slate-700 font-medium cursor-pointer"
            >
              <option value="all">All Vehicle Types</option>
              <option value="car">Cars Only</option>
              <option value="two_wheeler">Two-Wheelers Only</option>
            </select>
          </div>

          {/* Recommendation Filter */}
          <div>
            <select
              value={recommendationFilter}
              onChange={e => setRecommendationFilter(e.target.value as any)}
              className="w-full px-2.5 py-1 rounded border border-slate-200 text-xs bg-white text-slate-700 font-medium cursor-pointer"
            >
              <option value="all">All AI Recommendations</option>
              <option value="APPROVE">APPROVE Only</option>
              <option value="REQUEST INFORMATION">REQUEST INFORMATION Only</option>
              <option value="REJECT">REJECT Only</option>
            </select>
          </div>
        </div>

        {/* Secondary row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="font-bold text-slate-600">Showing:</span>
            <span className="font-mono">{filteredClaims.length} of {claims.length} claims</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Sort by:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  if (sortBy === 'date') setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                  else { setSortBy('date'); setSortOrder('desc'); }
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 cursor-pointer ${
                  sortBy === 'date' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                Date <ArrowUpDown className="w-2.5 h-2.5" />
              </button>
              <button
                onClick={() => {
                  if (sortBy === 'amount') setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                  else { setSortBy('amount'); setSortOrder('desc'); }
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 cursor-pointer ${
                  sortBy === 'amount' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                Amount <ArrowUpDown className="w-2.5 h-2.5" />
              </button>
              <button
                onClick={() => {
                  if (sortBy === 'contradictions') setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                  else { setSortBy('contradictions'); setSortOrder('desc'); }
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 cursor-pointer ${
                  sortBy === 'contradictions' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                Discrepancies <ArrowUpDown className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Claims Table */}
      <div className="bg-white rounded border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                <th className="py-2.5 px-3">Claim ID & Vehicle</th>
                <th className="py-2.5 px-3">Policy & Insured</th>
                <th className="py-2.5 px-3">Claimed vs Assessed</th>
                <th className="py-2.5 px-3">Discrepancies</th>
                <th className="py-2.5 px-3">Assistant Rec</th>
                <th className="py-2.5 px-3">Investigator Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No claims match your current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-mono font-bold text-slate-900">{claim.claimNumber}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        {claim.claimForm.vehicleCategory === 'car' ? (
                          <Car className="w-3 h-3 text-blue-500" />
                        ) : (
                          <Bike className="w-3 h-3 text-indigo-500" />
                        )}
                        <span className="font-medium text-slate-700">{claim.claimForm.vehicleMakeModel}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{claim.claimForm.vehicleRegistrationNumber}</span>
                    </td>
                    
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">{claim.claimForm.insuredName}</div>
                      <div className="text-[11px] text-slate-500">{claim.claimForm.policyType}</div>
                      <div className="text-[10px] font-mono text-slate-400">{claim.claimForm.policyNumber}</div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">${Number(claim.claimForm?.claimedAmount || 0).toLocaleString()}</div>
                      <div className="text-[10px] text-slate-500">
                        Assessed: <span className="font-bold text-green-700">${Number(claim.recommendation?.suggestedSettlementEstimate || 0).toLocaleString()}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      {claim.contradictions.length > 0 ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 uppercase">
                            <AlertTriangle className="w-3 h-3 text-red-600" />
                            {claim.contradictions.length} Conflict{claim.contradictions.length > 1 ? 's' : ''}
                          </span>
                          <div className="text-[9px] text-slate-400">
                            {claim.missingInformation.length} missing item(s)
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-green-700 font-bold uppercase">
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          Consistent
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="space-y-0.5">
                        <RecommendationBadge decision={claim.recommendation.decision} size="sm" />
                        <div className="text-[9px] text-slate-400 font-mono">
                          Score: {claim.recommendation.confidenceScore}%
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <ClaimStatusBadge status={claim.status} />
                      {claim.assignedInvestigator && (
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[130px]">
                          {claim.assignedInvestigator}
                        </div>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => onSelectClaim(claim.id)}
                        className="px-2 py-1 rounded text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
