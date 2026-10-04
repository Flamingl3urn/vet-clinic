"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getOwners() {
  return await prisma.owners.findMany({
    include: {
      pets: true,
    },
    orderBy: {
      owner_id: "desc",
    },
  });
}

export async function createOwner(data: {
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  address?: string;
}) {
  const result = await prisma.owners.create({
    data: {
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      email: data.email || null,
      address: data.address || null,
    },
  });
  revalidatePath("/dashboard/owners");
  return result;
}

export async function updateOwner(
  owner_id: number,
  data: {
    first_name: string;
    last_name: string;
    phone: string;
    email?: string;
    address?: string;
  }
) {
  const result = await prisma.owners.update({
    where: { owner_id },
    data: {
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      email: data.email || null,
      address: data.address || null,
    },
  });
  revalidatePath("/dashboard/owners");
  return result;
}

export async function deleteOwner(owner_id: number) {
  const result = await prisma.owners.delete({
    where: { owner_id },
  });
  revalidatePath("/dashboard/owners");
  return result;
}
