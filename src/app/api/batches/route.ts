import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isAgingCoffee } from '@/lib/format-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const batches = await prisma.batch.findMany({
      select: {
        id: true,
        batchNumber: true,
        status: true,
        origin: true,
        warehouseEntryDate: true,
        isAging: true,
        currentQuantityKg: true,
        isThirdParty: true,
        qualityChecks: {
          select: {
            totalScore: true,
          },
          orderBy: {
            timestamp: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Add aging status if not already set
    const batchesWithAging = batches.map(batch => ({
      ...batch,
      isAging: batch.isAging || isAgingCoffee(batch.warehouseEntryDate),
      lastQcScore: batch.qualityChecks[0]?.totalScore,
    }));

    return NextResponse.json(batchesWithAging);
  } catch (error) {
    console.error('Error fetching batches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch batches' },
      { status: 500 }
    );
  }
}







