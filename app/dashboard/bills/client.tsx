"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { getBillColumns, BillData } from "@/components/bills/columns";
import { BillForm } from "@/components/bills/bill-form";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  deleteBill,
  updateBillPaymentStatus,
} from "@/lib/actions/bill.actions";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Filter, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";

export function BillsClient({
  initialData,
  unbilledTreatments,
}: {
  initialData: BillData[];
  unbilledTreatments: any[];
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BillData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredData = useMemo(() => {
    return initialData.filter((b) => {
      if (statusFilter !== "all" && b.payment_status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [initialData, statusFilter]);

  const totalRevenue = useMemo(() => {
    return initialData
      .filter((b) => b.payment_status === "Paid")
      .reduce((sum, b) => sum + b.total_amount, 0);
  }, [initialData]);

  const pendingAmount = useMemo(() => {
    return initialData
      .filter((b) => b.payment_status !== "Paid")
      .reduce((sum, b) => sum + b.total_amount, 0);
  }, [initialData]);

  const columns = getBillColumns(
    async (id, status) => {
      await updateBillPaymentStatus(id, status);
      router.refresh();
    },
    (bill) => {
      setDeleteTarget(bill);
    }
  );

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteBill(deleteTarget.bill_id);
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete bill.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Billing & Invoices"
        description="Review consultation charges, pharmacy billing, and patient payments"
      >
        <Button onClick={() => setFormOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Invoice
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-xl border bg-card flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase">
              Collected Revenue (Paid)
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
              ฿{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-card flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase">
              Pending Collections (Unpaid)
            </div>
            <div className="text-2xl font-bold font-mono text-rose-600 mt-1">
              ฿{pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="h-10 w-10 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 bg-card rounded-xl border mb-6 shadow-xs">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mr-2">
          <Filter className="h-4 w-4" /> Filter Status:
        </div>
        <div className="w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="All Invoices" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Invoices</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Unpaid">Unpaid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        searchKey="patient"
        searchPlaceholder="Search invoices by patient name..."
      />

      <BillForm
        open={formOpen}
        onOpenChange={setFormOpen}
        treatments={unbilledTreatments}
        onSuccess={() => router.refresh()}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Invoice Record"
        description="Are you sure you want to delete this invoice record? This cannot be undone."
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </>
  );
}
