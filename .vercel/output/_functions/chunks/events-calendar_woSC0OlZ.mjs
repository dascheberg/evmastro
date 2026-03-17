import { d as db, a as events } from './index_BQXN-BIF.mjs';
import { sql, gte, lt } from 'drizzle-orm';

const prerender = false;
const GET = async ({ url }) => {
  const year = Number(url.searchParams.get("year"));
  const month = Number(url.searchParams.get("month"));
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const nextMonth = month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const result = await db.select({
    date: sql`DATE(${events.startDate})`,
    count: sql`COUNT(*)`
  }).from(events).where(gte(events.startDate, start)).where(lt(events.startDate, nextMonth)).groupBy(sql`DATE(${events.startDate})`).orderBy(sql`DATE(${events.startDate})`);
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
