import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  user: {
    modelName: "userTable",
  },
  session: {
    modelName: "sessionTable",
  },
  account: {
    modelName: "accountTable",
  },
  verification: {
    modelName: "verificationTable",
  },

  // 🔥 ADICIONE ISSO ABAIXO
  cookies: {
    sessionToken: {
      name: "__Secure-better-auth.session-token",
      options: {
        httpOnly: true,
        secure: true,          // 🔥 obrigatório em HTTPS
        sameSite: "none",      // 🔥 necessário para mobile
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 dias
      },
    },
  },

  // 🔹 E adicione isso também para garantir compatibilidade
  trustHost: true,
});
