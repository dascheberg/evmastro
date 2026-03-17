import type { APIRoute } from "astro";
import { auth } from "../../../lib/auth";

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const email = form.get("email")?.toString() ?? "";
  const password = form.get("password")?.toString() ?? "";

  try {
    // Better Auth: E-Mail + Passwort prüfen und Session anlegen
    const response = await auth.api.signInEmail({
      body: { email, password },
      headers: request.headers,
      asResponse: true,   // gibt direkt eine Response mit Set-Cookie zurück
    });

    // Login fehlgeschlagen
    if (!response.ok) {
      return redirect("/login?error=invalid_credentials");
    }

    // Cookie aus der Better-Auth-Response übernehmen und weiterleiten
    const setCookie = response.headers.get("set-cookie");
    const headers = new Headers({ Location: "/admin/events" });
    if (setCookie) headers.set("set-cookie", setCookie);

    return new Response(null, { status: 302, headers });

  } catch {
    return redirect("/login?error=server_error");
  }
};
