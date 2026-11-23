import { prisma } from '@/lib/db/prisma';
import { ICPManagerView } from './ICPManagerView';

export const revalidate = 0;

export default async function ICPPage() {
  const [icps, products] = await Promise.all([
    prisma.iCPPersona.findMany({
      include: {
        campaigns: {
          select: { id: true, name: true, status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.productService.findMany(),
  ]);

  return <ICPManagerView initialIcps={icps} products={products} />;
}

