import { c as createComponent } from './astro-component_DawRExCw.mjs';
import 'piccolore';
import { L as renderTemplate } from './sequence_BWwqfJV7.mjs';
import { r as renderComponent } from './entrypoint_B2885ELV.mjs';
import { $ as $$BaseLayout } from './BaseLayout_BLl-JaRM.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { r as recurrenceToText, a as recurrenceIcon } from './recurrence_DkJxPwGv.mjs';
import { CalendarDaysIcon, ClockIcon, TagIcon, UserGroupIcon, MapPinIcon, DocumentTextIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

function getDaysInMonth(year, month) {
  const days = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}
function getDaysInRange(start, end) {
  const days = [];
  const d = new Date(start);
  while (d <= end) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}
function getCalendarWeekFromDate(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const start = new Date(d);
  start.setDate(d.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const temp = new Date(start);
  temp.setHours(0, 0, 0, 0);
  temp.setDate(temp.getDate() + 3 - (temp.getDay() + 6) % 7);
  const week1 = new Date(temp.getFullYear(), 0, 4);
  const weekNumber = 1 + Math.round(
    ((temp.getTime() - week1.getTime()) / 864e5 - 3 + (week1.getDay() + 6) % 7) / 7
  );
  return { start, end, weekNumber };
}

function ListView({ filters, onSelectEvent }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search ?? "");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(filters.search ?? ""), 300);
    return () => clearTimeout(timer);
  }, [filters.search]);
  function buildParams() {
    return new URLSearchParams({
      organizerId: filters.organizerId ? String(filters.organizerId) : "",
      locationId: filters.locationId ? String(filters.locationId) : "",
      typeId: filters.typeId ? String(filters.typeId) : "",
      month: filters.month ? String(filters.month) : "",
      year: filters.year ? String(filters.year) : "",
      search: debouncedSearch
    });
  }
  useEffect(() => {
    setLoading(true);
    fetch(`/api/events-list?${buildParams()}`).then((res) => res.json()).then((data) => setEvents(data)).finally(() => setLoading(false));
  }, [
    filters.organizerId,
    filters.locationId,
    filters.typeId,
    filters.month,
    filters.year,
    debouncedSearch
  ]);
  function exportICal() {
    window.location.href = `/api/events-ical?${buildParams()}`;
  }
  function exportCSV(data) {
    const header = ["Datum", "Uhrzeit", "Veranstalter", "Ort", "Typ"];
    const rows = data.map((ev) => [
      ev.dateLabel ?? "",
      ev.timeLabel ?? "",
      ev.organizerLabel ?? "",
      ev.locationLabel ?? "",
      ev.typeLabel ?? ""
    ]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "veranstaltungen.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  function exportPDF(data) {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Veranstaltungsliste", 14, 15);
    const grouped = data.reduce((acc, ev) => {
      const [day, month, year] = ev.dateLabel.split(".");
      const key = `${year}-${month.padStart(2, "0")}`;
      const label = new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("de-DE", { month: "long", year: "numeric" });
      if (!acc[key]) acc[key] = { label, rows: [] };
      acc[key].rows.push(ev);
      return acc;
    }, {});
    let currentY = 22;
    Object.keys(grouped).sort().forEach((key) => {
      const { label, rows } = grouped[key];
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(label, 14, currentY);
      currentY += 2;
      autoTable(doc, {
        startY: currentY,
        head: [["Datum", "Uhrzeit", "Veranstalter", "Ort", "Typ"]],
        body: rows.map((ev) => [ev.dateLabel, ev.timeLabel, ev.organizerLabel, ev.locationLabel, ev.typeLabel]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [22, 101, 52] },
        margin: { top: 10 }
      });
      currentY = doc.lastAutoTable.finalY + 10;
    });
    doc.save("veranstaltungen.pdf");
  }
  function openPrint() {
    window.open(`/print?${buildParams()}`, "_blank");
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "btn btn-sm btn-outline",
            onClick: () => exportCSV(events),
            disabled: events.length === 0,
            children: "📄 CSV"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "btn btn-sm btn-outline",
            onClick: () => exportPDF(events),
            disabled: events.length === 0,
            children: "📑 PDF"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "btn btn-sm btn-outline",
            onClick: openPrint,
            disabled: events.length === 0,
            title: "Druckansicht öffnen",
            children: "🖨️ Drucken"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "btn btn-sm btn-outline",
            onClick: exportICal,
            disabled: events.length === 0,
            title: "In Kalender-App importieren (.ics)",
            children: "📅 Kalender (.ics)"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        loading && /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-400", children: "Suche…" }),
        /* @__PURE__ */ jsxs("span", { className: "text-sm text-gray-500", children: [
          events.length,
          " Veranstaltung",
          events.length !== 1 ? "en" : ""
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("table", { className: "table table-sm", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { children: "Datum" }),
        /* @__PURE__ */ jsx("th", { children: "Uhrzeit" }),
        /* @__PURE__ */ jsx("th", { children: "Veranstalter" }),
        /* @__PURE__ */ jsx("th", { children: "Ort" }),
        /* @__PURE__ */ jsx("th", { children: "Typ" })
      ] }) }),
      /* @__PURE__ */ jsxs("tbody", { children: [
        events.length === 0 && !loading && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 5, className: "text-center py-6 text-gray-400", children: "Keine Veranstaltungen gefunden." }) }),
        events.map((ev) => /* @__PURE__ */ jsxs(
          "tr",
          {
            className: "hover cursor-pointer",
            onClick: () => onSelectEvent(ev),
            children: [
              /* @__PURE__ */ jsx("td", { children: ev.dateLabel }),
              /* @__PURE__ */ jsx("td", { children: ev.timeLabel }),
              /* @__PURE__ */ jsx("td", { children: ev.organizerLabel }),
              /* @__PURE__ */ jsx("td", { children: ev.locationLabel }),
              /* @__PURE__ */ jsx("td", { children: ev.typeLabel })
            ]
          },
          ev.id
        ))
      ] })
    ] })
  ] });
}

