const WEEKDAYS = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
const ORDINALS = ["", "ersten", "zweiten", "dritten", "vierten", "letzten"];
function recurrenceToText(r) {
  if (!r) return "";
  const interval = r.interval ?? 1;
  let base = "";
  switch (r.type) {
    case "daily":
      base = interval === 1 ? "Täglich" : `Alle ${interval} Tage`;
      break;
    case "weekly":
      if (r.weekdays && r.weekdays.length > 1) {
        const days = r.weekdays.map((d) => WEEKDAYS[d]).join(", ");
        base = interval === 1 ? `Wöchentlich: ${days}` : `Alle ${interval} Wochen: ${days}`;
      } else if (r.weekday !== void 0) {
        const day = WEEKDAYS[r.weekday];
        if (r.weekOfMonth) {
          const ordinal = ORDINALS[r.weekOfMonth] ?? `${r.weekOfMonth}.`;
          base = interval === 1 ? `Jeden ${ordinal} ${day} im Monat` : `Jeden ${ordinal} ${day} alle ${interval} Monate`;
        } else {
          base = interval === 1 ? `Jeden ${day}` : `Jeden ${day} alle ${interval} Wochen`;
        }
      } else {
        base = interval === 1 ? "Wöchentlich" : `Alle ${interval} Wochen`;
      }
      break;
    case "monthly":
      if (r.dayOfMonth) {
        base = interval === 1 ? `Monatlich am ${r.dayOfMonth}.` : `Alle ${interval} Monate am ${r.dayOfMonth}.`;
      } else {
        base = interval === 1 ? "Monatlich" : `Alle ${interval} Monate`;
      }
      break;
    case "yearly":
      base = interval === 1 ? "Jährlich" : `Alle ${interval} Jahre`;
      break;
    default:
      return "";
  }
  const parts = [base];
  if (r.count) {
    parts.push(`(${r.count}× insgesamt)`);
  } else if (r.endDate) {
    const end = new Date(r.endDate).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
    parts.push(`bis ${end}`);
  }
  return parts.join(" ");
}
function recurrenceIcon(r) {
  if (!r) return "";
  switch (r.type) {
    case "daily":
      return "🔁";
    case "weekly":
      return "📅";
    case "monthly":
      return "🗓️";
    case "yearly":
      return "🎯";
    default:
      return "🔄";
  }
}

export { recurrenceIcon as a, recurrenceToText as r };
