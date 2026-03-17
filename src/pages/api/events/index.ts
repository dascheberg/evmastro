import type { APIRoute } from "astro";
import { db } from "../../../db";
import {
  events,
  organizers,
  locations,
  eventTypes,
  timeSlots,
} from "../../../db/schema";
import { eq, sql, asc, desc, and, gte, lte, or, ilike } from "drizzle-orm";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const page = Number(url.searchParams.get("page") ?? "1");
    const pageSize = Number(url.searchParams.get("pageSize") ?? "20");
    const sortBy = url.searchParams.get("sortBy") ?? "startDate";
    const sortDir = url.searchParams.get("sortDir") ?? "asc";
    const search = url.searchParams.get("search")?.trim() ?? "";

    const startDateFrom = url.searchParams.get("startDateFrom");
    const startDateTo = url.searchParams.get("startDateTo");
    const organizerFilter = url.searchParams.get("organizer");
    const locationFilter = url.searchParams.get("location");
    const typeFilter = url.searchParams.get("type");
    const timeSlotFilter = url.searchParams.get("timeSlot");

    const offset = (page - 1) * pageSize;

    const sortColumns: Record<string, any> = {
      id: events.id,
      startDate: events.startDate,
      endDate: events.endDate,
      organizer: organizers.name,
      location: locations.name,
      type: eventTypes.name,
      timeSlot: timeSlots.name,
    };

    const sortColumn = sortColumns[sortBy] ?? events.startDate;
    const sortOrder = sortDir === "desc" ? desc(sortColumn) : asc(sortColumn);

    const filters: any[] = [];

    if (startDateFrom) filters.push(gte(events.startDate, startDateFrom));
    if (startDateTo) filters.push(lte(events.startDate, startDateTo));
    if (organizerFilter) filters.push(eq(organizers.name, organizerFilter));
    if (locationFilter) filters.push(eq(locations.name, locationFilter));
    if (typeFilter) filters.push(eq(eventTypes.name, typeFilter));
    if (timeSlotFilter) filters.push(eq(timeSlots.name, timeSlotFilter));

    // Freitextsuche
    if (search) {
      filters.push(
        or(
          ilike(organizers.name, `%${search}%`),
          ilike(locations.name, `%${search}%`),
          ilike(eventTypes.name, `%${search}%`),
          ilike(events.notes, `%${search}%`),
        )
      );
    }

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const joins = (q: any) => q
      .leftJoin(organizers, eq(events.organizerId, organizers.id))
      .leftJoin(locations, eq(events.locationId, locations.id))
      .leftJoin(eventTypes, eq(events.typeId, eventTypes.id))
      .leftJoin(timeSlots, eq(events.timeId, timeSlots.id));

    const [{ count }] = await joins(
      db.select({ count: sql<number>`count(*)` }).from(events)
    ).where(whereClause);

    const rows = await joins(
      db.select({
        id: events.id,
        startDate: events.startDate,
        endDate: events.endDate,
        organizer: organizers.name,
        location: locations.name,
        type: eventTypes.name,
        timeSlot: timeSlots.name,
        recurrence: events.recurrence,
        importId: events.importId,
      }).from(events)
    )
      .where(whereClause)
      .orderBy(sortOrder)
      .limit(pageSize)
      .offset(offset);

    return new Response(
      JSON.stringify({
        data: rows,
        page,
        pageSize,
        total: count,
        pageCount: Math.ceil(count / pageSize),
        sortBy,
        sortDir,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("API Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    const newEvent = await db
      .insert(events)
      .values({
        startDate: body.startDate,
        endDate: body.endDate,
        organizerId: body.organizerId,
        typeId: body.eventTypeId,
        locationId: body.locationId,
        timeId: body.timeSlotsId,
        notes: body.notes ?? null,
      })
      .returning();

    return new Response(JSON.stringify(newEvent[0]), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("POST /api/events error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to create event" }),
      { status: 500 }
    );
  }
};
