import { c as createComponent } from './astro-component_DawRExCw.mjs';
import 'piccolore';
import { L as renderTemplate } from './sequence_BWwqfJV7.mjs';
import { r as renderComponent } from './entrypoint_B2885ELV.mjs';
import { $ as $$BaseLayout } from './BaseLayout_BLl-JaRM.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { create } from 'zustand';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { d as db, o as organizers, t as timeSlots, l as locations, e as eventTypes } from './index_BQXN-BIF.mjs';

const useImportStore = create(
  (set, get) => ({
    step: 1,
    // Organizer
    organizerId: null,
    organizers: [],
    currentOrganizer: () => {
      const id = get().organizerId;
      return get().organizers.find((o) => o.id === id) ?? null;
    },
    rows: [],
    hasHeader: false,
    mapping: {},
    events: [],
    resolvedEvents: [],
    // NEU
    unresolvedItems: [],
    discardedRows: [],
    discardedDetails: [],
    importSummary: null,
    saving: false,
    saveError: null,
    success: false,
    // Navigation
    nextStep: () => set((state) => ({
      step: Math.min(
        typeof state.step === "number" ? state.step + 1 : 6,
        6
      )
    })),
    prevStep: () => set((state) => ({
      step: Math.max(
        typeof state.step === "number" ? state.step - 1 : 1,
        1
      )
    })),
    goToStep: (step) => set({ step }),
    // Setter
    setOrganizerId: (id) => set({ organizerId: id }),
    setOrganizers: (list) => set({ organizers: list }),
    setRows: (rows) => set({ rows }),
    setHasHeader: (flag) => set({ hasHeader: flag }),
    setMapping: (mapping) => set({ mapping }),
    initializeMapping: (columnCount) => set({
      mapping: Object.fromEntries(
        Array.from({ length: columnCount }, (_, i) => [i, null])
      )
    }),
    setEvents: (events) => set({ events }),
    setResolvedEvents: (resolvedEvents) => set({ resolvedEvents }),
    // NEU
    setUnresolvedItems: (items) => set({ unresolvedItems: items }),
    setDiscardedRows: (rows) => set({ discardedRows: rows }),
    setDiscardedDetails: (details) => set({ discardedDetails: details }),
    setImportSummary: (summary) => set({ importSummary: summary }),
    setSaving: (flag) => set({ saving: flag }),
    setSaveError: (msg) => set({ saveError: msg }),
    setSuccess: (flag) => set({ success: flag })
  })
);

function StepButtons({
  onBack,
  onNext,
  nextEnabled = true
}) {
  return /* @__PURE__ */ jsxs("div", { className: "w-1/2 mx-auto flex justify-between mt-4", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: onBack,
        className: "px-4 py-2 bg-gray-200 rounded hover:bg-gray-300",
        children: "Zurück"
      }
    ),
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: onNext,
        disabled: !nextEnabled,
        className: `px-6 py-2 rounded-md shadow transition ${nextEnabled ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`,
        children: "Weiter"
      }
    )
  ] });
}

function OrganizerSelect({ organizers }) {
  const organizerId = useImportStore((s) => s.organizerId);
  const setOrganizerId = useImportStore((s) => s.setOrganizerId);
  const nextStep = useImportStore((s) => s.nextStep);
  const isValid = organizerId !== null;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6 w-2/3 mx-auto text-center", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: "Wer hat die Veranstaltungen eingereicht?" }),
    /* @__PURE__ */ jsxs("div", { className: "form-control w-full max-w-md mx-auto", children: [
      /* @__PURE__ */ jsx("label", { className: "label", children: /* @__PURE__ */ jsx("span", { className: "label-text font-medium", children: "Organizer auswählen" }) }),
      /* @__PURE__ */ jsxs(
        "select",
        {
          className: "select select-bordered w-full",
          value: organizerId ?? "",
          onChange: (e) => setOrganizerId(Number(e.target.value)),
          children: [
            /* @__PURE__ */ jsx("option", { value: "", disabled: true, children: "Bitte auswählen…" }),
            organizers.map((o) => /* @__PURE__ */ jsx("option", { value: o.id, children: o.name }, o.id))
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx(
      StepButtons,
      {
        onBack: void 0,
        onNext: nextStep,
        nextEnabled: isValid
      }
    )
  ] });
}

function parseCSV(file) {
  return new Promise((resolve) => {
    Papa.parse(file, {
      complete: (results) => resolve(results.data),
      delimiter: ";",
      skipEmptyLines: true
    });
  });
}
function parseExcel(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      resolve(rows);
    };
    reader.readAsArrayBuffer(file);
  });
}
function excelTimeToString(value) {
  const totalMinutes = Math.round(value * 24 * 60);
  const rounded = Math.round(totalMinutes / 15) * 15;
  const hours = Math.floor(rounded / 60);
  const minutes = rounded % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}
