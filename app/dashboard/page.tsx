import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/stat-card";
import {
  PawPrint,
  Users,
  CalendarDays,
  DollarSign,
  Stethoscope,
  Pill,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [
    totalPets,
    totalOwners,
    totalVets,
    todayAppointmentsCount,
    monthlyRevenueResult,
    lowStockCount,
    recentAppointments,
  ] = await Promise.all([
    prisma.pets.count(),
    prisma.owners.count(),
    prisma.veterinarians.count(),
    prisma.appointments.count({
      where: {
        appointment_date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    }),
    prisma.bills.aggregate({
      _sum: { total_amount: true },
      where: {
        payment_status: "Paid",
        payment_date: {
          gte: monthStart,
        },
      },
    }),
    prisma.medicines.count({
      where: {
        stock_quantity: {
          lte: 10,
        },
      },
    }),
    prisma.appointments.findMany({
      take: 6,
      orderBy: {
        appointment_date: "desc",
      },
      include: {
        pets: {
          include: {
            owners: true,
          },
        },
        veterinarians: true,
      },
    }),
  ]);

  const totalMonthlyRevenue = monthlyRevenueResult._sum.total_amount
    ? Number(monthlyRevenueResult._sum.total_amount)
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Clinic Overview
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Welcome back. Here is what is happening at the clinic today.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Registered Pets"
          value={totalPets}
          icon={PawPrint}
          description="Active patients in clinic"
        />
        <StatCard
          title="Pet Owners"
          value={totalOwners}
          icon={Users}
          description="Registered client profiles"
        />
        <StatCard
          title="Today's Appointments"
          value={todayAppointmentsCount}
          icon={CalendarDays}
          description="Scheduled visits today"
        />
        <StatCard
          title="Monthly Revenue"
          value={`฿${totalMonthlyRevenue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}`}
          icon={DollarSign}
          description="Total paid invoices this month"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 rounded-xl border bg-card text-card-foreground shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg text-foreground">
                Recent Appointments
              </h3>
              <p className="text-xs text-muted-foreground">
                Latest patient bookings and checkups
              </p>
            </div>
            <Button variant="outline" size="sm" render={<Link href="/dashboard/appointments" />}>
              View All
            </Button>
          </div>

          <div className="space-y-3">
            {recentAppointments.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No recent appointments found.
              </div>
            ) : (
              recentAppointments.map((appt) => {
                const isCompleted = appt.status === "Completed";
                const isCancelled = appt.status === "Cancelled";

                return (
                  <div
                    key={appt.appointment_id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                        {appt.pets.species.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-sm text-foreground flex items-center gap-2">
                          <span>{appt.pets.pet_name}</span>
                          <span className="text-xs font-normal text-muted-foreground">
                            ({appt.pets.species})
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Dr. {appt.veterinarians.first_name} •{" "}
                          {format(new Date(appt.appointment_date), "MMM dd")}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          isCompleted
                            ? "secondary"
                            : isCancelled
                            ? "destructive"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {appt.status || "Scheduled"}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border bg-card text-card-foreground shadow-xs p-6">
            <h3 className="font-semibold text-lg text-foreground mb-1">
              Quick Highlights
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Operational summary
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b">
                <div className="flex items-center gap-2 text-sm">
                  <Stethoscope className="h-4 w-4 text-primary" />
                  <span>Veterinarians</span>
                </div>
                <span className="font-bold">{totalVets}</span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b">
                <div className="flex items-center gap-2 text-sm">
                  <Pill className="h-4 w-4 text-amber-500" />
                  <span>Low Stock Meds (&le; 10)</span>
                </div>
                <span className="font-bold text-amber-600">
                  {lowStockCount}
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <Button size="sm" className="w-full" render={<Link href="/dashboard/visits" />}>
                Check-in Walk-in Visit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                render={<Link href="/dashboard/bills" />}
              >
                Invoices & Billing
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
