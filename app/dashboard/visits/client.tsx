"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { getVisitColumns, VisitData } from "@/components/visits/columns";
import { VisitForm } from "@/components/visits/visit-form";
import { TreatmentForm } from "@/components/treatments/treatment-form";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { deleteVisit } from "@/lib/actions/visit.actions";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function VisitsClient({
  initialData,
  pets,
  vets,
  appointments,
}: {
  initialData: VisitData[];
  pets: { pet_id: number; pet_name: string; species: string }[];
  vets: { vet_id: number; first_name: string; last_name: string }[];
  appointments: { appointment_id: number; pet_id: number; vet_id: number; symptoms: string | null }[];
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editVisit, setEditVisit] = useState<VisitData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VisitData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Treatment form state
  const [treatmentModalOpen, setTreatmentModalOpen] = useState(false);
  const [targetVisitForTreatment, setTargetVisitForTreatment] = useState<number | undefined>(undefined);

  const columns = getVisitColumns(
    (visit) => {
      setEditVisit(visit);
      setFormOpen(true);
    },
    (visit) => {
      setDeleteTarget(visit);
    },
    (visit) => {
      setTargetVisitForTreatment(visit.visit_id);
      setTreatmentModalOpen(true);
    }
  );

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteVisit(deleteTarget.visit_id);
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete visit record.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Patient Visits & Clinical Records"
        description="Track walk-in patients, consultation histories, and veterinary medical assessments"
      >
        <Button
          onClick={() => {
            setEditVisit(null);
            setFormOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Check-in Visit
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={initialData}
        searchKey="patient"
        searchPlaceholder="Search visits by patient..."
      />

      <VisitForm
        open={formOpen}
        onOpenChange={setFormOpen}
        visit={editVisit}
        pets={pets}
        vets={vets}
        appointments={appointments}
        onSuccess={() => router.refresh()}
      />

      <TreatmentForm
        open={treatmentModalOpen}
        onOpenChange={setTreatmentModalOpen}
        visitId={targetVisitForTreatment}
        onSuccess={() => router.refresh()}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Visit Record"
        description="Are you sure you want to delete this visit? Any associated treatments and diagnostic logs will be impacted."
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </>
  );
}
