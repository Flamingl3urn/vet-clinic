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
import { MoreHorizontal, Trash2, CheckCircle, Receipt } from "lucide-react";
import { format } from "date-fns";

export type BillData = {
  bill_id: number;
  treatment_id: number;
  service_fee: number;
  medicine_fee: number;
  total_amount: number;
  payment_status: string | null;
  payment_date: Date | string | null;
  treatments: {
    treatment_id: number;
    diagnosis: string;
    visits: {
      visit_id: number;
      visit_at: Date | string;
      pets: {
        pet_name: string;
        species: string;
        owners: {
          first_name: string;
          last_name: string;
          phone: string;
        };
      };
      veterinarians: {
        first_name: string;
        last_name: string;
      };
    };
  };
};

export function getBillColumns(
  onStatusChange: (billId: number, status: string) => void,
  onDelete: (bill: BillData) => void
): ColumnDef<BillData>[] {
  return [
    {
      accessorKey: "bill_id",
      header: "Invoice #",
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-primary">
          INV-{row.original.bill_id.toString().padStart(5, "0")}
        </span>
      ),
    },
    {
      id: "patient",
      header: "Patient / Owner",
      accessorFn: (row) => row.treatments.visits.pets.pet_name,
      cell: ({ row }) => {
        const pet = row.original.treatments.visits.pets;
        return (
          <div>
            <div className="font-semibold text-foreground">{pet.pet_name}</div>
            <div className="text-xs text-muted-foreground">
              {pet.owners.first_name} {pet.owners.last_name} ({pet.owners.phone})
            </div>
          </div>
        );
      },
    },
    {
      id: "diagnosis",
      header: "Treatment Case",
      cell: ({ row }) => (
        <div className="text-sm">
          <div className="font-medium text-foreground">
            {row.original.treatments.diagnosis}
          </div>
          <div className="text-xs text-muted-foreground">
            Dr. {row.original.treatments.visits.veterinarians.first_name}
          </div>
        </div>
      ),
    },
    {
      id: "fees",
      header: "Fee Breakdown",
      cell: ({ row }) => (
        <div className="text-xs space-y-0.5">
          <div className="text-muted-foreground">
            Service: ฿{row.original.service_fee.toFixed(2)}
          </div>
          <div className="text-muted-foreground">
            Meds: ฿{row.original.medicine_fee.toFixed(2)}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "total_amount",
      header: "Total Due",
      cell: ({ row }) => (
        <div className="font-bold text-base text-foreground font-mono">
          ฿{row.original.total_amount.toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: "payment_status",
      header: "Payment Status",
      cell: ({ row }) => {
        const status = row.original.payment_status || "Unpaid";
        const isPaid = status === "Paid";
        return (
          <div className="flex flex-col gap-1">
            <Badge
              variant={isPaid ? "secondary" : "destructive"}
              className="font-medium w-fit"
            >
              {status}
            </Badge>
            {isPaid && row.original.payment_date && (
              <span className="text-[10px] text-muted-foreground">
                Paid on {format(new Date(row.original.payment_date), "MMM dd")}
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const bill = row.original;
        const isPaid = bill.payment_status === "Paid";
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!isPaid ? (
                <DropdownMenuItem
                  onClick={() => onStatusChange(bill.bill_id, "Paid")}
                  className="text-emerald-600 focus:text-emerald-600"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark as Paid
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => onStatusChange(bill.bill_id, "Unpaid")}
                >
                  Mark as Unpaid
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(bill)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Invoice
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
