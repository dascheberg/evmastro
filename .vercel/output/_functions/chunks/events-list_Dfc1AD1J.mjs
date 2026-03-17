import { a as events, o as organizers, l as locations, e as eventTypes, d as db, t as timeSlots } from './index_BQXN-BIF.mjs';
import { eq, gte, lte, or, ilike, and } from 'drizzle-orm';
import { t as toDisplayEvent } from './eventDisplay_CwwTXUmI.mjs';

const prerender = false;
const GET = async ({ url }) => {
  const organizerId = Number(url.searchParams.get("organizerId"));
  const locationId = Number(url.searchParams.get("locationId"));
  const typeId = Number(url.searchParams.get("typeId"));
  const month = Number(url.searchParams.get("month"));
  const year = Number(url.searchParams.get("year"));
  const search = url.searchParams.get("search")?.trim() ?? "";
  const conditions = [];
  if (organizerId) conditions.push(eq(events.organizerId, organizerId));
  if (locationId) conditions.push(eq(events.locationId, locationId));
  if (typeId) conditions.push(eq(events.typeId, typeId));
  if (month && year) {
    const startStr = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = new Date(year, month, 0);
    const endStr = endDate.toISOString().split("T")[0];
    conditions.push(gte(events.startDate, startStr));
    conditions.push(lte(events.startDate, endStr));
  }
  if (search) {
    conditions.push(
      or(
        ilike(organizers.name, `%${search}%`),
        ilike(locations.name, `%${search}%`),
        ilike(eventTypes.name, `%${search}%`),
        ilike(events.notes, `%${search}%`)
      )
    );
  }
  const rows = await db.select({
    id: events.id,
    startDate: events.startDate,
    endDate: events.endDate,
    locationName: locations.name,
    eventTypeName: eventTypes.name,
    organizerName: organizers.name,
    timeSlotStart: timeSlots.name
  }).from(events).leftJoin(locations, eq(events.locationId, locations.id)).leftJoin(eventTypes, eq(events.typeId, eventTypes.id)).leftJoin(organizers, eq(events.organizerId, organizers.id)).leftJoin(timeSlots, eq(events.timeId, timeSlots.id)).where(conditions.length > 0 ? and(...conditions) : void 0).orderBy(events.startDate);
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
