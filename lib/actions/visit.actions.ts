"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getVisits() {
  return await prisma.visits.findMany({
    include: {
      pets: {
        include: {
          owners: true,
        },
      },
      veterinarians: true,
      appointments: true,
      treatments: {
        include: {
          prescriptions: {
            include: {
              prescription_items: {
                include: {
                  medicines: true,
                },
              },
            },
          },
          bills: true,
        },
      },
    },
    orderBy: {
      visit_at: "desc",
    },
  });
}

export async function createVisit(data: {
  pet_id: number;
  vet_id: number;
  appointment_id?: number;
  visit_at?: string;
  diagnosis?: string;
  treatment_detail?: string;
}) {
  const visit = await prisma.visits.create({
    data: {
      pet_id: data.pet_id,
      vet_id: data.vet_id,
      appointment_id: data.appointment_id || null,
      visit_at: data.visit_at ? new Date(data.visit_at) : new Date(),
    },
  });

  if (data.diagnosis) {
    await prisma.treatments.create({
      data: {
        visit_id: visit.visit_id,
        diagnosis: data.diagnosis,
        treatment_detail: data.treatment_detail || null,
        treatment_date: new Date(),
      },
    });
  }

  if (data.appointment_id) {
    await prisma.appointments.update({
      where: { appointment_id: data.appointment_id },
      data: { status: "Completed" },
    });
  }

  revalidatePath("/dashboard/visits");
  revalidatePath("/dashboard/appointments");
  return visit;
}

export async function updateVisit(
  visit_id: number,
  data: {
    pet_id: number;
    vet_id: number;
    appointment_id?: number;
    visit_at?: string;
  }
) {
  const result = await prisma.visits.update({
    where: { visit_id },
    data: {
      pet_id: data.pet_id,
      vet_id: data.vet_id,
      appointment_id: data.appointment_id || null,
      visit_at: data.visit_at ? new Date(data.visit_at) : undefined,
    },
  });
  revalidatePath("/dashboard/visits");
  return result;
}

export async function deleteVisit(visit_id: number) {
  const result = await prisma.visits.delete({
    where: { visit_id },
  });
  revalidatePath("/dashboard/visits");
  return result;
}
