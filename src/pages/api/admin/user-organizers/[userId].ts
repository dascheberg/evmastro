// src/pages/api/admin/user-organizers/[userId].ts
//
// GET  /api/admin/user-organizers/:userId  → Liste der erlaubten Veranstalter-IDs
// PUT  /api/admin/user-organizers/:userId  → Komplette Liste ersetzen (body: { organizerIds: number[] })

import type { APIRoute } from "astro";
import { db } from "../../../../db";
import { userOrganizers, organizers } from "../../../../db/schema";
import { auth } from "../../../../lib/auth";
import { eq } from "drizzle-orm";

export const prerender = false;

// ── GET: aktuelle Zuordnung laden ─────────────────────────────────────────────
export const GET: APIRoute = async ({ params, request }) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const userId = params.userId as string;

  const rows = await db
    .select({ organizerId: userOrganizers.organizerId })
    .from(userOrganizers)
    .where(eq(userOrganizers.userId, userId));

  return new Response(JSON.stringify(rows.map((r) => r.organizerId)), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

// ── PUT: Zuordnung komplett ersetzen ──────────────────────────────────────────
export const PUT: APIRoute = async ({ params, request }) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const userId = params.userId as string;

  try {
    const body = await request.json();
    const organizerIds: number[] = body.organizerIds ?? [];

    // Alle alten Einträge löschen
    await db.delete(userOrganizers).where(eq(userOrganizers.userId, userId));

    // Neue Einträge einfügen (leere Liste = Super-Admin)
    if (organizerIds.length > 0) {
      await db.insert(userOrganizers).values(
        organizerIds.map((organizerId) => ({ userId, organizerId }))
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("PUT user-organizers error:", err);
    return new Response(JSON.stringify({ error: "Fehler beim Speichern" }), { status: 500 });
  }
};
