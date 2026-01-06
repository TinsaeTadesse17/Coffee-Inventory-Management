import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Get storage costs
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const batchId = searchParams.get('batchId');

    const where = batchId ? { batchId } : {};

    const storageCosts = await prisma.storageCost.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(storageCosts);
  } catch (error) {
    console.error('Error fetching storage costs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch storage costs' },
      { status: 500 }
    );
  }
}

/**
 * Create storage cost record
 * For third-party coffee stored beyond 15 days
 * Cost: 2200 ETB per ton per day
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { batchId, startDate, endDate, juteBagCount, costPerTonPerDay = 2200 } = body;

    if (!batchId || !startDate || !juteBagCount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const daysStored = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate cost: (juteBagCount * avgWeightPerBag) / 1000 * daysStored * costPerTonPerDay
    // Assuming average 50kg per bag
    const totalTons = (juteBagCount * 50) / 1000;
    const totalCost = totalTons * daysStored * costPerTonPerDay;

    const storageCost = await prisma.storageCost.create({
      data: {
        batchId,
        startDate: start,
        endDate: endDate ? end : null,
        daysStored,
        juteBagCount: Number(juteBagCount),
        costPerTonPerDay: Number(costPerTonPerDay),
        totalCost,
      },
    });

    return NextResponse.json(storageCost);
  } catch (error) {
    console.error('Error creating storage cost:', error);
    return NextResponse.json(
      { error: 'Failed to create storage cost' },
      { status: 500 }
    );
  }
}

/**
 * Update storage cost (mark end date)
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, endDate } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Storage cost ID is required' },
        { status: 400 }
      );
    }

    const existingCost = await prisma.storageCost.findUnique({
      where: { id },
    });

    if (!existingCost) {
      return NextResponse.json(
        { error: 'Storage cost not found' },
        { status: 404 }
      );
    }

    const end = endDate ? new Date(endDate) : new Date();
    const daysStored = Math.ceil((end.getTime() - existingCost.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalTons = (existingCost.juteBagCount * 50) / 1000;
    const totalCost = totalTons * daysStored * existingCost.costPerTonPerDay;

    const updated = await prisma.storageCost.update({
      where: { id },
      data: {
        endDate: end,
        daysStored,
        totalCost,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating storage cost:', error);
    return NextResponse.json(
      { error: 'Failed to update storage cost' },
      { status: 500 }
    );
  }
}











