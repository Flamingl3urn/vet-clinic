"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPrescriptions() {
  const list = await prisma.prescriptions.findMany({
    include: {
      treatments: {
        include: {
          visits: {
            include: {
              pets: {
                include: {
                  owners: true,
                },
              },
              veterinarians: true,
            },
          },
        },
      },
      prescription_items: {
        include: {
          medicines: true,
        },
      },
    },
    orderBy: {
      prescription_id: "desc",
    },
  });

  return list.map((p) => ({
    ...p,
    prescription_items: p.prescription_items.map((pi) => ({
      ...pi,
      medicines: {
        ...pi.medicines,
        price: Number(pi.medicines.price),
      },
    })),
  }));
}

export async function createPrescription(data: {
  treatment_id: number;
  prescription_date?: string;
  items: {
    medicine_id: number;
    quantity: number;
    dosage?: string;
    instruction?: string;
  }[];
}) {
  const result = await prisma.$transaction(async (tx) => {
    const rx = await tx.prescriptions.create({
      data: {
        treatment_id: data.treatment_id,
        prescription_date: data.prescription_date
          ? new Date(data.prescription_date)
          : new Date(),
      },
    });

    for (const item of data.items) {
      await tx.prescription_items.create({
        data: {
          prescription_id: rx.prescription_id,
          medicine_id: item.medicine_id,
          quantity: item.quantity,
          dosage: item.dosage || null,
          instruction: item.instruction || null,
        },
      });

      // Deduct medicine stock
      await tx.medicines.update({
        where: { medicine_id: item.medicine_id },
        data: {
          stock_quantity: {
            decrement: item.quantity,
          },
        },
      });
    }

    return rx;
  });

  revalidatePath("/dashboard/prescriptions");
  revalidatePath("/dashboard/medicines");
  revalidatePath("/dashboard/visits");
  return result;
}

export async function deletePrescription(prescription_id: number) {
  const result = await prisma.$transaction(async (tx) => {
    // Return stock
    const items = await tx.prescription_items.findMany({
      where: { prescription_id },
    });
    for (const item of items) {
      await tx.medicines.update({
        where: { medicine_id: item.medicine_id },
        data: {
          stock_quantity: {
            increment: item.quantity,
          },
        },
      });
    }

    await tx.prescription_items.deleteMany({
      where: { prescription_id },
    });

    return await tx.prescriptions.delete({
      where: { prescription_id },
    });
  });

  revalidatePath("/dashboard/prescriptions");
  revalidatePath("/dashboard/medicines");
  return result;
}