function CalendarView({ mode, onSelectEvent, filters }) {
  const [events, setEvents] = useState([]);
  const [days, setDays] = useState([]);
  const [baseDate, setBaseDate] = useState(/* @__PURE__ */ new Date());
  function goNext() {
    const d = new Date(baseDate);
    if (mode === "month") d.setMonth(d.getMonth() + 1);
    if (mode === "week") d.setDate(d.getDate() + 7);
    setBaseDate(d);
  }
  function goPrev() {
    const d = new Date(baseDate);
    if (mode === "month") d.setMonth(d.getMonth() - 1);
    if (mode === "week") d.setDate(d.getDate() - 7);
    setBaseDate(d);
  }
  let title = "";
  if (mode === "month") {
    title = baseDate.toLocaleDateString("de-DE", {
      month: "long",
      year: "numeric"
    });
  }
  if (mode === "week") {
    const { start, end, weekNumber } = getCalendarWeekFromDate(baseDate);
    title = `KW ${weekNumber} (${start.toLocaleDateString(
      "de-DE"
    )} – ${end.toLocaleDateString("de-DE")})`;
  }
  useEffect(() => {
    if (mode !== "month") return;
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const monthDays = getDaysInMonth(year, month);
    setDays(monthDays);
    const params = new URLSearchParams({
      year: String(year),
      month: String(month + 1)
    });
    if (filters.organizerId) params.set("organizerId", String(filters.organizerId));
    if (filters.locationId) params.set("locationId", String(filters.locationId));
    if (filters.typeId) params.set("typeId", String(filters.typeId));
    fetch(`/api/events-by-month?${params}`).then((res) => res.json()).then((data) => setEvents(data));
  }, [mode, baseDate, filters]);
  useEffect(() => {
    if (mode !== "week") return;
    const { start, end } = getCalendarWeekFromDate(baseDate);
    const weekDays = getDaysInRange(start, end);
    setDays(weekDays);
    const startStr = start.toISOString().split("T")[0];
    const endStr = end.toISOString().split("T")[0];
    const params = new URLSearchParams({ start: startStr, end: endStr });
    if (filters.organizerId) params.set("organizerId", String(filters.organizerId));
    if (filters.locationId) params.set("locationId", String(filters.locationId));
    if (filters.typeId) params.set("typeId", String(filters.typeId));
    fetch(`/api/events-by-week?${params}`).then((res) => res.json()).then((data) => setEvents(data));
  }, [mode, baseDate, filters]);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    (mode === "month" || mode === "week") && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "px-2 py-1 bg-gray-200 rounded hover:bg-gray-300",
          onClick: goPrev,
          children: /* @__PURE__ */ jsx(ArrowLeftIcon, { className: "h-4 w-4" })
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "font-bold text-lg", children: title }),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "px-2 py-1 bg-gray-200 rounded hover:bg-gray-300",
          onClick: goNext,
          children: /* @__PURE__ */ jsx(ArrowRightIcon, { className: "h-4 w-4" })
        }
      )
    ] }),
    mode === "month" && /* @__PURE__ */ jsx("div", { className: "grid grid-cols-7 gap-2", children: days.map((day) => {
      const dateStr = day.toLocaleDateString("de-DE");
      const dayEvents = events.filter((ev) => ev.dateLabel === dateStr);
      return /* @__PURE__ */ jsxs(
        "div",
        {
          className: "border rounded p-2 bg-white min-h-[120px]",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "font-bold text-sm mb-1", children: [
              day.getDate(),
              ".",
              " ",
              day.toLocaleDateString("de-DE", { month: "short" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "space-y-1", children: dayEvents.map((ev) => /* @__PURE__ */ jsxs(
              "button",
              {
                className: "block w-full text-left text-xs p-1 rounded bg-blue-100 hover:bg-blue-200",
                onClick: () => onSelectEvent(ev),
                children: [
                  ev.timeLabel,
                  " – ",
                  ev.typeLabel
                ]
              },
              ev.id
            )) })
          ]
        },
        dateStr
      );
    }) }),
    mode === "week" && /* @__PURE__ */ jsx("div", { className: "grid grid-cols-7 gap-2", children: days.map((day) => {
      const dateStr = day.toLocaleDateString("de-DE");
      const dayEvents = events.filter((ev) => ev.dateLabel === dateStr);
      return /* @__PURE__ */ jsxs(
        "div",
        {
          className: "border rounded p-2 bg-white min-h-[120px]",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "font-bold text-sm mb-1", children: [
              day.toLocaleDateString("de-DE", { weekday: "short" }),
              " ",
              day.getDate(),
              "."
            ] }),
            /* @__PURE__ */ jsx("div", { className: "space-y-1", children: dayEvents.map((ev) => /* @__PURE__ */ jsxs(
              "button",
              {
                className: "block w-full text-left text-xs p-1 rounded bg-blue-100 hover:bg-blue-200",
                onClick: () => onSelectEvent(ev),
                children: [
                  ev.timeLabel,
                  " – ",
                  ev.typeLabel
                ]
              },
              ev.id
            )) })
          ]
        },
        dateStr
      );
    }) }),
    mode === "list" && /* @__PURE__ */ jsx("div", { className: "p-4 bg-white rounded border text-sm text-gray-600", children: /* @__PURE__ */ jsx(
      ListView,
      {
        filters,
        onSelectEvent
      }
    ) })
  ] });
}