function cleanRows(rows) {
  return rows.map(
    (row) => row.map((cell) => {
      if (cell == null) return "";
      if (typeof cell === "number" && cell > 0 && cell < 1) {
        return excelTimeToString(cell);
      }
      return String(cell).replace(/^\uFEFF/, "").trim();
    })
  ).filter((row) => row.some((cell) => cell !== ""));
}
function removeEmptyColumns(rows) {
  const maxCols = Math.max(...rows.map((r) => r.length));
  const nonEmptyCols = [];
  for (let col = 0; col < maxCols; col++) {
    const hasData = rows.some(
      (row) => row[col] && row[col].toString().trim() !== ""
    );
    if (hasData) nonEmptyCols.push(col);
  }
  return rows.map((row) => nonEmptyCols.map((col) => row[col] ?? ""));
}
async function handleFile(file) {
  const ext = file.name.split(".").pop()?.toLowerCase();
  let rows = ext === "csv" ? await parseCSV(file) : await parseExcel(file);
  rows = cleanRows(rows);
  rows = removeEmptyColumns(rows);
  return rows;
}

function FileUpload({ onLoaded, onFileSelected }) {
  const organizerId = useImportStore((s) => s.organizerId);
  const organizers = useImportStore((s) => s.organizers);
  const organizer = organizers?.find((o) => o.id === organizerId);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function handleFile$1(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    onFileSelected(true);
    setError("");
    setLoading(true);
    try {
      const rows = await handleFile(file);
      onLoaded(rows);
    } catch (err) {
      console.error(err);
      setError("Fehler beim Einlesen der Datei.");
      onFileSelected(false);
    } finally {
      setLoading(false);
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4 w-2/3 mx-auto text-center", children: [
    /* @__PURE__ */ jsxs("h2", { className: "text-xl font-bold", children: [
      "Datei für ",
      organizer?.name ?? "…",
      " hochladen"
    ] }),
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "file",
        accept: ".csv, .xlsx",
        className: "border px-2 py-1",
        onChange: handleFile$1
      }
    ),
    loading && /* @__PURE__ */ jsx("p", { children: "Einlesen…" }),
    error && /* @__PURE__ */ jsx("p", { className: "text-red-600", children: error })
  ] });
}

function HeaderChoice({ rows, onContinue }) {
  const [hasHeader, setHasHeader] = useState(true);
  const previewRows = rows.slice(0, 3);
  return /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto space-y-10", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold text-gray-800 underline", children: "Hat die Datei eine Kopfzeile?" }),
    /* @__PURE__ */ jsx("div", { className: "w-2/3 mx-auto text-center bg-white border-2 rounded-xl shadow-sm overflow-x-auto", children: /* @__PURE__ */ jsx("table", { className: "min-w-full text-sm", children: /* @__PURE__ */ jsx("tbody", { children: previewRows.map((row, rIdx) => /* @__PURE__ */ jsx("tr", { className: "border-b last:border-0", children: row.map((cell, cIdx) => /* @__PURE__ */ jsx("td", { className: "px-4 py-2 whitespace-nowrap border-2 border-black", children: cell }, cIdx)) }, rIdx)) }) }) }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "radio",
            name: "header",
            checked: hasHeader,
            onChange: () => setHasHeader(true),
            className: "h-4 w-4"
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "text-lg text-gray-700", children: "Ja, die erste Zeile ist eine Kopfzeile" })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "radio",
            name: "header",
            checked: !hasHeader,
            onChange: () => setHasHeader(false),
            className: "h-4 w-4"
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "text-lg text-gray-700", children: "Nein, alle Zeilen sind Daten" })
      ] })
    ] })
  ] });
}

