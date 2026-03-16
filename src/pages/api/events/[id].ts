import type { APIRoute } from "astro";
import { db } from "../../../db";
import { events } from "../../../db/schema";
import { eq } from "drizzle-orm";

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
      })
      .where(eq(events.id, id))
      .returning();

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
    await db.delete(events).where(eq(events.id, id));

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

