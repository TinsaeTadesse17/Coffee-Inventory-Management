-- CreateEnum
CREATE TYPE "ProcessingStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "processing_runs" ADD COLUMN     "status" "ProcessingStatus" NOT NULL DEFAULT 'IN_PROGRESS';

-- CreateTable
CREATE TABLE "processing_run_inputs" (
    "id" TEXT NOT NULL,
    "processingRunId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "weightUsed" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "processing_run_inputs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "processing_run_inputs" ADD CONSTRAINT "processing_run_inputs_processingRunId_fkey" FOREIGN KEY ("processingRunId") REFERENCES "processing_runs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processing_run_inputs" ADD CONSTRAINT "processing_run_inputs_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
