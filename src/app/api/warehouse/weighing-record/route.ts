import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const batchId = searchParams.get("batchId")

    if (!batchId) {
      return NextResponse.json(
        { error: "Batch ID is required" },
        { status: 400 }
      )
    }

    // Find batch by ID or batch number
    const batch = await prisma.batch.findFirst({
      where: {
        OR: [
          { id: batchId },
          { batchNumber: batchId },
        ],
      },
    })

    if (!batch) {
      return NextResponse.json(
        { error: "Batch not found" },
        { status: 404 }
      )
    }

    // Find the most recent weighing record for this batch
    const weighingRecord = await prisma.vehicleWeighingRecord.findFirst({
      where: {
        batchId: batch.id,
      },
      include: {
        batch: {
          include: {
            supplier: true,
          },
        },
      },
      orderBy: {
        timestampIn: "desc",
      },
    })

    if (!weighingRecord) {
      return NextResponse.json(
        { error: "No weighing record found for this batch" },
        { status: 404 }
      )
    }

    return NextResponse.json({ weighingRecord })
  } catch (error) {
    console.error("Failed to fetch weighing record:", error)
    return NextResponse.json(
      { error: "Failed to fetch weighing record" },
      { status: 500 }
    )
  }
}


