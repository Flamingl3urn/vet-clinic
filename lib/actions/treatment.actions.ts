"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTreatment(data: {
  visit_id: number;
  diagnosis: string;
  treatment_detail?: string;
  treatment_date?: string;
}) {
  const result = await prisma.treatments.create({
    data: {
      visit_id: data.visit_id,
      diagnosis: data.diagnosis,
      treatment_detail: data.treatment_detail || null,
      treatment_date: data.treatment_date ? new Date(data.treatment_date) : new Date(),
    },
  });
  revalidatePath("/dashboard/visits");
  return result;
}

export async function updateTreatment(
  treatment_id: number,
  data: {
    diagnosis: string;
    treatment_detail?: string;
    treatment_date?: string;
  }
) {
  const result = await prisma.treatments.update({
    where: { treatment_id },
    data: {
      diagnosis: data.diagnosis,
      treatment_detail: data.treatment_detail || null,
      treatment_date: data.treatment_date ? new Date(data.treatment_date) : undefined,
    },
  });
  revalidatePath("/dashboard/visits");
  return result;
}

export async function deleteTreatment(treatment_id: number) {
  const result = await prisma.treatments.delete({
    where: { treatment_id },
  });
  revalidatePath("/dashboard/visits");
  return result;
}
