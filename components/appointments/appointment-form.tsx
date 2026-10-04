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
import {
  createAppointment,
  updateAppointment,
} from "@/lib/actions/appointment.actions";
import { AppointmentData } from "./columns";

interface AppointmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: AppointmentData | null;
  pets: { pet_id: number; pet_name: string; species: string }[];
  vets: { vet_id: number; first_name: string; last_name: string }[];
  onSuccess?: () => void;
}

export function AppointmentForm({
  open,
  onOpenChange,
  appointment,
  pets,
  vets,
  onSuccess,
}: AppointmentFormProps) {
  const [loading, setLoading] = useState(false);
  const [petId, setPetId] = useState<string>("");
  const [vetId, setVetId] = useState<string>("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [symptoms, setSymptoms] = useState("");
  const [status, setStatus] = useState("Scheduled");

  const isEdit = !!appointment;

  useEffect(() => {
    if (appointment) {
      setPetId(appointment.pet_id.toString());
      setVetId(appointment.vet_id.toString());
      setDate(new Date(appointment.appointment_date).toISOString().split("T")[0]);
      const apptTime = new Date(appointment.appointment_time);
      const hours = apptTime.getHours().toString().padStart(2, "0");
      const mins = apptTime.getMinutes().toString().padStart(2, "0");
      setTime(`${hours}:${mins}`);
      setSymptoms(appointment.symptoms || "");
      setStatus(appointment.status || "Scheduled");
    } else {
      setPetId(pets[0]?.pet_id.toString() || "");
      setVetId(vets[0]?.vet_id.toString() || "");
      setDate(new Date().toISOString().split("T")[0]);
      setTime("10:00");
      setSymptoms("");
      setStatus("Scheduled");
    }
  }, [appointment, open, pets, vets]);

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
        appointment_date: date,
        appointment_time: time,
        symptoms,
        status,
      };

      if (isEdit && appointment) {
        await updateAppointment(appointment.appointment_id, payload);
      } else {
        await createAppointment(payload);
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error(err);
      alert("Failed to schedule appointment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Appointment" : "Schedule New Appointment"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Appointment Date *</Label>
              <Input
                id="date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Appointment Time *</Label>
              <Input
                id="time"
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="symptoms">Symptoms / Reason for Visit</Label>
            <Textarea
              id="symptoms"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. Annual vaccination, coughing, lethargy..."
              rows={3}
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
              {loading
                ? "Saving..."
                : isEdit
                ? "Update Appointment"
                : "Schedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
