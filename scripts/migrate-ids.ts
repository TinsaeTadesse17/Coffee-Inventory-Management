
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function generateId(prefix: string): string {
  // Generate 6 random digits
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
  // Format as 000-000
  const formatted = `${random.slice(0, 3)}-${random.slice(3)}`
  return `${prefix}-${formatted}`
}

const ID_REGEX = /^[A-Z]{3}-\d{3}-\d{3}$/

async function main() {
  console.log('Starting ID migration...')

  // 1. Migrate Batches
  const batches = await prisma.batch.findMany()
  console.log(`Found ${batches.length} batches.`)
  
  for (const batch of batches) {
    const expectedPrefix = batch.isThirdParty ? "EXT" : "BTH"
    const currentPrefix = batch.batchNumber.split('-')[0]
    
    if (!ID_REGEX.test(batch.batchNumber) || currentPrefix !== expectedPrefix) {
      const newId = generateId(expectedPrefix)
      console.log(`Migrating Batch ${batch.batchNumber} -> ${newId}`)
      await prisma.batch.update({
        where: { id: batch.id },
        data: { batchNumber: newId }
      })
    }
  }

  // 2. Migrate Processing Runs
  const runs = await prisma.processingRun.findMany()
  console.log(`Found ${runs.length} processing runs.`)

  for (const run of runs) {
    if (!ID_REGEX.test(run.runNumber)) {
      const newId = generateId("RUN")
      console.log(`Migrating Run ${run.runNumber} -> ${newId}`)
      await prisma.processingRun.update({
        where: { id: run.id },
        data: { runNumber: newId }
      })
    }
  }

  // 3. Migrate Contracts
  const contracts = await prisma.contract.findMany()
  console.log(`Found ${contracts.length} contracts.`)

  for (const contract of contracts) {
    if (!ID_REGEX.test(contract.contractNumber)) {
      const newId = generateId("CON")
      console.log(`Migrating Contract ${contract.contractNumber} -> ${newId}`)
      await prisma.contract.update({
        where: { id: contract.id },
        data: { contractNumber: newId }
      })
    }
  }

  // 4. Migrate Warehouse Entries
  const entries = await prisma.warehouseEntry.findMany()
  console.log(`Found ${entries.length} warehouse entries.`)

  for (const entry of entries) {
    if (!ID_REGEX.test(entry.warehouseNumber)) {
      const newId = generateId("WHE")
      console.log(`Migrating Warehouse Entry ${entry.warehouseNumber} -> ${newId}`)
      await prisma.warehouseEntry.update({
        where: { id: entry.id },
        data: { warehouseNumber: newId }
      })
    }
  }

  // 5. Migrate Representative Samples
  const samples = await prisma.representativeSample.findMany()
  console.log(`Found ${samples.length} representative samples.`)

  for (const sample of samples) {
    if (!ID_REGEX.test(sample.sampleCode)) {
      const newId = generateId("RPS")
      console.log(`Migrating Sample ${sample.sampleCode} -> ${newId}`)
      await prisma.representativeSample.update({
        where: { id: sample.id },
        data: { sampleCode: newId }
      })
    }
  }

  // 6. Migrate Shipments
  const shipments = await prisma.shipment.findMany()
  console.log(`Found ${shipments.length} shipments.`)

  for (const shipment of shipments) {
    if (!ID_REGEX.test(shipment.shipmentNumber)) {
      const newId = generateId("SHP")
      console.log(`Migrating Shipment ${shipment.shipmentNumber} -> ${newId}`)
      await prisma.shipment.update({
        where: { id: shipment.id },
        data: { shipmentNumber: newId }
      })
    }
  }

  console.log('Migration completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
