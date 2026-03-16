import type { APIRoute } from "astro";
import { db } from "../../../../db";
import { timeSlots } from "../../../../db/schema";
import { eq, ilike } from "drizzle-orm";

export const prerender = false;

// PUT /api/lookups/timeSlots?id=123
export const PUT: APIRoute = async ({ request, params }) => {
  const id = Number(params.id);
  const body = await request.json();
  const name = body?.name?.trim();

  if (!id || !name) {
    return new Response(JSON.stringify({ error: "Invalid input" }), {
      status: 400,
    });
  }

  const [row] = await db
    .update(timeSlots)
    .set({ name })
    .where(eq(timeSlots.id, id))
    .returning();

  return new Response(JSON.stringify(row), {
    headers: { "Content-Type": "application/json" },
  });
};


// DELETE /api/lookups/timeSlots?id=123
export const DELETE: APIRoute = async ({ params }) => {
  const id = Number(params.id);

  if (!id) {
    return new Response(JSON.stringify({ error: "Invalid id" }), {
      status: 400,
    });
  }

  try {
    await db.delete(timeSlots).where(eq(timeSlots.id, id));

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Dieser Veranstalter kann nicht gelöscht werden, weil noch Veranstaltungen darauf verweisen.",
      }),
      { status: 409 } // 409 = Conflict
    );
  }
};

