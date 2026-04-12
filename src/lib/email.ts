// src/lib/email.ts
import { Resend } from "resend";
import { db } from "../db";
import { user, subscribers } from "../db/schema";
import { eq, inArray, sql } from "drizzle-orm";
import { organizers, locations } from "../db/schema";



const resend = new Resend(import.meta.env.RESEND_API_KEY);

const FROM = import.meta.env.NOTIFY_FROM_EMAIL ?? "EvMA <noreply@gemeinde24640de>";
const BASE_URL = import.meta.env.PUBLIC_BASE_URL ?? "https://evmastro.vercel.app";

// ── Empfänger aus DB laden ────────────────────────────────────────────────────

async function getNotifyRecipients(): Promise<string[]> {
  const rows = await db
    .select({ email: user.email })
    .from(user)
    .where(eq(user.notify, true));
  return rows.map((r) => r.email);
}

// ── Mail-Versand (intern) ─────────────────────────────────────────────────────

async function send(subject: string, html: string) {
  const to = await getNotifyRecipients();
  if (to.length === 0) return; // kein Empfänger → kein Fehler

  const { error } = await resend.emails.send({ from: FROM, to, subject, html });
  if (error) console.error("[email] Resend-Fehler:", error);
}

// ── Hilfsfunktion: Datum formatieren ─────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

// ── Template-Wrapper ──────────────────────────────────────────────────────────

function layout(title: string, body: string) {
  return `<!DOCTYPE html><html lang="de"><head><meta charset="utf-8">
<style>
  body{font-family:sans-serif;color:#1a1a1a;background:#f5f5f5;margin:0;padding:24px}
  .card{background:#fff;border-radius:8px;padding:24px 32px;max-width:560px;margin:0 auto}
  h2{margin:0 0 16px;font-size:18px;color:#166534}
  table{border-collapse:collapse;width:100%;font-size:14px}
  td{padding:6px 8px;vertical-align:top}
  td:first-child{color:#6b7280;white-space:nowrap;width:140px}
  .btn{display:inline-block;margin-top:20px;padding:10px 20px;background:#166534;
       color:#fff;text-decoration:none;border-radius:6px;font-size:14px}
  .footer{margin-top:24px;font-size:12px;color:#9ca3af;text-align:center}
</style></head><body>
<div class="card">
  <h2>${title}</h2>
  ${body}
  <div class="footer">Veranstaltungskalender Schmalfeld · <a href="${BASE_URL}">${BASE_URL}</a></div>
</div></body></html>`;
}

// ── 4 öffentliche Funktionen ──────────────────────────────────────────────────

type EventData = {
  id: number;
  startDate: string;
  endDate: string;
  organizerName?: string;
  locationName?: string;
  typeName?: string;
  timeSlotName?: string;
  notes?: string | null;
};

function eventTable(e: EventData) {
  const dateStr = e.startDate === e.endDate
    ? fmtDate(e.startDate)
    : `${fmtDate(e.startDate)} – ${fmtDate(e.endDate)}`;
  return `<table>
    <tr><td>Datum</td><td>${dateStr}</td></tr>
    ${e.timeSlotName ? `<tr><td>Uhrzeit</td><td>${e.timeSlotName}</td></tr>` : ""}
    ${e.typeName ? `<tr><td>Art</td><td>${e.typeName}</td></tr>` : ""}
    ${e.organizerName ? `<tr><td>Veranstalter</td><td>${e.organizerName}</td></tr>` : ""}
    ${e.locationName ? `<tr><td>Ort</td><td>${e.locationName}</td></tr>` : ""}
    ${e.notes ? `<tr><td>Bemerkungen</td><td>${e.notes}</td></tr>` : ""}
  </table>
  <a class="btn" href="${BASE_URL}/events/${e.id}">Event ansehen</a>`;
}

export async function notifyEventCreated(e: EventData) {
  await send(
    `📅 Neues Event: ${e.typeName ?? "Veranstaltung"} am ${fmtDate(e.startDate)}`,
    layout("Neues Event eingetragen", eventTable(e)),
  );
}

export async function notifyEventUpdated(e: EventData) {
  await send(
    `✏️ Event geändert: ${e.typeName ?? "Veranstaltung"} am ${fmtDate(e.startDate)}`,
    layout("Event wurde geändert", eventTable(e)),
  );
}

