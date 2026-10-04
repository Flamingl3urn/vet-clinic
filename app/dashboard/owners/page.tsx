import { getOwners } from "@/lib/actions/owner.actions";
import { OwnersClient } from "./client";

export const dynamic = "force-dynamic";

export default async function OwnersPage() {
  const owners = await getOwners();
  return <OwnersClient initialData={owners as any} />;
}
