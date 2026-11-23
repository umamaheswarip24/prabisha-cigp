import { prisma } from '@/lib/db/prisma';
import {
  ShieldCheck,
  BookOpen,
  FileText,
  CheckCircle2,
  ExternalLink,
  Award,
  Layers,
} from 'lucide-react';
import { HistoricalContentView } from './HistoricalContentView';

export const revalidate = 0;

export default async function KnowledgePage() {
  const [brandProfile, products, evidence, claims, historicalDocs] = await Promise.all([
    prisma.brandProfile.findFirst(),
    prisma.productService.findMany(),
    prisma.evidenceRecord.findMany({ orderBy: { verifiedAt: 'desc' } }),
    prisma.claim.findMany({ orderBy: { reviewDate: 'desc' } }),
    prisma.historicalContent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Decluttered Page Header on Canvas */}
      <div className="border-b border-[#E2E4E9] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Grounded Knowledge &amp; Claim Registry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            The core intelligence layer. Generation models are strictly constrained to factual records registered here.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
            {claims.length} Approved Claims Active
          </span>
        </div>
      </div>

      {/* Historical Content & Semantic Search Archive (Dense Data Rows) */}
      <HistoricalContentView initialDocuments={historicalDocs} />

      {/* Grid: Claims Registry (Left) & Evidence Library (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Approved Claim Registry */}
        <div className="bg-white rounded-md border border-[#E2E4E9] shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#E2E4E9]">
            <div>
              <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Approved Claims Registry ({claims.length})</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Verifiable objective claims approved for use in promotional content
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded">
              ASA/ASCI Validated
            </span>
          </div>

          <div className="space-y-2.5">
            {claims.map((claim) => (
              <div
                key={claim.id}
                className="p-3 bg-[#FAF9F6] rounded border border-[#E2E4E9] space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-indigo-700">
                    {claim.id}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      claim.riskLevel === 'LOW'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    Risk: {claim.riskLevel}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900 leading-snug">
                  &quot;{claim.exactWording}&quot;
                </p>
                <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-[#E2E4E9]">
                  <span>Reviewer: {claim.reviewer}</span>
                  <span>Verified: {new Date(claim.reviewDate).toLocaleDateString('en-GB')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence Library & Proof Records */}
        <div className="bg-white rounded-md border border-[#E2E4E9] shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#E2E4E9]">
            <div>
              <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
                <Award className="w-3.5 h-3.5 text-indigo-600" />
                <span>Evidence Records &amp; Proof ({evidence.length})</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Audited metrics, customer permissions, and case studies
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Verified Proof</span>
          </div>

          <div className="space-y-2.5">
            {evidence.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-[#FAF9F6] rounded border border-[#E2E4E9] space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{item.title}</span>
                  <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded border border-[#E2E4E9]">
                    {item.scope}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-indigo-700 bg-white p-1.5 rounded border border-[#E2E4E9]">
                  {item.verifiedData}
                </p>
                <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-[#E2E4E9]">
                  <span>Owner: {item.owner}</span>
                  <span>Permission: {item.permissionStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
