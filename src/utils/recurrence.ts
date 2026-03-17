// ── Typen ─────────────────────────────────────────────────────────────────────

export type RecurrenceType = "daily" | "weekly" | "monthly" | "yearly";

export interface Recurrence {
  type: RecurrenceType;
  interval: number;          // alle X Tage/Wochen/Monate/Jahre
  weekday?: number;          // 0=Mo, 1=Di, 2=Mi, 3=Do, 4=Fr, 5=Sa, 6=So
  weekdays?: number[];        // mehrere Wochentage (z.B. Mo+Mi+Fr)
  dayOfMonth?: number;          // z.B. 15 → am 15. des Monats
  weekOfMonth?: number;         // z.B. 2 → am 2. [Wochentag] des Monats
  endDate?: string;          // ISO-Datum bis wann
  count?: number;          // wie oft insgesamt
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
        base = interval === 1
          ? `Monatlich am ${r.dayOfMonth}.`
          : `Alle ${interval} Monate am ${r.dayOfMonth}.`;
      } else {
        base = interval === 1
          ? "Monatlich"
          : `Alle ${interval} Monate`;
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
