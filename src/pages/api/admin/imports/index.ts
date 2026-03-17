import type { APIRoute } from "astro";
import { db } from "../../../../db";
import { importLog, events } from "../../../../db/schema";
import { auth } from "../../../../lib/auth";
import { eq, sql } from "drizzle-orm";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return new Response(JSON.stringify({ error: "Nicht autorisiert" }), { status: 401 });
  }

  const logs = await db
    .select({
      id: importLog.id,
      createdAt: importLog.createdAt,
      count: importLog.count,
      events: importLog.events,
    })
    .from(importLog)
    .orderBy(sql`${importLog.createdAt} DESC`);

  // Prüfen wie viele Events pro Import noch existieren
  const result = await Promise.all(
    logs.map(async (log) => {
      const eventIds = log.events as number[];

      // Zählen wie viele der ursprünglichen Events noch in der DB sind
      const existing = await db
        .select({ id: events.id })
        .from(events)
        .where(eq(events.importId, log.id));

      return {
        id: log.id,
        createdAt: log.createdAt,
        importedCount: log.count,
        remainingCount: existing.length,
        alreadyDeleted: existing.length === 0,
      };
    })
  );

  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json" },
  });
};
