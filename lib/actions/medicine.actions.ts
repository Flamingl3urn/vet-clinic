"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getMedicines() {
  const medicines = await prisma.medicines.findMany({
    orderBy: {
      medicine_id: "desc",
    },
  });

  return medicines.map((m) => ({
    ...m,
    price: Number(m.price),
  }));
}

export async function createMedicine(data: {
  medicine_name: string;
  unit?: string;
  price: number;
  stock_quantity?: number;
}) {
  const result = await prisma.medicines.create({
    data: {
      medicine_name: data.medicine_name,
      unit: data.unit || null,
      price: data.price,
      stock_quantity: data.stock_quantity ?? 0,
    },
  });
  revalidatePath("/dashboard/medicines");
  return result;
}

export async function updateMedicine(
  medicine_id: number,
  data: {
    medicine_name: string;
    unit?: string;
    price: number;
    stock_quantity?: number;
  }
) {
  const result = await prisma.medicines.update({
    where: { medicine_id },
    data: {
      medicine_name: data.medicine_name,
      unit: data.unit || null,
      price: data.price,
      stock_quantity: data.stock_quantity ?? 0,
    },
  });
  revalidatePath("/dashboard/medicines");
  return result;
}

export async function deleteMedicine(medicine_id: number) {
  const result = await prisma.medicines.delete({
    where: { medicine_id },
  });
  revalidatePath("/dashboard/medicines");
  return result;
}
