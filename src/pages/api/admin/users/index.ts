import type { APIRoute } from "astro";
import { db } from "../../../../db";
import { user } from "../../../../db/schema";
import { auth } from "../../../../lib/auth";
import { eq } from "drizzle-orm";

export const prerender = false;

// GET – alle Admins laden
export const GET: APIRoute = async ({ request }) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return new Response(JSON.stringify({ error: "Nicht autorisiert" }), { status: 401 });
  }

  const users = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      notify: user.notify,       // NEU
    })
    .from(user)
    .orderBy(user.name);

  return new Response(JSON.stringify(users), {
    headers: { "Content-Type": "application/json" },
  });
};

// POST – neuen Admin anlegen
export const POST: APIRoute = async ({ request }) => {
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
      body: { name, email, password },
    });

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
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
