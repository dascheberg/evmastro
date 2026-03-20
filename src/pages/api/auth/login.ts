{/*
  export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const email = form.get("email")?.toString() ?? "";
  const password = form.get("password")?.toString() ?? "";

  try {
    // Better Auth direkt per fetch mit JSON aufrufen
    const baseURL = import.meta.env.BETTER_AUTH_URL;
    const response = await fetch(`${baseURL}/api/auth/sign-in/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
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
*/}

import type { APIRoute } from "astro";
import { auth } from "../../../lib/auth";

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const email = form.get("email")?.toString() ?? "";
  const password = form.get("password")?.toString() ?? "";

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
