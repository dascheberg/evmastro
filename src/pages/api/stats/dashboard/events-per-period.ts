import type { APIRoute } from "astro";
import { db } from "../../../../db";
import { events } from "../../../../db/schema";
import { and, gte, lte, sql } from "drizzle-orm";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {


  const period = url.searchParams.get("period") ?? "all";

  const today = new Date();
  const start = today.toISOString().slice(0, 10);

  function addDays(days: number) {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  let end: string | null = null;

  switch (period) {
    case "week": end = addDays(7); break;
    case "month": end = addDays(30); break;
    case "quarter": end = addDays(90); break;
    case "halfyear": end = addDays(180); break;
    case "year": end = addDays(365); break;
    case "all":
    default:
      end = null;
  }

  let whereClause = undefined;

  if (end) {
    whereClause = and(
      gte(events.startDate, start),
      lte(events.startDate, end)
    );
  }

  let result;

  if (whereClause) {
    result = await db
      .select({ count: sql<number>`count(*)` })
      .from(events)
      .where(whereClause);
  } else {
    result = await db
      .select({ count: sql<number>`count(*)` })
      .from(events);
  }

  const count = result[0].count;

  return new Response(JSON.stringify({ count }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
