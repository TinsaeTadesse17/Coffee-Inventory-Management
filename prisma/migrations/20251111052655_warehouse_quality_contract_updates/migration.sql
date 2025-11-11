-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CEO', 'PURCHASING', 'SECURITY', 'QUALITY', 'WAREHOUSE', 'PLANT_MANAGER', 'EXPORT_MANAGER', 'FINANCE', 'ADMIN');

-- CreateEnum
CREATE TYPE "ProcessingType" AS ENUM ('NATURAL', 'WASHED', 'SPECIAL', 'ANAEROBIC', 'HONEY');

-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('ORDERED', 'AT_GATE', 'AT_WAREHOUSE', 'STORED', 'PROCESSING_REQUESTED', 'IN_PROCESSING', 'PROCESSED', 'EXPORT_READY', 'IN_TRANSIT', 'SHIPPED', 'REJECTED', 'REPROCESSING');

-- CreateEnum
CREATE TYPE "WarehouseEntryType" AS ENUM ('ARRIVAL', 'REJECT', 'EXPORT');

-- CreateEnum
CREATE TYPE "QCCheckpoint" AS ENUM ('FIRST_QC', 'POST_PROCESSING', 'CLU', 'REPROCESS_CHECK');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PSSStatus" AS ENUM ('PENDING', 'SENT', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('TT', 'LC', 'CAD');

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('BOOKED', 'DOCUMENTS_READY', 'CLU_PENDING', 'CLU_PASSED', 'CLU_FAILED', 'PERMIT_REQUESTED', 'PERMIT_RECEIVED', 'IN_TRANSIT', 'ARRIVED', 'PAID');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('COFFEE_AUTHORITY', 'CLU', 'BILL_OF_LADING', 'ORIGINAL_BILL', 'CONTRACT', 'PSS', 'PURCHASE_ORDER', 'QUALITY_CERTIFICATE', 'BANK_RECEIPT', 'PERMIT', 'OTHER');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('WEIGHT_LOSS_ALERT', 'MOISTURE_ALERT', 'SHIPPING_DATE_ALERT', 'PSS_REJECTED', 'QC_FAILED', 'CONTRACT_APPROVED', 'PERMIT_REQUIRED', 'GENERAL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PURCHASING',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "contact" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "certifications" TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batches" (
    "id" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "grade" TEXT,
    "variety" TEXT,
    "processingType" "ProcessingType" NOT NULL DEFAULT 'NATURAL',
    "purchaseDate" TIMESTAMP(3) NOT NULL,
    "purchasedQuantityKg" DOUBLE PRECISION NOT NULL,
    "purchaseCost" DOUBLE PRECISION NOT NULL,
    "purchaseCurrency" TEXT NOT NULL DEFAULT 'ETB',
    "containerCount" INTEGER,
    "status" "BatchStatus" NOT NULL DEFAULT 'ORDERED',
    "currentLocation" TEXT,
    "representativeSampleId" TEXT,
    "contractId" TEXT,
    "reprocessCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_weighing_records" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "vehiclePlate" TEXT NOT NULL,
    "timestampIn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grossWeightIn" DOUBLE PRECISION NOT NULL,
    "timestampOut" TIMESTAMP(3),
    "grossWeightOut" DOUBLE PRECISION,
    "tareWeight" DOUBLE PRECISION,
    "netWeight" DOUBLE PRECISION,
    "weightLossKg" DOUBLE PRECISION,
    "weightLossPercent" DOUBLE PRECISION,
    "checkpointType" TEXT NOT NULL DEFAULT 'GATE',
    "authorityDocsUrl" TEXT[],
    "notes" TEXT,
    "recordedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_weighing_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_entries" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "warehouseNumber" TEXT NOT NULL,
    "entryType" "WarehouseEntryType" NOT NULL DEFAULT 'ARRIVAL',
    "arrivalTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "arrivalWeightKg" DOUBLE PRECISION NOT NULL,
    "storageLocations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "moisturePercent" DOUBLE PRECISION,
    "temperatureCelsius" DOUBLE PRECISION,
    "bags" INTEGER,
    "notes" TEXT,
    "receivedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouse_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_checks" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "checkpoint" "QCCheckpoint" NOT NULL,
    "inspectorId" TEXT NOT NULL,
    "sessionName" TEXT NOT NULL,
    "sessionDate" TIMESTAMP(3) NOT NULL,
    "origin" TEXT,
    "roastProfile" TEXT,
    "moisturePercent" DOUBLE PRECISION,
    "defectsScore" DOUBLE PRECISION,
    "fragranceScore" INTEGER,
    "flavorScore" INTEGER,
    "aftertasteScore" INTEGER,
    "acidityScore" INTEGER,
    "bodyScore" INTEGER,
    "balanceScore" INTEGER,
    "sweetnessScore" INTEGER,
    "uniformityScore" INTEGER,
    "cleanCupScore" INTEGER,
    "overallScore" INTEGER,
    "totalScore" DOUBLE PRECISION,
    "notes" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quality_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "representative_samples" (
    "id" TEXT NOT NULL,
    "sampleCode" TEXT NOT NULL,
    "photoUrls" TEXT[],
    "storageLocation" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "representative_samples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "fromLocation" TEXT,
    "toLocation" TEXT NOT NULL,
    "quantityKg" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "movedBy" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "processing_runs" (
    "id" TEXT NOT NULL,
    "runNumber" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "yieldRatio" DOUBLE PRECISION,
    "exportQuantity" DOUBLE PRECISION,
    "rejectQuantity" DOUBLE PRECISION,
    "jotbagQuantity" DOUBLE PRECISION,
    "notes" TEXT,
    "processedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "processing_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" TEXT NOT NULL,
    "contractNumber" TEXT NOT NULL,
    "buyer" TEXT NOT NULL,
    "buyerEmail" TEXT,
    "destinationCountry" TEXT NOT NULL,
    "coffeeType" TEXT NOT NULL,
    "gradeSpec" TEXT,
    "quantityKg" DOUBLE PRECISION NOT NULL,
    "pricePerKg" DOUBLE PRECISION,
    "priceCurrency" TEXT NOT NULL DEFAULT 'USD',
    "shippingDate" TIMESTAMP(3),
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'TT',
    "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "ceoApprovedBy" TEXT,
    "ceoApprovedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pss_records" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "buyerEmail" TEXT NOT NULL,
    "sentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "PSSStatus" NOT NULL DEFAULT 'PENDING',
    "buyerFeedback" TEXT,
    "respondedAt" TIMESTAMP(3),
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pss_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipments" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "shipmentNumber" TEXT NOT NULL,
    "bookingInfo" TEXT,
    "shippingLine" TEXT,
    "containerNumber" TEXT,
    "shippingDate" TIMESTAMP(3),
    "paymentMethod" "PaymentMethod",
    "status" "ShipmentStatus" NOT NULL DEFAULT 'BOOKED',
    "permitRequested" BOOLEAN NOT NULL DEFAULT false,
    "permitReceived" BOOLEAN NOT NULL DEFAULT false,
    "bankReceiptUrl" TEXT,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "batchId" TEXT,
    "shipmentId" TEXT,
    "type" "DocumentType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "beforeData" JSONB,
    "afterData" JSONB,
    "changes" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProcessingInputs" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProcessingInputs_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ProcessingOutputs" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProcessingOutputs_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "batches_batchNumber_key" ON "batches"("batchNumber");

-- CreateIndex
CREATE UNIQUE INDEX "batches_representativeSampleId_key" ON "batches"("representativeSampleId");

-- CreateIndex
CREATE UNIQUE INDEX "representative_samples_sampleCode_key" ON "representative_samples"("sampleCode");

-- CreateIndex
CREATE UNIQUE INDEX "processing_runs_runNumber_key" ON "processing_runs"("runNumber");

-- CreateIndex
CREATE UNIQUE INDEX "contracts_contractNumber_key" ON "contracts"("contractNumber");

-- CreateIndex
CREATE UNIQUE INDEX "shipments_shipmentNumber_key" ON "shipments"("shipmentNumber");

-- CreateIndex
CREATE INDEX "_ProcessingInputs_B_index" ON "_ProcessingInputs"("B");

-- CreateIndex
CREATE INDEX "_ProcessingOutputs_B_index" ON "_ProcessingOutputs"("B");

-- AddForeignKey
ALTER TABLE "batches" ADD CONSTRAINT "batches_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batches" ADD CONSTRAINT "batches_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batches" ADD CONSTRAINT "batches_representativeSampleId_fkey" FOREIGN KEY ("representativeSampleId") REFERENCES "representative_samples"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_weighing_records" ADD CONSTRAINT "vehicle_weighing_records_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_weighing_records" ADD CONSTRAINT "vehicle_weighing_records_recordedBy_fkey" FOREIGN KEY ("recordedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_entries" ADD CONSTRAINT "warehouse_entries_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_entries" ADD CONSTRAINT "warehouse_entries_receivedBy_fkey" FOREIGN KEY ("receivedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_checks" ADD CONSTRAINT "quality_checks_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_checks" ADD CONSTRAINT "quality_checks_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_movedBy_fkey" FOREIGN KEY ("movedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processing_runs" ADD CONSTRAINT "processing_runs_processedBy_fkey" FOREIGN KEY ("processedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_ceoApprovedBy_fkey" FOREIGN KEY ("ceoApprovedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pss_records" ADD CONSTRAINT "pss_records_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "shipments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProcessingInputs" ADD CONSTRAINT "_ProcessingInputs_A_fkey" FOREIGN KEY ("A") REFERENCES "batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProcessingInputs" ADD CONSTRAINT "_ProcessingInputs_B_fkey" FOREIGN KEY ("B") REFERENCES "processing_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProcessingOutputs" ADD CONSTRAINT "_ProcessingOutputs_A_fkey" FOREIGN KEY ("A") REFERENCES "batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProcessingOutputs" ADD CONSTRAINT "_ProcessingOutputs_B_fkey" FOREIGN KEY ("B") REFERENCES "processing_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
