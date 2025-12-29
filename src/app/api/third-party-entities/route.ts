import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const entities = await prisma.thirdPartyEntity.findMany({
      where: { active: true },
      include: {
        batches: {
          select: {
            id: true,
            batchNumber: true,
            status: true,
            currentQuantityKg: true,
            queuePosition: true,
          },
          orderBy: {
            queuePosition: 'asc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(entities);
  } catch (error) {
    console.error('Error fetching third-party entities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch third-party entities' },
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

    // Only allow specific roles to create entities
    if (!['CEO', 'ADMIN', 'PLANT_MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { name, contactPerson, email, phone } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Entity name is required' },
        { status: 400 }
      );
    }

    const entity = await prisma.thirdPartyEntity.create({
      data: {
        name,
        contactPerson: contactPerson || null,
        email: email || null,
        phone: phone || null,
      },
    });

    return NextResponse.json(entity);
  } catch (error) {
    console.error('Error creating third-party entity:', error);
    return NextResponse.json(
      { error: 'Failed to create third-party entity' },
      { status: 500 }
    );
  }
}










