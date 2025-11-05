import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/is-admin";
import { db } from "@/db";
import { productTable, categoryTable, productVariantTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import AdminDashboard from "./components/admin-dashboard";

export default async function AdminPage() {
  const authorized = await isAdmin();

  if (!authorized) {
    redirect("/"); // ❌ Redireciona visitantes comuns
  }

  const products = await db.query.productTable.findMany({
    with: {
      category: true,
      variants: true,
    },
  });

  const categories = await db.query.categoryTable.findMany();

  return <AdminDashboard products={products} categories={categories} />;
}
