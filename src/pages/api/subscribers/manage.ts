// src/pages/api/subscribers/manage.ts
// Öffentlicher Endpunkt – kein Login, nur Token aus der E-Mail

import type { APIRoute } from "astro";
import { db } from "../../../db";
import { subscribers } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const prerender = false;

// GET /api/subscribers/manage?token=abc123
// Liefert die aktuellen Einstellungen des Abonnenten
export const GET: APIRoute = async ({ url }) => {
  const token = url.searchParams.get("token");

  if (!token) {
    return new Response(JSON.stringify({ error: "Kein Token angegeben." }), { status: 400 });
  }

  const [sub] = await db
    .select({
      name: subscribers.name,
      email: subscribers.email,
      organizerIds: subscribers.organizerIds,
      locationIds: subscribers.locationIds,
    })
    .from(subscribers)
    .where(eq(subscribers.unsubscribeToken, token));

  if (!sub) {
    return new Response(JSON.stringify({ error: "Ungültiger oder abgelaufener Link." }), { status: 404 });
  }

  return new Response(JSON.stringify(sub), {
    headers: { "Content-Type": "application/json" },
  });
};

// PUT /api/subscribers/manage
// Speichert geänderte Einstellungen anhand des Tokens im Body
export const PUT: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { token, organizerIds, locationIds } = body;

  if (!token) {
    return new Response(JSON.stringify({ error: "Kein Token angegeben." }), { status: 400 });
  }

  const orgIds: number[] = Array.isArray(organizerIds) ? organizerIds : [];
  const locIds: number[] = Array.isArray(locationIds) ? locationIds : [];

  if (orgIds.length === 0 && locIds.length === 0) {
    return new Response(
      JSON.stringify({ error: "Bitte mindestens einen Veranstalter oder Ort auswählen." }),
      { status: 400 }
    );
  }

  const existing = await db
    .select({ id: subscribers.id })
    .from(subscribers)
    .where(eq(subscribers.unsubscribeToken, token));

  if (existing.length === 0) {
    return new Response(JSON.stringify({ error: "Ungültiger Token." }), { status: 404 });
  }

  await db
    .update(subscribers)
    .set({ organizerIds: orgIds, locationIds: locIds })
    .where(eq(subscribers.unsubscribeToken, token));

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
};
