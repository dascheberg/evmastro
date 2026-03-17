import { c as createComponent } from './astro-component_DawRExCw.mjs';
import 'piccolore';
import { L as renderTemplate, x as maybeRenderHead } from './sequence_BWwqfJV7.mjs';
import { r as renderComponent } from './entrypoint_B2885ELV.mjs';
import { $ as $$BaseLayout } from './BaseLayout_BLl-JaRM.mjs';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import React, { useState, useEffect } from 'react';
import { ArrowUturnLeftIcon } from '@heroicons/react/24/solid';

function ImportsTable() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  async function loadLogs() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/imports");
      const data = await res.json();
      setLogs(data);
    } catch {
      setError("Fehler beim Laden der Import-Übersicht.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    loadLogs();
  }, []);
  function showSuccess(msg) {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 4e3);
  }
  async function confirmUndo(id) {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/imports/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Fehler beim Rückgängigmachen.");
        setDeletingId(null);
        return;
      }
      setDeletingId(null);
      await loadLogs();
      showSuccess(`✅ Import rückgängig gemacht – ${data.deletedCount} Events gelöscht.`);
    } catch {
      setError("Netzwerkfehler. Bitte erneut versuchen.");
      setDeletingId(null);
    } finally {
      setDeleteLoading(false);
    }
  }
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "p-4 text-gray-500", children: "Lade Import-Übersicht…" });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    success && /* @__PURE__ */ jsx("div", { className: "alert alert-success text-sm py-2", children: success }),
    error && /* @__PURE__ */ jsxs("div", { className: "alert alert-error text-sm py-2", children: [
      "❌ ",
      error,
      /* @__PURE__ */ jsx("button", { className: "ml-2 underline", onClick: () => setError(""), children: "Schließen" })
    ] }),
    logs.length === 0 ? /* @__PURE__ */ jsx("div", { className: "p-8 text-center text-gray-400 bg-white rounded border", children: "Noch keine Imports vorhanden." }) : /* @__PURE__ */ jsxs("table", { className: "table table-compact w-full border-1", children: [
      /* @__PURE__ */ jsx("thead", { className: "font-bold border-b-2 text-black text-base", children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: "w-12", children: "#" }),
        /* @__PURE__ */ jsx("th", { children: "Datum / Uhrzeit" }),
        /* @__PURE__ */ jsx("th", { className: "text-center", children: "Importiert" }),
        /* @__PURE__ */ jsx("th", { className: "text-center", children: "Noch vorhanden" }),
        /* @__PURE__ */ jsx("th", { className: "text-center", children: "Status" }),
        /* @__PURE__ */ jsx("th", { className: "w-48", children: "Aktion" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: logs.map((log) => /* @__PURE__ */ jsxs(React.Fragment, { children: [
        /* @__PURE__ */ jsxs("tr", { className: `border-t ${log.alreadyDeleted ? "bg-gray-50 opacity-60" : "odd:bg-green-100 hover:bg-green-200"}`, children: [
          /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-gray-400 text-sm", children: log.id }),
          /* @__PURE__ */ jsxs("td", { className: "px-3 py-2", children: [
            /* @__PURE__ */ jsx("div", { className: "font-medium", children: new Date(log.createdAt).toLocaleDateString("de-DE") }),
            /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500", children: [
              new Date(log.createdAt).toLocaleTimeString("de-DE", {
                hour: "2-digit",
                minute: "2-digit"
              }),
              " Uhr"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("td", { className: "px-3 py-2 text-center", children: [
            /* @__PURE__ */ jsx("span", { className: "font-semibold", children: log.importedCount }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-400 text-xs ml-1", children: "Events" })
          ] }),
          /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: log.alreadyDeleted ? /* @__PURE__ */ jsx("span", { className: "text-gray-400 text-sm", children: "–" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("span", { className: `font-semibold ${log.remainingCount < log.importedCount ? "text-orange-600" : "text-green-700"}`, children: log.remainingCount }),
            /* @__PURE__ */ jsxs("span", { className: "text-gray-400 text-xs ml-1", children: [
              "/ ",
              log.importedCount
            ] })
          ] }) }),
          /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: log.alreadyDeleted ? /* @__PURE__ */ jsx("span", { className: "badge badge-ghost text-xs", children: "Bereits gelöscht" }) : log.remainingCount < log.importedCount ? /* @__PURE__ */ jsx("span", { className: "badge badge-warning text-xs", children: "Teilweise gelöscht" }) : /* @__PURE__ */ jsx("span", { className: "badge badge-success text-xs", children: "Vollständig" }) }),
          /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: !log.alreadyDeleted && /* @__PURE__ */ jsx(Fragment, { children: deletingId === log.id ? /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                className: "btn btn-xs bg-red-600 text-white",
                onClick: () => confirmUndo(log.id),
                disabled: deleteLoading,
                children: deleteLoading ? "Läuft…" : "Ja, löschen"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                className: "btn btn-xs btn-ghost",
                onClick: () => setDeletingId(null),
                disabled: deleteLoading,
                children: "Abbrechen"
              }
            )
          ] }) : /* @__PURE__ */ jsxs(
            "button",
            {
              className: "btn btn-sm btn-ghost text-orange-600 gap-1",
              onClick: () => setDeletingId(log.id),
              title: "Diesen Import rückgängig machen",
              children: [
                /* @__PURE__ */ jsx(ArrowUturnLeftIcon, { className: "h-4 w-4" }),
                "Rückgängig"
              ]
            }
          ) }) })
        ] }),
        deletingId === log.id && /* @__PURE__ */ jsx("tr", { className: "bg-red-50", children: /* @__PURE__ */ jsx("td", { colSpan: 6, className: "px-3 py-3", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-red-700", children: [
          "⚠️ Sollen wirklich alle ",
          /* @__PURE__ */ jsxs("strong", { children: [
            log.remainingCount,
            " noch vorhandenen Events"
          ] }),
          " dieses Imports vom ",
          /* @__PURE__ */ jsx("strong", { children: new Date(log.createdAt).toLocaleDateString("de-DE") }),
          " gelöscht werden? Diese Aktion kann nicht rückgängig gemacht werden."
        ] }) }) })
      ] }, log.id)) })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400", children: '* "Teilweise gelöscht" bedeutet dass einzelne Events nach dem Import manuell gelöscht wurden. Ein Rückgängigmachen löscht alle verbleibenden Events dieses Imports.' })
  ] });
}

const prerender = false;
const $$Imports = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Import-Übersicht" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="space-y-4"> <h1 class="text-2xl font-bold">Import-Übersicht</h1> <p class="text-gray-500 text-sm">
Hier siehst du alle bisherigen Daten-Imports. Du kannst einen Import
      rückgängig machen – dabei werden alle Events dieses Imports gelöscht.
</p> ${renderComponent($$result2, "ImportsTable", ImportsTable, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/dieter/dev/evmastro/src/components/admin/ImportsTable", "client:component-export": "ImportsTable" })} </div> ` })}`;
}, "/home/dieter/dev/evmastro/src/pages/admin/imports.astro", void 0);

const $$file = "/home/dieter/dev/evmastro/src/pages/admin/imports.astro";
const $$url = "/admin/imports";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Imports,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
