// src/pages/api/subscribers/unsubscribe-silent.ts
// Löscht den Abonnenten und gibt nur JSON zurück — kein Redirect
// Der Redirect zum Dashboard passiert im Client (abo-verwalten.astro)

import type { APIRoute } from "astro";
import { db } from "../../../db";
import { subscribers } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const prerender = false;

export const DELETE: APIRoute = async ({ url }) => {
  const token = url.searchParams.get("token");

  if (!token) {
    return new Response(JSON.stringify({ error: "Kein Token." }), { status: 400 });
  }

  await db.delete(subscribers).where(eq(subscribers.unsubscribeToken, token));

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
};
