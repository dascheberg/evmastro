// src/pages/api/subscribers/unsubscribe-silent.ts
import type { APIRoute } from "astro";
import { db } from "../../../db";
import { subscribers } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { notifySubscriberGoodbye } from "../../../lib/email";

export const prerender = false;

export const DELETE: APIRoute = async ({ url }) => {
  const token = url.searchParams.get("token");

  if (!token) {
    return new Response(JSON.stringify({ error: "Kein Token." }), { status: 400 });
  }

  // ── Daten VOR dem Löschen holen ──────────────────────────────────────────
  const [toDelete] = await db
    .select({ name: subscribers.name, email: subscribers.email })
    .from(subscribers)
    .where(eq(subscribers.unsubscribeToken, token));

  await db.delete(subscribers).where(eq(subscribers.unsubscribeToken, token));

  if (toDelete) {
    notifySubscriberGoodbye(toDelete).catch(console.error);
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
};
