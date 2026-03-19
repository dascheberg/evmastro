import type { APIRoute } from "astro";
import { db } from "../../../db";
import { events, locations, organizers, eventTypes, timeSlots } from "../../../db/schema";
import { eq, and, gte, lte, or, ilike, asc } from "drizzle-orm";
import { corsResponse } from "../../../lib/cors";

export const prerender = false;

// OPTIONS für CORS-Preflight
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
};

export const GET: APIRoute = async ({ url }) => {
  try {
    const from = url.searchParams.get("from");       // ISO-Datum, z.B. 2025-01-01
    const to = url.searchParams.get("to");         // ISO-Datum, z.B. 2025-12-31
    const search = url.searchParams.get("search")?.trim() ?? "";
    const organizer = url.searchParams.get("organizer"); // Name (teilweise)
    const location = url.searchParams.get("location");  // Name (teilweise)
    const type = url.searchParams.get("type");      // Name (teilweise)
    const limitRaw = url.searchParams.get("limit");
    const limit = limitRaw ? Math.min(Number(limitRaw), 200) : 50;

    const conditions: any[] = [];

    // Datum-Filter — Standard: ab heute
    const fromDate = from ?? new Date().toISOString().split("T")[0];
    conditions.push(gte(events.startDate, fromDate));
    if (to) conditions.push(lte(events.startDate, to));

    // Freitextsuche
    if (search) {
      conditions.push(or(
        ilike(organizers.name, `%${search}%`),
        ilike(locations.name, `%${search}%`),
        ilike(eventTypes.name, `%${search}%`),
        ilike(events.notes, `%${search}%`),
      ));
    }

    // Einzelfilter
    if (organizer) conditions.push(ilike(organizers.name, `%${organizer}%`));
    if (location) conditions.push(ilike(locations.name, `%${location}%`));
    if (type) conditions.push(ilike(eventTypes.name, `%${type}%`));

    const rows = await db
      .select({
        id: events.id,
        startDate: events.startDate,
        endDate: events.endDate,
        organizer: organizers.name,
        location: locations.name,
        type: eventTypes.name,
        time: timeSlots.name,
        notes: events.notes,
      })
      .from(events)
      .leftJoin(organizers, eq(events.organizerId, organizers.id))
      .leftJoin(locations, eq(events.locationId, locations.id))
      .leftJoin(eventTypes, eq(events.typeId, eventTypes.id))
      .leftJoin(timeSlots, eq(events.timeId, timeSlots.id))
      .where(and(...conditions))
      .orderBy(asc(events.startDate))
      .limit(limit);

    return corsResponse({ count: rows.length, events: rows });

  } catch (err) {
    console.error("GET /api/public/events error:", err);
    return corsResponse({ error: "Serverfehler" }, 500);
  }
};
