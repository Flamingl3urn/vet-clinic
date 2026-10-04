"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Pencil, Trash2, CheckCircle2, Clock, XCircle } from "lucide-react";
import { format } from "date-fns";

export type AppointmentData = {
  appointment_id: number;
  pet_id: number;
  vet_id: number;
  appointment_date: Date | string;
  appointment_time: Date | string;
  symptoms: string | null;
  status: string | null;
  pets: {
    pet_id: number;
    pet_name: string;
    species: string;
    owners: {
      owner_id: number;
      first_name: string;
      last_name: string;
      phone: string;
    };
  };
  veterinarians: {
    vet_id: number;
    first_name: string;
    last_name: string;
  };
  visits: {
    visit_id: number;
  } | null;
};

export function getAppointmentColumns(
  onEdit: (appointment: AppointmentData) => void,
  onDelete: (appointment: AppointmentData) => void,
  onStatusChange: (appointmentId: number, status: string) => void
): ColumnDef<AppointmentData>[] {
  return [
    {
      accessorKey: "appointment_id",
      header: "ID",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          #{row.original.appointment_id}
        </span>
      ),
    },
    {
      id: "dateTime",
      header: "Date & Time",
      cell: ({ row }) => {
        const date = new Date(row.original.appointment_date);
        const time = new Date(row.original.appointment_time);
        return (
          <div>
            <div className="font-medium text-foreground">
              {format(date, "MMM dd, yyyy")}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Clock className="h-3 w-3" />
              {format(time, "hh:mm a")}
            </div>
          </div>
        );
      },
    },
    {
      id: "pet_name",
      header: "Patient (Pet)",
      accessorFn: (row) => row.pets.pet_name,
      cell: ({ row }) => {
        const pet = row.original.pets;
        return (
          <div>
            <div className="font-semibold text-foreground">{pet.pet_name}</div>
            <div className="text-xs text-muted-foreground">
              {pet.species} • {pet.owners.first_name} ({pet.owners.phone})
            </div>
          </div>
        );
      },
    },
    {
      id: "doctor",
      header: "Assigned Vet",
      cell: ({ row }) => (
        <div className="text-sm font-medium">
          Dr. {row.original.veterinarians.first_name}{" "}
          {row.original.veterinarians.last_name}
        </div>
      ),
    },
    {
      accessorKey: "symptoms",
      header: "Symptoms / Reason",
      cell: ({ row }) => (
        <span className="truncate max-w-[200px] inline-block text-sm text-muted-foreground">
          {row.original.symptoms || "Regular Checkup"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status || "Scheduled";
        const variant: "default" | "secondary" | "destructive" | "outline" = "outline";
        let colorClass = "border-blue-300 text-blue-700 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400";

        if (status === "Completed") {
          colorClass = "border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400";
        } else if (status === "Cancelled") {
          colorClass = "border-rose-300 text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400";
        } else if (status === "In Progress") {
          colorClass = "border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400";
        }

        return (
          <Badge variant={variant} className={`font-medium ${colorClass}`}>
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const appt = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => onEdit(appt)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onStatusChange(appt.appointment_id, "In Progress")}
              >
                Mark In Progress
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onStatusChange(appt.appointment_id, "Completed")}
              >
                <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
                Mark Completed
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onStatusChange(appt.appointment_id, "Cancelled")}
              >
                <XCircle className="mr-2 h-4 w-4 text-amber-600" />
                Mark Cancelled
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(appt)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
