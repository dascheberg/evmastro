// ── Typen ─────────────────────────────────────────────────────────────────────

export type RecurrenceType = "daily" | "weekly" | "monthly" | "yearly";

export interface Recurrence {
  type: RecurrenceType;
  interval: number;          // alle X Tage/Wochen/Monate/Jahre
  weekday?: number;          // 0=Mo, 1=Di, 2=Mi, 3=Do, 4=Fr, 5=Sa, 6=So
  weekdays?: number[];       // mehrere Wochentage (z.B. Mo+Mi+Fr)
  dayOfMonth?: number;       // z.B. 15 → am 15. des Monats
  weekOfMonth?: number;      // z.B. 2 → am 2. [Wochentag] des Monats
  endDate?: string;          // ISO-Datum bis wann
  count?: number;            // wie oft insgesamt
  dates?: string[];          // ← NEU: errechnete Termine (YYYY-MM-DD)
}

// ── Wochentag-Namen ───────────────────────────────────────────────────────────

const WEEKDAYS = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
const WEEKDAYS_SHORT = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

const ORDINALS = ["", "ersten", "zweiten", "dritten", "vierten", "letzten"];

// ── Recurrence → lesbarer Text ────────────────────────────────────────────────

export function recurrenceToText(r: Recurrence | null | undefined): string {
  if (!r) return "";

  const interval = r.interval ?? 1;

  let base = "";

  switch (r.type) {
    case "daily":
      base = interval === 1
        ? "Täglich"
        : `Alle ${interval} Tage`;
      break;

    case "weekly":
      if (r.weekdays && r.weekdays.length > 1) {
        const days = r.weekdays.map((d) => WEEKDAYS[d]).join(", ");
        base = interval === 1
          ? `Wöchentlich: ${days}`
          : `Alle ${interval} Wochen: ${days}`;
      } else if (r.weekday !== undefined) {
        const day = WEEKDAYS[r.weekday];
        if (r.weekOfMonth) {
          const ordinal = ORDINALS[r.weekOfMonth] ?? `${r.weekOfMonth}.`;
          base = interval === 1
            ? `Jeden ${ordinal} ${day} im Monat`
            : `Jeden ${ordinal} ${day} alle ${interval} Monate`;
        } else {
          base = interval === 1
            ? `Jeden ${day}`
            : `Jeden ${day} alle ${interval} Wochen`;
        }
      } else {
        base = interval === 1
          ? "Wöchentlich"
          : `Alle ${interval} Wochen`;
      }
      break;

    case "monthly":
      if (r.dayOfMonth) {
        base = `Monatlich am ${r.dayOfMonth}.`;
      } else if (r.weekday !== undefined && r.weekOfMonth !== undefined) {
        const ordinal = ORDINALS[r.weekOfMonth] ?? `${r.weekOfMonth}.`;
        base = `Monatlich am ${ordinal} ${WEEKDAYS[r.weekday]}`;
      } else {
        base = "Monatlich";
      }
      break;

    case "yearly":
      base = interval === 1
        ? "Jährlich"
        : `Alle ${interval} Jahre`;
      break;

    default:
      return "";
  }

  // Enddatum oder Anzahl anhängen
  const parts = [base];

  if (r.count) {
    parts.push(`(${r.count}× insgesamt)`);
  } else if (r.endDate) {
    const end = new Date(r.endDate).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    parts.push(`bis ${end}`);
  }

  return parts.join(" ");
}

// ── Recurrence Icon ───────────────────────────────────────────────────────────

export function recurrenceIcon(r: Recurrence | null | undefined): string {
  if (!r) return "";
  switch (r.type) {
    case "daily": return "🔁";
    case "weekly": return "📅";
    case "monthly": return "🗓️";
    case "yearly": return "🎯";
    default: return "🔄";
  }
}

// ── Datumserrechnung ──────────────────────────────────────────────────────────

/**
 * Gibt den N-ten Wochentag eines Monats zurück.
 * weekOfMonth 5 = "letzter"
 * wd: 0=Mo … 6=So (wie im Recurrence-Typ)
 */
function getNthWeekday(year: number, month: number, n: number, wd: number): Date {
  const jsWd = (wd + 1) % 7; // JS: 0=So,1=Mo,...,6=Sa → umrechnen
  if (n === 5) {
    const d = new Date(year, month + 1, 0); // letzter Tag des Monats
    while (d.getDay() !== jsWd) d.setDate(d.getDate() - 1);
    return d;
  }
  const d = new Date(year, month, 1);
  while (d.getDay() !== jsWd) d.setDate(d.getDate() + 1);
  d.setDate(d.getDate() + (n - 1) * 7);
  return d;
}

/**
 * Errechnet alle Termine einer Wiederholungsregel ausgehend vom Startdatum.
 * Gibt ISO-Datumsstrings zurück (YYYY-MM-DD), inklusive Startdatum.
 * Maximal 365 Termine als Sicherheitsbremse.
 */
export function expandRecurrence(startDate: string, r: Recurrence): string[] {
  const toISO = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  const start = new Date(startDate + "T00:00:00");
  const results: Date[] = [start];
  let cur = new Date(start);
  const maxCount = r.count ?? 365;
  const endDate = r.endDate ? new Date(r.endDate + "T00:00:00") : null;

  for (let i = 1; i < 500; i++) {
    const iv = r.interval ?? 1;
    let next: Date;

    switch (r.type) {
      case "daily":
        next = new Date(cur);
        next.setDate(next.getDate() + iv);
        break;

      case "weekly":
        if (r.weekdays && r.weekdays.length > 1) {
          const jsWds = r.weekdays.map((d) => (d + 1) % 7);
          let found: Date | null = null;
          for (let d = 1; d <= iv * 7; d++) {
            const t = new Date(cur);
            t.setDate(t.getDate() + d);
            if (jsWds.includes(t.getDay())) { found = t; break; }
          }
          if (!found) return results.map(toISO);
          next = found;
        } else {
          next = new Date(cur);
          next.setDate(next.getDate() + iv * 7);
        }
        break;

      case "monthly":
        if (r.weekday !== undefined && r.weekOfMonth !== undefined) {
          const nm = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
          next = getNthWeekday(nm.getFullYear(), nm.getMonth(), r.weekOfMonth, r.weekday);
        } else {
          const dom = r.dayOfMonth ?? cur.getDate();
          next = new Date(cur.getFullYear(), cur.getMonth() + 1, dom);
        }
        break;

      case "yearly":
        next = new Date(cur);
        next.setFullYear(next.getFullYear() + iv);
        break;

      default:
        return results.map(toISO);
    }

    if (endDate && next > endDate) break;
    if (results.length >= maxCount) break;
    results.push(next);
    cur = next;
  }

  return results.map(toISO);
}