const REQUIRED_FIELDS = ["startDate", "eventType", "location", "timeSlot"];
const FIELD_LABELS$1 = {
  startDate: "Beginndatum",
  endDate: "Ende-Datum",
  timeSlot: "Startzeit",
  location: "Veranstaltungsort",
  eventType: "Veranstaltungsart",
  notes: "Bemerkungen",
  ignore: "Ignorieren"
};
function MappingMask({ rows, onComplete, onBack }) {
  const { mapping, setMapping } = useImportStore();
  const columns = rows[0] ?? [];
  const previewRows = rows.slice(0, 3);
  const allMapped = REQUIRED_FIELDS.every(
    (field) => Object.values(mapping).includes(field)
  );
  const handleSelect = (colIndex, field) => {
    setMapping({
      ...mapping,
      [colIndex]: field
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto space-y-12", children: [
    /* @__PURE__ */ jsxs("div", { className: "rounded-lg border-1 border-black bg-white shadow-sm overflow-x-auto", children: [
      /* @__PURE__ */ jsxs("table", { className: "min-w-full table-fixed border border-black text-sm", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-gray-100", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "w-[160px] " }),
          columns.map((col, idx) => /* @__PURE__ */ jsxs(
            "th",
            {
              className: `px-4 py-2 text-left font-medium text-gray-700 ${idx === columns.length - 1 ? "w-auto" : "w-[120px]"}`,
              children: [
                "Spalte ",
                idx + 1
              ]
            },
            idx
          ))
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: previewRows.map((row, rIdx) => /* @__PURE__ */ jsxs("tr", { className: "border-b last:border-0", children: [
          /* @__PURE__ */ jsx("td", { className: "w-[160px] " }),
          row.map((cell, cIdx) => /* @__PURE__ */ jsx(
            "td",
            {
              className: `px-4 py-2 whitespace-nowrap border-r last:border-r-0 ${cIdx === columns.length - 1 ? "w-auto" : "w-[120px]"}`,
              children: cell
            },
            cIdx
          ))
        ] }, rIdx)) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "rounded-lg border bg-white shadow-sm overflow-x-auto mt-6", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full table-fixed text-sm", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-gray-50 border-b border-gray-300", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "w-[160px] px-4 py-2 text-left font-semibold sticky left-0 bg-gray-50 z-10 border-r", children: "Feld" }),
          columns.map((_, idx) => /* @__PURE__ */ jsxs(
            "th",
            {
              className: `px-4 py-2 text-center font-semibold border-r last:border-r-0 ${idx === columns.length - 1 ? "w-auto" : "w-[120px]"}`,
              children: [
                "Spalte ",
                idx + 1
              ]
            },
            idx
          ))
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: Object.keys(FIELD_LABELS$1).map((field) => /* @__PURE__ */ jsxs("tr", { className: "border-b last:border-0", children: [
          /* @__PURE__ */ jsx("td", { className: "w-[160px] px-4 py-3 font-medium sticky left-0 bg-gray-50 z-10 border-r", children: FIELD_LABELS$1[field] }),
          columns.map((_, colIndex) => /* @__PURE__ */ jsx(
            "td",
            {
              className: `px-2 py-3 text-center border-r last:border-r-0 ${colIndex === columns.length - 1 ? "w-auto" : "w-[120px]"}`,
              children: /* @__PURE__ */ jsx(
                "input",
                {
                  type: "radio",
                  name: `map-${field}`,
                  className: "h-4 w-4",
                  checked: mapping[colIndex] === field,
                  onChange: () => handleSelect(colIndex, field)
                }
              )
            },
            colIndex
          ))
        ] }, field)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(
      StepButtons,
      {
        onBack,
        onNext: () => onComplete(mapping),
        nextEnabled: allMapped
      }
    )
  ] });
}

function PreviewTable({ events, onBack, onConfirm }) {
  if (!events || events.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: "Keine Daten vorhanden." }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onBack,
          className: "px-4 py-2 bg-gray-200 rounded hover:bg-gray-300",
          children: "Zurück"
        }
      )
    ] });
  }
  const columns = [
    { key: "startDate", label: "Startdatum" },
    { key: "endDate", label: "Enddatum" },
    { key: "timeSlot", label: "Startzeit" },
    { key: "location", label: "Ort" },
    { key: "eventType", label: "Art" },
    { key: "notes", label: "Notizen" }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8 max-w-5xl mx-auto", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold text-gray-800", children: "Vorschau der importierten Events" }),
    /* @__PURE__ */ jsxs("p", { className: "text-green-900 text-white", children: [
      events.length,
      " Datensätze bereit zum Import"
    ] }),
    /* @__PURE__ */ jsx("div", { className: "overflow-x-auto rounded-lg border border-gray-300 shadow-sm bg-white", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full border-collapse text-sm", children: [
      /* @__PURE__ */ jsx("thead", { className: "bg-gray-100 border-b border-gray-300", children: /* @__PURE__ */ jsx("tr", { children: columns.map((col) => /* @__PURE__ */ jsx(
        "th",
        {
          className: "px-4 py-2 text-left font-semibold text-gray-700 border-r last:border-r-0",
          children: col.label
        },
        col.key
      )) }) }),
      /* @__PURE__ */ jsx("tbody", { children: events.map((ev, idx) => /* @__PURE__ */ jsx("tr", { className: "border-b border-gray-200", children: columns.map((col) => /* @__PURE__ */ jsx(
        "td",
        {
          className: "px-4 py-2 border-r last:border-r-0 whitespace-nowrap",
          children: String(ev[col.key] ?? "")
        },
        col.key
      )) }, idx)) })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onBack,
          className: "px-4 py-2 bg-gray-200 rounded hover:bg-gray-300",
          children: "Zurück"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onConfirm,
          className: "px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700",
          children: "Weiter"
        }
      )
    ] })
  ] });
}

