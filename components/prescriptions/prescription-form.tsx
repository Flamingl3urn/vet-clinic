"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createPrescription } from "@/lib/actions/prescription.actions";
import { Plus, Trash2 } from "lucide-react";

export type PrescriptionTreatmentOption = {
  treatment_id: number;
  diagnosis: string;
  visits: {
    pets: { pet_name: string; species: string };
  };
};

export type PrescriptionMedicineOption = {
  medicine_id: number;
  medicine_name: string;
  unit: string | null;
  stock_quantity: number | null;
  price: number;
};

interface PrescriptionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treatments: PrescriptionTreatmentOption[];
  medicines: PrescriptionMedicineOption[];
  onSuccess?: () => void;
}

export function PrescriptionForm({
  open,
  onOpenChange,
  treatments,
  medicines,
  onSuccess,
}: PrescriptionFormProps) {
  const [loading, setLoading] = useState(false);
  const [treatmentId, setTreatmentId] = useState<string>("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [items, setItems] = useState<
    { medicine_id: string; quantity: number; dosage: string; instruction: string }[]
  >([{ medicine_id: medicines[0]?.medicine_id.toString() || "", quantity: 1, dosage: "1 tab twice daily", instruction: "Take after meals" }]);

  function handleAddItem() {
    setItems([
      ...items,
      {
        medicine_id: medicines[0]?.medicine_id.toString() || "",
        quantity: 1,
        dosage: "",
        instruction: "",
      },
    ]);
  }

  function handleRemoveItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function handleItemChange(
    index: number,
    field: "medicine_id" | "quantity" | "dosage" | "instruction",
    val: string | number
  ) {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: val };
    setItems(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!treatmentId) {
      alert("Please select a clinical treatment / visit.");
      return;
    }
    if (items.length === 0) {
      alert("Please add at least one medication.");
      return;
    }

    setLoading(true);
    try {
      await createPrescription({
        treatment_id: parseInt(treatmentId),
        prescription_date: date,
        items: items.map((i) => ({
          medicine_id: parseInt(i.medicine_id),
          quantity: Number(i.quantity) || 1,
          dosage: i.dosage,
          instruction: i.instruction,
        })),
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error(err);
      alert("Failed to issue prescription. Check stock availability.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Issue New Prescription (Rx)</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="treatment_id">Treatment / Patient Case *</Label>
              <Select value={treatmentId} onValueChange={setTreatmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Treatment Case" />
                </SelectTrigger>
                <SelectContent>
                  {treatments.map((t) => (
                    <SelectItem key={t.treatment_id} value={t.treatment_id.toString()}>
                      {t.visits.pets.pet_name} - {t.diagnosis} (#{t.treatment_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date Issued *</Label>
              <Input
                id="date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold">Medications & Dosages</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                className="gap-1 text-xs"
              >
                <Plus className="h-3.5 w-3.5" /> Add Medicine
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 border rounded-lg bg-muted/20 space-y-3 relative"
                >
                  <div className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-8 space-y-1">
                      <Label className="text-xs">Medicine</Label>
                      <Select
                        value={item.medicine_id}
                        onValueChange={(val) =>
                          handleItemChange(idx, "medicine_id", val)
                        }
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select Medicine" />
                        </SelectTrigger>
                        <SelectContent>
                          {medicines.map((m) => (
                            <SelectItem
                              key={m.medicine_id}
                              value={m.medicine_id.toString()}
                            >
                              {m.medicine_name} (Stock: {m.stock_quantity ?? 0} {m.unit || "unit"})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-3 space-y-1">
                      <Label className="text-xs">Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        required
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(idx, "quantity", parseInt(e.target.value))
                        }
                        className="bg-background"
                      />
                    </div>

                    <div className="col-span-1 pt-5 flex justify-end">
                      {items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(idx)}
                          className="h-8 w-8 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Dosage Instructions</Label>
                      <Input
                        placeholder="e.g. 1 tablet twice daily"
                        value={item.dosage}
                        onChange={(e) =>
                          handleItemChange(idx, "dosage", e.target.value)
                        }
                        className="bg-background text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Administration Notes</Label>
                      <Input
                        placeholder="e.g. After meals with water"
                        value={item.instruction}
                        onChange={(e) =>
                          handleItemChange(idx, "instruction", e.target.value)
                        }
                        className="bg-background text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
              {loading ? "Prescribing..." : "Complete & Issue Rx"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
