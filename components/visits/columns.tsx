"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Pencil, Trash2, Stethoscope, PlusCircle } from "lucide-react";
import { format } from "date-fns";

export type VisitData = {
  visit_id: number;
  pet_id: number;
  vet_id: number;
  appointment_id: number | null;
  visit_at: Date | string;
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
  appointments: {
    appointment_id: number;
    symptoms: string | null;
  } | null;
  treatments: {
    treatment_id: number;
    diagnosis: string;
    treatment_detail: string | null;
    treatment_date: Date | string;
    bills: {
      bill_id: number;
      total_amount: number | string;
      payment_status: string | null;
    } | null;
    prescriptions: {
      prescription_id: number;
      prescription_items: unknown[];
    } | null;
  } | null;
};

export function getVisitColumns(
  onEdit: (visit: VisitData) => void,
  onDelete: (visit: VisitData) => void,
  onAddTreatment: (visit: VisitData) => void
): ColumnDef<VisitData>[] {
  return [
    {
      accessorKey: "visit_id",
      header: "Visit ID",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          #{row.original.visit_id}
        </span>
      ),
    },
    {
      accessorKey: "visit_at",
      header: "Date & Time",
      cell: ({ row }) => (
        <div className="font-medium text-foreground">
          {format(new Date(row.original.visit_at), "MMM dd, yyyy HH:mm")}
        </div>
      ),
    },
    {
      id: "patient",
      header: "Patient (Pet)",
      accessorFn: (row) => row.pets.pet_name,
      cell: ({ row }) => {
        const pet = row.original.pets;
        return (
          <div>
            <div className="font-semibold text-foreground">{pet.pet_name}</div>
            <div className="text-xs text-muted-foreground">
              {pet.species} • Owner: {pet.owners.first_name}
            </div>
          </div>
        );
      },
    },
    {
      id: "vet",
      header: "Attending Doctor",
      cell: ({ row }) => (
        <div className="text-sm font-medium">
          Dr. {row.original.veterinarians.first_name}{" "}
          {row.original.veterinarians.last_name}
        </div>
      ),
    },
    {
      id: "treatment",
      header: "Clinical Diagnosis",
      cell: ({ row }) => {
        const trt = row.original.treatments;
        if (!trt) {
          return (
            <Button
              variant="outline"
              size="xs"
              onClick={() => onAddTreatment(row.original)}
              className="gap-1 text-xs"
            >
              <PlusCircle className="h-3 w-3" /> Record Diagnosis
            </Button>
          );
        }
        return (
          <div className="max-w-[220px]">
            <div className="font-semibold text-primary truncate">
              {trt.diagnosis}
            </div>
            {trt.treatment_detail && (
              <div className="text-xs text-muted-foreground truncate">
                {trt.treatment_detail}
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: "status",
      header: "Billing / Rx",
      cell: ({ row }) => {
        const trt = row.original.treatments;
        if (!trt) return <span className="text-xs text-muted-foreground">-</span>;

        const hasRx = !!trt.prescriptions;
        const bill = trt.bills;

        return (
          <div className="flex flex-col gap-1">
            {hasRx && (
              <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700">
                Rx Prescribed
              </Badge>
            )}
            {bill ? (
              <Badge
                variant={bill.payment_status === "Paid" ? "secondary" : "destructive"}
                className="text-[10px]"
              >
                {bill.payment_status || "Unpaid"} (฿{Number(bill.total_amount).toFixed(0)})
              </Badge>
            ) : (
              <span className="text-[10px] text-muted-foreground">No Bill</span>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const visit = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(visit)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Visit
              </DropdownMenuItem>
              {!visit.treatments && (
                <DropdownMenuItem onClick={() => onAddTreatment(visit)}>
                  <Stethoscope className="mr-2 h-4 w-4 text-primary" />
                  Add Treatment
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => onDelete(visit)}
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
