import { d as db, i as importLog, a as events } from './index_BQXN-BIF.mjs';
import { a as auth } from './auth_CP-dz2xh.mjs';
import { sql, eq } from 'drizzle-orm';

const prerender = false;
const GET = async ({ request }) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return new Response(JSON.stringify({ error: "Nicht autorisiert" }), { status: 401 });
  }
  const logs = await db.select({
    id: importLog.id,
    createdAt: importLog.createdAt,
    count: importLog.count,
    events: importLog.events
  }).from(importLog).orderBy(sql`${importLog.createdAt} DESC`);
  const result = await Promise.all(
    logs.map(async (log) => {
      log.events;
      const existing = await db.select({ id: events.id }).from(events).where(eq(events.importId, log.id));
      return {
        id: log.id,
        createdAt: log.createdAt,
        importedCount: log.count,
        remainingCount: existing.length,
        alreadyDeleted: existing.length === 0
      };
    })
  );
  return new Response(JSON.stringify(result), {
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
