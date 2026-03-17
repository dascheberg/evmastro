import { a as events, d as db, t as timeSlots, o as organizers, e as eventTypes, l as locations } from './index_BQXN-BIF.mjs';
import { gte, lte, eq, and } from 'drizzle-orm';
import { t as toDisplayEvent } from './eventDisplay_CwwTXUmI.mjs';

const prerender = false;
const GET = async ({ url }) => {
  const start = url.searchParams.get("start");
  const end = url.searchParams.get("end");
  if (!start || !end) {
    return new Response(JSON.stringify([]));
  }
  const conditions = [
    gte(events.startDate, start),
    lte(events.startDate, end)
  ];
  const organizerId = url.searchParams.get("organizerId");
  const locationId = url.searchParams.get("locationId");
  const typeId = url.searchParams.get("typeId");
  if (organizerId) conditions.push(eq(events.organizerId, Number(organizerId)));
  if (locationId) conditions.push(eq(events.locationId, Number(locationId)));
  if (typeId) conditions.push(eq(events.typeId, Number(typeId)));
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
  }).from(events).leftJoin(locations, eq(events.locationId, locations.id)).leftJoin(eventTypes, eq(events.typeId, eventTypes.id)).leftJoin(organizers, eq(events.organizerId, organizers.id)).leftJoin(timeSlots, eq(events.timeId, timeSlots.id)).where(and(...conditions)).orderBy(events.startDate);
  return new Response(JSON.stringify(rows.map(toDisplayEvent)));
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    GET,
    prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
