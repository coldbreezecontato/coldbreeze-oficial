// app/admin/orders/page.tsx
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/is-admin";
import { db } from "@/db";
import { orderTable } from "@/db/schema";

import AdminOrdersDashboard from "./components/admin-orders-dashboard";

export default async function AdminOrdersPage() {
  const authorized = await isAdmin();
  if (!authorized) redirect("/");

  const orders = await db.query.orderTable.findMany({
    with: {
      items: {
        with: {
          productVariant: {
            with: { product: true },
          },
          productVariantSize: {
            with: { size: true },
          },
        },
      },
      shippingAddress: true,
      user: true,
    },
    orderBy: (table, { desc }) => desc(table.createdAt),
  });

  return <AdminOrdersDashboard orders={orders} />;
}
