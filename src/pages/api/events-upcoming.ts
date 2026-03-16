import type { APIRoute } from "astro";
import { db } from "../../db";
import {
    events,
    locations,
    organizers,
    eventTypes,
    timeSlots,
} from "../../db/schema";
import { eq, gte, lte, and } from "drizzle-orm";
import { toDisplayEvent } from "../../utils/eventDisplay";

export const prerender = false;

export const GET: APIRoute = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);

    // 1) ALLE Events holen (mit Lookup-Tabellen)
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
        .orderBy(events.startDate);

    // 2) Rohdaten → DisplayEvent
    const display = rows.map(toDisplayEvent);

    // 3) Filterlogik
    const todayEvents = display.filter((ev) => {
        const [day, month, year] = ev.dateLabel.split(".");
        const d = new Date(`${year}-${month}-${day}`);
        // const d = new Date(ev.dateLabel.split(".").reverse().join("-"));
        return d.toDateString() === today.toDateString();
    });

    const weekEvents = display.filter((ev) => {
        const [day, month, year] = ev.dateLabel.split(".");
        const d = new Date(`${year}-${month}-${day}`);
        return d > today && d <= nextWeek;
    });

    const monthEvents = display.filter((ev) => {
        const [day, month, year] = ev.dateLabel.split(".");
        const d = new Date(`${year}-${month}-${day}`);
        return d > nextWeek && d <= nextMonth;
    });

    return new Response(
        JSON.stringify({
            today: todayEvents,
            nextWeek: weekEvents,
            nextMonth: monthEvents,
        }),
        { headers: { "Content-Type": "application/json" } }
    );
};
