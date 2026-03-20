import { config } from "dotenv";
config();

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "../src/db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: { enabled: true },
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
});

const admins = [
  { name: "Dieter", email: "progdieter@dascheberg.de", password: "Sch2021&1?abg" },
  { name: "Office", email: "office@dascheberg.de", password: "NeuesPasswort2!" },
  { name: "SSV", email: "ssv@dascheberg.de", password: "NeuesPasswort3!" },
];

async function run() {
  for (const admin of admins) {
    try {
      await auth.api.signUpEmail({ body: admin });
      console.log(`✅ Angelegt: ${admin.email}`);
    } catch (err: any) {
      console.error(`❌ ${admin.email}:`, err?.message ?? err);
    }
  }
  process.exit(0);
}

run();
