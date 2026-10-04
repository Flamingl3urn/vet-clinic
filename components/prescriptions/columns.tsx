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
import { MoreHorizontal, Trash2, Pill } from "lucide-react";
import { format } from "date-fns";

export type PrescriptionData = {
  prescription_id: number;
  treatment_id: number;
  prescription_date: Date | string;
  treatments: {
    treatment_id: number;
    diagnosis: string;
    visits: {
      visit_id: number;
      pets: {
        pet_id: number;
        pet_name: string;
        species: string;
        owners: {
          first_name: string;
          phone: string;
        };
      };
      veterinarians: {
        first_name: string;
        last_name: string;
      };
    };
  };
  prescription_items: {
    medicine_id: number;
    quantity: number;
    dosage: string | null;
    instruction: string | null;
    medicines: {
      medicine_name: string;
      unit: string | null;
      price: number;
    };
  }[];
};

export function getPrescriptionColumns(
  onDelete: (rx: PrescriptionData) => void
): ColumnDef<PrescriptionData>[] {
  return [
    {
      accessorKey: "prescription_id",
      header: "Rx ID",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          #{row.original.prescription_id}
        </span>
      ),
    },
    {
      accessorKey: "prescription_date",
      header: "Date",
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {format(new Date(row.original.prescription_date), "MMM dd, yyyy")}
        </span>
      ),
    },
    {
      id: "patient",
      header: "Patient (Pet)",
      accessorFn: (row) => row.treatments.visits.pets.pet_name,
      cell: ({ row }) => {
        const pet = row.original.treatments.visits.pets;
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
      id: "diagnosis",
      header: "Diagnosis / Visit",
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-primary text-sm">
            {row.original.treatments.diagnosis}
          </div>
          <div className="text-xs text-muted-foreground">
            Dr. {row.original.treatments.visits.veterinarians.first_name}{" "}
            {row.original.treatments.visits.veterinarians.last_name}
          </div>
        </div>
      ),
    },
    {
      id: "items",
      header: "Prescribed Medications",
      cell: ({ row }) => {
        const items = row.original.prescription_items;
        if (!items || items.length === 0) {
          return <span className="text-xs text-muted-foreground">No items</span>;
        }
        return (
          <div className="space-y-1 max-w-[280px]">
            {items.map((i, idx) => (
              <div
                key={idx}
                className="text-xs border rounded-md px-2 py-1 bg-muted/30 flex flex-col"
              >
                <div className="font-medium flex justify-between items-center">
                  <span>{i.medicines.medicine_name}</span>
                  <span className="text-primary font-bold">
                    x{i.quantity} {i.medicines.unit || "unit"}
                  </span>
                </div>
                {(i.dosage || i.instruction) && (
                  <span className="text-[11px] text-muted-foreground truncate">
                    {i.dosage ? `${i.dosage} • ` : ""}
                    {i.instruction || ""}
                  </span>
                )}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const rx = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onDelete(rx)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Prescription
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
