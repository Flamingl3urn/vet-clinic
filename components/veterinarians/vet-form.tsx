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
import { createVeterinarian, updateVeterinarian } from "@/lib/actions/vet.actions";
import { VetData } from "./columns";

interface VetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vet?: VetData | null;
  onSuccess?: () => void;
}

export function VetForm({
  open,
  onOpenChange,
  vet,
  onSuccess,
}: VetFormProps) {
  const [loading, setLoading] = useState(false);
  const [licenseNumber, setLicenseNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [phone, setPhone] = useState("");

  const isEdit = !!vet;

  useEffect(() => {
    if (vet) {
      setLicenseNumber(vet.license_number);
      setFirstName(vet.first_name);
      setLastName(vet.last_name);
      setSpecialization(vet.specialization || "");
      setPhone(vet.phone || "");
    } else {
      setLicenseNumber("");
      setFirstName("");
      setLastName("");
      setSpecialization("");
      setPhone("");
    }
  }, [vet, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        license_number: licenseNumber,
        first_name: firstName,
        last_name: lastName,
        specialization: specialization || undefined,
        phone: phone || undefined,
      };

      if (isEdit && vet) {
        await updateVeterinarian(vet.vet_id, payload);
      } else {
        await createVeterinarian(payload);
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error(err);
      alert("Failed to save veterinarian. License number must be unique.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Veterinarian Details" : "Add New Veterinarian"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="license_number">License Number *</Label>
            <Input
              id="license_number"
              required
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              placeholder="VET-2024-001"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Sarah"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Smith"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialization">Specialization / Department</Label>
            <Input
              id="specialization"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              placeholder="Surgery, Dermatology, Internal Medicine"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0891234567"
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
              {loading ? "Saving..." : isEdit ? "Update Vet" : "Add Vet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
