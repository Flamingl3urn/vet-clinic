import { getVeterinarians } from "@/lib/actions/vet.actions";
import { VetsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function VeterinariansPage() {
  const vets = await getVeterinarians();
  return <VetsClient initialData={vets as any} />;
}
