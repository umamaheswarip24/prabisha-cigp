import { prisma } from '@/lib/db/prisma';
import { KnowledgeView } from './KnowledgeView';

export const revalidate = 0;

export default async function KnowledgePage() {
  const [evidence, claims, historicalDocs] = await Promise.all([
    prisma.evidenceRecord.findMany({ orderBy: { verifiedAt: 'desc' } }),
    prisma.claim.findMany({ orderBy: { reviewDate: 'desc' } }),
    prisma.historicalContent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  return (
    <KnowledgeView
      initialDocuments={historicalDocs}
      claims={claims}
      evidence={evidence}
    />
  );
}