function DetailRow({
  icon,
  label,
  value,
  className = ""
}) {
  if (!value) return null;
  return /* @__PURE__ */ jsxs("div", { className: `flex gap-3 ${className}`, children: [
    /* @__PURE__ */ jsx("div", { className: "mt-0.5 text-green-700 shrink-0", children: icon }),
    /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-400 uppercase tracking-wide mb-0.5", children: label }),
      /* @__PURE__ */ jsx("div", { className: "text-gray-800 font-medium", children: value })
    ] })
  ] });
}
function EventDetails({ event }) {
  if (!event) {
    return /* @__PURE__ */ jsxs("div", { className: "p-6 bg-white rounded-xl shadow text-center space-y-2", children: [
      /* @__PURE__ */ jsx(CalendarDaysIcon, { className: "h-10 w-10 text-gray-200 mx-auto" }),
      /* @__PURE__ */ jsxs("p", { className: "text-gray-400 text-sm", children: [
        "Klicke auf eine Veranstaltung",
        /* @__PURE__ */ jsx("br", {}),
        "um die Details zu sehen"
      ] })
    ] });
  }
  const raw = event.raw ?? null;
  const recurrence = raw?.recurrence ?? null;
  const notes = raw?.notes ?? null;
  const endDate = raw?.endDate ?? null;
  const startDate = raw?.startDate ?? null;
  const showEndDate = endDate && endDate !== startDate;
  const recurrenceText = recurrenceToText(recurrence);
  const recurrenceIco = recurrenceIcon(recurrence);
  return /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl shadow overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-green-700 px-5 py-4", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-white font-bold text-lg leading-tight", children: event.typeLabel ?? "Veranstaltung" }),
      /* @__PURE__ */ jsx("p", { className: "text-green-200 text-sm mt-0.5", children: event.organizerLabel })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-5 space-y-4", children: [
      /* @__PURE__ */ jsx(
        DetailRow,
        {
          icon: /* @__PURE__ */ jsx(CalendarDaysIcon, { className: "h-5 w-5" }),
          label: "Datum",
          value: showEndDate ? `${event.dateLabel} – ${new Date(endDate).toLocaleDateString("de-DE")}` : event.dateLabel
        }
      ),
      event.timeLabel && /* @__PURE__ */ jsx(
        DetailRow,
        {
          icon: /* @__PURE__ */ jsx(ClockIcon, { className: "h-5 w-5" }),
          label: "Uhrzeit",
          value: event.timeLabel
        }
      ),
      /* @__PURE__ */ jsx(
        DetailRow,
        {
          icon: /* @__PURE__ */ jsx(TagIcon, { className: "h-5 w-5" }),
          label: "Veranstaltungsart",
          value: event.typeLabel
        }
      ),
      /* @__PURE__ */ jsx(
        DetailRow,
        {
          icon: /* @__PURE__ */ jsx(UserGroupIcon, { className: "h-5 w-5" }),
          label: "Veranstalter",
          value: event.organizerLabel
        }
      ),
      /* @__PURE__ */ jsx(
        DetailRow,
        {
          icon: /* @__PURE__ */ jsx(MapPinIcon, { className: "h-5 w-5" }),
          label: "Veranstaltungsort",
          value: event.locationLabel
        }
      ),
      notes && /* @__PURE__ */ jsx(
        DetailRow,
        {
          icon: /* @__PURE__ */ jsx(DocumentTextIcon, { className: "h-5 w-5" }),
          label: "Bemerkungen",
          value: /* @__PURE__ */ jsx("span", { className: "text-gray-600 font-normal whitespace-pre-line", children: notes })
        }
      ),
      recurrenceText && /* @__PURE__ */ jsx(
        DetailRow,
        {
          icon: /* @__PURE__ */ jsx(ArrowPathIcon, { className: "h-5 w-5" }),
          label: "Wiederholung",
          value: /* @__PURE__ */ jsxs("span", { children: [
            recurrenceIco,
            " ",
            recurrenceText
          ] })
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "px-5 pb-4", children: /* @__PURE__ */ jsx(
      "a",
      {
        href: `/events/${event.id}`,
        className: "text-sm text-green-700 hover:text-green-900 hover:underline",
        children: "→ Vollständige Detailseite öffnen"
      }
    ) })
  ] });
}

