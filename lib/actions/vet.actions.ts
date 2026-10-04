"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getVeterinarians() {
  return await prisma.veterinarians.findMany({
    include: {
      appointments: true,
      visits: true,
    },
    orderBy: {
      vet_id: "desc",
    },
  });
}

export async function createVeterinarian(data: {
  license_number: string;
  first_name: string;
  last_name: string;
  specialization?: string;
  phone?: string;
}) {
  const result = await prisma.veterinarians.create({
    data: {
      license_number: data.license_number,
      first_name: data.first_name,
      last_name: data.last_name,
      specialization: data.specialization || null,
      phone: data.phone || null,
    },
  });
  revalidatePath("/dashboard/veterinarians");
  return result;
}

export async function updateVeterinarian(
  vet_id: number,
  data: {
    license_number: string;
    first_name: string;
    last_name: string;
    specialization?: string;
    phone?: string;
  }
) {
  const result = await prisma.veterinarians.update({
    where: { vet_id },
    data: {
      license_number: data.license_number,
      first_name: data.first_name,
      last_name: data.last_name,
      specialization: data.specialization || null,
      phone: data.phone || null,
    },
  });
  revalidatePath("/dashboard/veterinarians");
  return result;
}

export async function deleteVeterinarian(vet_id: number) {
  const result = await prisma.veterinarians.delete({
    where: { vet_id },
  });
  revalidatePath("/dashboard/veterinarians");
  return result;
}
