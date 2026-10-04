"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAppointments() {
  return await prisma.appointments.findMany({
    include: {
      pets: {
        include: {
          owners: true,
        },
      },
      veterinarians: true,
      visits: true,
    },
    orderBy: {
      appointment_date: "desc",
    },
  });
}

export async function createAppointment(data: {
  pet_id: number;
  vet_id: number;
  appointment_date: string;
  appointment_time: string;
  symptoms?: string;
  status?: string;
}) {
  const [hours, minutes] = data.appointment_time.split(":");
  const timeDate = new Date();
  timeDate.setHours(parseInt(hours) || 0, parseInt(minutes) || 0, 0, 0);

  const result = await prisma.appointments.create({
    data: {
      pet_id: data.pet_id,
      vet_id: data.vet_id,
      appointment_date: new Date(data.appointment_date),
      appointment_time: timeDate,
      symptoms: data.symptoms || null,
      status: data.status || "Scheduled",
    },
  });
  revalidatePath("/dashboard/appointments");
  revalidatePath("/dashboard");
  return result;
}

export async function updateAppointment(
  appointment_id: number,
  data: {
    pet_id: number;
    vet_id: number;
    appointment_date: string;
    appointment_time: string;
    symptoms?: string;
    status?: string;
  }
) {
  const [hours, minutes] = data.appointment_time.split(":");
  const timeDate = new Date();
  timeDate.setHours(parseInt(hours) || 0, parseInt(minutes) || 0, 0, 0);

  const result = await prisma.appointments.update({
    where: { appointment_id },
    data: {
      pet_id: data.pet_id,
      vet_id: data.vet_id,
      appointment_date: new Date(data.appointment_date),
      appointment_time: timeDate,
      symptoms: data.symptoms || null,
      status: data.status,
    },
  });
  revalidatePath("/dashboard/appointments");
  revalidatePath("/dashboard");
  return result;
}

export async function updateAppointmentStatus(
  appointment_id: number,
  status: string
) {
  const result = await prisma.appointments.update({
    where: { appointment_id },
    data: { status },
  });
  revalidatePath("/dashboard/appointments");
  revalidatePath("/dashboard");
  return result;
}

export async function deleteAppointment(appointment_id: number) {
  const result = await prisma.appointments.delete({
    where: { appointment_id },
  });
  revalidatePath("/dashboard/appointments");
  revalidatePath("/dashboard");
  return result;
}
