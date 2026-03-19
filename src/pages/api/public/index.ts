import type { APIRoute } from "astro";
import { corsResponse } from "../../../lib/cors";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const base = `${url.origin}/api/public`;
  const ical = `${url.origin}/api/events-ical`;

  return corsResponse({
    description: "Öffentliche API – Veranstaltungskalender Schmalfeld",
    endpoints: {
      events: {
        url: `${base}/events`,
        method: "GET",
        description: "Gibt Veranstaltungen als JSON zurück",
        parameters: {
          from: "Startdatum ISO (Standard: heute), z.B. 2025-06-01",
          to: "Enddatum ISO, z.B. 2025-12-31",
          search: "Freitextsuche über Veranstalter, Ort, Typ, Bemerkungen",
          organizer: "Filter nach Veranstalter (Teilstring)",
          location: "Filter nach Ort (Teilstring)",
          type: "Filter nach Veranstaltungsart (Teilstring)",
          limit: "Max. Anzahl Ergebnisse (Standard: 50, max: 200)",
        },
        example: `${base}/events?from=2025-01-01&to=2025-12-31&limit=100`,
      },
      ical: {
        url: ical,
        method: "GET",
        description: "iCal-Feed zum Abonnieren in Kalender-Apps",
        parameters: {
          from: "Startdatum ISO (optional)",
          to: "Enddatum ISO (optional)",
        },
        example: `${ical}`,
      },
    },
  });
};
