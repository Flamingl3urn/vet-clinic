"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { getOwnerColumns, OwnerData } from "@/components/owners/columns";
import { OwnerForm } from "@/components/owners/owner-form";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { deleteOwner } from "@/lib/actions/owner.actions";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function OwnersClient({ initialData }: { initialData: OwnerData[] }) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editOwner, setEditOwner] = useState<OwnerData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OwnerData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const columns = getOwnerColumns(
    (owner) => {
      setEditOwner(owner);
      setFormOpen(true);
    },
    (owner) => {
      setDeleteTarget(owner);
    }
  );

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteOwner(deleteTarget.owner_id);
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete owner. They might have related records.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Owners"
        description="View and manage pet owners and contact details"
      >
        <Button
          onClick={() => {
            setEditOwner(null);
            setFormOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Owner
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={initialData}
        searchKey="name"
        searchPlaceholder="Search owners by name..."
      />

      <OwnerForm
        open={formOpen}
        onOpenChange={setFormOpen}
        owner={editOwner}
        onSuccess={() => router.refresh()}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Owner"
        description={`Are you sure you want to delete ${deleteTarget?.first_name} ${deleteTarget?.last_name}? This will remove all their associated records.`}
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </>
  );
}
