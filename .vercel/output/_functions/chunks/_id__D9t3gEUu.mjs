import { d as db, i as importLog, a as events } from './index_BQXN-BIF.mjs';
import { a as auth } from './auth_CP-dz2xh.mjs';
import { eq } from 'drizzle-orm';

const prerender = false;
const DELETE = async ({ params, request }) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return new Response(JSON.stringify({ error: "Nicht autorisiert" }), { status: 401 });
  }
  const id = Number(params.id);
  if (!id || isNaN(id)) {
    return new Response(JSON.stringify({ error: "Ungültige ID" }), { status: 400 });
  }
  const [log] = await db.select().from(importLog).where(eq(importLog.id, id));
  if (!log) {
    return new Response(JSON.stringify({ error: "Import nicht gefunden" }), { status: 404 });
  }
  try {
    const deleted = await db.delete(events).where(eq(events.importId, id)).returning({ id: events.id });
    await db.delete(importLog).where(eq(importLog.id, id));
    return new Response(
      JSON.stringify({
        success: true,
        deletedCount: deleted.length
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("DELETE /api/admin/imports error:", err);
    return new Response(
      JSON.stringify({ error: "Fehler beim Rückgängigmachen des Imports." }),
      { status: 500 }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
