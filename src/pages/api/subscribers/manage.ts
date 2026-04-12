// src/pages/api/subscribers/manage.ts
import type { APIRoute } from "astro";
import { db } from "../../../db";
import { subscribers } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { notifySubscriberChanged } from "../../../lib/email";

export const prerender = false;

// GET /api/subscribers/manage?token=abc123
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

  // ── Ein einziges UPDATE mit .returning() ──────────────────────────────────
  const [updated] = await db
    .update(subscribers)
    .set({ organizerIds: orgIds, locationIds: locIds })
    .where(eq(subscribers.unsubscribeToken, token))
    .returning();

  if (!updated) {
    return new Response(JSON.stringify({ error: "Ungültiger Token." }), { status: 404 });
  }

  notifySubscriberChanged(updated).catch(console.error);

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
};
