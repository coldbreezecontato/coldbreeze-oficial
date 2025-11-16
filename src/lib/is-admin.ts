import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// 🔐 Lista de e-mails com permissão de administrador
const ADMIN_EMAILS = [
  "isaabatista@coldbreeze.com.br",
  "ceo@coldbreeze.com.br",
  "coio@coldbreeze.com.br",
  "valbert777@coldbreeze.com.br",
  "lavinnya.silva@coldbreeze.com.br",
  "sara.lopes@coldbreeze.com.br",
  "yago@coldbreeze.com.br",
  "fazan@coldbreeze.com.br",
  "contato@coldbreeze.com.br",
  "renan@coldbreeze.com.br",

  // Seus e-mails externos
  "renang@coldbreeze.com",
  "renaan.profissional@gmail.com",
  "coldbreeze.contato@gmail.com",
];

export async function isAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });

  const userEmail = session?.user?.email;

  if (!userEmail) return false;
  return ADMIN_EMAILS.includes(userEmail);
}
