import { a as events, d as db } from './index_BQXN-BIF.mjs';
import { and, gte, lte, sql } from 'drizzle-orm';

const prerender = false;
const GET = async ({ url }) => {
  const period = url.searchParams.get("period") ?? "all";
  const today = /* @__PURE__ */ new Date();
  const start = today.toISOString().slice(0, 10);
  function addDays(days) {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }
  let end = null;
  switch (period) {
    case "week":
      end = addDays(7);
      break;
    case "month":
      end = addDays(30);
      break;
    case "quarter":
      end = addDays(90);
      break;
    case "halfyear":
      end = addDays(180);
      break;
    case "year":
      end = addDays(365);
      break;
    case "all":
    default:
      end = null;
  }
  let whereClause = void 0;
  if (end) {
    whereClause = and(
      gte(events.startDate, start),
      lte(events.startDate, end)
    );
  }
  let result;
  if (whereClause) {
    result = await db.select({ count: sql`count(*)` }).from(events).where(whereClause);
  } else {
    result = await db.select({ count: sql`count(*)` }).from(events);
  }
  const count = result[0].count;
  return new Response(JSON.stringify({ count }), {
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
