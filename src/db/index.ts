import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const url =
  process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || "file:local.db";
const authToken =
  process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN;

const client = createClient({
  url,
  authToken,
});

export const db = drizzle(client, { schema });
export default db;
