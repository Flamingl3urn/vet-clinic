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
import { format } from "date-fns";

export type PetData = {
  pet_id: number;
  owner_id: number;
  pet_name: string;
  species: string;
  breed: string | null;
  gender: string | null;
  birth_date: Date | string | null;
  weight: number | null;
  color: string | null;
  allergy_info: string | null;
  owners: {
    owner_id: number;
    first_name: string;
    last_name: string;
    phone: string;
  };
};

export function getPetColumns(
  onEdit: (pet: PetData) => void,
  onDelete: (pet: PetData) => void
): ColumnDef<PetData>[] {
  return [
    {
      accessorKey: "pet_id",
      header: "ID",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          #{row.original.pet_id}
        </span>
      ),
    },
    {
      accessorKey: "pet_name",
      header: "Pet Name",
      cell: ({ row }) => (
        <div className="font-semibold text-foreground">
          {row.original.pet_name}
        </div>
      ),
    },
    {
      accessorKey: "species",
      header: "Species",
      cell: ({ row }) => (
        <Badge variant="outline" className="font-medium">
          {row.original.species}
        </Badge>
      ),
    },
    {
      accessorKey: "breed",
      header: "Breed",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.breed || "-"}</span>
      ),
    },
    {
      accessorKey: "gender",
      header: "Gender",
      cell: ({ row }) => (
        <span className="capitalize text-muted-foreground">
          {row.original.gender || "-"}
        </span>
      ),
    },
    {
      id: "owner",
      header: "Owner",
      cell: ({ row }) => {
        const owner = row.original.owners;
        return (
          <div>
            <div className="font-medium text-foreground">
              {owner.first_name} {owner.last_name}
            </div>
            <div className="text-xs text-muted-foreground">{owner.phone}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "weight",
      header: "Weight (kg)",
      cell: ({ row }) => (
        <span>{row.original.weight ? `${row.original.weight} kg` : "-"}</span>
      ),
    },
    {
      accessorKey: "allergy_info",
      header: "Allergies",
      cell: ({ row }) => (
        <span className="text-xs text-destructive truncate max-w-[150px] inline-block">
          {row.original.allergy_info || "None"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const pet = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(pet)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(pet)}
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
