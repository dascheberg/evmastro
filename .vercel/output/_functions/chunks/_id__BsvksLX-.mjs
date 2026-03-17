import { d as db, t as timeSlots } from './index_BQXN-BIF.mjs';
import { eq } from 'drizzle-orm';

const prerender = false;
const PUT = async ({ request, params }) => {
  const id = Number(params.id);
  const body = await request.json();
  const name = body?.name?.trim();
  if (!id || !name) {
    return new Response(JSON.stringify({ error: "Invalid input" }), {
      status: 400
    });
  }
  const [row] = await db.update(timeSlots).set({ name }).where(eq(timeSlots.id, id)).returning();
  return new Response(JSON.stringify(row), {
    headers: { "Content-Type": "application/json" }
  });
};
const DELETE = async ({ params }) => {
  const id = Number(params.id);
  if (!id) {
    return new Response(JSON.stringify({ error: "Invalid id" }), {
      status: 400
    });
  }
  try {
    await db.delete(timeSlots).where(eq(timeSlots.id, id));
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Dieser Veranstalter kann nicht gelöscht werden, weil noch Veranstaltungen darauf verweisen."
      }),
      { status: 409 }
      // 409 = Conflict
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  PUT,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