const FIELD_LABELS = {
  timeSlot: "Uhrzeit",
  location: "Veranstaltungsort",
  eventType: "Veranstaltungsart"
};
const API_MAP = {
  timeSlot: "/api/lookups/timeSlots",
  location: "/api/lookups/locations",
  eventType: "/api/lookups/eventTypes"
};
function UnresolvedValuesStep({
  unresolvedItems,
  onComplete,
  onBack
}) {
  const [decisions, setDecisions] = useState(
    () => Object.fromEntries(
      unresolvedItems.map((item) => [`${item.field}::${item.value}`, null])
    )
  );
  const [newIds, setNewIds] = useState({});
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});
  const allDecided = unresolvedItems.every(
    (item) => decisions[`${item.field}::${item.value}`] !== null
  );
  const grouped = unresolvedItems.reduce((acc, item) => {
    if (!acc[item.field]) acc[item.field] = [];
    acc[item.field].push(item);
    return acc;
  }, {});
  async function handleAdd(item) {
    const key = `${item.field}::${item.value}`;
    setLoading((l) => ({ ...l, [key]: true }));
    setErrors((e) => ({ ...e, [key]: "" }));
    try {
      const res = await fetch(API_MAP[item.field], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: item.value })
      });
      if (!res.ok) throw new Error("Fehler beim Anlegen");
      const created = await res.json();
      setNewIds((ids) => ({ ...ids, [key]: created.id }));
      setDecisions((d) => ({ ...d, [key]: "add" }));
    } catch {
      setErrors((e) => ({ ...e, [key]: "Fehler beim Anlegen. Bitte erneut versuchen." }));
    } finally {
      setLoading((l) => ({ ...l, [key]: false }));
    }
  }
  function handleDiscard(item) {
    const key = `${item.field}::${item.value}`;
    setDecisions((d) => ({ ...d, [key]: "discard" }));
    setNewIds((ids) => {
      const updated = { ...ids };
      delete updated[key];
      return updated;
    });
  }
  function handleReset(item) {
    const key = `${item.field}::${item.value}`;
    setDecisions((d) => ({ ...d, [key]: null }));
  }
  return /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-yellow-50 border border-yellow-300 rounded-lg p-4", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-yellow-800 mb-1", children: "⚠️ Unbekannte Werte gefunden" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-yellow-700", children: "Die folgenden Werte aus deiner Import-Datei wurden in den Lookup-Tabellen nicht gefunden. Entscheide für jeden Wert ob er angelegt oder die betroffenen Events verworfen werden sollen." })
    ] }),
    Object.entries(grouped).map(([field, items]) => /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-700 border-b pb-1", children: FIELD_LABELS[field] ?? field }),
      items.map((item) => {
        const key = `${item.field}::${item.value}`;
        const decision = decisions[key];
        const isLoading = loading[key];
        const error = errors[key];
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: `rounded-lg border p-4 flex items-center justify-between gap-4 ${decision === "add" ? "bg-green-50 border-green-300" : decision === "discard" ? "bg-red-50 border-red-300" : "bg-white border-gray-200"}`,
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxs("div", { className: "font-medium text-gray-800 truncate", children: [
                  "„",
                  item.value,
                  '"'
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500 mt-0.5", children: [
                  item.affectedRows.length,
                  " betroffene(s) Event(s)"
                ] }),
                error && /* @__PURE__ */ jsx("div", { className: "text-xs text-red-600 mt-1", children: error }),
                decision === "add" && /* @__PURE__ */ jsx("div", { className: "text-xs text-green-700 mt-1", children: "✅ Wird angelegt" }),
                decision === "discard" && /* @__PURE__ */ jsxs("div", { className: "text-xs text-red-700 mt-1", children: [
                  "❌ ",
                  item.affectedRows.length,
                  " Event(s) werden verworfen"
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "flex gap-2 shrink-0", children: decision === null ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    className: "btn btn-sm bg-green-700 text-white",
                    onClick: () => handleAdd(item),
                    disabled: isLoading,
                    children: isLoading ? "Anlegen…" : "✅ Anlegen"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    className: "btn btn-sm bg-red-600 text-white",
                    onClick: () => handleDiscard(item),
                    children: "❌ Verwerfen"
                  }
                )
              ] }) : /* @__PURE__ */ jsx(
                "button",
                {
                  className: "btn btn-sm btn-ghost text-gray-500",
                  onClick: () => handleReset(item),
                  children: "Rückgängig"
                }
              ) })
            ]
          },
          key
        );
      })
    ] }, field)),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between pt-4", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "px-4 py-2 bg-gray-200 rounded hover:bg-gray-300",
          onClick: onBack,
          children: "Zurück"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: `px-6 py-2 rounded-md shadow transition ${allDecided ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`,
          disabled: !allDecided,
          onClick: () => onComplete(decisions, newIds),
          children: "Weiter"
        }
      )
    ] })
  ] });
}

