import type { APIRoute } from "astro";
import { db } from "../../db";
import {
    events,
    locations,
    organizers,
    eventTypes,
    timeSlots,
} from "../../db/schema";
import { eq, sql } from "drizzle-orm";
import { toDisplayEvent } from "../../utils/eventDisplay";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
    const date = url.searchParams.get("date");
    if (!date) {
        return new Response(JSON.stringify([]), {
            headers: { "Content-Type": "application/json" },
        });
    }

    const rows = await db
        .select({
            id: events.id,
            startDate: events.startDate,
            endDate: events.endDate,
            locationName: locations.name,
            eventTypeName: eventTypes.name,
            organizerName: organizers.name,
            timeSlotStart: timeSlots.name,
            notes: events.notes,        // ← NEU
            recurrence: events.recurrence,   // ← NEU
        })
        .from(events)
        .leftJoin(locations, eq(events.locationId, locations.id))
        .leftJoin(eventTypes, eq(events.typeId, eventTypes.id))
        .leftJoin(organizers, eq(events.organizerId, organizers.id))
        .leftJoin(timeSlots, eq(events.timeId, timeSlots.id))
        .where(sql`DATE(${events.startDate}) = ${date}`)
        .orderBy(events.startDate);

    return new Response(JSON.stringify(rows.map(toDisplayEvent)), {
        headers: { "Content-Type": "application/json" },
    });
};
