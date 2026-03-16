import type { APIRoute } from "astro";
import { db } from "../../../../db";
import { locations } from "../../../../db/schema";
import { eq, ilike } from "drizzle-orm";

export const prerender = false;

// GET /api/lookups/locations?search=abc
export const GET: APIRoute = async ({ url }) => {
  const search = url.searchParams.get("search") ?? "";

  const rows = await db
    .select()
    .from(locations)
    .where(search ? ilike(locations.name, `%${search}%`) : undefined)
    .orderBy(locations.name);

  return new Response(JSON.stringify(rows), {
    headers: { "Content-Type": "application/json" },
  });
};

// POST /api/lookups/locations
export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const name = body?.name?.trim();

  if (!name) {
    return new Response(JSON.stringify({ error: "Name required" }), {
      status: 400,
    });
  }

  const [row] = await db
    .insert(locations)
    .values({ name })
    .returning();

  return new Response(JSON.stringify(row), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};

