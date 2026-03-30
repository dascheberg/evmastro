import type { APIRoute } from "astro";
import { db } from "../../db";
import {
  events,
  locations,
  organizers,
  eventTypes,
  timeSlots,
} from "../../db/schema";
import { eq, and, ne } from "drizzle-orm";

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
 *     timeId?:     2,    // optional: für Orts-Konflikt-Prüfung
 *     excludeId?:  12    // optional: diese Event-ID ignorieren (beim Bearbeiten)
 *   }
 * ]
 *
 * Response: Array von Ergebnissen:
 * [
 *   {
 *     inputIndex:    0,
 *     existingEvent: { ... }   // echtes Duplikat (gleicher Veranstalter + Ort + Typ + Datum)
 *     locationConflict: { ... } // Orts-Konflikt (gleicher Ort + Datum + Uhrzeit, anderer Veranstalter)
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
      timeId?: number;
      excludeId?: number;
    }>;

    if (!Array.isArray(candidates) || candidates.length === 0) {
      return new Response(JSON.stringify([]), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const results = [];

    for (let i = 0; i < candidates.length; i++) {
      const c = candidates[i];

      if (!c.startDate || !c.organizerId || !c.locationId || !c.typeId) {
        continue;
      }

      // ── 1. Duplikat-Prüfung (bisherige Logik) ────────────────────────────
      const dupConditions = [
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
        .where(and(...dupConditions));

      const dupFiltered = existing.filter((e) => e.id !== c.excludeId);

      // ── 2. Orts-Konflikt-Prüfung (NEU) ───────────────────────────────────
      // Gleicher Ort + gleiches Datum + gleiche Uhrzeit + ANDERER Veranstalter
      let locationConflict = null;

      if (c.timeId) {
        const conflictConditions = [
          eq(events.startDate, c.startDate),
          eq(events.locationId, c.locationId),
          eq(events.timeId, c.timeId),
          ne(events.organizerId, c.organizerId),  // anderer Veranstalter
        ];

        const conflicts = await db
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
          .where(and(...conflictConditions));

        const conflictFiltered = conflicts.filter((e) => e.id !== c.excludeId);
        if (conflictFiltered.length > 0) {
          locationConflict = conflictFiltered[0];
        }
      }

      // Nur zurückgeben wenn mindestens eine Warnung vorliegt
      if (dupFiltered.length > 0 || locationConflict) {
        results.push({
          inputIndex: i,
          existingEvent: dupFiltered.length > 0 ? dupFiltered[0] : null,
          locationConflict,
        });
      }
    }

    return new Response(JSON.stringify(results), {
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
