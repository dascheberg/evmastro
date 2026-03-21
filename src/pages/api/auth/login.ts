import type { APIRoute } from "astro";
import { auth } from "../../../lib/auth";

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  const body = await request.json();
  const email = body.email ?? "";
  const password = body.password ?? "";

  try {
    const response = await auth.api.signInEmail({
      body: { email, password },
      headers: request.headers,
      asResponse: true,
    });

    if (!response.ok) {
      return redirect("/login?error=invalid_credentials");
    }

    const setCookie = response.headers.get("set-cookie");
    const headers = new Headers({ Location: "/admin/events" });
    if (setCookie) headers.set("set-cookie", setCookie);

    return new Response(null, { status: 302, headers });

  } catch (err: unknown) {
    console.error("LOGIN FEHLER:", err);
    return redirect("/login?error=server_error");
  }
};
