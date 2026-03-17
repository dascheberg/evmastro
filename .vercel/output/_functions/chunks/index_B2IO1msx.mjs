import { d as db, e as eventTypes } from './index_BQXN-BIF.mjs';
import { ilike } from 'drizzle-orm';

const prerender = false;
const GET = async ({ url }) => {
  const search = url.searchParams.get("search") ?? "";
  const rows = await db.select().from(eventTypes).where(search ? ilike(eventTypes.name, `%${search}%`) : void 0).orderBy(eventTypes.name);
  return new Response(JSON.stringify(rows), {
    headers: { "Content-Type": "application/json" }
  });
};
const POST = async ({ request }) => {
  const body = await request.json();
  const name = body?.name?.trim();
  if (!name) {
    return new Response(JSON.stringify({ error: "Name required" }), {
      status: 400
    });
  }
  const [row] = await db.insert(eventTypes).values({ name }).returning();
  return new Response(JSON.stringify(row), {
    status: 201,
    headers: { "Content-Type": "application/json" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
