import * as schema from "./schema.ts";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: Deno.env.get("DATABASE_URL")!,
});

const db = drizzle({ client: pool, schema: schema });

export default db;
