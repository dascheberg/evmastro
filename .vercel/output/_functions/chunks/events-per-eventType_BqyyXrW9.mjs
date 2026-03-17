import { d as db, e as eventTypes, a as events } from './index_BQXN-BIF.mjs';
import { sql, eq } from 'drizzle-orm';

const prerender = false;
const GET = async ({ url }) => {
  const limitParam = url.searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : 5;
  if (isNaN(limit)) {
    return new Response(JSON.stringify([]), { status: 400 });
  }
  const result = await db.select({
    id: eventTypes.id,
    name: eventTypes.name,
    event_count: sql`COUNT(${events.id})`.as("event_count")
  }).from(events).leftJoin(eventTypes, eq(events.typeId, eventTypes.id)).groupBy(eventTypes.id, eventTypes.name).orderBy(sql`event_count DESC`).limit(limit);
  return new Response(JSON.stringify(result), {
    status: 200,
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
