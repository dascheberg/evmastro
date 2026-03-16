import type { APIRoute } from "astro";
import { db } from "../../db"
import { events, importLog } from "../../db/schema";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { events: incomingEvents } = body;

        if (!incomingEvents || !Array.isArray(incomingEvents)) {
            return new Response(
                JSON.stringify({ error: "Ungültige Daten" }),
                { status: 400 }
            );
        }

        // Events speichern
        const inserted = await db
            .insert(events)
            .values(
                incomingEvents.map((ev) => ({
                    startDate: ev.startDate,
                    endDate: ev.endDate,
                    timeId: ev.timeId,
                    locationId: ev.locationId,
                    typeId: ev.typeId,
                    notes: ev.notes ?? null,
                    recurrence: ev.recurrence ?? null,
                    organizerId: ev.organizerId,
                }))
            )
            .returning();

        // Import-Log speichern
        await db.insert(importLog).values({
            count: inserted.length,
            events: inserted.map((e) => e.id), // JSONB array
        });

        return new Response(
            JSON.stringify({
                success: true,
                inserted: inserted.length,
            }),
            { status: 200 }
        );
    } catch (err) {
        console.error("Import-Fehler:", err);

        return new Response(
            JSON.stringify({ error: "Serverfehler beim Import" }),
            { status: 500 }

        );
    }
};
