// src/pages/api/subscribers/index.ts
// Öffentlicher Endpunkt – kein Admin-Login erforderlich

import type { APIRoute } from "astro";
import { db } from "../../../db";
import { subscribers } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";

export const prerender = false;

// POST /api/subscribers  – neuen Abonnenten eintragen
export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { name, email, organizerIds, locationIds } = body;

  // Validierung
  if (!name?.trim() || !email?.trim()) {
    return new Response(
      JSON.stringify({ error: "Name und E-Mail sind erforderlich." }),
      { status: 400 }
    );
  }

  if (!email.includes("@")) {
    return new Response(
      JSON.stringify({ error: "Bitte eine gültige E-Mail-Adresse eingeben." }),
      { status: 400 }
    );
  }

  const orgIds: number[] = Array.isArray(organizerIds) ? organizerIds : [];
  const locIds: number[] = Array.isArray(locationIds) ? locationIds : [];

  if (orgIds.length === 0 && locIds.length === 0) {
    return new Response(
      JSON.stringify({ error: "Bitte mindestens einen Veranstalter oder einen Ort auswählen." }),
      { status: 400 }
    );
  }

  // Prüfen ob E-Mail bereits vorhanden
  const existing = await db
    .select({ id: subscribers.id })
    .from(subscribers)
    .where(eq(subscribers.email, email.trim().toLowerCase()));

  if (existing.length > 0) {
    return new Response(
      JSON.stringify({ error: "Diese E-Mail-Adresse ist bereits eingetragen." }),
      { status: 409 }
    );
  }

  // Token generieren (32 Byte = 64 hex-Zeichen)
  const unsubscribeToken = randomBytes(32).toString("hex");

  await db.insert(subscribers).values({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    unsubscribeToken,
    organizerIds: orgIds,
    locationIds: locIds,
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};
