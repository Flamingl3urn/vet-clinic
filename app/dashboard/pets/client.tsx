"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { getPetColumns, PetData } from "@/components/pets/columns";
import { PetForm } from "@/components/pets/pet-form";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { deletePet } from "@/lib/actions/pet.actions";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function PetsClient({
  initialData,
  owners,
}: {
  initialData: PetData[];
  owners: { owner_id: number; first_name: string; last_name: string }[];
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editPet, setEditPet] = useState<PetData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PetData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const columns = getPetColumns(
    (pet) => {
      setEditPet(pet);
      setFormOpen(true);
    },
    (pet) => {
      setDeleteTarget(pet);
    }
  );

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deletePet(deleteTarget.pet_id);
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete pet. It may have existing visits or appointments.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Pets"
        description="View, register, and manage patient profiles and owners"
      >
        <Button
          onClick={() => {
            setEditPet(null);
            setFormOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Pet
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={initialData}
        searchKey="pet_name"
        searchPlaceholder="Search pets by name..."
      />

      <PetForm
        open={formOpen}
        onOpenChange={setFormOpen}
        pet={editPet}
        owners={owners}
        onSuccess={() => router.refresh()}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Pet Profile"
        description={`Are you sure you want to delete ${deleteTarget?.pet_name}? All associated appointment and visit histories will be impacted.`}
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </>
  );
}
