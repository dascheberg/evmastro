import type { APIRoute } from "astro";
import { db } from "../../../../db";
import { events } from "../../../../db/schema";
import { organizers } from "../../../../db/schema";
import { and, gte, lte, sql, eq } from "drizzle-orm";

/*
SELECT 
  l.id,
  l.name,
  COUNT(e.id) AS event_count
FROM events e
JOIN locations l ON e.location_id = l.id
GROUP BY l.id, l.name
ORDER BY event_count DESC
LIMIT 5;
*/


export const prerender = false;

export const GET: APIRoute = async ({ url }) => {

  const limitParam = url.searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : 5;

  if (isNaN(limit)) {
    return new Response(JSON.stringify([]), { status: 400 });
  }

  const result = await db
    .select({
      id: organizers.id,
      name: organizers.name,
      event_count: sql<number>`COUNT(${events.id})`.as("event_count")
    })
    .from(events)
    .leftJoin(organizers, eq(events.organizerId, organizers.id))
    .groupBy(organizers.id, organizers.name)
    .orderBy(sql`event_count DESC`)
    .limit(limit);

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

};
