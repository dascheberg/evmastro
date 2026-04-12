// src/pages/api/subscribers/unsubscribe.ts
// Öffentlicher Endpunkt – kein Login nötig, nur Token

import type { APIRoute } from "astro";
import { db } from "../../../db";
import { subscribers } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { notifySubscriberGoodbye } from "../../../lib/email";

export const prerender = false;

// GET /api/subscribers/unsubscribe?token=abc123
export const GET: APIRoute = async ({ url, redirect }) => {
  const token = url.searchParams.get("token");

  if (!token) {
    return redirect("/abmelden?fehler=kein-token");
  }

  const existing = await db
    .select({ id: subscribers.id })
    .from(subscribers)
    .where(eq(subscribers.unsubscribeToken, token));

  if (existing.length === 0) {
    return redirect("/abmelden?fehler=ungueltig");
  }

  const [toDelete] = await db
    .select({ name: subscribers.name, email: subscribers.email })
    .from(subscribers)
    .where(eq(subscribers.unsubscribeToken, token));

  await db.delete(subscribers).where(eq(subscribers.unsubscribeToken, token));

  if (toDelete) {
    notifySubscriberGoodbye(toDelete).catch(console.error);
  }

  return redirect("/abmelden?erfolg=1");
};
