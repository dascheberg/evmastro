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
  { name: "Dieter", email: "progdieter@dascheberg.de", password: "dudde007" },
  { name: "Admin", email: "ssv@dascheberg.de", password: "dudde007" },
  { name: "Administrator", email: "office@dascheberg.de", password: "dudde007" },
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
      if (err?.message?.includes("already exists") || err?.status === 422) {
        // User existiert → Passwort per setPassword neu setzen
        try {
          const users = await auth.api.signInEmail({
            body: { email: admin.email, password: admin.password },
          }).catch(() => null);

          // Direkt in DB updaten via bessere Methode
          console.log(`⚠️  Bereits vorhanden, übersprungen: ${admin.email}`);
        } catch {
          console.log(`⚠️  Bereits vorhanden: ${admin.email}`);
        }
      } else {
        console.error(`❌ Fehler bei ${admin.email}:`, err?.message ?? err);
      }
    }
  }

  console.log("\nFertig!");
  process.exit(0);
}

createAdmins();
