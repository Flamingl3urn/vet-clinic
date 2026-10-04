"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPets() {
  const pets = await prisma.pets.findMany({
    include: {
      owners: true,
      appointments: true,
      visits: true,
    },
    orderBy: {
      pet_id: "desc",
    },
  });

  return pets.map((p) => ({
    ...p,
    weight: p.weight ? Number(p.weight) : null,
  }));
}

export async function createPet(data: {
  owner_id: number;
  pet_name: string;
  species: string;
  breed?: string;
  gender?: string;
  birth_date?: string;
  weight?: number;
  color?: string;
  allergy_info?: string;
}) {
  const result = await prisma.pets.create({
    data: {
      owner_id: data.owner_id,
      pet_name: data.pet_name,
      species: data.species,
      breed: data.breed || null,
      gender: data.gender || null,
      birth_date: data.birth_date ? new Date(data.birth_date) : null,
      weight: data.weight !== undefined && data.weight !== null ? data.weight : null,
      color: data.color || null,
      allergy_info: data.allergy_info || null,
    },
  });
  revalidatePath("/dashboard/pets");
  return result;
}

export async function updatePet(
  pet_id: number,
  data: {
    owner_id: number;
    pet_name: string;
    species: string;
    breed?: string;
    gender?: string;
    birth_date?: string;
    weight?: number;
    color?: string;
    allergy_info?: string;
  }
) {
  const result = await prisma.pets.update({
    where: { pet_id },
    data: {
      owner_id: data.owner_id,
      pet_name: data.pet_name,
      species: data.species,
      breed: data.breed || null,
      gender: data.gender || null,
      birth_date: data.birth_date ? new Date(data.birth_date) : null,
      weight: data.weight !== undefined && data.weight !== null ? data.weight : null,
      color: data.color || null,
      allergy_info: data.allergy_info || null,
    },
  });
  revalidatePath("/dashboard/pets");
  return result;
}

export async function deletePet(pet_id: number) {
  const result = await prisma.pets.delete({
    where: { pet_id },
  });
  revalidatePath("/dashboard/pets");
  return result;
}
