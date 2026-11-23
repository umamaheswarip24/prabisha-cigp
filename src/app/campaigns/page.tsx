import { prisma } from '@/lib/db/prisma';
import { CampaignView } from './CampaignView';

export const revalidate = 0;

export default async function CampaignsPage() {
  const [campaigns, icps, products] = await Promise.all([
    prisma.campaign.findMany({
      include: {
        icp: true,
        assets: {
          include: {
            versions: {
              orderBy: { versionNumber: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.iCPPersona.findMany({
      select: { id: true, title: true, buyerRole: true, industry: true },
    }),
    prisma.productService.findMany({
      select: { id: true, name: true, ctaDestinationUrl: true },
    }),
  ]);

  return <CampaignView initialCampaigns={campaigns} icps={icps} products={products} />;
}