export async function notifyEventDeleted(e: EventData) {
  await send(
    `🗑️ Event gelöscht: ${e.typeName ?? "Veranstaltung"} am ${fmtDate(e.startDate)}`,
    layout(
      "Event wurde gelöscht",
      `<table>
        <tr><td>Datum</td><td>${fmtDate(e.startDate)}</td></tr>
        ${e.typeName ? `<tr><td>Art</td><td>${e.typeName}</td></tr>` : ""}
        ${e.organizerName ? `<tr><td>Veranstalter</td><td>${e.organizerName}</td></tr>` : ""}
        ${e.locationName ? `<tr><td>Ort</td><td>${e.locationName}</td></tr>` : ""}
      </table>`,
    ),
  );
}

export async function notifyImport(count: number, events: EventData[]) {
  const rows = events.slice(0, 20).map((e) =>
    `<tr>
      <td>${fmtDate(e.startDate)}</td>
      <td>${e.typeName ?? "–"}</td>
      <td>${e.organizerName ?? "–"}</td>
      <td>${e.locationName ?? "–"}</td>
    </tr>`
  ).join("");

  const more = events.length > 20
    ? `<p style="font-size:13px;color:#6b7280">… und ${events.length - 20} weitere</p>`
    : "";

  await send(
    `📥 Import: ${count} neue Event${count !== 1 ? "s" : ""} eingetragen`,
    layout(
      `${count} Event${count !== 1 ? "s" : ""} importiert`,
      `<table>
        <thead><tr style="font-size:12px;color:#6b7280">
          <th align="left" style="padding:4px 8px">Datum</th>
          <th align="left" style="padding:4px 8px">Art</th>
          <th align="left" style="padding:4px 8px">Veranstalter</th>
          <th align="left" style="padding:4px 8px">Ort</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>${more}
      <a class="btn" href="${BASE_URL}/admin/events">Alle Events ansehen</a>`,
    ),
  );
}

// src/lib/email.ts — Ergänzung (korrigiert)
// notifySubscribers()-Funktion — den Abmeldelink war zwar berechnet
// aber nicht ins HTML-Template eingefügt. Hier die korrigierte Version:

type SubscriberEventData = {
  id: number;
  startDate: string;
  endDate: string;
  organizerName?: string;
  locationName?: string;
  typeName?: string;
  timeSlotName?: string;
  organizerId: number;
  locationId: number;
};

export async function notifySubscribers(
  action: "neu" | "geändert" | "gelöscht",
  event: SubscriberEventData
) {
  const allSubs = await db
    .select()
    .from(subscribers)
    .where(
      sql`${event.organizerId} = ANY(${subscribers.organizerIds})
     OR ${event.locationId} = ANY(${subscribers.locationIds})`
    );

  if (allSubs.length === 0) return;

  const actionLabel = {
    neu: "🆕 Neue Veranstaltung",
    geändert: "✏️ Veranstaltung geändert",
    gelöscht: "🗑️ Veranstaltung abgesagt",
  }[action];

  const sends = allSubs.map((sub) => {
    const unsubUrl = `${BASE_URL}/abo-verwalten?token=${sub.unsubscribeToken}`;

    const body = `
      ${eventTable(event)}
      <a class="btn" href="${BASE_URL}">Zum Kalender</a>
      <div class="footer">
        Du erhältst diese E-Mail, weil du Terminbenachrichtigungen abonniert hast. Bitte benutze<br/>
        zum Ändern oder Abmelden jederzeit den nachstehenden Link, nur über diesen geht es:<br />
        <a href="${unsubUrl}" style="color:#9ca3af">Benachrichtigungen abbestellen / ändern</a>
      </div>
    `;

    return resend.emails.send({
      from: FROM,
      to: sub.email,
      subject: `${actionLabel} – Gemeinde Schmalfeld`,
      html: layout(actionLabel, body),
    });
  });

  const results = await Promise.allSettled(sends);
  results.forEach((r, i) => {
    if (r.status === "rejected")
      console.error(`[email] Subscriber ${allSubs[i].email} fehlgeschlagen:`, r.reason);
  });
}

// ── Hilfsfunktion: IDs → Namen auflösen ──────────────────────────────────────

async function resolveNames(
  organizerIds: number[],
  locationIds: number[]
): Promise<{ organizerNames: string[]; locationNames: string[] }> {
  const [orgRows, locRows] = await Promise.all([
    organizerIds.length > 0
      ? db.select({ name: organizers.name }).from(organizers)
        .where(inArray(organizers.id, organizerIds))
      : Promise.resolve([]),
    locationIds.length > 0
      ? db.select({ name: locations.name }).from(locations)
        .where(inArray(locations.id, locationIds))
      : Promise.resolve([]),
  ]);
  return {
    organizerNames: orgRows.map((r) => r.name),
    locationNames: locRows.map((r) => r.name),
  };
}

