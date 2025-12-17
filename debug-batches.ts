
import { prisma } from "./src/lib/prisma"

async function main() {
  console.log("Checking Batches and QC Checks...")

  const batches = await prisma.batch.findMany({
    include: {
      qualityChecks: {
        orderBy: { timestamp: 'desc' },
        take: 1
      }
    }
  })

  console.log(`Found ${batches.length} batches.`)

  for (const batch of batches) {
    console.log(`Batch: ${batch.batchNumber} (ID: ${batch.id})`)
    console.log(`  Status: ${batch.status}`)
    console.log(`  QC Checks: ${batch.qualityChecks.length}`)
    if (batch.qualityChecks.length > 0) {
      console.log(`  Last QC Score: ${batch.qualityChecks[0].totalScore}`)
    } else {
      console.log(`  Last QC Score: N/A`)
    }
    
    const isStored = batch.status === "STORED"
    const hasPassedQC = batch.qualityChecks.length > 0 && (batch.qualityChecks[0].totalScore || 0) >= 80
    
    console.log(`  Visible in Selector? ${isStored && hasPassedQC}`)
    console.log("---")
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
