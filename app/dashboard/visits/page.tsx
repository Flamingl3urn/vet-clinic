import { getVisits } from "@/lib/actions/visit.actions";
import { getPets } from "@/lib/actions/pet.actions";
import { getVeterinarians } from "@/lib/actions/vet.actions";
import { getAppointments } from "@/lib/actions/appointment.actions";
import { VisitsClient } from "./client";
import type { VisitData } from "@/components/visits/columns";

export const dynamic = "force-dynamic";

export default async function VisitsPage() {
  const [visits, pets, vets, appointments] = await Promise.all([
    getVisits(),
    getPets(),
    getVeterinarians(),
    getAppointments(),
  ]);

  const activeAppointments = appointments.filter(
    (a) => a.status !== "Completed" && a.status !== "Cancelled"
  );

  return (
    <VisitsClient
      initialData={visits as unknown as VisitData[]}
      pets={pets}
      vets={vets}
      appointments={activeAppointments}
    />
  );
}