function Filters({ mode, onChange }) {
  const [organizers, setOrganizers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [types, setTypes] = useState([]);
  const now = /* @__PURE__ */ new Date();
  const [filters, setFilters] = useState({
    organizerId: void 0,
    locationId: void 0,
    typeId: void 0,
    month: void 0,
    year: now.getFullYear(),
    search: ""
  });
  useEffect(() => {
    fetch("/api/lookups-central").then((r) => r.json()).then((d) => {
      setOrganizers(d.organizers);
      setLocations(d.locations);
      setTypes(d.types);
    });
  }, []);
  useEffect(() => {
    onChange(filters);
  }, [filters]);
  const disabled = mode !== "list";
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `flex flex-wrap gap-4 bg-white p-3 rounded shadow ${disabled ? "opacity-50 pointer-events-none" : ""}`,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-gray-500", children: "Veranstalter" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              className: "select select-sm select-bordered",
              value: filters.organizerId ?? "",
              onChange: (e) => setFilters((f) => ({
                ...f,
                organizerId: e.target.value ? Number(e.target.value) : void 0
              })),
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Alle" }),
                organizers.map((o) => /* @__PURE__ */ jsx("option", { value: o.id, children: o.name }, o.id))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-gray-500", children: "Ort" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              className: "select select-sm select-bordered",
              value: filters.locationId ?? "",
              onChange: (e) => setFilters((f) => ({
                ...f,
                locationId: e.target.value ? Number(e.target.value) : void 0
              })),
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Alle" }),
                locations.map((l) => /* @__PURE__ */ jsx("option", { value: l.id, children: l.name }, l.id))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-gray-500", children: "Typ" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              className: "select select-sm select-bordered",
              value: filters.typeId ?? "",
              onChange: (e) => setFilters((f) => ({
                ...f,
                typeId: e.target.value ? Number(e.target.value) : void 0
              })),
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Alle" }),
                types.map((t) => /* @__PURE__ */ jsx("option", { value: t.id, children: t.name }, t.id))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-gray-500", children: "Monat" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: filters.month ?? "",
              onChange: (e) => setFilters((f) => ({
                ...f,
                month: e.target.value ? Number(e.target.value) : void 0
              })),
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Alle Monate" }),
                "   ",
                Array.from({ length: 12 }).map((_, i) => /* @__PURE__ */ jsx("option", { value: i + 1, children: new Date(2024, i, 1).toLocaleDateString("de-DE", { month: "long" }) }, i + 1))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-gray-500", children: "Jahr" }),
          /* @__PURE__ */ jsx(
            "select",
            {
              className: "select select-sm select-bordered",
              value: filters.year,
              onChange: (e) => setFilters((f) => ({ ...f, year: Number(e.target.value) })),
              children: Array.from({ length: 5 }).map((_, i) => {
                const y = now.getFullYear() - 2 + i;
                return /* @__PURE__ */ jsx("option", { value: y, children: y }, y);
              })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-gray-500", children: "Suche" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: "input input-sm input-bordered",
              value: filters.search,
              onChange: (e) => setFilters((f) => ({ ...f, search: e.target.value }))
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "btn btn-sm",
            onClick: () => setFilters({
              organizerId: void 0,
              locationId: void 0,
              typeId: void 0,
              month: void 0,
              year: now.getFullYear(),
              search: ""
            }),
            children: "Reset"
          }
        )
      ]
    }
  );
}

