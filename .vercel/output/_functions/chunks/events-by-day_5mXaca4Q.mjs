import { d as db, a as events, t as timeSlots, o as organizers, e as eventTypes, l as locations } from './index_BQXN-BIF.mjs';
import { eq, sql } from 'drizzle-orm';
import { t as toDisplayEvent } from './eventDisplay_CwwTXUmI.mjs';

const prerender = false;
const GET = async ({ url }) => {
  const date = url.searchParams.get("date");
  if (!date) {
    return new Response(JSON.stringify([]), {
      headers: { "Content-Type": "application/json" }
    });
  }
  const rows = await db.select({
    id: events.id,
    startDate: events.startDate,
    endDate: events.endDate,
    locationName: locations.name,
    eventTypeName: eventTypes.name,
    organizerName: organizers.name,
    timeSlotStart: timeSlots.name,
    notes: events.notes,
    // ← NEU
    recurrence: events.recurrence
    // ← NEU
  }).from(events).leftJoin(locations, eq(events.locationId, locations.id)).leftJoin(eventTypes, eq(events.typeId, eventTypes.id)).leftJoin(organizers, eq(events.organizerId, organizers.id)).leftJoin(timeSlots, eq(events.timeId, timeSlots.id)).where(sql`DATE(${events.startDate}) = ${date}`).orderBy(events.startDate);
  return new Response(JSON.stringify(rows.map(toDisplayEvent)), {
    headers: { "Content-Type": "application/json" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    GET,
    prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
