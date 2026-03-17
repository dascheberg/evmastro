import { d as db, a as events, t as timeSlots, o as organizers, e as eventTypes, l as locations } from './index_BQXN-BIF.mjs';
import { eq } from 'drizzle-orm';
import { t as toDisplayEvent } from './eventDisplay_CwwTXUmI.mjs';

const prerender = false;
const GET = async () => {
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  const nextMonth = new Date(today);
  nextMonth.setMonth(today.getMonth() + 1);
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
  }).from(events).leftJoin(locations, eq(events.locationId, locations.id)).leftJoin(eventTypes, eq(events.typeId, eventTypes.id)).leftJoin(organizers, eq(events.organizerId, organizers.id)).leftJoin(timeSlots, eq(events.timeId, timeSlots.id)).orderBy(events.startDate);
  const display = rows.map(toDisplayEvent);
  function parseDate(dateLabel) {
    const [day, month, year] = dateLabel.split(".");
    return /* @__PURE__ */ new Date(`${year}-${month}-${day}`);
  }
  const todayEvents = display.filter((ev) => {
    const d = parseDate(ev.dateLabel);
    return d.toDateString() === today.toDateString();
  });
  const weekEvents = display.filter((ev) => {
    const d = parseDate(ev.dateLabel);
    return d > today && d <= nextWeek;
  });
  const monthEvents = display.filter((ev) => {
    const d = parseDate(ev.dateLabel);
    return d > nextWeek && d <= nextMonth;
  });
  return new Response(
    JSON.stringify({
      today: todayEvents,
      nextWeek: weekEvents,
      nextMonth: monthEvents
    }),
    { headers: { "Content-Type": "application/json" } }
  );
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    GET,
    prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
