import { getMedicines } from "@/lib/actions/medicine.actions";
import { MedicinesClient } from "./client";

export const dynamic = "force-dynamic";

export default async function MedicinesPage() {
  const medicines = await getMedicines();
  return <MedicinesClient initialData={medicines as any} />;
}
