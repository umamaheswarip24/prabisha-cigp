import { prisma } from '../src/lib/db/prisma';

async function main() {
  console.log('Campaigns:', await prisma.campaign.count());
  console.log('Assets:', await prisma.contentAsset.count());
  console.log('Versions:', await prisma.contentVersion.count());
  console.log('Publications:', await prisma.publication.count());
  console.log('HistoricalContent:', await prisma.historicalContent.count());
  console.log('Claims:', await prisma.claim.count());
  console.log('Evidence:', await prisma.evidenceRecord.count());
  console.log('ICPs:', await prisma.iCPPersona.count());
  console.log('AIRequestLogs:', await prisma.aIRequestLog.count());
  console.log('AuditEvents:', await prisma.auditEvent.count());
  
  const campaigns = await prisma.campaign.findMany({ select: { id: true, name: true } });
  console.log('Campaign names:', campaigns);

  const assets = await prisma.contentAsset.findMany({ select: { id: true, status: true, channel: true } });
  console.log('Assets:', assets);
}

main().finally(() => prisma.$disconnect());
