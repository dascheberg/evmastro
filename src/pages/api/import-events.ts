import type { APIRoute } from "astro";
import { db } from "../../db"
import { events, importLog } from "../../db/schema";
import { eq } from "drizzle-orm";

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

        // Import-Log ZUERST anlegen
        const [log] = await db.insert(importLog).values({
            count: incomingEvents.length,
            events: [],  // vorläufig leer
        }).returning();

        // Events MIT importId speichern
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
                    importId: log.id,   // ← jetzt gesetzt
                }))
            )
            .returning();

        // Import-Log mit echten IDs aktualisieren
        await db.update(importLog)
            .set({
                count: inserted.length,
                events: inserted.map((e) => e.id),
            })
            .where(eq(importLog.id, log.id));

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
