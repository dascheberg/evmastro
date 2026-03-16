import type { APIRoute } from "astro";
import { db } from "../../db";
import { events } from "../../db/schema";
import { sql, gte, lt } from "drizzle-orm";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
    const year = Number(url.searchParams.get("year"));
    const month = Number(url.searchParams.get("month")); // 1–12

    const start = `${year}-${String(month).padStart(2, "0")}-01`;

    const nextMonth =
        month === 12
            ? `${year + 1}-01-01`
            : `${year}-${String(month + 1).padStart(2, "0")}-01`;

    const result = await db
        .select({
            date: sql<string>`DATE(${events.startDate})`,
            count: sql<number>`COUNT(*)`,
        })
        .from(events)
        .where(gte(events.startDate, start))
        .where(lt(events.startDate, nextMonth))
        .groupBy(sql`DATE(${events.startDate})`)
        .orderBy(sql`DATE(${events.startDate})`);

    return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
};
