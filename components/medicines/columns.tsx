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
import { MoreHorizontal, Pencil, Trash2, AlertTriangle } from "lucide-react";

export type MedicineData = {
  medicine_id: number;
  medicine_name: string;
  unit: string | null;
  price: number;
  stock_quantity: number | null;
};

export function getMedicineColumns(
  onEdit: (med: MedicineData) => void,
  onDelete: (med: MedicineData) => void
): ColumnDef<MedicineData>[] {
  return [
    {
      accessorKey: "medicine_id",
      header: "ID",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          #{row.original.medicine_id}
        </span>
      ),
    },
    {
      accessorKey: "medicine_name",
      header: "Medicine Name",
      cell: ({ row }) => (
        <div className="font-semibold text-foreground">
          {row.original.medicine_name}
        </div>
      ),
    },
    {
      accessorKey: "unit",
      header: "Unit",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.unit || "unit"}</span>
      ),
    },
    {
      accessorKey: "price",
      header: "Unit Price",
      cell: ({ row }) => (
        <span className="font-mono font-medium">
          ฿{row.original.price.toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: "stock_quantity",
      header: "Stock Quantity",
      cell: ({ row }) => {
        const qty = row.original.stock_quantity ?? 0;
        const isLow = qty < 10;
        return (
          <div className="flex items-center gap-2">
            <span
              className={`font-semibold ${
                isLow ? "text-amber-600 dark:text-amber-400" : "text-foreground"
              }`}
            >
              {qty}
            </span>
            {isLow && (
              <Badge variant="destructive" className="gap-1 px-1.5 py-0 text-[10px]">
                <AlertTriangle className="h-3 w-3" /> Low
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const med = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(med)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(med)}
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
