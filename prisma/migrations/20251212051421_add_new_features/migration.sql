/*
  Warnings:

  - Added the required column `currentQuantityKg` to the `batches` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MeasurementType" AS ENUM ('JUTE_BAG', 'FERESULA', 'KILOGRAM');

-- CreateEnum
CREATE TYPE "JuteBagSize" AS ENUM ('KG_30', 'KG_50', 'KG_60', 'KG_85');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'APPROVAL_REQUEST';
ALTER TYPE "NotificationType" ADD VALUE 'BATCH_READY';
ALTER TYPE "NotificationType" ADD VALUE 'AGING_ALERT';
ALTER TYPE "NotificationType" ADD VALUE 'DUPLICATE_ENTRY';
ALTER TYPE "NotificationType" ADD VALUE 'PROCESSING_COMPLETE';
ALTER TYPE "NotificationType" ADD VALUE 'JUTE_BAG_LOW_STOCK';

-- DropForeignKey
ALTER TABLE "public"."batches" DROP CONSTRAINT "batches_supplierId_fkey";

-- AlterTable
ALTER TABLE "batches" ADD COLUMN     "currentQuantityKg" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "duplicateApprovedBy" TEXT,
ADD COLUMN     "exchangeRateAtPurchase" DOUBLE PRECISION,
ADD COLUMN     "isAging" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isDuplicateEntry" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isThirdParty" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "queuePosition" INTEGER,
ADD COLUMN     "thirdPartyEntityId" TEXT,
ADD COLUMN     "warehouseEntryDate" TIMESTAMP(3),
ALTER COLUMN "supplierId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "contracts" ADD COLUMN     "exchangeRateAtExport" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "processing_runs" ADD COLUMN     "processingGrade" TEXT,
ADD COLUMN     "wasteQuantity" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "warehouse_entries" ADD COLUMN     "feresulaBags" INTEGER,
ADD COLUMN     "juteBagCount" INTEGER,
ADD COLUMN     "juteBagSize" "JuteBagSize",
ADD COLUMN     "measurementType" "MeasurementType" NOT NULL DEFAULT 'KILOGRAM';

-- CreateTable
CREATE TABLE "third_party_entities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactPerson" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "third_party_entities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jute_bag_inventory" (
    "id" TEXT NOT NULL,
    "size" "JuteBagSize" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "pricePerBag" DOUBLE PRECISION NOT NULL,
    "lowStockAlert" INTEGER NOT NULL DEFAULT 50,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jute_bag_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "additional_costs" (
    "id" TEXT NOT NULL,
    "batchId" TEXT,
    "costType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ETB',
    "recordedBy" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "additional_costs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "processing_costs" (
    "id" TEXT NOT NULL,
    "processingRunId" TEXT NOT NULL,
    "costType" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ETB',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "processing_costs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "storage_costs" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "daysStored" INTEGER NOT NULL,
    "juteBagCount" INTEGER NOT NULL,
    "costPerTonPerDay" DOUBLE PRECISION NOT NULL DEFAULT 2200,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "storage_costs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "jute_bag_inventory_size_key" ON "jute_bag_inventory"("size");

-- AddForeignKey
ALTER TABLE "batches" ADD CONSTRAINT "batches_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batches" ADD CONSTRAINT "batches_thirdPartyEntityId_fkey" FOREIGN KEY ("thirdPartyEntityId") REFERENCES "third_party_entities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "additional_costs" ADD CONSTRAINT "additional_costs_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "additional_costs" ADD CONSTRAINT "additional_costs_recordedBy_fkey" FOREIGN KEY ("recordedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processing_costs" ADD CONSTRAINT "processing_costs_processingRunId_fkey" FOREIGN KEY ("processingRunId") REFERENCES "processing_runs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
