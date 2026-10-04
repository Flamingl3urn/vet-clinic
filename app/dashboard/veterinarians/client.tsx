"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { getVetColumns, VetData } from "@/components/veterinarians/columns";
import { VetForm } from "@/components/veterinarians/vet-form";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { deleteVeterinarian } from "@/lib/actions/vet.actions";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function VetsClient({ initialData }: { initialData: VetData[] }) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editVet, setEditVet] = useState<VetData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VetData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const columns = getVetColumns(
    (vet) => {
      setEditVet(vet);
      setFormOpen(true);
    },
    (vet) => {
      setDeleteTarget(vet);
    }
  );

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteVeterinarian(deleteTarget.vet_id);
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete veterinarian. They may have active appointments or visits.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Veterinarians"
        description="Manage doctor credentials, specializations, and staff profiles"
      >
        <Button
          onClick={() => {
            setEditVet(null);
            setFormOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Veterinarian
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={initialData}
        searchKey="name"
        searchPlaceholder="Search doctors by name..."
      />

      <VetForm
        open={formOpen}
        onOpenChange={setFormOpen}
        vet={editVet}
        onSuccess={() => router.refresh()}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Veterinarian"
        description={`Are you sure you want to delete Dr. ${deleteTarget?.first_name} ${deleteTarget?.last_name}?`}
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </>
  );
}
