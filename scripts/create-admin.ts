/**
 * Admin-Benutzer anlegen
 * Aufruf: npx tsx scripts/create-admin.ts
 *
 * Umgebungsvariablen werden aus .env geladen.
 */

import { config } from "dotenv";
config(); // .env laden

import { auth } from "../src/lib/auth";

const admins = [
  // Hier alle Admin-Accounts eintragen die du anlegen möchtest
  // Weitere Einträge einfach kopieren und anpassen
  {
    name: "Dieter",
    email: "progdieter@dascheberg.de",   // ← anpassen
    password: "Sch2021&1?abg",    // ← anpassen
  },
];

async function createAdmins() {
  console.log("Starte Admin-Erstellung...\n");

  for (const admin of admins) {
    try {
      await auth.api.signUpEmail({
        body: {
          name: admin.name,
          email: admin.email,
          password: admin.password,
        },
      });
      console.log(`✅ Admin angelegt: ${admin.email}`);
    } catch (err: any) {
      // Bereits vorhanden → kein Problem
      if (err?.message?.includes("already exists") || err?.status === 422) {
        console.log(`⚠️  Bereits vorhanden: ${admin.email}`);
      } else {
        console.error(`❌ Fehler bei ${admin.email}:`, err?.message ?? err);
      }
    }
  }

  console.log("\nFertig!");
  process.exit(0);
}

createAdmins();
