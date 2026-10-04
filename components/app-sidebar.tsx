"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  CalendarDays,
  PawPrint,
  Users,
  ClipboardList,
  Pill,
  Stethoscope,
  Receipt,
  Syringe,
} from "lucide-react";

const menuItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Owners", href: "/dashboard/owners", icon: Users },
  { title: "Pets", href: "/dashboard/pets", icon: PawPrint },
  { title: "Veterinarians", href: "/dashboard/veterinarians", icon: Stethoscope },
  { title: "Appointments", href: "/dashboard/appointments", icon: CalendarDays },
  { title: "Visits", href: "/dashboard/visits", icon: ClipboardList },
  { title: "Prescriptions", href: "/dashboard/prescriptions", icon: Syringe },
  { title: "Medicines", href: "/dashboard/medicines", icon: Pill },
  { title: "Bills", href: "/dashboard/bills", icon: Receipt },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-base leading-none">VetClinic</span>
            <span className="text-xs text-muted-foreground mt-0.5">Admin Portal</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 px-2 py-1.5">
            Management
          </SidebarGroupLabel>
          <SidebarMenu>
            {menuItems.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={isActive}
                    render={<Link href={item.href} />}
                    tooltip={item.title}
                    className="font-medium"
                  >
                    <item.icon className="size-4 shrink-0" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}