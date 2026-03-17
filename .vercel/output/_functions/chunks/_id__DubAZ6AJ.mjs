import { d as db, u as user, s as session, b as account } from './index_BQXN-BIF.mjs';
import { a as auth } from './auth_CP-dz2xh.mjs';
import { eq } from 'drizzle-orm';

const prerender = false;
const DELETE = async ({ params, request }) => {
  const currentSession = await auth.api.getSession({ headers: request.headers });
  if (!currentSession) {
    return new Response(JSON.stringify({ error: "Nicht autorisiert" }), { status: 401 });
  }
  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: "Keine ID angegeben" }), { status: 400 });
  }
  if (id === currentSession.user.id) {
    return new Response(
      JSON.stringify({ error: "Du kannst deinen eigenen Account nicht löschen." }),
      { status: 403 }
    );
  }
  const allUsers = await db.select({ id: user.id }).from(user);
  if (allUsers.length <= 1) {
    return new Response(
      JSON.stringify({ error: "Der letzte Admin-Account kann nicht gelöscht werden." }),
      { status: 403 }
    );
  }
  try {
    await db.delete(session).where(eq(session.userId, id));
    await db.delete(account).where(eq(account.userId, id));
    await db.delete(user).where(eq(user.id, id));
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("DELETE /api/admin/users error:", err);
    return new Response(
      JSON.stringify({ error: "Fehler beim Löschen des Accounts." }),
      { status: 500 }
    );
  }
};
const PUT = async ({ params, request }) => {
  const currentSession = await auth.api.getSession({ headers: request.headers });
  if (!currentSession) {
    return new Response(JSON.stringify({ error: "Nicht autorisiert" }), { status: 401 });
  }
  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: "Keine ID angegeben" }), { status: 400 });
  }
  const body = await request.json();
  const { password } = body;
  if (!password || password.length < 8) {
    return new Response(
      JSON.stringify({ error: "Das Passwort muss mindestens 8 Zeichen lang sein." }),
      { status: 400 }
    );
  }
  try {
    await auth.api.setPassword({
      body: { newPassword: password, userId: id },
      headers: request.headers
    });
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("PUT /api/admin/users error:", err);
    return new Response(
      JSON.stringify({ error: "Fehler beim Ändern des Passworts." }),
      { status: 500 }
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
