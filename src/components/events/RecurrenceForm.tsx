import React, { useEffect, useState } from "react";
import { type Recurrence, recurrenceToText, expandRecurrence } from "../../utils/recurrence";

// ── Typen ─────────────────────────────────────────────────────────────────────

type MonthlyMode = "dom" | "dow";

type RecurrenceFormProps = {
  startDate: string;
  value: Recurrence | null;
  onChange: (r: Recurrence | null) => void;
  // ← NEU: bekannte Werte aus EventForm für CSV-Export
  organizerName?: string;
  locationName?: string;
  eventTypeName?: string;
  timeSlotName?: string;
};

// ── Konstanten ─────────────────────────────────────────────────────────────────

const WEEKDAYS_LONG = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
const WEEKDAYS_SHORT = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const ORDINALS = ["", "ersten", "zweiten", "dritten", "vierten", "letzten"];

// ── Hilfsfunktionen ────────────────────────────────────────────────────────────

function fmtDE(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

function fmtShort(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${d}.${m}.`;
}

// ── Komponente ─────────────────────────────────────────────────────────────────

export function RecurrenceForm({
  startDate, value, onChange,
  organizerName = "", locationName = "", eventTypeName = "", timeSlotName = "",
}: RecurrenceFormProps) {

  const [enabled, setEnabled] = useState(false);
  const [type, setType] = useState<Recurrence["type"]>("monthly");
  const [interval, setInterval] = useState(1);
  const [weekdays, setWeekdays] = useState<number[]>([]);
  const [monthlyMode, setMonthlyMode] = useState<MonthlyMode>("dow");
  const [weekday, setWeekday] = useState(2);
  const [weekOfMonth, setWeekOfMonth] = useState(3);
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [endType, setEndType] = useState<"none" | "date" | "count">("count");
  const [endDate, setEndDate] = useState("");
  const [count, setCount] = useState(12);
  const [showDates, setShowDates] = useState(false);
  const [expandedDates, setExpandedDates] = useState<string[]>([]);

  // ── Initialbefüllung ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!value) { setEnabled(false); return; }
    setEnabled(true);
    setType(value.type);
    setInterval(value.interval ?? 1);
    if (value.weekdays?.length) setWeekdays(value.weekdays);
    if (value.weekday !== undefined) setWeekday(value.weekday);
    if (value.weekOfMonth !== undefined) { setWeekOfMonth(value.weekOfMonth); setMonthlyMode("dow"); }
    if (value.dayOfMonth !== undefined) { setDayOfMonth(value.dayOfMonth); setMonthlyMode("dom"); }
    if (value.endDate) { setEndDate(value.endDate); setEndType("date"); }
    if (value.count) { setCount(value.count); setEndType("count"); }
    if (value.dates?.length) { setExpandedDates(value.dates); setShowDates(true); }
  }, [value]);

  // ── Recurrence-Objekt zusammenbauen & melden ───────────────────────────────
  useEffect(() => {
    if (!enabled) { onChange(null); return; }
    const r: Recurrence = { type, interval };
    if (type === "weekly") {
      if (weekdays.length > 1) r.weekdays = weekdays;
      else if (weekdays.length === 1) r.weekday = weekdays[0];
    }
    if (type === "monthly") {
      r.interval = 1;
      if (monthlyMode === "dow") { r.weekday = weekday; r.weekOfMonth = weekOfMonth; }
      else { r.dayOfMonth = dayOfMonth; }
    }
    if (endType === "date" && endDate) r.endDate = endDate;
    if (endType === "count") r.count = count;
    if (startDate) r.dates = expandRecurrence(startDate, r);
    onChange(r);
  }, [enabled, type, interval, weekdays, monthlyMode, weekday, weekOfMonth,
    dayOfMonth, endType, endDate, count, startDate]);

  // ── Vorschau-Termine ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled || !startDate) { setExpandedDates([]); setShowDates(false); return; }
    const r: Recurrence = { type, interval };
    if (type === "weekly") {
      if (weekdays.length > 1) r.weekdays = weekdays;
      else if (weekdays.length === 1) r.weekday = weekdays[0];
    }
    if (type === "monthly") {
      if (monthlyMode === "dow") { r.weekday = weekday; r.weekOfMonth = weekOfMonth; }
      else { r.dayOfMonth = dayOfMonth; }
    }
    if (endType === "date" && endDate) r.endDate = endDate;
    if (endType === "count") r.count = count;
    const dates = expandRecurrence(startDate, r);
    setExpandedDates(dates);
    setShowDates(dates.length > 1);
  }, [enabled, type, interval, weekdays, monthlyMode, weekday, weekOfMonth,
    dayOfMonth, endType, endDate, count, startDate]);

  // ── Wochentag-Toggle ───────────────────────────────────────────────────────
  function toggleWeekday(i: number) {
    setWeekdays((prev) =>
      prev.includes(i) ? prev.filter((d) => d !== i) : [...prev, i].sort()
    );
  }

  // ── Drucken ────────────────────────────────────────────────────────────────
  function handlePrint() {
    const recDesc = recurrenceToText({ type, interval, weekday, weekOfMonth, dayOfMonth, weekdays } as Recurrence);
    const rows = expandedDates
      .map((iso, i) =>
        `<tr style="background:${i % 2 ? "#f9f9f9" : "#fff"}">
          <td style="padding:6px 14px;font-weight:${i === 0 ? 600 : 400}">${fmtDE(iso)}</td>
          <td style="padding:6px 14px;color:#666">${i === 0 ? "Eingetragener Termin" : "Folgetermin"}</td>
        </tr>`
      ).join("");
    const html = `<html><head><title>Wiederholungstermine</title>
      <style>body{font-family:sans-serif;font-size:14px;margin:2cm}
      h2{font-size:16px;margin-bottom:4px}p{color:#666;font-size:12px;margin:0 0 16px}
      table{border-collapse:collapse;width:100%}
      th{text-align:left;padding:6px 14px;background:#eee;font-size:12px;font-weight:600}
      </style></head><body>
      <h2>Wiederholungstermine</h2>
      <p>${recDesc} &nbsp;·&nbsp; ${expandedDates.length} Termine gesamt &nbsp;·&nbsp; ${fmtDE(expandedDates[0])} bis ${fmtDE(expandedDates[expandedDates.length - 1])}</p>
      <table><tr><th>Datum</th><th>Art</th></tr>${rows}</table>
      </body></html>`;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.print();
  }

  // ── CSV-Export ─────────────────────────────────────────────────────────────
  function handleCsvExport() {
    if (expandedDates.length === 0) return;

    // Folgetermine = alle außer dem ersten (der wird bereits als Event gespeichert)
    const followUpDates = expandedDates.slice(1);

    const header = "Beginndatum;Enddatum;Beginn-Uhrzeit;Veranstaltungsort;Veranstaltungsart;Bemerkungen";
    const lines = followUpDates.map((iso) => {
      const datum = fmtDE(iso);  // DD.MM.YYYY — wie der Import es erwartet
      return [
        datum,               // startDate
        datum,               // endDate (gleich wie startDate)
        timeSlotName,        // timeSlot  z.B. "19:00"
        locationName,        // location  z.B. "Dorfgemeinschaftshaus"
        eventTypeName,       // eventType z.B. "Skat"
        "",                  // description / notes — leer
      ].join(";");
    });

    const csv = [header, ...lines].join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }); // BOM für Excel
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    // Dateiname: z.B. "folgetermine_2026-01-14.csv"
    a.download = `folgetermine_${startDate || "export"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const intervalLabel: Record<string, string> = {
    daily: "Alle … Tage",
    weekly: "Alle … Wochen",
    yearly: "Alle … Jahre",
  };

  return (
    <div className="space-y-3">

      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          className="checkbox checkbox-sm"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
        />
        <span className="text-sm font-bold text-black">Wiederholung</span>
      </label>

      {enabled && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">

          {/* ── Rhythmus ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="px-2 py-1 text-black rounded text-sm font-bold">Typ</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={type}
                onChange={(e) => setType(e.target.value as Recurrence["type"])}
              >
                <option value="daily">Täglich</option>
                <option value="weekly">Wöchentlich</option>
                <option value="monthly">Monatlich</option>
                <option value="yearly">Jährlich</option>
              </select>
            </div>

            {type !== "monthly" && (
              <div>
                <label className="label">
                  <span className="px-2 py-1 text-black rounded text-sm font-bold">
                    {intervalLabel[type] ?? "Intervall"}
                  </span>
                </label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  min={1} max={52}
                  value={interval}
                  onChange={(e) => setInterval(Number(e.target.value))}
                />
              </div>
            )}
          </div>

          {/* ── Wöchentlich ── */}
          {type === "weekly" && (
            <div>
              <label className="label">
                <span className="px-2 py-1 text-black rounded text-sm font-bold">Wochentage</span>
              </label>
              <div className="flex gap-2 flex-wrap mt-1">
                {WEEKDAYS_SHORT.map((d, i) => (
                  <button
                    key={i} type="button"
                    className={`w-10 h-10 rounded-full border text-sm font-medium transition-colors ${weekdays.includes(i)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                      }`}
                    onClick={() => toggleWeekday(i)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Monatlich ── */}
          {type === "monthly" && (
            <div className="space-y-3">
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="radio" name="mtype" className="radio radio-sm"
                    checked={monthlyMode === "dow"} onChange={() => setMonthlyMode("dow")} />
                  Am Wochentag
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="radio" name="mtype" className="radio radio-sm"
                    checked={monthlyMode === "dom"} onChange={() => setMonthlyMode("dom")} />
                  Am Tag des Monats
                </label>
              </div>

              {monthlyMode === "dow" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">
                      <span className="px-2 py-1 text-black rounded text-sm font-bold">Welcher</span>
                    </label>
                    <select className="select select-bordered w-full" value={weekOfMonth}
                      onChange={(e) => setWeekOfMonth(Number(e.target.value))}>
                      <option value={1}>1. (erster)</option>
                      <option value={2}>2. (zweiter)</option>
                      <option value={3}>3. (dritter)</option>
                      <option value={4}>4. (vierter)</option>
                      <option value={5}>5. (letzter)</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">
                      <span className="px-2 py-1 text-black rounded text-sm font-bold">Wochentag</span>
                    </label>
                    <select className="select select-bordered w-full" value={weekday}
                      onChange={(e) => setWeekday(Number(e.target.value))}>
                      {WEEKDAYS_LONG.map((d, i) => (
                        <option key={i} value={i}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {monthlyMode === "dom" && (
                <div>
                  <label className="label">
                    <span className="px-2 py-1 text-black rounded text-sm font-bold">Tag des Monats</span>
                  </label>
                  <select className="select select-bordered w-full" value={dayOfMonth}
                    onChange={(e) => setDayOfMonth(Number(e.target.value))}>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>{d}.</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* ── Ende ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="px-2 py-1 text-black rounded text-sm font-bold">Ende</span>
              </label>
              <select className="select select-bordered w-full" value={endType}
                onChange={(e) => setEndType(e.target.value as "none" | "date" | "count")}>
                <option value="count">Anzahl Wiederholungen</option>
                <option value="date">Bis Datum</option>
                <option value="none">Kein Ende (max. 52)</option>
              </select>
            </div>
            {endType === "count" && (
              <div>
                <label className="label">
                  <span className="px-2 py-1 text-black rounded text-sm font-bold">Anzahl Wiederholungen</span>
                </label>
                <input type="number" className="input input-bordered w-full"
                  min={1} max={365} value={count}
                  onChange={(e) => setCount(Number(e.target.value))} />
              </div>
            )}
            {endType === "date" && (
              <div>
                <label className="label">
                  <span className="px-2 py-1 text-black rounded text-sm font-bold">Enddatum</span>
                </label>
                <input type="date" className="input input-bordered w-full"
                  value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            )}
          </div>

          {/* ── Vorschau-Text ── */}
          <div className="text-sm text-blue-700 italic">
            {recurrenceToText({ type, interval, weekday, weekOfMonth, dayOfMonth, weekdays, endDate, count } as Recurrence)}
          </div>

          {/* ── Notizblock: errechnete Termine ── */}
          {showDates && expandedDates.length > 0 && (
            <div className="border border-blue-300 rounded-lg overflow-hidden">
              <div className="bg-blue-100 border-b border-blue-200 px-4 py-2 flex justify-between items-center">
                <span className="text-sm font-bold text-blue-800">
                  Errechnete Termine ({expandedDates.length}) — nur zur Vorschau, nur der oben eingetragene Termin wird gespeichert
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="text-xs px-3 py-1 border border-blue-300 rounded bg-white text-blue-700 hover:bg-blue-50"
                    onClick={handlePrint}
                  >
                    🖨 Drucken
                  </button>
                  {expandedDates.length > 1 && (
                    <button
                      type="button"
                      className="text-xs px-3 py-1 border border-green-400 rounded bg-white text-green-700 hover:bg-green-50"
                      onClick={handleCsvExport}
                      title="Folgetermine als CSV exportieren — kann danach über den Import-Workflow eingelesen werden"
                    >
                      📥 CSV Export ({expandedDates.length - 1} Folgetermine)
                    </button>
                  )}
                </div>
              </div>
              <div className="bg-white p-4">
                <div className="grid grid-cols-3 md:grid-cols-4 gap-1.5">
                  {expandedDates.map((iso, i) => (
                    <div
                      key={iso}
                      className={`text-xs px-2 py-1.5 rounded ${i === 0
                          ? "bg-green-100 text-green-800 font-semibold"
                          : "bg-gray-100 text-gray-700"
                        }`}
                    >
                      {i === 0 ? `→ ${fmtDE(iso)}` : fmtShort(iso)}
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-100">
                  {expandedDates.length} Termine · {fmtDE(expandedDates[0])} bis {fmtDE(expandedDates[expandedDates.length - 1])}
                  {expandedDates.length > 1 && (
                    <span className="ml-2 text-green-600">
                      · {expandedDates.length - 1} Folgetermine als CSV exportierbar
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
