
import { notifyBatchReady } from "./src/lib/notification-service"
import { Role } from "@prisma/client"

async function testNotification() {
  console.log("Testing notification for PLANT_MANAGER...")
  try {
    const result = await notifyBatchReady({
      batchId: "test-batch-id",
      batchNumber: "TEST-BATCH-001",
      nextRole: Role.PLANT_MANAGER,
      stepName: "Processing",
    })
    console.log("Notification result:", result)
  } catch (error) {
    console.error("Notification failed:", error)
  }
}

testNotification()
