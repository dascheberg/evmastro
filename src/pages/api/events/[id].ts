import type { APIRoute } from "astro";
import { db } from "../../../db";
import { events } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { notifyEventUpdated, notifyEventDeleted } from "../../../lib/email";
import { organizers, locations, eventTypes, timeSlots } from "../../../db/schema";


export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const id = Number(params.id);

  if (isNaN(id)) {
    return new Response(JSON.stringify({ error: "Invalid ID" }), { status: 400 });
  }

  const [row] = await db
    .select()
    .from(events)
    .where(eq(events.id, id));

  if (!row) {
    return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  }

  return new Response(JSON.stringify(row), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const PUT: APIRoute = async ({ params, request }) => {
  const id = Number(params.id);

  if (isNaN(id)) {
    return new Response(JSON.stringify({ error: "Invalid ID" }), { status: 400 });
  }

  try {
    const body = await request.json();

    const updated = await db
      .update(events)
      .set({
        startDate: body.startDate,
        endDate: body.endDate,
        organizerId: body.organizerId,
        typeId: body.eventTypeId,
        locationId: body.locationId,
        timeId: body.timeSlotsId,
        notes: body.notes ?? null,
        recurrence: body.recurrence ?? null,   // ← NEU
      })
      .where(eq(events.id, id))
      .returning();

    // ── E-Mail-Benachrichtigung ───────────────────────────────────────────────
    const [meta] = await db
      .select({
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
      .where(eq(events.id, id));

    notifyEventUpdated({
      id,
      startDate: updated[0].startDate,
      endDate: updated[0].endDate,
      organizerName: meta?.organizerName ?? undefined,
      locationName: meta?.locationName ?? undefined,
      typeName: meta?.typeName ?? undefined,
      timeSlotName: meta?.timeSlotName ?? undefined,
      notes: updated[0].notes ?? undefined,
    }).catch(console.error);
    // ── Ende E-Mail ───────────────────────────────────────────────────────────

    return new Response(JSON.stringify(updated[0]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("PUT /api/events error:", err);
    return new Response(JSON.stringify({ error: "Failed to update event" }), {
      status: 500,
    });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  const id = Number(params.id);

  if (isNaN(id)) {
    return new Response(JSON.stringify({ error: "Invalid ID" }), { status: 400 });
  }

  try {
    // ── Daten VOR dem Löschen holen (für die Mail) ────────────────────────────
    const [toDelete] = await db
      .select({
        startDate: events.startDate,
        endDate: events.endDate,
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
      .where(eq(events.id, id));
    // ─────────────────────────────────────────────────────────────────────────

    await db.delete(events).where(eq(events.id, id));

    if (toDelete) {
      notifyEventDeleted({
        id,
        startDate: toDelete.startDate,
        endDate: toDelete.endDate,
        organizerName: toDelete.organizerName ?? undefined,
        locationName: toDelete.locationName ?? undefined,
        typeName: toDelete.typeName ?? undefined,
        timeSlotName: toDelete.timeSlotName ?? undefined,
      }).catch(console.error);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("DELETE /api/events error:", err);
    return new Response(JSON.stringify({ error: "Failed to delete event" }), {
      status: 500,
    });
  }
};
