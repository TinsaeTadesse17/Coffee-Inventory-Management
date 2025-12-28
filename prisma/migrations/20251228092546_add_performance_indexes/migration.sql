-- CreateIndex
CREATE INDEX "additional_costs_recordedAt_idx" ON "additional_costs"("recordedAt");

-- CreateIndex
CREATE INDEX "additional_costs_createdAt_idx" ON "additional_costs"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "audit_logs_entity_action_idx" ON "audit_logs"("entity", "action");

-- CreateIndex
CREATE INDEX "batches_supplierId_idx" ON "batches"("supplierId");

-- CreateIndex
CREATE INDEX "batches_status_idx" ON "batches"("status");

-- CreateIndex
CREATE INDEX "batches_createdAt_idx" ON "batches"("createdAt");

-- CreateIndex
CREATE INDEX "batches_isThirdParty_idx" ON "batches"("isThirdParty");

-- CreateIndex
CREATE INDEX "batches_warehouseEntryDate_idx" ON "batches"("warehouseEntryDate");

-- CreateIndex
CREATE INDEX "contracts_approvalStatus_idx" ON "contracts"("approvalStatus");

-- CreateIndex
CREATE INDEX "contracts_createdAt_idx" ON "contracts"("createdAt");

-- CreateIndex
CREATE INDEX "processing_costs_createdAt_idx" ON "processing_costs"("createdAt");

-- CreateIndex
CREATE INDEX "processing_runs_startTime_idx" ON "processing_runs"("startTime");

-- CreateIndex
CREATE INDEX "processing_runs_status_idx" ON "processing_runs"("status");

-- CreateIndex
CREATE INDEX "quality_checks_batchId_idx" ON "quality_checks"("batchId");

-- CreateIndex
CREATE INDEX "quality_checks_timestamp_idx" ON "quality_checks"("timestamp");

-- CreateIndex
CREATE INDEX "storage_costs_createdAt_idx" ON "storage_costs"("createdAt");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_active_idx" ON "users"("active");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- CreateIndex
CREATE INDEX "vehicle_weighing_records_batchId_idx" ON "vehicle_weighing_records"("batchId");

-- CreateIndex
CREATE INDEX "vehicle_weighing_records_timestampIn_idx" ON "vehicle_weighing_records"("timestampIn");

-- CreateIndex
CREATE INDEX "warehouse_entries_batchId_idx" ON "warehouse_entries"("batchId");

-- CreateIndex
CREATE INDEX "warehouse_entries_arrivalTimestamp_idx" ON "warehouse_entries"("arrivalTimestamp");
