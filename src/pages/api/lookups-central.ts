import type { APIRoute } from "astro";
import { db } from "../../db";
import { organizers, locations, eventTypes, timeSlots } from "../../db/schema";
import { asc } from "drizzle-orm";

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const organizerRows = await db
      .select({ id: organizers.id, name: organizers.name })
      .from(organizers)
      .orderBy(asc(organizers.name));

    const locationRows = await db
      .select({ id: locations.id, name: locations.name })
      .from(locations)
      .orderBy(asc(locations.name));

    const typeRows = await db
      .select({ id: eventTypes.id, name: eventTypes.name })
      .from(eventTypes)
      .orderBy(asc(eventTypes.name));

    const timeSlotRows = await db
      .select({ id: timeSlots.id, name: timeSlots.name })
      .from(timeSlots)
      .orderBy(asc(timeSlots.name));

    return new Response(JSON.stringify({
      organizers: organizerRows,
      locations: locationRows,
      types: typeRows,
      timeSlots: timeSlotRows,
    }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Lookup API Error:", err);

    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
};
