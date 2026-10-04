"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import {
  getAppointmentColumns,
  AppointmentData,
} from "@/components/appointments/columns";
import { AppointmentForm } from "@/components/appointments/appointment-form";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  deleteAppointment,
  updateAppointmentStatus,
} from "@/lib/actions/appointment.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Filter } from "lucide-react";
import { useRouter } from "next/navigation";

export function AppointmentsClient({
  initialData,
  pets,
  vets,
}: {
  initialData: AppointmentData[];
  pets: { pet_id: number; pet_name: string; species: string }[];
  vets: { vet_id: number; first_name: string; last_name: string }[];
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editAppt, setEditAppt] = useState<AppointmentData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AppointmentData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");

  const filteredData = useMemo(() => {
    return initialData.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }
      if (dateFilter) {
        const itemDate = new Date(item.appointment_date)
          .toISOString()
          .split("T")[0];
        if (itemDate !== dateFilter) {
          return false;
        }
      }
      return true;
    });
  }, [initialData, statusFilter, dateFilter]);

  const columns = getAppointmentColumns(
    (appt) => {
      setEditAppt(appt);
      setFormOpen(true);
    },
    (appt) => {
      setDeleteTarget(appt);
    },
    async (id, status) => {
      await updateAppointmentStatus(id, status);
      router.refresh();
    }
  );

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteAppointment(deleteTarget.appointment_id);
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete appointment.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Appointments"
        description="Schedule, filter, and manage clinic appointments and statuses"
      >
        <Button
          onClick={() => {
            setEditAppt(null);
            setFormOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Schedule Appointment
        </Button>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-3 p-4 bg-card rounded-xl border mb-6 shadow-xs">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mr-2">
          <Filter className="h-4 w-4" /> Filters:
        </div>

        <div className="w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Scheduled">Scheduled</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-48">
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-background"
          />
        </div>

        {(statusFilter !== "all" || dateFilter !== "") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStatusFilter("all");
              setDateFilter("");
            }}
          >
            Reset Filters
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        searchKey="pet_name"
        searchPlaceholder="Search by pet name..."
      />

      <AppointmentForm
        open={formOpen}
        onOpenChange={setFormOpen}
        appointment={editAppt}
        pets={pets}
        vets={vets}
        onSuccess={() => router.refresh()}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Cancel & Delete Appointment"
        description="Are you sure you want to delete this appointment record?"
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </>
  );
}
