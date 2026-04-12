// src/pages/api/admin/subscribers/index.ts
// Geschützter Admin-Endpunkt

import type { APIRoute } from "astro";
import { db } from "../../../../db";
import { subscribers } from "../../../../db/schema";
import { auth } from "../../../../lib/auth";
import { eq } from "drizzle-orm";

export const prerender = false;

// GET /api/admin/subscribers – alle Abonnenten laden
export const GET: APIRoute = async ({ request }) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return new Response(JSON.stringify({ error: "Nicht autorisiert" }), { status: 401 });
  }

  const rows = await db
    .select({
      id: subscribers.id,
      name: subscribers.name,
      email: subscribers.email,
      organizerIds: subscribers.organizerIds,
      locationIds: subscribers.locationIds,
      createdAt: subscribers.createdAt,
    })
    .from(subscribers)
    .orderBy(subscribers.name);

  return new Response(JSON.stringify(rows), {
    headers: { "Content-Type": "application/json" },
  });
};

// DELETE /api/admin/subscribers  – mit Body { id: number }
export const DELETE: APIRoute = async ({ request }) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return new Response(JSON.stringify({ error: "Nicht autorisiert" }), { status: 401 });
  }

  const body = await request.json();
  const id = Number(body.id);

  if (isNaN(id)) {
    return new Response(JSON.stringify({ error: "Ungültige ID" }), { status: 400 });
  }

  await db.delete(subscribers).where(eq(subscribers.id, id));

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
};
