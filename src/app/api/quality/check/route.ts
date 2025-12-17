import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { notifyBatchReady } from "@/lib/notification-service"
import { Role } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = session.user
    if (user.role !== Role.QUALITY && user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const data = await request.json()

    const {
      batchId,
      sessionName,
      sessionDate,
      origin,
      roastProfile,
      moisture,
      defects,
      fragrance,
      flavor,
      aftertaste,
      acidity,
      body,
      balance,
      sweetness,
      uniformity,
      cleanCup,
      overall,
      notes,
      checkpoint = "FIRST_QC",
    } = data

    const requiredFields = {
      batchId,
      sessionName,
      sessionDate,
      fragrance,
      flavor,
      aftertaste,
      acidity,
      body,
      balance,
      sweetness,
      uniformity,
      cleanCup,
      overall,
    }

    for (const [field, value] of Object.entries(requiredFields)) {
      if (value === undefined || value === null || value === "") {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    const sessionDateValue = new Date(sessionDate)
    if (Number.isNaN(sessionDateValue.getTime())) {
      return NextResponse.json({ error: "Invalid session date" }, { status: 400 })
    }

    const scoreFields = {
      fragranceScore: Number(fragrance),
      flavorScore: Number(flavor),
      aftertasteScore: Number(aftertaste),
      acidityScore: Number(acidity),
      bodyScore: Number(body),
      balanceScore: Number(balance),
      sweetnessScore: Number(sweetness),
      uniformityScore: Number(uniformity),
      cleanCupScore: Number(cleanCup),
      overallScore: Number(overall),
    }

    for (const [key, value] of Object.entries(scoreFields)) {
      if (Number.isNaN(value)) {
        return NextResponse.json(
          { error: `Invalid numeric value for ${key}` },
          { status: 400 }
        )
      }
    }

    const totalScore = Object.values(scoreFields).reduce((sum, value) => sum + value, 0)

    // Find batch (match by id or batch number; prefer explicit id)
    const batch = await prisma.batch.findFirst({
      where: {
        OR: [
          { id: batchId },
          { batchNumber: batchId },
        ],
      },
      orderBy: { createdAt: "desc" },
    })

    if (!batch) {
      return NextResponse.json(
        { error: "Batch not found. Receive it in warehouse first." },
        { status: 400 }
      )
    }

    // Decide QC outcome based on total score (threshold: 80)
    const passed = totalScore >= 80

    // Check if this is the first QC check
    const existingQcCount = await prisma.qualityCheck.count({
      where: { batchId: batch.id }
    })
    const isFirstQc = existingQcCount === 0

    // Create QC check
    const qcCheck = await prisma.qualityCheck.create({
      data: {
        batch: { connect: { id: batch.id } },
        checkpoint,
        inspector: { connect: { id: user.id } },
        sessionName,
        sessionDate: sessionDateValue,
        origin: origin || null,
        roastProfile: roastProfile || null,
        moisturePercent: typeof moisture === "number" ? moisture : moisture ? Number(moisture) : null,
        defectsScore: typeof defects === "number" ? defects : defects ? Number(defects) : null,
        ...scoreFields,
        totalScore,
        notes: notes || null,
      },
    })

    // Update batch status
    await prisma.batch.update({
      where: { id: batch.id },
      data: {
        status: passed ? "STORED" : "REJECTED",
      },
    })

    // Notify Plant Manager if this is a passing First QC check
    // This signals that the coffee is ready for processing
    if (passed && checkpoint === "FIRST_QC") {
      try {
        await notifyBatchReady({
          batchId: batch.id,
          batchNumber: batch.batchNumber,
          nextRole: Role.PLANT_MANAGER,
          stepName: "Processing",
        })
      } catch (notifyError) {
        console.error("Failed to send notification:", notifyError)
      }
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        entity: "QualityCheck",
        entityId: qcCheck.id,
        action: "CREATE_QC_CHECK",
        changes: JSON.stringify({
          passed,
          totalScore,
          checkpoint,
          sessionName,
          sessionDate,
          scores: scoreFields,
          moisture,
          defects,
          origin,
          roastProfile,
        }),
      },
    })

    return NextResponse.json({ success: true, qcCheck, passed, totalScore }, { status: 201 })
  } catch (error) {
    console.error("Failed to record QC check:", error)
    return NextResponse.json(
      { error: "Failed to record QC check" },
      { status: 500 }
    )
  }
}
