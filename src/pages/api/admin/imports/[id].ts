import type { APIRoute } from "astro";
import { db } from "../../../../db";
import { importLog, events } from "../../../../db/schema";
import { auth } from "../../../../lib/auth";
import { eq } from "drizzle-orm";

export const prerender = false;

export const DELETE: APIRoute = async ({ params, request }) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return new Response(JSON.stringify({ error: "Nicht autorisiert" }), { status: 401 });
  }

  const id = Number(params.id);
  if (!id || isNaN(id)) {
    return new Response(JSON.stringify({ error: "Ungültige ID" }), { status: 400 });
  }

  // Import-Log prüfen
  const [log] = await db
    .select()
    .from(importLog)
    .where(eq(importLog.id, id));

  if (!log) {
    return new Response(JSON.stringify({ error: "Import nicht gefunden" }), { status: 404 });
  }

  try {
    // Alle Events dieses Imports löschen
    const deleted = await db
      .delete(events)
      .where(eq(events.importId, id))
      .returning({ id: events.id });

    // Import-Log selbst löschen
    await db.delete(importLog).where(eq(importLog.id, id));

    return new Response(
      JSON.stringify({
        success: true,
        deletedCount: deleted.length,
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
