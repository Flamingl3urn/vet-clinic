"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { getMedicineColumns, MedicineData } from "@/components/medicines/columns";
import { MedicineForm } from "@/components/medicines/medicine-form";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { deleteMedicine } from "@/lib/actions/medicine.actions";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function MedicinesClient({
  initialData,
}: {
  initialData: MedicineData[];
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editMedicine, setEditMedicine] = useState<MedicineData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MedicineData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const columns = getMedicineColumns(
    (med) => {
      setEditMedicine(med);
      setFormOpen(true);
    },
    (med) => {
      setDeleteTarget(med);
    }
  );

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteMedicine(deleteTarget.medicine_id);
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete medicine item. It might be referenced in prescriptions.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Medicines & Inventory"
        description="Monitor pharmaceutical inventory stock, pricing, and product items"
      >
        <Button
          onClick={() => {
            setEditMedicine(null);
            setFormOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Medicine
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={initialData}
        searchKey="medicine_name"
        searchPlaceholder="Search medicines by name..."
      />

      <MedicineForm
        open={formOpen}
        onOpenChange={setFormOpen}
        medicine={editMedicine}
        onSuccess={() => router.refresh()}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Medicine"
        description={`Are you sure you want to delete ${deleteTarget?.medicine_name}?`}
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </>
  );
}
