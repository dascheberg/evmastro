import { d as db, o as organizers, l as locations, e as eventTypes, t as timeSlots } from './index_BQXN-BIF.mjs';
import { asc } from 'drizzle-orm';

const prerender = false;
const GET = async () => {
  try {
    const organizerRows = await db.select({ id: organizers.id, name: organizers.name }).from(organizers).orderBy(asc(organizers.name));
    const locationRows = await db.select({ id: locations.id, name: locations.name }).from(locations).orderBy(asc(locations.name));
    const typeRows = await db.select({ id: eventTypes.id, name: eventTypes.name }).from(eventTypes).orderBy(asc(eventTypes.name));
    const timeSlotRows = await db.select({ id: timeSlots.id, name: timeSlots.name }).from(timeSlots).orderBy(asc(timeSlots.name));
    return new Response(
      JSON.stringify({
        organizers: organizerRows,
        locations: locationRows,
        types: typeRows,
        timeSlots: timeSlotRows
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
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

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
