import { getBills } from "@/lib/actions/bill.actions";
import { prisma } from "@/lib/prisma";
import { BillsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function BillsPage() {
  const [bills, unbilledTreatments] = await Promise.all([
    getBills(),
    prisma.treatments.findMany({
      where: {
        bills: null, // treatments that don't have a bill yet
      },
      include: {
        visits: {
          include: {
            pets: true,
          },
        },
        prescriptions: {
          include: {
            prescription_items: {
              include: {
                medicines: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const sanitizedUnbilled = unbilledTreatments.map((t) => ({
    ...t,
    prescriptions: t.prescriptions
      ? {
          ...t.prescriptions,
          prescription_items: t.prescriptions.prescription_items.map((pi) => ({
            ...pi,
            medicines: {
              ...pi.medicines,
              price: Number(pi.medicines.price),
            },
          })),
        }
      : null,
  }));

  return (
    <BillsClient
      initialData={bills as any}
      unbilledTreatments={sanitizedUnbilled as any}
    />
  );
}
