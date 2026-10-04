import { getAppointments } from "@/lib/actions/appointment.actions";
import { getPets } from "@/lib/actions/pet.actions";
import { getVeterinarians } from "@/lib/actions/vet.actions";
import { AppointmentsClient } from "./client";
import type { AppointmentData } from "@/components/appointments/columns";

export const dynamic = "force-dynamic";

export default async function AppointmentsPage() {
  const [appointments, pets, vets] = await Promise.all([
    getAppointments(),
    getPets(),
    getVeterinarians(),
  ]);

  return (
    <AppointmentsClient
      initialData={appointments as unknown as AppointmentData[]}
      pets={pets}
      vets={vets}
    />
  );
}
