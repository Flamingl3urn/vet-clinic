"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getBills() {
  const bills = await prisma.bills.findMany({
    include: {
      treatments: {
        include: {
          visits: {
            include: {
              pets: {
                include: {
                  owners: true,
                },
              },
              veterinarians: true,
            },
          },
          prescriptions: {
            include: {
              prescription_items: {
                include: {
                  medicines: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      bill_id: "desc",
    },
  });

  return bills.map((b) => ({
    ...b,
    service_fee: b.service_fee ? Number(b.service_fee) : 0,
    medicine_fee: b.medicine_fee ? Number(b.medicine_fee) : 0,
    total_amount: Number(b.total_amount),
  }));
}

export async function createBill(data: {
  treatment_id: number;
  service_fee: number;
  medicine_fee: number;
  total_amount: number;
  payment_status?: string;
  payment_date?: string;
}) {
  const result = await prisma.bills.create({
    data: {
      treatment_id: data.treatment_id,
      service_fee: data.service_fee,
      medicine_fee: data.medicine_fee,
      total_amount: data.total_amount,
      payment_status: data.payment_status || "Unpaid",
      payment_date: data.payment_date ? new Date(data.payment_date) : null,
    },
  });
  revalidatePath("/dashboard/bills");
  revalidatePath("/dashboard");
  return result;
}

export async function updateBillPaymentStatus(
  bill_id: number,
  payment_status: string
) {
  const result = await prisma.bills.update({
    where: { bill_id },
    data: {
      payment_status,
      payment_date: payment_status === "Paid" ? new Date() : null,
    },
  });
  revalidatePath("/dashboard/bills");
  revalidatePath("/dashboard");
  return result;
}

export async function deleteBill(bill_id: number) {
  const result = await prisma.bills.delete({
    where: { bill_id },
  });
  revalidatePath("/dashboard/bills");
  revalidatePath("/dashboard");
  return result;
}
