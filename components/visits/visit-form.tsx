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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createVisit, updateVisit } from "@/lib/actions/visit.actions";
import { VisitData } from "./columns";

interface VisitFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visit?: VisitData | null;
  pets: { pet_id: number; pet_name: string; species: string }[];
  vets: { vet_id: number; first_name: string; last_name: string }[];
  appointments?: { appointment_id: number; pet_id: number; vet_id: number; symptoms: string | null }[];
  onSuccess?: () => void;
}

export function VisitForm({
  open,
  onOpenChange,
  visit,
  pets,
  vets,
  appointments = [],
  onSuccess,
}: VisitFormProps) {
  const [loading, setLoading] = useState(false);
  const [petId, setPetId] = useState<string>("");
  const [vetId, setVetId] = useState<string>("");
  const [appointmentId, setAppointmentId] = useState<string>("none");
  const [visitAt, setVisitAt] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatmentDetail, setTreatmentDetail] = useState("");

  const isEdit = !!visit;

  useEffect(() => {
    if (visit) {
      setPetId(visit.pet_id.toString());
      setVetId(visit.vet_id.toString());
      setAppointmentId(visit.appointment_id ? visit.appointment_id.toString() : "none");
      const d = new Date(visit.visit_at);
      setVisitAt(d.toISOString().slice(0, 16));
      setDiagnosis("");
      setTreatmentDetail("");
    } else {
      setPetId(pets[0]?.pet_id.toString() || "");
      setVetId(vets[0]?.vet_id.toString() || "");
      setAppointmentId("none");
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setVisitAt(now.toISOString().slice(0, 16));
      setDiagnosis("");
      setTreatmentDetail("");
    }
  }, [visit, open, pets, vets]);

  function handleSelectAppointment(apptIdStr: string) {
    setAppointmentId(apptIdStr);
    if (apptIdStr !== "none") {
      const appt = appointments.find((a) => a.appointment_id.toString() === apptIdStr);
      if (appt) {
        setPetId(appt.pet_id.toString());
        setVetId(appt.vet_id.toString());
        if (appt.symptoms) {
          setDiagnosis(`Symptoms: ${appt.symptoms}`);
        }
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!petId || !vetId) {
      alert("Please select both a patient pet and a veterinarian.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        pet_id: parseInt(petId),
        vet_id: parseInt(vetId),
        appointment_id: appointmentId !== "none" ? parseInt(appointmentId) : undefined,
        visit_at: visitAt ? new Date(visitAt).toISOString() : undefined,
        diagnosis: !isEdit && diagnosis ? diagnosis : undefined,
        treatment_detail: !isEdit && treatmentDetail ? treatmentDetail : undefined,
      };

      if (isEdit && visit) {
        await updateVisit(visit.visit_id, payload);
      } else {
        await createVisit(payload);
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error(err);
      alert("Failed to record visit.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Visit Record" : "Check-in Patient Visit"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEdit && appointments.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="appointment_id">Link from Scheduled Appointment (Optional)</Label>
              <Select value={appointmentId} onValueChange={handleSelectAppointment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Scheduled Appointment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Standalone Walk-in Visit --</SelectItem>
                  {appointments.map((a) => (
                    <SelectItem key={a.appointment_id} value={a.appointment_id.toString()}>
                      Appt #{a.appointment_id} - Pet #{a.pet_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pet_id">Patient (Pet) *</Label>
              <Select value={petId} onValueChange={setPetId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Pet" />
                </SelectTrigger>
                <SelectContent>
                  {pets.map((p) => (
                    <SelectItem key={p.pet_id} value={p.pet_id.toString()}>
                      {p.pet_name} ({p.species})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vet_id">Doctor *</Label>
              <Select value={vetId} onValueChange={setVetId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Doctor" />
                </SelectTrigger>
                <SelectContent>
                  {vets.map((v) => (
                    <SelectItem key={v.vet_id} value={v.vet_id.toString()}>
                      Dr. {v.first_name} {v.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="visit_at">Check-in Time *</Label>
            <Input
              id="visit_at"
              type="datetime-local"
              required
              value={visitAt}
              onChange={(e) => setVisitAt(e.target.value)}
            />
          </div>

          {!isEdit && (
            <>
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold mb-3 text-foreground">
                  Initial Clinical Assessment (Optional)
                </h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="diagnosis">Diagnosis / Findings</Label>
                    <Input
                      id="diagnosis"
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      placeholder="e.g. Mild dermatitis, dehydration"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="treatment_detail">Treatment & Procedures Note</Label>
                    <Textarea
                      id="treatment_detail"
                      value={treatmentDetail}
                      onChange={(e) => setTreatmentDetail(e.target.value)}
                      placeholder="Administered topical antibiotic ointment and IV fluids"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

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
              {loading ? "Saving..." : isEdit ? "Update Visit" : "Check-in Visit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
