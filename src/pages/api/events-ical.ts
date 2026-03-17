import type { APIRoute } from "astro";
import { db } from "../../db";
import {
  events,
  locations,
  organizers,
  eventTypes,
  timeSlots,
} from "../../db/schema";
import { eq, and, gte, lte, or, ilike } from "drizzle-orm";

export const prerender = false;

// ── Hilfsfunktionen ───────────────────────────────────────────────────────────

function escapeIcal(str: string): string {
  return (str ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function toIcalDate(dateStr: string): string {
  // "2026-03-17" → "20260317"
  return dateStr.replace(/-/g, "");
}

function toIcalDateTime(dateStr: string, timeStr: string | null): string {
  // Datum + Uhrzeit → "20260317T170000"
  const date = toIcalDate(dateStr);

  if (!timeStr) return `${date}T000000`;

  // "17:00" → "170000"
  const time = timeStr.replace(":", "") + "00";
  return `${date}T${time}`;
}

function generateUID(id: number, dateStr: string): string {
  return `event-${id}-${dateStr.replace(/-/g, "")}@evmastro`;
}

// ── API Route ─────────────────────────────────────────────────────────────────

export const GET: APIRoute = async ({ url }) => {
  const organizerId = Number(url.searchParams.get("organizerId"));
  const locationId = Number(url.searchParams.get("locationId"));
  const typeId = Number(url.searchParams.get("typeId"));
  const month = Number(url.searchParams.get("month"));
  const year = Number(url.searchParams.get("year"));
  const search = url.searchParams.get("search")?.trim() ?? "";

  const conditions: any[] = [];

  if (organizerId) conditions.push(eq(events.organizerId, organizerId));
  if (locationId) conditions.push(eq(events.locationId, locationId));
  if (typeId) conditions.push(eq(events.typeId, typeId));

  if (month && year) {
    const startStr = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = new Date(year, month, 0);
    const endStr = endDate.toISOString().split("T")[0];
    conditions.push(gte(events.startDate, startStr));
    conditions.push(lte(events.startDate, endStr));
  }

  if (search) {
    conditions.push(
      or(
        ilike(organizers.name, `%${search}%`),
        ilike(locations.name, `%${search}%`),
        ilike(eventTypes.name, `%${search}%`),
        ilike(events.notes, `%${search}%`),
      )
    );
  }

  const rows = await db
    .select({
      id: events.id,
      startDate: events.startDate,
      endDate: events.endDate,
      notes: events.notes,
      locationName: locations.name,
      typeName: eventTypes.name,
      organizerName: organizers.name,
      timeSlotName: timeSlots.name,
    })
    .from(events)
    .leftJoin(locations, eq(events.locationId, locations.id))
    .leftJoin(eventTypes, eq(events.typeId, eventTypes.id))
    .leftJoin(organizers, eq(events.organizerId, organizers.id))
    .leftJoin(timeSlots, eq(events.timeId, timeSlots.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(events.startDate);

  // ── iCal generieren ───────────────────────────────────────────────────────

  const now = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Event Manager abg//Veranstaltungskalender//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:Veranstaltungskalender`,
    `X-WR-TIMEZONE:Europe/Berlin`,
  ];

  for (const row of rows) {
    const dtStart = toIcalDateTime(row.startDate, row.timeSlotName);
    const dtEnd = row.endDate && row.endDate !== row.startDate
      ? toIcalDate(row.endDate)
      : toIcalDate(row.startDate);

    // Titel = Veranstaltungsart, Fallback auf Veranstalter
    const summary = escapeIcal(row.typeName ?? row.organizerName ?? "Veranstaltung");

    // Beschreibung
    const descParts = [];
    if (row.organizerName) descParts.push(`Veranstalter: ${row.organizerName}`);
    if (row.notes) descParts.push(row.notes);
    const description = escapeIcal(descParts.join("\\n"));

    const location = escapeIcal(row.locationName ?? "");

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${generateUID(row.id, row.startDate)}`);
    lines.push(`DTSTAMP:${now}`);

    if (row.timeSlotName) {
      // Mit Uhrzeit → DATETIME
      lines.push(`DTSTART;TZID=Europe/Berlin:${dtStart}`);
    } else {
      // Ganztägig → DATE
      lines.push(`DTSTART;VALUE=DATE:${toIcalDate(row.startDate)}`);
    }

    // Enddatum (exklusiv bei DATE-only Events → +1 Tag)
    if (!row.timeSlotName) {
      const endDateObj = new Date(dtEnd.slice(0, 4) + "-" + dtEnd.slice(4, 6) + "-" + dtEnd.slice(6, 8));
      endDateObj.setDate(endDateObj.getDate() + 1);
      const endStr = endDateObj.toISOString().slice(0, 10).replace(/-/g, "");
      lines.push(`DTEND;VALUE=DATE:${endStr}`);
    } else {
      // Bei Uhrzeit: 1 Stunde Standarddauer
      lines.push(`DTEND;TZID=Europe/Berlin:${dtStart}`);
    }

    lines.push(`SUMMARY:${summary}`);
    if (location) lines.push(`LOCATION:${location}`);
    if (description) lines.push(`DESCRIPTION:${description}`);

    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");

  // iCal-Zeilen dürfen max. 75 Zeichen lang sein (RFC 5545)
  const foldedLines = lines.flatMap((line) => {
    if (line.length <= 75) return [line];
    const chunks = [];
    chunks.push(line.slice(0, 75));
    let i = 75;
    while (i < line.length) {
      chunks.push(" " + line.slice(i, i + 74));
      i += 74;
    }
    return chunks;
  });

  const ical = foldedLines.join("\r\n");

  return new Response(ical, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar;charset=utf-8",
      "Content-Disposition": `attachment; filename="veranstaltungen.ics"`,
    },
  });
};
