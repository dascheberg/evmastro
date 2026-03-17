import type { APIRoute } from "astro";
import { auth } from "../../../lib/auth";

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  await auth.api.signOut({
    headers: request.headers,
    asResponse: true,
  });

  return redirect("/");
};
