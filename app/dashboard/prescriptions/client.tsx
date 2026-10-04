"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import {
  getPrescriptionColumns,
  PrescriptionData,
} from "@/components/prescriptions/columns";
import {
  PrescriptionForm,
  type PrescriptionTreatmentOption,
  type PrescriptionMedicineOption,
} from "@/components/prescriptions/prescription-form";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { deletePrescription } from "@/lib/actions/prescription.actions";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function PrescriptionsClient({
  initialData,
  treatments,
  medicines,
}: {
  initialData: PrescriptionData[];
  treatments: PrescriptionTreatmentOption[];
  medicines: PrescriptionMedicineOption[];
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PrescriptionData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const columns = getPrescriptionColumns((rx) => {
    setDeleteTarget(rx);
  });

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deletePrescription(deleteTarget.prescription_id);
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete prescription.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Prescriptions (Rx)"
        description="Issue medical prescriptions, manage dosages, and monitor dispensed medicines"
      >
        <Button onClick={() => setFormOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Issue Prescription
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={initialData}
        searchKey="patient"
        searchPlaceholder="Search prescriptions by patient name..."
      />

      <PrescriptionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        treatments={treatments}
        medicines={medicines}
        onSuccess={() => router.refresh()}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Prescription"
        description="Are you sure you want to delete this prescription? Dispensed item quantities will be restored back to pharmacy stock."
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </>
  );
}
