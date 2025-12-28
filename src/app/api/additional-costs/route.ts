import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const batchId = searchParams.get('batchId');

    const where = batchId ? { batchId } : {};

    const costs = await prisma.additionalCost.findMany({
      where,
      include: {
        batch: {
          select: {
            batchNumber: true,
          },
        },
        recordedByUser: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        recordedAt: 'desc',
      },
    });

    return NextResponse.json(costs);
  } catch (error) {
    console.error('Error fetching additional costs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch additional costs' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { batchId, costType, description, amount, currency } = body;

    if (!costType || !description || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const cost = await prisma.additionalCost.create({
      data: {
        batchId: batchId || null,
        costType,
        description,
        amount: parseFloat(amount),
        currency: currency || 'ETB',
        recordedBy: session.user.id,
      },
      include: {
        batch: {
          select: {
            batchNumber: true,
          },
        },
      },
    });

    return NextResponse.json(cost);
  } catch (error) {
    console.error('Error creating additional cost:', error);
    return NextResponse.json(
      { error: 'Failed to create additional cost' },
      { status: 500 }
    );
  }
}









