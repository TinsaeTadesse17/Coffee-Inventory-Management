"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BatchStatusBadge } from "@/components/ui/batch-status-badge";
import { formatNumber, formatCurrency, calculateDaysInWarehouse, formatWeight } from "@/lib/format-utils";
import { ContractApprovalButtons } from "./contract-approval-buttons";
import { CEOVisualDashboard } from "./ceo-visual-dashboard";
import { AlertTriangle } from "lucide-react";

interface EnhancedCEODashboardProps {
  data: any;
}

export function EnhancedCEODashboard({ data }: EnhancedCEODashboardProps) {
  const { contracts, batches, qualityChecks, processingRuns, warehouseEntries } = data;

  return (
    <div className="space-y-8">
      {/* 1. Visual Dashboard (Charts & KPIs) */}
      <CEOVisualDashboard data={data} />

      {/* 2. Pending Contract Approvals (Actionable Items) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Pending Contract Approvals
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contracts.filter((c: any) => c.approvalStatus === "PENDING").length === 0 ? (
            <div className="text-sm text-muted-foreground">No pending approvals</div>
          ) : (
            <div className="space-y-4">
              {contracts
                .filter((c: any) => c.approvalStatus === "PENDING")
                .slice(0, 5)
                .map((c: any) => (
                  <div key={c.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-base">{c.contractNumber}</p>
                      <p className="text-sm text-muted-foreground mt-1">{c.buyer}</p>
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Quantity: {formatNumber(c.quantityKg, 0)} kg</span>
                        <span>Price: {formatCurrency(c.pricePerKg || 0, 'USD')}/kg</span>
                        <span>Total: {formatCurrency(c.quantityKg * (c.pricePerKg || 0), 'USD')}</span>
                      </div>
                      {c.destinationCountry && (
                        <p className="text-xs text-muted-foreground mt-1">Destination: {c.destinationCountry}</p>
                      )}
                    </div>
                    <div className="ml-4">
                      <ContractApprovalButtons contractId={c.id} currentStatus={c.approvalStatus} />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Comprehensive Batch Details Table (Data Grid) */}
      <Card>
        <CardHeader>
          <CardTitle>Comprehensive Batch Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-2 text-left font-medium">Batch #</th>
                  <th className="p-2 text-left font-medium">Status</th>
                  <th className="p-2 text-left font-medium">Origin</th>
                  <th className="p-2 text-right font-medium">Purchased</th>
                  <th className="p-2 text-right font-medium">Current</th>
                  <th className="p-2 text-right font-medium">Processed</th>
                  <th className="p-2 text-right font-medium">Rejected</th>
                  <th className="p-2 text-right font-medium">QA Score</th>
                  <th className="p-2 text-right font-medium">Cost (ETB)</th>
                  <th className="p-2 text-center font-medium">Days in WH</th>
                </tr>
              </thead>
              <tbody>
                {batches.slice(0, 20).map((batch: any) => {
                  const batchQC = qualityChecks.find((qc: any) => qc.batchId === batch.id);
                  const batchProcessing = processingRuns.find((pr: any) =>
                    pr.outputBatches?.some((b: any) => b.id === batch.id)
                  );
                  const daysInWH = batch.warehouseEntryDate ? calculateDaysInWarehouse(batch.warehouseEntryDate) : null;

                  return (
                    <tr key={batch.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{batch.batchNumber}</td>
                      <td className="p-2">
                        <BatchStatusBadge status={batch.status} isAging={batch.isAging} />
                      </td>
                      <td className="p-2">{batch.origin}</td>
                      <td className="p-2 text-right">{formatNumber(batch.purchasedQuantityKg, 0)} kg</td>
                      <td className="p-2 text-right">{formatNumber(batch.currentQuantityKg || batch.purchasedQuantityKg, 0)} kg</td>
                      <td className="p-2 text-right">{batchProcessing ? formatNumber(batchProcessing.exportQuantity || 0, 0) : '—'} kg</td>
                      <td className="p-2 text-right text-red-600">{batchProcessing ? formatNumber(batchProcessing.rejectQuantity || 0, 0) : '—'} kg</td>
                      <td className="p-2 text-right">{batchQC?.totalScore ? formatNumber(batchQC.totalScore, 2) : '—'}</td>
                      <td className="p-2 text-right">{formatNumber(batch.purchaseCost, 0)}</td>
                      <td className="p-2 text-center">
                        {daysInWH !== null ? (
                          <span className={daysInWH >= 180 ? 'text-red-600 font-bold' : ''}>
                            {formatNumber(daysInWH, 0)}
                          </span>
                        ) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}







