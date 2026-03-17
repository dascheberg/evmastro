import type { APIRoute } from "astro";
import { db } from "../../db";
import {
    events,
    locations,
    organizers,
    eventTypes,
    timeSlots,
} from "../../db/schema";
import { eq, and, gte, lte, or, ilike } from "drizzle-orm";
import { toDisplayEvent } from "../../utils/eventDisplay";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
    const organizerId = Number(url.searchParams.get("organizerId"));
    const locationId = Number(url.searchParams.get("locationId"));
    const typeId = Number(url.searchParams.get("typeId"));
    const month = Number(url.searchParams.get("month"));
    const year = Number(url.searchParams.get("year"));
    const search = url.searchParams.get("search")?.trim() ?? "";

    const conditions: any[] = [];

    if (organizerId) conditions.push(eq(events.organizerId, organizerId));
    if (locationId) conditions.push(eq(events.locationId, locationId));
    if (typeId) conditions.push(eq(events.typeId, typeId));

    if (month && year) {
        const startStr = `${year}-${String(month).padStart(2, "0")}-01`;
        const endDate = new Date(year, month, 0);
        const endStr = endDate.toISOString().split("T")[0];
        conditions.push(gte(events.startDate, startStr));
        conditions.push(lte(events.startDate, endStr));
    }

    // Freitextsuche über Veranstalter, Ort, Typ und Bemerkungen
    if (search) {
        conditions.push(
            or(
                ilike(organizers.name, `%${search}%`),
                ilike(locations.name, `%${search}%`),
                ilike(eventTypes.name, `%${search}%`),
                ilike(events.notes, `%${search}%`),
            )
        );
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
        })
        .from(events)
        .leftJoin(locations, eq(events.locationId, locations.id))
        .leftJoin(eventTypes, eq(events.typeId, eventTypes.id))
        .leftJoin(organizers, eq(events.organizerId, organizers.id))
        .leftJoin(timeSlots, eq(events.timeId, timeSlots.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(events.startDate);

    return new Response(JSON.stringify(rows.map(toDisplayEvent)), {
        headers: { "Content-Type": "application/json" },
    });
};
