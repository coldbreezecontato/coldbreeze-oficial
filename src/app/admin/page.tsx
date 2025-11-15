import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/is-admin";
import { db } from "@/db";
import {
  productTable,
  categoryTable,
  productVariantTable,
  productSizeTable,
} from "@/db/schema";
import AdminDashboard from "./components/admin-dashboard";

export default async function AdminPage() {
  const authorized = await isAdmin();

  if (!authorized) {
    redirect("/");
  }

  const products = await db.query.productTable.findMany({
    with: {
      category: true,
      variants: true,
    },
  });

  const categories = await db.query.categoryTable.findMany();
  const sizes = await db.query.productSizeTable.findMany();

  return (
    <AdminDashboard
      products={products}
      categories={categories}
      sizes={sizes}
    />
  );
}
