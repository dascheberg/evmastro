import type { APIRoute } from "astro";
import { db } from "../../../../db";
import { organizers } from "../../../../db/schema";
import { and, ilike, inArray } from "drizzle-orm";

export const prerender = false;

// GET /api/lookups/organizers?search=abc
export const GET: APIRoute = async ({ url, locals }) => {
  const search = url.searchParams.get("search") ?? "";
  const allowedIds = (locals.allowedOrganizerIds ?? null) as number[] | null;

  // Leeres Array → User ist eingeschränkt aber ohne Veranstalter → nichts anzeigen
  // (inArray([]) wäre ungültiges SQL)
  if (allowedIds !== null && allowedIds.length === 0) {
    return new Response(JSON.stringify([]), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // Bedingungen kombinieren:
  // - Super-Admin (allowedIds = null) oder öffentlicher Zugriff: alle Veranstalter
  // - Eingeschränkter Admin: nur erlaubte Veranstalter
  const searchFilter = search ? ilike(organizers.name, `%${search}%`) : undefined;
  const accessFilter = allowedIds !== null && allowedIds.length > 0
    ? inArray(organizers.id, allowedIds)
    : undefined;

  const whereClause =
    searchFilter && accessFilter ? and(searchFilter, accessFilter) :
      searchFilter ?? accessFilter ?? undefined;

  const rows = await db
    .select()
    .from(organizers)
    .where(whereClause)
    .orderBy(organizers.name);

  return new Response(JSON.stringify(rows), {
    headers: { "Content-Type": "application/json" },
  });
};

// POST /api/lookups/organizers
export const POST: APIRoute = async ({ request, locals }) => {
  const allowedIds = (locals.allowedOrganizerIds ?? null) as number[] | null;

  // Eingeschränkte Admins dürfen keine neuen Veranstalter anlegen
  if (allowedIds !== null) {
    return new Response(
      JSON.stringify({ error: "Keine Berechtigung zum Anlegen neuer Veranstalter." }),
      { status: 403 }
    );
  }

  const body = await request.json();
  const name = body?.name?.trim();

  if (!name) {
    return new Response(JSON.stringify({ error: "Name required" }), { status: 400 });
  }

  const [row] = await db
    .insert(organizers)
    .values({ name })
    .returning();

  return new Response(JSON.stringify(row), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};
