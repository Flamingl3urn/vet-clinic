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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createBill } from "@/lib/actions/bill.actions";

interface BillFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treatments: {
    treatment_id: number;
    diagnosis: string;
    visits: {
      pets: { pet_name: string };
    };
    prescriptions: {
      prescription_items: {
        quantity: number;
        medicines: { price: number; medicine_name: string };
      }[];
    } | null;
  }[];
  onSuccess?: () => void;
}

export function BillForm({
  open,
  onOpenChange,
  treatments,
  onSuccess,
}: BillFormProps) {
  const [loading, setLoading] = useState(false);
  const [treatmentId, setTreatmentId] = useState<string>("");
  const [serviceFee, setServiceFee] = useState("300");
  const [medicineFee, setMedicineFee] = useState("0");
  const [paymentStatus, setPaymentStatus] = useState("Paid");

  const totalAmount = (parseFloat(serviceFee) || 0) + (parseFloat(medicineFee) || 0);

  function handleSelectTreatment(tIdStr: string) {
    setTreatmentId(tIdStr);
    const trt = treatments.find((t) => t.treatment_id.toString() === tIdStr);
    if (trt?.prescriptions?.prescription_items) {
      const sum = trt.prescriptions.prescription_items.reduce(
        (acc, item) => acc + item.quantity * item.medicines.price,
        0
      );
      setMedicineFee(sum.toString());
    } else {
      setMedicineFee("0");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!treatmentId) {
      alert("Please select a treatment record.");
      return;
    }
    setLoading(true);
    try {
      await createBill({
        treatment_id: parseInt(treatmentId),
        service_fee: parseFloat(serviceFee) || 0,
        medicine_fee: parseFloat(medicineFee) || 0,
        total_amount: totalAmount,
        payment_status: paymentStatus,
        payment_date: paymentStatus === "Paid" ? new Date().toISOString() : undefined,
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error(err);
      alert("Failed to create invoice.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Medical Invoice / Bill</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="treatment_id">Treatment Case *</Label>
            <Select value={treatmentId} onValueChange={handleSelectTreatment}>
              <SelectTrigger>
                <SelectValue placeholder="Select Treatment Case" />
              </SelectTrigger>
              <SelectContent>
                {treatments.map((t) => (
                  <SelectItem
                    key={t.treatment_id}
                    value={t.treatment_id.toString()}
                  >
                    {t.visits.pets.pet_name} - {t.diagnosis} (#{t.treatment_id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service_fee">Service / Procedure Fee (฿)</Label>
              <Input
                id="service_fee"
                type="number"
                step="0.01"
                required
                value={serviceFee}
                onChange={(e) => setServiceFee(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medicine_fee">Medication Fee (฿)</Label>
              <Input
                id="medicine_fee"
                type="number"
                step="0.01"
                required
                value={medicineFee}
                onChange={(e) => setMedicineFee(e.target.value)}
              />
            </div>
          </div>

          <div className="p-3 bg-muted/40 rounded-lg flex items-center justify-between">
            <span className="font-semibold text-sm">Total Due:</span>
            <span className="text-xl font-bold font-mono text-primary">
              ฿{totalAmount.toFixed(2)}
            </span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Initial Payment Status</Label>
            <Select value={paymentStatus} onValueChange={setPaymentStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Unpaid">Unpaid (Pending)</SelectItem>
              </SelectContent>
            </Select>
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
              {loading ? "Generating..." : "Create Invoice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
