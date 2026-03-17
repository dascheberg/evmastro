import { d as db, u as user } from './index_BQXN-BIF.mjs';
import { a as auth } from './auth_CP-dz2xh.mjs';

const prerender = false;
const GET = async ({ request }) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return new Response(JSON.stringify({ error: "Nicht autorisiert" }), { status: 401 });
  }
  const users = await db.select({
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt
  }).from(user).orderBy(user.name);
  return new Response(JSON.stringify(users), {
    headers: { "Content-Type": "application/json" }
  });
};
const POST = async ({ request }) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return new Response(JSON.stringify({ error: "Nicht autorisiert" }), { status: 401 });
  }
  const body = await request.json();
  const { name, email, password } = body;
  if (!name || !email || !password) {
    return new Response(
      JSON.stringify({ error: "Name, E-Mail und Passwort sind erforderlich." }),
      { status: 400 }
    );
  }
  if (password.length < 8) {
    return new Response(
      JSON.stringify({ error: "Das Passwort muss mindestens 8 Zeichen lang sein." }),
      { status: 400 }
    );
  }
  try {
    const response = await auth.api.signUpEmail({
      body: { name, email, password }
    });
    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    const msg = err?.message ?? "";
    if (msg.toLowerCase().includes("already exists") || err?.status === 422) {
      return new Response(
        JSON.stringify({ error: "Diese E-Mail-Adresse ist bereits vergeben." }),
        { status: 409 }
      );
    }
    return new Response(
      JSON.stringify({ error: "Fehler beim Anlegen des Accounts." }),
      { status: 500 }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