function ImportHeader() {
  const step = useImportStore((s) => s.step);
  const organizer = useImportStore((s) => s.currentOrganizer());
  const resolvedEvents = useImportStore((s) => s.resolvedEvents);
  const steps = [
    "Organisator",
    "Datei",
    "Kopfzeile",
    "Mapping",
    "Vorschau",
    "Speichern"
  ];
  return /* @__PURE__ */ jsx("div", { className: "w-full bg-gray-100 border-b py-4 mb-6 shadow-sm", children: /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto px-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-left space-y-1", children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-lg font-semibold text-gray-800", children: [
        "Import für ",
        organizer?.name ?? "—"
      ] }),
      resolvedEvents.length > 0 && /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-600", children: [
        resolvedEvents.length,
        " Veranstaltungen vorbereitet"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "text-right", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500", children: [
      "Schritt ",
      step,
      " von ",
      steps.length,
      ":",
      " ",
      /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-700", children: steps[step - 1] })
    ] }) })
  ] }) });
}

function applyMapping(rows, mapping, organizerId) {
  return rows.filter((row) => row.some((cell) => cell && cell.trim() !== "")).filter((row) => !isHeaderRow(row)).filter((row) => isValidDataRow(row, mapping)).map((row) => {
    const raw = {};
    Object.entries(mapping).forEach(([colIndex, fieldName]) => {
      const index = Number(colIndex);
      raw[fieldName] = row[index] ?? null;
    });
    raw.organizerId = organizerId;
    return raw;
  });
}
function isHeaderRow(row) {
  const headerKeywords = [
    "beginn",
    "start",
    "datum",
    "enddatum",
    "ende",
    "zeit",
    "uhrzeit",
    "ort",
    "location",
    "art",
    "event",
    "veranstaltung",
    "typ",
    "type"
  ];
  return row.some((cell) => {
    if (!cell) return false;
    const lower = cell.toLowerCase().trim();
    return headerKeywords.includes(lower);
  });
}
function isValidDataRow(row, mapping) {
  const startDateCol = Object.entries(mapping).find(
    ([, fieldName]) => fieldName === "startDate"
  );
  if (!startDateCol) return true;
  const [colIndex] = startDateCol;
  const value = row[Number(colIndex)];
  return Boolean(value && value.trim() !== "" && !isNaN(Date.parse(value)));
}

