import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// 🔐 Defina aqui os e-mails permitidos
const ADMIN_EMAILS = ["renang@coldbreeze.com", "renaan.profissional@gmail.com"];

export async function isAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });

  const userEmail = session?.user?.email;

  if (!userEmail) return false;
  return ADMIN_EMAILS.includes(userEmail);
}
