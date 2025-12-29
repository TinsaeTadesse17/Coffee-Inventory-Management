import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notifyLowJuteBagStock } from '@/lib/notification-service';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const inventory = await prisma.juteBagInventory.findMany({
      orderBy: {
        size: 'asc',
      },
    });

    return NextResponse.json(inventory);
  } catch (error) {
    console.error('Error fetching jute bag inventory:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jute bag inventory' },
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

    // Only allow WAREHOUSE, CEO, and ADMIN to manage jute bags
    if (!['WAREHOUSE', 'CEO', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { size, quantity, pricePerBag, lowStockAlert } = body;

    // Check if entry exists
    const existing = await prisma.juteBagInventory.findUnique({
      where: { size },
    });

    let inventory;
    if (existing) {
      inventory = await prisma.juteBagInventory.update({
        where: { size },
        data: {
          quantity,
          pricePerBag,
          lowStockAlert,
        },
      });
    } else {
      inventory = await prisma.juteBagInventory.create({
        data: {
          size,
          quantity,
          pricePerBag,
          lowStockAlert: lowStockAlert || 50,
        },
      });
    }

    // Check if stock is low and send notification
    if (inventory.quantity <= inventory.lowStockAlert) {
      await notifyLowJuteBagStock({
        size: inventory.size,
        currentQuantity: inventory.quantity,
        threshold: inventory.lowStockAlert,
      });
    }

    return NextResponse.json(inventory);
  } catch (error) {
    console.error('Error updating jute bag inventory:', error);
    return NextResponse.json(
      { error: 'Failed to update jute bag inventory' },
      { status: 500 }
    );
  }
}










