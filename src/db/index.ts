import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema"; // ✅ importa todas as tabelas

// 🔹 Cria conexão segura com o banco
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: process.env.NODE_ENV === "production" ? true : false,
});

// 🔹 Exporta o db tipado com schema
export const db = drizzle(pool, { schema });

// (opcional, mas recomendado pra tipagem global)
export type Db = typeof db;
