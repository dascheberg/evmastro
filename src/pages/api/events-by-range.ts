import type { APIRoute } from "astro";
import { db } from "../../db";
import { events, locations, organizers, eventTypes, timeSlots } from "../../db/schema";
import { and, eq, gte, lte, like } from "drizzle-orm";
import { toDisplayEvent } from "../../utils/eventDisplay";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    if (!from || !to) {
        return new Response(JSON.stringify({ error: "from/to fehlen" }), { status: 400 });
    }

    const organizerId = url.searchParams.get("organizerId");
    const locationId = url.searchParams.get("locationId");
    const typeId = url.searchParams.get("typeId");
    const search = url.searchParams.get("search")?.trim();

    const conditions: any[] = [gte(events.startDate, from), lte(events.startDate, to)];
    if (organizerId) conditions.push(eq(events.organizerId, Number(organizerId)));
    if (locationId) conditions.push(eq(events.locationId, Number(locationId)));
    if (typeId) conditions.push(eq(events.typeId, Number(typeId)));
    if (search) conditions.push(like(events.notes, `%${search}%`));

    const rows = await db
        .select({
            id: events.id,
            startDate: events.startDate,
            endDate: events.endDate,
            locationName: locations.name,
            eventTypeName: eventTypes.name,
            organizerName: organizers.name,
            timeSlotStart: timeSlots.name,
            notes: events.notes,
            recurrence: events.recurrence,
        })
        .from(events)
        .leftJoin(locations, eq(events.locationId, locations.id))
        .leftJoin(eventTypes, eq(events.typeId, eventTypes.id))
        .leftJoin(organizers, eq(events.organizerId, organizers.id))
        .leftJoin(timeSlots, eq(events.timeId, timeSlots.id))
        .where(and(...conditions))
        .orderBy(events.startDate);

    return new Response(JSON.stringify(rows.map(toDisplayEvent)), {
        headers: { "Content-Type": "application/json" },
    });
};