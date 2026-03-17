import { c as createComponent } from './astro-component_DawRExCw.mjs';
import 'piccolore';
import { L as renderTemplate, x as maybeRenderHead, a2 as addAttribute } from './sequence_BWwqfJV7.mjs';
import { r as renderComponent } from './entrypoint_B2885ELV.mjs';
import { $ as $$BaseLayout } from './BaseLayout_BLl-JaRM.mjs';
import { d as db, t as timeSlots, o as organizers, e as eventTypes, l as locations, a as events } from './index_BQXN-BIF.mjs';
import { eq } from 'drizzle-orm';
import { r as recurrenceToText, a as recurrenceIcon } from './recurrence_DkJxPwGv.mjs';

const prerender = false;
const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$id;
  const { id } = Astro2.params;
  const eventId = Number(id);
  if (!eventId || isNaN(eventId)) {
    return Astro2.redirect("/user");
  }
  const [row] = await db.select({
    id: events.id,
    startDate: events.startDate,
    endDate: events.endDate,
    notes: events.notes,
    recurrence: events.recurrence,
    importId: events.importId,
    locationName: locations.name,
    typeName: eventTypes.name,
    organizerName: organizers.name,
    timeSlotName: timeSlots.name
  }).from(events).leftJoin(locations, eq(events.locationId, locations.id)).leftJoin(eventTypes, eq(events.typeId, eventTypes.id)).leftJoin(organizers, eq(events.organizerId, organizers.id)).leftJoin(timeSlots, eq(events.timeId, timeSlots.id)).where(eq(events.id, eventId));
  if (!row) {
    return Astro2.redirect("/user");
  }
  const startFormatted = new Date(row.startDate).toLocaleDateString("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
  const endFormatted = row.endDate && row.endDate !== row.startDate ? new Date(row.endDate).toLocaleDateString("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  }) : null;
  const recurrence = row.recurrence;
  const recurrenceText = recurrenceToText(recurrence);
  const recurrenceIco = recurrenceIcon(recurrence);
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": row.typeName ?? "Veranstaltung" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-2xl mx-auto space-y-6">  <a href="/user" class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
← Zurück zur Übersicht
</a>  <div class="bg-white rounded-xl shadow overflow-hidden">  <div class="bg-green-700 px-6 py-5"> <h1 class="text-white font-bold text-2xl leading-tight"> ${row.typeName ?? "Veranstaltung"} </h1> <p class="text-green-200 mt-1"> ${row.organizerName} </p> </div>  <div class="p-6 space-y-5">  <div class="flex gap-4"> <div class="text-green-700 mt-0.5">📅</div> <div> <div class="text-xs text-gray-400 uppercase tracking-wide mb-0.5"> ${endFormatted ? "Zeitraum" : "Datum"} </div> <div class="font-medium text-gray-800"> ${startFormatted} ${endFormatted && renderTemplate`<span class="text-gray-500"> – ${endFormatted}</span>`} </div> </div> </div>  ${row.timeSlotName && renderTemplate`<div class="flex gap-4"> <div class="text-green-700 mt-0.5">🕐</div> <div> <div class="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
Uhrzeit
</div> <div class="font-medium text-gray-800"> ${row.timeSlotName} Uhr
</div> </div> </div>`}  <div class="flex gap-4"> <div class="text-green-700 mt-0.5">🏷️</div> <div> <div class="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
Veranstaltungsart
</div> <div class="font-medium text-gray-800"> ${row.typeName ?? "–"} </div> </div> </div>  <div class="flex gap-4"> <div class="text-green-700 mt-0.5">👥</div> <div> <div class="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
Veranstalter
</div> <div class="font-medium text-gray-800"> ${row.organizerName ?? "–"} </div> </div> </div>  <div class="flex gap-4"> <div class="text-green-700 mt-0.5">📍</div> <div> <div class="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
Veranstaltungsort
</div> <div class="font-medium text-gray-800"> ${row.locationName ?? "–"} </div> </div> </div>  ${row.notes && renderTemplate`<div class="flex gap-4"> <div class="text-green-700 mt-0.5">📝</div> <div> <div class="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
Bemerkungen
</div> <div class="text-gray-600 whitespace-pre-line">${row.notes}</div> </div> </div>`}  ${recurrenceText && renderTemplate`<div class="flex gap-4"> <div class="text-green-700 mt-0.5">🔁</div> <div> <div class="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
Wiederholung
</div> <div class="font-medium text-gray-800"> ${recurrenceIco} ${recurrenceText} </div> ${recurrence && renderTemplate`<details class="mt-2"> <summary class="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
Rohdaten anzeigen
</summary> <pre class="mt-1 text-xs bg-gray-50 p-2 rounded border overflow-auto">

                      ${JSON.stringify(recurrence, null, 2)}
                    </pre> </details>`} </div> </div>`}  <hr class="border-gray-100">  <div class="text-xs text-gray-400 space-y-1"> <div>Event-ID: #${row.id}</div> ${row.importId && renderTemplate`<div>Import-ID: #${row.importId}</div>`} </div> </div> </div>  <div class="flex gap-3"> <a${addAttribute(`/api/events-ical?search=${encodeURIComponent(row.typeName ?? "")}`, "href")} class="btn btn-sm btn-outline" title="Dieses Event in Kalender-App importieren">
📅 In Kalender übernehmen
</a> <button onclick="window.print()" class="btn btn-sm btn-outline">
🖨️ Drucken
</button> </div> </div> ` })}`;
}, "/home/dieter/dev/evmastro/src/pages/events/[id].astro", void 0);

const $$file = "/home/dieter/dev/evmastro/src/pages/events/[id].astro";
const $$url = "/events/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
