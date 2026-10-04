"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createMedicine, updateMedicine } from "@/lib/actions/medicine.actions";
import { MedicineData } from "./columns";

interface MedicineFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicine?: MedicineData | null;
  onSuccess?: () => void;
}

export function MedicineForm({
  open,
  onOpenChange,
  medicine,
  onSuccess,
}: MedicineFormProps) {
  const [loading, setLoading] = useState(false);
  const [medicineName, setMedicineName] = useState("");
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");

  const isEdit = !!medicine;

  useEffect(() => {
    if (medicine) {
      setMedicineName(medicine.medicine_name);
      setUnit(medicine.unit || "");
      setPrice(medicine.price.toString());
      setStockQuantity(
        medicine.stock_quantity !== null ? medicine.stock_quantity.toString() : "0"
      );
    } else {
      setMedicineName("");
      setUnit("tablet");
      setPrice("");
      setStockQuantity("0");
    }
  }, [medicine, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        medicine_name: medicineName,
        unit: unit || undefined,
        price: parseFloat(price) || 0,
        stock_quantity: parseInt(stockQuantity) || 0,
      };

      if (isEdit && medicine) {
        await updateMedicine(medicine.medicine_id, payload);
      } else {
        await createMedicine(payload);
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error(err);
      alert("Failed to save medicine item.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Medicine" : "Add Medicine to Inventory"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="medicine_name">Medicine Name *</Label>
            <Input
              id="medicine_name"
              required
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
              placeholder="Amoxicillin 250mg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit">Unit Type</Label>
              <Input
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="tablet, bottle, vial..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Unit Price (฿) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="150.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock_quantity">Initial Stock Quantity</Label>
            <Input
              id="stock_quantity"
              type="number"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              placeholder="50"
            />
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Update Medicine" : "Save Medicine"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