// ── Hilfsfunktion: Auswahl-Liste als HTML ─────────────────────────────────────

function selectionList(
  organizerNames: string[],
  locationNames: string[]
): string {
  const orgList = organizerNames.length > 0
    ? `<tr><td>Veranstalter</td><td>${organizerNames.join(", ")}</td></tr>`
    : "";
  const locList = locationNames.length > 0
    ? `<tr><td>Orte</td><td>${locationNames.join(", ")}</td></tr>`
    : "";
  return `<table>${orgList}${locList}</table>`;
}

// ── 1. Anmelde-Bestätigung ────────────────────────────────────────────────────

export async function notifySubscriberWelcome(sub: {
  email: string;
  name: string;
  organizerIds: number[];
  locationIds: number[];
  unsubscribeToken: string;
}) {
  const { organizerNames, locationNames } = await resolveNames(
    sub.organizerIds,
    sub.locationIds
  );

  const manageUrl = `${BASE_URL}/abo-verwalten?token=${sub.unsubscribeToken}`;
  const unsubUrl = `${BASE_URL}/api/subscribers/unsubscribe?token=${sub.unsubscribeToken}`;

  const { error } = await resend.emails.send({
    from: FROM,
    to: sub.email,
    subject: "✅ Anmeldung bestätigt – Gemeinde Schmalfeld",
    html: layout("Anmeldung bestätigt", `
      <p>Hallo ${sub.name},</p>
      <p>du erhältst ab sofort eine Benachrichtigung, wenn sich bei folgenden
         Veranstaltungen etwas ändert:</p>
      ${selectionList(organizerNames, locationNames)}
      <a class="btn" href="${BASE_URL}">Zum Kalender</a>
      <div class="footer">
        <a href="${manageUrl}" style="color:#9ca3af">Einstellungen ändern</a>
        &nbsp;·&nbsp;
        <a href="${unsubUrl}" style="color:#9ca3af">Abmelden</a>
      </div>
    `),
  });

  if (error) console.error("[email] Welcome-Mail fehlgeschlagen:", error);
}

// ── 2. Abmelde-Bestätigung ────────────────────────────────────────────────────

export async function notifySubscriberGoodbye(sub: {
  email: string;
  name: string;
}) {
  const { error } = await resend.emails.send({
    from: FROM,
    to: sub.email,
    subject: "👋 Abmeldung bestätigt – Gemeinde Schmalfeld",
    html: layout("Abmeldung bestätigt", `
      <p>Hallo ${sub.name},</p>
      <p>du wurdest erfolgreich abgemeldet und erhältst keine
         Terminbenachrichtigungen mehr von uns.</p>
      <p>Du kannst dich jederzeit wieder anmelden:</p>
      <a class="btn" href="${BASE_URL}/abonnieren">Wieder anmelden</a>
    `),
  });

  if (error) console.error("[email] Goodbye-Mail fehlgeschlagen:", error);
}

// ── 3. Einstellungen geändert ─────────────────────────────────────────────────

export async function notifySubscriberChanged(sub: {
  email: string;
  name: string;
  organizerIds: number[];
  locationIds: number[];
  unsubscribeToken: string;
}) {
  const { organizerNames, locationNames } = await resolveNames(
    sub.organizerIds,
    sub.locationIds
  );

  const manageUrl = `${BASE_URL}/abo-verwalten?token=${sub.unsubscribeToken}`;
  const unsubUrl = `${BASE_URL}/api/subscribers/unsubscribe?token=${sub.unsubscribeToken}`;

  const { error } = await resend.emails.send({
    from: FROM,
    to: sub.email,
    subject: "✏️ Einstellungen geändert – Gemeinde Schmalfeld",
    html: layout("Einstellungen aktualisiert", `
      <p>Hallo ${sub.name},</p>
      <p>deine Benachrichtigungseinstellungen wurden aktualisiert.
         Du erhältst ab sofort Meldungen für:</p>
      ${selectionList(organizerNames, locationNames)}
      <a class="btn" href="${BASE_URL}">Zum Kalender</a>
      <div class="footer">
        <a href="${manageUrl}" style="color:#9ca3af">Einstellungen ändern</a>
        &nbsp;·&nbsp;
        <a href="${unsubUrl}" style="color:#9ca3af">Abmelden</a>
      </div>
    `),
  });

  if (error) console.error("[email] Changed-Mail fehlgeschlagen:", error);
}
