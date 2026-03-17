import { d as db, i as importLog, a as events } from './index_BQXN-BIF.mjs';
import { eq } from 'drizzle-orm';

const prerender = false;
const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const { events: incomingEvents } = body;
    if (!incomingEvents || !Array.isArray(incomingEvents)) {
      return new Response(
        JSON.stringify({ error: "Ungültige Daten" }),
        { status: 400 }
      );
    }
    const [log] = await db.insert(importLog).values({
      count: incomingEvents.length,
      events: []
      // vorläufig leer
    }).returning();
    const inserted = await db.insert(events).values(
      incomingEvents.map((ev) => ({
        startDate: ev.startDate,
        endDate: ev.endDate,
        timeId: ev.timeId,
        locationId: ev.locationId,
        typeId: ev.typeId,
        notes: ev.notes ?? null,
        recurrence: ev.recurrence ?? null,
        organizerId: ev.organizerId,
        importId: log.id
        // ← jetzt gesetzt
      }))
    ).returning();
    await db.update(importLog).set({
      count: inserted.length,
      events: inserted.map((e) => e.id)
    }).where(eq(importLog.id, log.id));
    return new Response(
      JSON.stringify({
        success: true,
        inserted: inserted.length
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

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    POST,
    prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
