import { prisma } from '@/lib/db/prisma';
import { CalendarView } from './CalendarView';

export const revalidate = 0;

export default async function CalendarPage() {
  const [assets, campaigns] = await Promise.all([
    prisma.contentAsset.findMany({
      include: {
        campaign: true,
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1,
        },
        publications: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.campaign.findMany(),
  ]);

  return <CalendarView initialAssets={assets} campaigns={campaigns} />;
}