function EventsUserPage() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [view, setView] = useState("month");
  const [filters, setFilters] = useState({});
  return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 space-y-4", children: [
      /* @__PURE__ */ jsx(Filters, { mode: view, onChange: (f) => setFilters(f) }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2 border-b pb-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            className: `px-3 py-1 rounded ${view === "month" ? "bg-blue-600 text-white" : "bg-gray-200"}`,
            onClick: () => setView("month"),
            children: "Monat"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: `px-3 py-1 rounded ${view === "week" ? "bg-blue-600 text-white" : "bg-gray-200"}`,
            onClick: () => setView("week"),
            children: "Woche"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: `px-3 py-1 rounded ${view === "list" ? "bg-blue-600 text-white" : "bg-gray-200"}`,
            onClick: () => setView("list"),
            children: "Liste"
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        CalendarView,
        {
          mode: view,
          filters,
          onSelectEvent: setSelectedEvent
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(EventDetails, { event: selectedEvent }) })
  ] });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Veranstaltungen" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "EventsUserPage", EventsUserPage, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/dieter/dev/evmastro/src/components/events/EventsUserPage", "client:component-export": "EventsUserPage" })} ` })}`;
}, "/home/dieter/dev/evmastro/src/pages/user/index.astro", void 0);

const $$file = "/home/dieter/dev/evmastro/src/pages/user/index.astro";
const $$url = "/user";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Index,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
