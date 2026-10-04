import { getPets } from "@/lib/actions/pet.actions";
import { getOwners } from "@/lib/actions/owner.actions";
import { PetsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function PetsPage() {
  const [pets, owners] = await Promise.all([getPets(), getOwners()]);
  return <PetsClient initialData={pets as any} owners={owners as any} />;
}