function normalizeDate(value) {
  if (!value) return null;
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (match) {
    const [_, d, m, y] = match;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  return null;
}
function normalizeTimeSlot(value) {
  if (!value) return "";
  return value.trim();
}
function normalizeString(value) {
  return value?.trim() ?? "";
}
function normalizeEvent(raw) {
  const start = normalizeDate(raw.startDate);
  const end = normalizeDate(raw.endDate) ?? start;
  return {
    startDate: start,
    endDate: end,
    timeSlot: normalizeTimeSlot(raw.timeSlot),
    location: normalizeString(raw.location),
    eventType: normalizeString(raw.eventType),
    description: normalizeString(raw.description)
  };
}

function norm(value) {
  return value?.trim().toLowerCase() ?? "";
}
function lookupTimeSlotId(timeSlotName, timeSlots) {
  const n = norm(timeSlotName);
  const match = timeSlots.find((ts) => norm(ts.name) === n);
  return match ? match.id : null;
}
function lookupLocationId(locationName, locations) {
  const n = norm(locationName);
  const match = locations.find((loc) => norm(loc.name) === n);
  return match ? match.id : null;
}
function lookupEventTypeId(eventTypeName, eventTypes) {
  const n = norm(eventTypeName);
  const match = eventTypes.find((et) => norm(et.name) === n);
  return match ? match.id : null;
}
function findUnresolvedValues(events, { timeSlots, locations, eventTypes }) {
  const map = /* @__PURE__ */ new Map();
  events.forEach((ev, idx) => {
    if (ev.timeSlot && !lookupTimeSlotId(ev.timeSlot, timeSlots)) {
      const key = `timeSlot::${ev.timeSlot}`;
      if (!map.has(key)) {
        map.set(key, { value: ev.timeSlot, field: "timeSlot", affectedRows: [] });
      }
      map.get(key).affectedRows.push(idx);
    }
    if (ev.location && !lookupLocationId(ev.location, locations)) {
      const key = `location::${ev.location}`;
      if (!map.has(key)) {
        map.set(key, { value: ev.location, field: "location", affectedRows: [] });
      }
      map.get(key).affectedRows.push(idx);
    }
    if (ev.eventType && !lookupEventTypeId(ev.eventType, eventTypes)) {
      const key = `eventType::${ev.eventType}`;
      if (!map.has(key)) {
        map.set(key, { value: ev.eventType, field: "eventType", affectedRows: [] });
      }
      map.get(key).affectedRows.push(idx);
    }
  });
  return Array.from(map.values());
}
function resolveEventIds(event, { timeSlots, locations, eventTypes }) {
  return {
    ...event,
    timeId: lookupTimeSlotId(event.timeSlot, timeSlots),
    locationId: lookupLocationId(event.location, locations),
    typeId: lookupEventTypeId(event.eventType, eventTypes)
  };
}

function ImportFlow({
  organizers,
  timeSlots,
  locations,
  eventTypes
}) {
  const {
    step,
    nextStep,
    prevStep,
    goToStep,
    organizerId,
    setOrganizerId,
    rows,
    setRows,
    setHasHeader,
    mapping,
    setMapping,
    events,
    setEvents,
    resolvedEvents,
    setResolvedEvents,
    unresolvedItems,
    setUnresolvedItems,
    setDiscardedRows,
    setDiscardedDetails,
    setImportSummary,
    saving,
    saveError,
    setSaving,
    setSaveError,
    initializeMapping,
    setOrganizers,
    success,
    setSuccess
  } = useImportStore();
  const [fileSelected, setFileSelected] = useState(false);
  const [currentTimeSlots, setCurrentTimeSlots] = useState(timeSlots);
  const [currentLocations, setCurrentLocations] = useState(locations);
  const [currentEventTypes, setCurrentEventTypes] = useState(eventTypes);
  useEffect(() => {
    setOrganizers(organizers);
  }, [organizers, setOrganizers]);
  function handlePreviewConfirm() {
    const unresolved = findUnresolvedValues(events, {
      timeSlots: currentTimeSlots,
      locations: currentLocations,
      eventTypes: currentEventTypes
    });
    if (unresolved.length > 0) {
      setUnresolvedItems(unresolved);
      goToStep("5b");
    } else {
      const resolved = events.map(
        (ev) => resolveEventIds(ev, {
          timeSlots: currentTimeSlots,
          locations: currentLocations,
          eventTypes: currentEventTypes
        })
      );
      setResolvedEvents(resolved);
      goToStep(6);
    }
  }
  async function handleUnresolvedComplete(decisions, newIds) {
    const updatedTimeSlots = [...currentTimeSlots];
    const updatedLocations = [...currentLocations];
    const updatedEventTypes = [...currentEventTypes];
    for (const [key, id] of Object.entries(newIds)) {
      const [field, value] = key.split("::");
      if (field === "timeSlot") updatedTimeSlots.push({ id, name: value });
      if (field === "location") updatedLocations.push({ id, name: value });
      if (field === "eventType") updatedEventTypes.push({ id, name: value });
    }
    setCurrentTimeSlots(updatedTimeSlots);
    setCurrentLocations(updatedLocations);
    setCurrentEventTypes(updatedEventTypes);
    const discardedIndices = /* @__PURE__ */ new Set();
    const discardedDetails = [];
    for (const [key, decision] of Object.entries(decisions)) {
      if (decision === "discard") {
        const [field, value] = key.split("::");
        const item = unresolvedItems.find(
          (i) => i.field === field && i.value === value
        );
        if (item) {
          item.affectedRows.forEach((idx) => discardedIndices.add(idx));
          item.affectedRows.forEach(
            (idx) => discardedDetails.push(
              `Event #${idx + 1}: ${field === "timeSlot" ? "Uhrzeit" : field === "location" ? "Veranstaltungsort" : "Veranstaltungsart"} „${value}" nicht gefunden`
            )
          );
        }
      }
    }
    setDiscardedRows(Array.from(discardedIndices));
    setDiscardedDetails(discardedDetails);
    const filteredEvents = events.filter((_, idx) => !discardedIndices.has(idx));
    const resolved = filteredEvents.map(
      (ev) => resolveEventIds(ev, {
        timeSlots: updatedTimeSlots,
        locations: updatedLocations,
        eventTypes: updatedEventTypes
      })
    );
    setResolvedEvents(resolved);
    goToStep(6);
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(ImportHeader, {}),
    step === 1 && /* @__PURE__ */ jsx("div", { className: "p-6 space-y-6", children: /* @__PURE__ */ jsx(
      OrganizerSelect,
      {
        organizers,
        selectedId: organizerId,
        setSelectedId: (id) => {
          setOrganizerId(id);
          nextStep();
        }
      }
    ) }),
    step === 2 && /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-6 w-2/3 mx-auto", children: [
      /* @__PURE__ */ jsx(
        FileUpload,
        {
          onLoaded: (loadedRows) => {
            setRows(loadedRows);
            if (loadedRows[0]) initializeMapping(loadedRows[0].length);
          },
          onFileSelected: setFileSelected
        }
      ),
      /* @__PURE__ */ jsx(StepButtons, { onBack: prevStep, onNext: nextStep, nextEnabled: fileSelected })
    ] }),
    step === 3 && /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-6", children: [
      /* @__PURE__ */ jsx(
        HeaderChoice,
        {
          rows,
          onContinue: (cleanedRows, headerFlag) => {
            setRows(cleanedRows);
            setHasHeader(headerFlag);
            setTimeout(() => nextStep(), 0);
          }
        }
      ),
      /* @__PURE__ */ jsx(StepButtons, { onBack: prevStep, onNext: nextStep, nextEnabled: true })
    ] }),
    step === 4 && /* @__PURE__ */ jsx("div", { className: "p-6 space-y-6", children: /* @__PURE__ */ jsx(
      MappingMask,
      {
        rows,
        onBack: prevStep,
        onComplete: (mappingResult) => {
          setMapping(mappingResult);
          const rawEvents = applyMapping(rows, mappingResult, organizerId);
          const normalized = rawEvents.map((raw) => ({
            ...normalizeEvent(raw),
            organizerId
          }));
          setEvents(normalized);
          nextStep();
        }
      }
    ) }),
    step === 5 && /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-6 max-w-5xl mx-auto", children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-xl font-bold text-center", children: [
        events.length,
        " Veranstaltungen gefunden"
      ] }),
      /* @__PURE__ */ jsx(
        PreviewTable,
        {
          events,
          onBack: prevStep,
          onConfirm: handlePreviewConfirm
        }
      )
    ] }),
    step === "5b" && /* @__PURE__ */ jsx("div", { className: "p-6 space-y-6", children: /* @__PURE__ */ jsx(
      UnresolvedValuesStep,
      {
        unresolvedItems,
        onComplete: handleUnresolvedComplete,
        onBack: () => goToStep(5)
      }
    ) }),
    step === 6 && /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-6", children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-xl font-bold text-center", children: [
        resolvedEvents.length,
        " Veranstaltungen importieren"
      ] }),
      saveError && /* @__PURE__ */ jsx("p", { className: "text-red-600 w-2/3 mx-auto text-center", children: saveError }),
      success && useImportStore.getState().importSummary && (() => {
        const summary = useImportStore.getState().importSummary;
        return /* @__PURE__ */ jsxs("div", { className: "w-2/3 mx-auto space-y-3", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-green-600 text-center text-lg font-semibold", children: [
            "✅ ",
            summary.inserted,
            " Veranstaltungen erfolgreich importiert!"
          ] }),
          summary.discarded.length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-yellow-50 border border-yellow-300 rounded-lg p-4", children: [
            /* @__PURE__ */ jsxs("p", { className: "font-semibold text-yellow-800 mb-2", children: [
              "⚠️ ",
              summary.discarded.length,
              " Event(s) wurden verworfen:"
            ] }),
            /* @__PURE__ */ jsx("ul", { className: "text-sm text-yellow-700 space-y-1", children: summary.discarded.map((d, i) => /* @__PURE__ */ jsxs("li", { children: [
              "• ",
              d
            ] }, i)) })
          ] })
        ] });
      })(),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-4 justify-center", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "btn",
            onClick: () => goToStep(5),
            disabled: saving,
            children: "Zurück"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "btn btn-primary",
            disabled: saving || success,
            onClick: async () => {
              setSaving(true);
              setSaveError(null);
              try {
                const response = await fetch("/api/import-events", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ events: resolvedEvents })
                });
                if (!response.ok) throw new Error("Fehler beim Speichern");
                const discardedDetails = useImportStore.getState().discardedDetails;
                setImportSummary({
                  inserted: resolvedEvents.length,
                  discarded: discardedDetails
                });
                setSuccess(true);
                setTimeout(() => {
                  window.location.href = "/";
                }, 4e3);
              } catch (err) {
                console.error(err);
                setSaveError("Fehler beim Speichern der Events.");
                setSaving(false);
              }
            },
            children: saving ? "Speichere ..." : "Import starten"
          }
        )
      ] })
    ] })
  ] });
}

const prerender = false;
const $$Import = createComponent(async ($$result, $$props, $$slots) => {
  const organizers$1 = await db.select().from(organizers);
  const timeSlots$1 = await db.select().from(timeSlots);
  const locations$1 = await db.select().from(locations);
  const eventTypes$1 = await db.select().from(eventTypes);
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Event Import" }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "ImportFlow", ImportFlow, { "client:load": true, "organizers": organizers$1, "timeSlots": timeSlots$1, "locations": locations$1, "eventTypes": eventTypes$1, "client:component-hydration": "load", "client:component-path": "/home/dieter/dev/evmastro/src/components/import/ImportFlow", "client:component-export": "default" })} ` })}`;
}, "/home/dieter/dev/evmastro/src/pages/admin/import.astro", void 0);

const $$file = "/home/dieter/dev/evmastro/src/pages/admin/import.astro";
const $$url = "/admin/import";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Import,
    file: $$file,
    prerender,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
