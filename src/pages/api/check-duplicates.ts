import type { APIRoute } from "astro";
import { db } from "../../db";
import {
  events,
  locations,
  organizers,
  eventTypes,
  timeSlots,
} from "../../db/schema";
import { eq, and } from "drizzle-orm";

export const prerender = false;

/**
 * POST /api/check-duplicates
 *
 * Body: Array von Events zum Prüfen:
 * [
 *   {
 *     startDate:   "2026-03-17",
 *     organizerId: 3,
 *     locationId:  5,
 *     typeId:      8,
 *     excludeId?:  12  // optional: diese Event-ID ignorieren (beim Bearbeiten)
 *   }
 * ]
 *
 * Response: Array von Duplikaten:
 * [
 *   {
 *     inputIndex:    0,       // Index im Input-Array
 *     existingEvent: { ... }  // das gefundene Duplikat
 *   }
 * ]
 */

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const candidates = body as Array<{
      startDate: string;
      organizerId: number;
      locationId: number;
      typeId: number;
      excludeId?: number;
    }>;

    if (!Array.isArray(candidates) || candidates.length === 0) {
      return new Response(JSON.stringify([]), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const duplicates = [];

    for (let i = 0; i < candidates.length; i++) {
      const c = candidates[i];

      if (!c.startDate || !c.organizerId || !c.locationId || !c.typeId) {
        continue;
      }

      // Suche nach existierendem Event mit gleichen Feldern
      const conditions = [
        eq(events.startDate, c.startDate),
        eq(events.organizerId, c.organizerId),
        eq(events.locationId, c.locationId),
        eq(events.typeId, c.typeId),
      ];

      const existing = await db
        .select({
          id: events.id,
          startDate: events.startDate,
          organizerName: organizers.name,
          locationName: locations.name,
          typeName: eventTypes.name,
          timeSlotName: timeSlots.name,
        })
        .from(events)
        .leftJoin(organizers, eq(events.organizerId, organizers.id))
        .leftJoin(locations, eq(events.locationId, locations.id))
        .leftJoin(eventTypes, eq(events.typeId, eventTypes.id))
        .leftJoin(timeSlots, eq(events.timeId, timeSlots.id))
        .where(and(...conditions));

      // Beim Bearbeiten: eigene ID ignorieren
      const filtered = existing.filter((e) => e.id !== c.excludeId);

      if (filtered.length > 0) {
        duplicates.push({
          inputIndex: i,
          existingEvent: filtered[0],
        });
      }
    }

    return new Response(JSON.stringify(duplicates), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("check-duplicates error:", err);
    return new Response(
      JSON.stringify({ error: "Fehler bei der Duplikat-Prüfung" }),
      { status: 500 }
    );
  }
};
