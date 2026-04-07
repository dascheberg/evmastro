import type { APIRoute } from "astro";
import { db } from "../../db";
import {
    events,
    locations,
    organizers,
    eventTypes,
    timeSlots,
} from "../../db/schema";
import { and, eq, gte, lte } from "drizzle-orm";
import { toDisplayEvent } from "../../utils/eventDisplay";

export const prerender = false;

function formatLocalDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

export const GET: APIRoute = async ({ url }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startStr = formatLocalDate(today);
    const endStr = formatLocalDate(addDays(today, 30));

    const conditions: any[] = [
        gte(events.startDate, startStr),
        lte(events.startDate, endStr),
    ];

    const organizerId = url.searchParams.get("organizerId");
    const locationId = url.searchParams.get("locationId");
    const typeId = url.searchParams.get("typeId");

    if (organizerId) conditions.push(eq(events.organizerId, Number(organizerId)));
    if (locationId) conditions.push(eq(events.locationId, Number(locationId)));
    if (typeId) conditions.push(eq(events.typeId, Number(typeId)));

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

    return new Response(JSON.stringify(rows.map(toDisplayEvent)));
};
