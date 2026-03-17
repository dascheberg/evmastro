import { c as createComponent } from './astro-component_DawRExCw.mjs';
import 'piccolore';
import { b5 as renderHead, L as renderTemplate } from './sequence_BWwqfJV7.mjs';
import 'clsx';
import { a as events, o as organizers, l as locations, e as eventTypes, d as db, t as timeSlots } from './index_BQXN-BIF.mjs';
import { eq, gte, lte, or, ilike, and, asc } from 'drizzle-orm';

const prerender = false;
const $$Print = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Print;
  const url = Astro2.url;
  const organizerId = Number(url.searchParams.get("organizerId"));
  const locationId = Number(url.searchParams.get("locationId"));
  const typeId = Number(url.searchParams.get("typeId"));
  const month = Number(url.searchParams.get("month"));
  const year = Number(url.searchParams.get("year"));
  const search = url.searchParams.get("search")?.trim() ?? "";
  const conditions = [];
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
        ilike(events.notes, `%${search}%`)
      )
    );
  }
  const rows = await db.select({
    id: events.id,
    startDate: events.startDate,
    endDate: events.endDate,
    notes: events.notes,
    locationName: locations.name,
    typeName: eventTypes.name,
    organizerName: organizers.name,
    timeSlotName: timeSlots.name
  }).from(events).leftJoin(locations, eq(events.locationId, locations.id)).leftJoin(eventTypes, eq(events.typeId, eventTypes.id)).leftJoin(organizers, eq(events.organizerId, organizers.id)).leftJoin(timeSlots, eq(events.timeId, timeSlots.id)).where(conditions.length > 0 ? and(...conditions) : void 0).orderBy(asc(events.startDate));
  const grouped = /* @__PURE__ */ new Map();
  for (const row of rows) {
    const d = new Date(row.startDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("de-DE", {
      month: "long",
      year: "numeric"
    });
    if (!grouped.has(key)) grouped.set(key, { label, events: [] });
    grouped.get(key).events.push(row);
  }
  const months = Array.from(grouped.entries()).sort(
    ([a], [b]) => a.localeCompare(b)
  );
  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("de-DE", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  }
  function formatDateShort(dateStr) {
    return new Date(dateStr).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit"
    });
  }
  const printDate = (/* @__PURE__ */ new Date()).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
  return renderTemplate`<html lang="de" data-astro-cid-btbdlfee> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Veranstaltungskalender – Druckansicht</title>${renderHead()}</head> <body data-astro-cid-btbdlfee> <!-- Druck/Schließen Buttons – nur auf Bildschirm --> <div class="screen-only" data-astro-cid-btbdlfee> <button class="btn-print" onclick="window.print()" data-astro-cid-btbdlfee>🖨️ Drucken</button> <button class="btn-close" onclick="window.close()" data-astro-cid-btbdlfee>✕ Schließen</button> </div> <!-- Kopfzeile mit Wappen --> <div class="header" data-astro-cid-btbdlfee> <img src="/img/Schmalfeld_Wappen.png" alt="Wappen Schmalfeld" data-astro-cid-btbdlfee> <div class="header-text" data-astro-cid-btbdlfee> <h1 data-astro-cid-btbdlfee>Veranstaltungskalender Schmalfeld</h1> <p data-astro-cid-btbdlfee> ${months.length > 0 ? `${months[0][1].label} – ${months[months.length - 1][1].label}` : "Alle Veranstaltungen"}
&nbsp;·&nbsp; ${rows.length} Veranstaltungen
</p> </div> </div> <!-- Druckdatum --> <p class="print-meta" data-astro-cid-btbdlfee>Stand: ${printDate}</p> <!-- Monatsblöcke --> ${months.length === 0 ? renderTemplate`<p style="color: #888; text-align: center; padding: 2rem;" data-astro-cid-btbdlfee>
Keine Veranstaltungen gefunden.
</p>` : months.map(([key, group]) => renderTemplate`<div class="month-block" data-astro-cid-btbdlfee> <div class="month-title" data-astro-cid-btbdlfee>${group.label}</div> <table data-astro-cid-btbdlfee> <thead data-astro-cid-btbdlfee> <tr data-astro-cid-btbdlfee> <th class="td-date" data-astro-cid-btbdlfee>Datum</th> <th class="td-time" data-astro-cid-btbdlfee>Uhrzeit</th> <th class="td-type" data-astro-cid-btbdlfee>Veranstaltung</th> <th class="td-organizer" data-astro-cid-btbdlfee>Veranstalter</th> <th class="td-location" data-astro-cid-btbdlfee>Ort</th> <th class="td-notes" data-astro-cid-btbdlfee>Bemerkung</th> </tr> </thead> <tbody data-astro-cid-btbdlfee> ${group.events.map((ev) => renderTemplate`<tr data-astro-cid-btbdlfee> <td class="td-date" data-astro-cid-btbdlfee> ${formatDate(ev.startDate)} ${ev.endDate && ev.endDate !== ev.startDate && renderTemplate`<div class="date-range" data-astro-cid-btbdlfee>
bis ${formatDateShort(ev.endDate)} </div>`} </td> <td class="td-time" data-astro-cid-btbdlfee>${ev.timeSlotName ?? "–"}</td> <td class="td-type" data-astro-cid-btbdlfee>${ev.typeName ?? "–"}</td> <td class="td-organizer" data-astro-cid-btbdlfee>${ev.organizerName ?? "–"}</td> <td class="td-location" data-astro-cid-btbdlfee>${ev.locationName ?? "–"}</td> <td class="td-notes" data-astro-cid-btbdlfee>${ev.notes ?? ""}</td> </tr>`)} </tbody> </table> </div>`)} <!-- Footer --> <div class="footer" data-astro-cid-btbdlfee> <span data-astro-cid-btbdlfee>Veranstaltungskalender Schmalfeld</span> <span data-astro-cid-btbdlfee>Gedruckt am ${printDate}</span> </div> </body></html>`;
}, "/home/dieter/dev/evmastro/src/pages/print.astro", void 0);

const $$file = "/home/dieter/dev/evmastro/src/pages/print.astro";
const $$url = "/print";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Print,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
