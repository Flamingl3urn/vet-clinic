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
import { Textarea } from "@/components/ui/textarea";
import { createTreatment, updateTreatment } from "@/lib/actions/treatment.actions";

interface TreatmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visitId?: number;
  treatment?: {
    treatment_id: number;
    diagnosis: string;
    treatment_detail: string | null;
  } | null;
  onSuccess?: () => void;
}

export function TreatmentForm({
  open,
  onOpenChange,
  visitId,
  treatment,
  onSuccess,
}: TreatmentFormProps) {
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState("");
  const [treatmentDetail, setTreatmentDetail] = useState("");

  const isEdit = !!treatment;

  useEffect(() => {
    if (treatment) {
      setDiagnosis(treatment.diagnosis);
      setTreatmentDetail(treatment.treatment_detail || "");
    } else {
      setDiagnosis("");
      setTreatmentDetail("");
    }
  }, [treatment, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!diagnosis) return;
    setLoading(true);
    try {
      if (isEdit && treatment) {
        await updateTreatment(treatment.treatment_id, {
          diagnosis,
          treatment_detail: treatmentDetail,
        });
      } else if (visitId) {
        await createTreatment({
          visit_id: visitId,
          diagnosis,
          treatment_detail: treatmentDetail,
        });
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error(err);
      alert("Failed to save treatment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Clinical Treatment" : "Record Clinical Treatment"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnosis / Findings *</Label>
            <Input
              id="diagnosis"
              required
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Parvovirus, ear infection, broken bone"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatment_detail">Treatment & Procedures Detail</Label>
            <Textarea
              id="treatment_detail"
              value={treatmentDetail}
              onChange={(e) => setTreatmentDetail(e.target.value)}
              placeholder="Procedure details, nursing care, instructions..."
              rows={4}
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
              {loading ? "Saving..." : isEdit ? "Update Treatment" : "Save Treatment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
