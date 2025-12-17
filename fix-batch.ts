
import { prisma } from "./src/lib/prisma"

async function main() {
  const batchNumber = 'BTH-1765717793212' // One of the rejected ones
  console.log(`Fixing batch ${batchNumber}...`)

  const batch = await prisma.batch.findFirst({
    where: { batchNumber }
  })

  if (!batch) {
    console.error("Batch not found")
    return
  }

  // Update QC check to be passing
  await prisma.qualityCheck.updateMany({
    where: { batchId: batch.id },
    data: { 
      totalScore: 85,
      fragranceScore: 8.5,
      flavorScore: 8.5,
      aftertasteScore: 8.5,
      acidityScore: 8.5,
      bodyScore: 8.5,
      balanceScore: 8.5,
      sweetnessScore: 8.5,
      uniformityScore: 8.5,
      cleanCupScore: 8.5,
      overallScore: 8.5
    }
  })

  // Update batch status to STORED
  await prisma.batch.update({
    where: { id: batch.id },
    data: { status: 'STORED' }
  })

  console.log("Batch updated to STORED with score 85.")
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
