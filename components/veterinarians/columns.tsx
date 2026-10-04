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
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

export type VetData = {
  vet_id: number;
  license_number: string;
  first_name: string;
  last_name: string;
  specialization: string | null;
  phone: string | null;
};

export function getVetColumns(
  onEdit: (vet: VetData) => void,
  onDelete: (vet: VetData) => void
): ColumnDef<VetData>[] {
  return [
    {
      accessorKey: "vet_id",
      header: "ID",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          #{row.original.vet_id}
        </span>
      ),
    },
    {
      accessorKey: "license_number",
      header: "License No.",
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-primary">
          {row.original.license_number}
        </span>
      ),
    },
    {
      id: "name",
      header: "Name",
      accessorFn: (row) => `Dr. ${row.first_name} ${row.last_name}`,
      cell: ({ row }) => (
        <div className="font-semibold text-foreground">
          Dr. {row.original.first_name} {row.original.last_name}
        </div>
      ),
    },
    {
      accessorKey: "specialization",
      header: "Specialization",
      cell: ({ row }) =>
        row.original.specialization ? (
          <Badge variant="secondary" className="font-medium">
            {row.original.specialization}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-xs">General Vet</span>
        ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.phone || "-"}</span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const vet = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(vet)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(vet)}
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
