import type { APIRoute } from "astro";
import { db } from "../../../../db";
import { user, session, account } from "../../../../db/schema";
import { auth } from "../../../../lib/auth";
import { eq } from "drizzle-orm";

export const prerender = false;

// DELETE – Admin löschen
export const DELETE: APIRoute = async ({ params, request }) => {
  const currentSession = await auth.api.getSession({ headers: request.headers });
  if (!currentSession) {
    return new Response(JSON.stringify({ error: "Nicht autorisiert" }), { status: 401 });
  }

  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: "Keine ID angegeben" }), { status: 400 });
  }

  // Sich selbst kann man nicht löschen
  if (id === currentSession.user.id) {
    return new Response(
      JSON.stringify({ error: "Du kannst deinen eigenen Account nicht löschen." }),
      { status: 403 }
    );
  }

  // Prüfen ob noch andere Admins existieren
  const allUsers = await db.select({ id: user.id }).from(user);
  if (allUsers.length <= 1) {
    return new Response(
      JSON.stringify({ error: "Der letzte Admin-Account kann nicht gelöscht werden." }),
      { status: 403 }
    );
  }

  try {
    // Sessions und Accounts des Nutzers löschen (Foreign Keys)
    await db.delete(session).where(eq(session.userId, id));
    await db.delete(account).where(eq(account.userId, id));
    await db.delete(user).where(eq(user.id, id));

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("DELETE /api/admin/users error:", err);
    return new Response(
      JSON.stringify({ error: "Fehler beim Löschen des Accounts." }),
      { status: 500 }
    );
  }
};

// PUT – Passwort ändern ODER notify-Flag setzen
export const PUT: APIRoute = async ({ params, request }) => {
  const currentSession = await auth.api.getSession({ headers: request.headers });
  if (!currentSession) {
    return new Response(JSON.stringify({ error: "Nicht autorisiert" }), { status: 401 });
  }

  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: "Keine ID angegeben" }), { status: 400 });
  }

  const body = await request.json();

  // ── Fall 1: notify-Flag ────────────────────────────────────────────────────
  if (typeof body.notify === "boolean") {
    try {
      await db
        .update(user)
        .set({ notify: body.notify })
        .where(eq(user.id, id));

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("PUT notify /api/admin/users error:", err);
      return new Response(
        JSON.stringify({ error: "Fehler beim Speichern der Mail-Einstellung." }),
        { status: 500 }
      );
    }
  }

  // Fall 2: Passwort ändern
  const { password } = body;

  if (!password || password.length < 8) {
    return new Response(
      JSON.stringify({ error: "Das Passwort muss mindestens 8 Zeichen lang sein." }),
      { status: 400 }
    );
  }

  try {
    // Better Auth's eigenen Hasher verwenden
    const ctx = await auth.$context;
    const hashed = await ctx.password.hash(password);

    await db
      .update(account)
      .set({ password: hashed })
      .where(eq(account.userId, id));

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("PUT /api/admin/users error:", err);
    return new Response(
      JSON.stringify({ error: "Fehler beim Ändern des Passworts." }),
      { status: 500 }
    );
  }
}
