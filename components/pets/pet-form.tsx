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
import { createPet, updatePet } from "@/lib/actions/pet.actions";
import { PetData } from "./columns";

interface PetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pet?: PetData | null;
  owners: { owner_id: number; first_name: string; last_name: string }[];
  onSuccess?: () => void;
}

export function PetForm({
  open,
  onOpenChange,
  pet,
  owners,
  onSuccess,
}: PetFormProps) {
  const [loading, setLoading] = useState(false);
  const [ownerId, setOwnerId] = useState<string>("");
  const [petName, setPetName] = useState("");
  const [species, setSpecies] = useState("Dog");
  const [breed, setBreed] = useState("");
  const [gender, setGender] = useState("Male");
  const [birthDate, setBirthDate] = useState("");
  const [weight, setWeight] = useState("");
  const [color, setColor] = useState("");
  const [allergyInfo, setAllergyInfo] = useState("");

  const isEdit = !!pet;

  useEffect(() => {
    if (pet) {
      setOwnerId(pet.owner_id.toString());
      setPetName(pet.pet_name);
      setSpecies(pet.species);
      setBreed(pet.breed || "");
      setGender(pet.gender || "Male");
      setBirthDate(
        pet.birth_date
          ? new Date(pet.birth_date).toISOString().split("T")[0]
          : ""
      );
      setWeight(pet.weight ? pet.weight.toString() : "");
      setColor(pet.color || "");
      setAllergyInfo(pet.allergy_info || "");
    } else {
      setOwnerId(owners[0]?.owner_id.toString() || "");
      setPetName("");
      setSpecies("Dog");
      setBreed("");
      setGender("Male");
      setBirthDate("");
      setWeight("");
      setColor("");
      setAllergyInfo("");
    }
  }, [pet, open, owners]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ownerId) {
      alert("Please select an owner");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        owner_id: parseInt(ownerId),
        pet_name: petName,
        species,
        breed,
        gender,
        birth_date: birthDate || undefined,
        weight: weight ? parseFloat(weight) : undefined,
        color,
        allergy_info: allergyInfo,
      };

      if (isEdit && pet) {
        await updatePet(pet.pet_id, payload);
      } else {
        await createPet(payload);
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error(err);
      alert("Failed to save pet.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Pet Profile" : "Register New Pet"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="owner_id">Pet Owner *</Label>
            <Select value={ownerId} onValueChange={setOwnerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Owner" />
              </SelectTrigger>
              <SelectContent>
                {owners.map((o) => (
                  <SelectItem key={o.owner_id} value={o.owner_id.toString()}>
                    {o.first_name} {o.last_name} (#{o.owner_id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pet_name">Pet Name *</Label>
              <Input
                id="pet_name"
                required
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder="Buddy"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="species">Species *</Label>
              <Input
                id="species"
                required
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                placeholder="Dog, Cat, Bird..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="breed">Breed</Label>
              <Input
                id="breed"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                placeholder="Golden Retriever"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger>
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birth_date">Birth Date</Label>
              <Input
                id="birth_date"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="12.5"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Color / Markings</Label>
            <Input
              id="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="Brown and white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="allergy_info">Allergies / Special Notes</Label>
            <Input
              id="allergy_info"
              value={allergyInfo}
              onChange={(e) => setAllergyInfo(e.target.value)}
              placeholder="Allergic to penicillin, sensitive stomach..."
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
              {loading ? "Saving..." : isEdit ? "Update Pet" : "Create Pet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
