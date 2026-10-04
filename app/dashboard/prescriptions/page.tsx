import { getPrescriptions } from "@/lib/actions/prescription.actions";
import { getMedicines } from "@/lib/actions/medicine.actions";
import { prisma } from "@/lib/prisma";
import { PrescriptionsClient } from "./client";

import type { PrescriptionData } from "@/components/prescriptions/columns";

export const dynamic = "force-dynamic";

export default async function PrescriptionsPage() {
  const [prescriptions, medicines, treatments] = await Promise.all([
    getPrescriptions(),
    getMedicines(),
    prisma.treatments.findMany({
      where: {
        prescriptions: null, // treatments that don't have prescriptions yet
      },
      include: {
        visits: {
          include: {
            pets: true,
          },
        },
      },
    }),
  ]);

  return (
    <PrescriptionsClient
      initialData={prescriptions as unknown as PrescriptionData[]}
      treatments={treatments}
      medicines={medicines}
    />
  );
}
