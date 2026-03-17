import { c as createComponent } from './astro-component_DawRExCw.mjs';
import 'piccolore';
import { L as renderTemplate } from './sequence_BWwqfJV7.mjs';
import { r as renderComponent } from './entrypoint_B2885ELV.mjs';
import { $ as $$BaseLayout } from './BaseLayout_BLl-JaRM.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect, useMemo } from 'react';
import { useReactTable, getFilteredRowModel, getSortedRowModel, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import { MagnifyingGlassIcon, PlusIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';

function buildQuery(params) {
  const q = new URLSearchParams();
  q.set("page", String(params.pagination.pageIndex + 1));
  q.set("pageSize", String(params.pagination.pageSize));
  if (params.sorting.length > 0) {
    q.set("sortBy", params.sorting[0].id);
    q.set("sortDir", params.sorting[0].desc ? "desc" : "asc");
  }
  params.columnFilters.forEach((f) => {
    if (f.value) q.set(f.id, String(f.value));
  });
  if (params.dateFilters.startDateFrom) q.set("startDateFrom", params.dateFilters.startDateFrom);
  if (params.dateFilters.startDateTo) q.set("startDateTo", params.dateFilters.startDateTo);
  if (params.search) q.set("search", params.search);
  return q.toString();
}
function EventsTable({ reload, onEdit, onDelete }) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [lookups, setLookups] = useState({
    organizers: [],
    locations: [],
    types: [],
    timeSlots: []
  });
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  });
  const [sorting, setSorting] = useState([
    { id: "startDate", desc: false }
  ]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [dateFilters, setDateFilters] = useState({
    startDateFrom: "",
    startDateTo: ""
  });
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPagination((p) => ({ ...p, pageIndex: 0 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);
  useEffect(() => {
    fetch("/api/lookups-central").then((res) => res.json()).then((data2) => setLookups({
      organizers: data2.organizers.map((o) => o.name),
      locations: data2.locations.map((l) => l.name),
      types: data2.types.map((t) => t.name),
      timeSlots: data2.timeSlots.map((ts) => ts.name)
    })).catch((err) => console.error("Lookup fetch error", err));
  }, []);
  useEffect(() => {
    const query = buildQuery({
      pagination,
      sorting,
      columnFilters,
      dateFilters,
      search: debouncedSearch
    });
    fetch(`/api/events?${query}`).then((res) => res.json()).then((json) => {
      setData(json.data);
      setTotal(json.total);
      setPageCount(json.pageCount);
    }).catch((err) => console.error("Events fetch error", err));
  }, [pagination, sorting, columnFilters, dateFilters, debouncedSearch, reload]);
  const columns = useMemo(
    () => [
      {
        accessorKey: "startDate",
        header: "Start",
        enableSorting: true,
        cell: (info) => new Date(info.getValue()).toLocaleDateString("de-DE")
      },
      {
        accessorKey: "endDate",
        header: "Ende",
        enableSorting: true,
        cell: (info) => {
          const v = info.getValue();
          return v ? new Date(v).toLocaleDateString("de-DE") : "";
        }
      },
      { accessorKey: "organizer", header: "Veranstalter", enableSorting: true },
      { accessorKey: "location", header: "Ort", enableSorting: true },
      { accessorKey: "type", header: "Typ", enableSorting: true },
      { accessorKey: "timeSlot", header: "Zeitfenster", enableSorting: true },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => /* @__PURE__ */ jsxs("div", { className: "flex gap-2 justify-end", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "btn btn-xs btn-ghost",
              onClick: () => onEdit(row.original),
              children: /* @__PURE__ */ jsx(PencilIcon, { className: "h-5 w-5 text-red-400" })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "btn btn-xs btn-ghost",
              onClick: () => onDelete(row.original),
              children: /* @__PURE__ */ jsx(TrashIcon, { className: "h-5 w-5 text-blue-600" })
            }
          )
        ] })
      }
    ],
    [onEdit]
  );
  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: { pagination, sorting, columnFilters },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  });
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "card bg-base-200 shadow border-1 p-4 space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(MagnifyingGlassIcon, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            className: "input input-bordered w-full pl-9",
            placeholder: "Suche nach Veranstalter, Ort, Typ oder Bemerkung…",
            value: searchInput,
            onChange: (e) => setSearchInput(e.target.value)
          }
        ),
        searchInput && /* @__PURE__ */ jsx(
          "button",
          {
            className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600",
            onClick: () => setSearchInput(""),
            children: "✕"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-bold mb-1", children: "Veranstalter" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              className: "border rounded px-2 py-1 w-full",
              value: table.getColumn("organizer")?.getFilterValue() ?? "",
              onChange: (e) => table.getColumn("organizer")?.setFilterValue(e.target.value || void 0),
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Alle" }),
                lookups.organizers.map((o) => /* @__PURE__ */ jsx("option", { value: o, children: o }, o))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-bold mb-1", children: "Ort" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              className: "border rounded px-2 py-1 w-full",
              value: table.getColumn("location")?.getFilterValue() ?? "",
              onChange: (e) => table.getColumn("location")?.setFilterValue(e.target.value || void 0),
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Alle" }),
                lookups.locations.map((l) => /* @__PURE__ */ jsx("option", { value: l, children: l }, l))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-1", children: "Typ" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              className: "border rounded px-2 py-1 w-full",
              value: table.getColumn("type")?.getFilterValue() ?? "",
              onChange: (e) => table.getColumn("type")?.setFilterValue(e.target.value || void 0),
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Alle" }),
                lookups.types.map((t) => /* @__PURE__ */ jsx("option", { value: t, children: t }, t))
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-1", children: "Start ab" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "date",
              className: "border rounded px-2 py-1 w-full",
              value: dateFilters.startDateFrom,
              onChange: (e) => setDateFilters((old) => ({ ...old, startDateFrom: e.target.value }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-1", children: "Start bis" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "date",
              className: "border rounded px-2 py-1 w-full",
              value: dateFilters.startDateTo,
              onChange: (e) => setDateFilters((old) => ({ ...old, startDateTo: e.target.value }))
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-end", children: /* @__PURE__ */ jsx(
          "button",
          {
            className: "border rounded px-3 py-1 bg-teal-600 rounded-lg text-white w-full",
            onClick: () => {
              setDateFilters({ startDateFrom: "", startDateTo: "" });
              setSearchInput("");
              setColumnFilters([]);
            },
            children: "Alle Filter zurücksetzen"
          }
        ) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "overflow-x-auto border-1 rounded", children: /* @__PURE__ */ jsxs("table", { className: "table-compact min-w-full text-sm", children: [
      /* @__PURE__ */ jsx("thead", { className: "bg-gray-100", children: table.getHeaderGroups().map((hg) => /* @__PURE__ */ jsx("tr", { children: hg.headers.map((header) => {
        const canSort = header.column.getCanSort();
        const sortDir = header.column.getIsSorted();
        return /* @__PURE__ */ jsxs(
          "th",
          {
            className: "px-3 py-2 text-left cursor-pointer select-none",
            onClick: canSort ? header.column.getToggleSortingHandler() : void 0,
            children: [
              header.isPlaceholder ? null : flexRender(
                header.column.columnDef.header,
                header.getContext()
              ),
              canSort && /* @__PURE__ */ jsxs("span", { className: "ml-1 text-xs", children: [
                sortDir === "asc" && "▲",
                sortDir === "desc" && "▼"
              ] })
            ]
          },
          header.id
        );
      }) }, hg.id)) }),
      /* @__PURE__ */ jsx("tbody", { children: table.getRowModel().rows.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "px-3 py-6 text-center text-gray-400", colSpan: columns.length, children: "Keine Einträge gefunden." }) }) : table.getRowModel().rows.map((row) => /* @__PURE__ */ jsx("tr", { className: "border-t odd:bg-green-200 hover:bg-green-400 cursor-pointer", children: row.getVisibleCells().map((cell) => /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: flexRender(cell.column.columnDef.cell, cell.getContext()) }, cell.id)) }, row.id)) })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "border rounded px-2 py-1 text-sm",
            onClick: () => table.setPageIndex(0),
            disabled: !table.getCanPreviousPage(),
            children: "« Erste"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "border rounded px-2 py-1 text-sm",
            onClick: () => table.previousPage(),
            disabled: !table.getCanPreviousPage(),
            children: "‹ Zurück"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "border rounded px-2 py-1 text-sm",
            onClick: () => table.nextPage(),
            disabled: !table.getCanNextPage(),
            children: "Weiter ›"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "border rounded px-2 py-1 text-sm",
            onClick: () => table.setPageIndex(pageCount - 1),
            disabled: !table.getCanNextPage(),
            children: "Letzte »"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "text-sm", children: [
        "Anzahl Datensätze: ",
        total
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxs("span", { children: [
          "Seite ",
          pagination.pageIndex + 1,
          " von ",
          pageCount || 1
        ] }),
        /* @__PURE__ */ jsx(
          "select",
          {
            className: "border rounded px-2 py-1",
            value: pagination.pageSize,
            onChange: (e) => setPagination((old) => ({
              ...old,
              pageSize: Number(e.target.value),
              pageIndex: 0
            })),
            children: [5, 10, 20, 50].map((size) => /* @__PURE__ */ jsxs("option", { value: size, children: [
              size,
              " / Seite"
            ] }, size))
          }
        )
      ] })
    ] })
  ] });
}

function LookupCombobox({
  api,
  value,
  onChange,
  placeholder,
  onAddModeChange
}) {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState(null);
  const effectivePlaceholder = placeholder ?? "Bitte auswählen…";
  useEffect(() => {
    onAddModeChange?.(isAdding);
  }, [isAdding]);
  useEffect(() => {
    async function loadItems() {
      try {
        setError(null);
        const response = await fetch(api);
        if (!response.ok) throw new Error("Fehler beim Laden");
        const data = await response.json();
        setItems(data);
      } catch {
        setError("Daten konnten nicht geladen werden");
      }
    }
    loadItems();
  }, [api]);
  useEffect(() => {
    if (value == null) {
      setSearchTerm("");
      return;
    }
    const selected = items.find((i) => i.id === value);
    if (selected) setSearchTerm(selected.name);
  }, [value, items]);
  useEffect(() => {
    if (isAdding) return;
    if (!searchTerm) {
      setError(null);
      onChange(null);
      return;
    }
    const match = items.find(
      (i) => i.name.toLowerCase() === searchTerm.toLowerCase()
    );
    if (match) {
      setError(null);
      onChange(match.id);
    } else {
      setError(`„${searchTerm}“ ist kein gültiger Wert.`);
      onChange(null);
    }
  }, [searchTerm, items, isAdding]);
  return /* @__PURE__ */ jsxs("div", { className: "form-control w-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative w-full", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            className: "input input-bordered flex-1",
            placeholder: effectivePlaceholder,
            value: isAdding ? newName : searchTerm,
            onChange: (e) => {
              if (isAdding) {
                setNewName(e.target.value);
              } else {
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }
            },
            onClick: () => !isAdding && setIsOpen(!isOpen),
            onBlur: () => !isAdding && setIsOpen(false),
            onKeyDown: async (e) => {
              if (isAdding && e.key === "Enter") {
                e.preventDefault();
                try {
                  setError(null);
                  const response = await fetch(api, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: newName })
                  });
                  if (!response.ok) throw new Error("Fehler beim Speichern");
                  const created = await response.json();
                  setItems((prev) => [...prev, created]);
                  onChange(created.id);
                  setSearchTerm(created.name);
                  setIsAdding(false);
                  setNewName("");
                } catch {
                  setError("Eintrag konnte nicht gespeichert werden");
                }
              }
            }
          }
        ),
        !isAdding && /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: "btn btn-square bg-green-900 text-white text-2xl font-bold rounded-lg",
            onMouseDown: (e) => {
              e.preventDefault();
              setIsAdding(true);
              setIsOpen(false);
              setNewName("");
            },
            children: /* @__PURE__ */ jsx(PlusIcon, { className: "h-5 w-5" })
          }
        ),
        isAdding && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "btn btn-square bg-red-600",
              onMouseDown: (e) => {
                e.preventDefault();
                setIsAdding(false);
                setNewName("");
              },
              children: /* @__PURE__ */ jsx(XMarkIcon, { className: "h-5 w-5 font-bold text-white" })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "btn btn-square bg-green-900",
              onMouseDown: async (e) => {
                e.preventDefault();
                try {
                  setError(null);
                  const response = await fetch(api, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: newName })
                  });
                  if (!response.ok) throw new Error("Fehler beim Speichern");
                  const created = await response.json();
                  setItems((prev) => [...prev, created]);
                  onChange(created.id);
                  setSearchTerm(created.name);
                  setIsAdding(false);
                  setNewName("");
                } catch {
                  setError("Eintrag konnte nicht gespeichert werden");
                }
              },
              children: /* @__PURE__ */ jsx(CheckIcon, { className: "h-5 w-5 font-bold text-white" })
            }
          )
        ] })
      ] }),
      !isAdding && isOpen && /* @__PURE__ */ jsxs(
        "ul",
        {
          className: "menu menu-compact bg-base-100 rounded-box shadow absolute z-10 w-full mt-1 max-h-60 overflow-auto",
          onMouseDown: (e) => e.preventDefault(),
          children: [
            items.filter(
              (item) => item.name.toLowerCase().includes(searchTerm.toLowerCase())
            ).map((item) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => {
                  onChange(item.id);
                  setSearchTerm(item.name);
                  setIsOpen(false);
                },
                children: item.name
              }
            ) }, item.id)),
            items.length === 0 && /* @__PURE__ */ jsx("li", { className: "disabled", children: /* @__PURE__ */ jsx("span", { children: "Keine Einträge gefunden" }) })
          ]
        }
      )
    ] }),
    error && /* @__PURE__ */ jsx("p", { className: "text-error text-sm mt-1", children: error })
  ] });
}

function LookupLabel({ label, isAdding }) {
  const text = isAdding ? `Neue(r) ${label}` : label;
  const bg = isAdding ? "bg-red-300" : "bg-green-200";
  return /* @__PURE__ */ jsx("span", { className: `px-2 py-1 rounded text-sm font-bold ${bg}`, children: text });
}

const EMPTY_FORM = {
  startDate: "",
  endDate: "",
  organizerId: null,
  eventTypeId: null,
  locationId: null,
  timeSlotsId: null,
  notes: ""
};
function EventForm({ event, onSaved, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [isEndDateSynced, setIsEndDateSynced] = useState(true);
  const [isAddingOrganizer, setIsAddingOrganizer] = useState(false);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [isAddingType, setIsAddingType] = useState(false);
  const [isAddingTimeSlot, setIsAddingTimeSlot] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => {
    if (event) {
      setForm({
        startDate: event.startDate ?? "",
        endDate: event.endDate ?? "",
        timeSlotsId: event.timeId ?? null,
        organizerId: event.organizerId ?? null,
        eventTypeId: event.typeId ?? null,
        locationId: event.locationId ?? null,
        notes: event.notes ?? ""
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setSuccessMessage("");
    setErrorMessage("");
  }, [event]);
  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }
  function updateStartDate(value) {
    setForm((f) => {
      const updated = { ...f, startDate: value };
      if (isEndDateSynced) updated.endDate = value;
      return updated;
    });
  }
  function updateEndDate(value) {
    setForm((f) => ({ ...f, endDate: value }));
    setIsEndDateSynced(value === form.startDate);
  }
  async function save() {
    if (!form.startDate) {
      setErrorMessage("Bitte ein Beginndatum eingeben.");
      return;
    }
    if (!form.organizerId) {
      setErrorMessage("Bitte einen Veranstalter auswählen.");
      return;
    }
    if (!form.locationId) {
      setErrorMessage("Bitte einen Veranstaltungsort auswählen.");
      return;
    }
    if (!form.eventTypeId) {
      setErrorMessage("Bitte eine Veranstaltungsart auswählen.");
      return;
    }
    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const method = event ? "PUT" : "POST";
      const url = event ? `/api/events/${event.id}` : `/api/events`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        throw new Error("Fehler beim Speichern");
      }
      setSuccessMessage(event ? "Veranstaltung gespeichert!" : "Veranstaltung hinzugefügt!");
      if (!event) {
        setForm(EMPTY_FORM);
        setIsEndDateSynced(true);
      }
      onSaved();
      setTimeout(() => setSuccessMessage(""), 3e3);
    } catch (err) {
      setErrorMessage("Fehler beim Speichern. Bitte erneut versuchen.");
    } finally {
      setIsSaving(false);
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "bg-green-200 p-4 rounded-lg shadow space-y-4", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold", children: event ? "Veranstaltung bearbeiten" : "Neue Veranstaltung eingeben" }),
    successMessage && /* @__PURE__ */ jsxs("div", { className: "alert alert-success text-sm py-2", children: [
      "✅ ",
      successMessage
    ] }),
    errorMessage && /* @__PURE__ */ jsxs("div", { className: "alert alert-error text-sm py-2", children: [
      "❌ ",
      errorMessage
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "label", children: /* @__PURE__ */ jsx("span", { className: "px-2 py-1 text-black rounded text-sm font-bold", children: "Beginndatum" }) }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "date",
              className: "input input-bordered w-full",
              value: form.startDate,
              onChange: (e) => updateStartDate(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "label", children: /* @__PURE__ */ jsx("span", { className: "px-2 py-1 text-black rounded text-sm font-bold", children: "Enddatum" }) }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "date",
              className: "input input-bordered w-full",
              value: form.endDate,
              onChange: (e) => updateEndDate(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(LookupLabel, { label: "Beginn-Uhrzeit", isAdding: isAddingTimeSlot }),
          /* @__PURE__ */ jsx(
            LookupCombobox,
            {
              api: "/api/lookups/timeSlots",
              value: form.timeSlotsId,
              onChange: (id) => update("timeSlotsId", id),
              onAddModeChange: setIsAddingTimeSlot
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx(LookupLabel, { label: "Veranstalter", isAdding: isAddingOrganizer }),
      /* @__PURE__ */ jsx(
        LookupCombobox,
        {
          api: "/api/lookups/organizers",
          value: form.organizerId,
          onChange: (id) => update("organizerId", id),
          onAddModeChange: setIsAddingOrganizer
        }
      ),
      /* @__PURE__ */ jsx(LookupLabel, { label: "Veranstaltungsart", isAdding: isAddingType }),
      /* @__PURE__ */ jsx(
        LookupCombobox,
        {
          api: "/api/lookups/eventTypes",
          value: form.eventTypeId,
          onChange: (id) => update("eventTypeId", id),
          onAddModeChange: setIsAddingType
        }
      ),
      /* @__PURE__ */ jsx(LookupLabel, { label: "Veranstaltungsort", isAdding: isAddingLocation }),
      /* @__PURE__ */ jsx(
        LookupCombobox,
        {
          api: "/api/lookups/locations",
          value: form.locationId,
          onChange: (id) => update("locationId", id),
          onAddModeChange: setIsAddingLocation
        }
      ),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "label", children: /* @__PURE__ */ jsx("span", { className: "px-2 py-1 rounded text-sm font-bold text-black", children: "Bemerkungen" }) }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            className: "textarea textarea-bordered w-full",
            rows: 3,
            value: form.notes,
            onChange: (e) => update("notes", e.target.value)
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2 justify-center pt-4", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "btn bg-green-800 text-white font-bold text-base rounded-lg w-48 h-12",
          onClick: save,
          disabled: isSaving,
          children: isSaving ? "Speichere..." : event ? "Speichern" : "Hinzufügen"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "btn bg-red-800 text-white font-bold text-base rounded-lg w-48 h-12",
          onClick: onCancel,
          disabled: isSaving,
          children: "Abbrechen"
        }
      )
    ] })
  ] });
}

function useConfirm() {
  const [options, setOptions] = useState(null);
  function confirm(message) {
    return new Promise((resolve) => {
      setOptions({ message, resolve });
    });
  }
  function ConfirmModal() {
    if (!options) return null;
    return /* @__PURE__ */ jsx("dialog", { open: true, className: "modal", children: /* @__PURE__ */ jsxs("div", { className: "modal-box", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-lg mb-4", children: "Bestätigung" }),
      /* @__PURE__ */ jsx("p", { className: "mb-6 whitespace-pre-line", children: options.message }),
      /* @__PURE__ */ jsxs("div", { className: "modal-action", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "btn btn-error",
            onClick: () => {
              options.resolve(true);
              setOptions(null);
            },
            children: "OK"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "btn",
            onClick: () => {
              options.resolve(false);
              setOptions(null);
            },
            children: "Abbrechen"
          }
        )
      ] })
    ] }) });
  }
  return { confirm, ConfirmModal };
}

function EventsAdminPage() {
  const [editingEvent, setEditingEvent] = useState(null);
  const [reload, setReload] = useState(0);
  const { confirm, ConfirmModal } = useConfirm();
  return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
    /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
      EventsTable,
      {
        reload,
        onEdit: async (ev) => {
          const res = await fetch(`/api/events/${ev.id}`);
          const fullEvent = await res.json();
          setEditingEvent(fullEvent);
        },
        onDelete: async (ev) => {
          const ok = await confirm(
            `Soll das Event wirklich gelöscht werden?

ID: ${ev.id}
Datum: ${ev.startDate} – ${ev.endDate ?? ""}
Organisator: ${ev.organizer ?? "-"}
Ort: ${ev.location ?? "-"}
Typ: ${ev.type ?? "-"}
Zeit: ${ev.timeSlot ?? "-"}`
          );
          if (!ok) return;
          await fetch(`/api/events/${ev.id}`, { method: "DELETE" });
          setReload((r) => r + 1);
        }
      }
    ) }),
    /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
      EventForm,
      {
        event: editingEvent,
        onSaved: () => {
          setEditingEvent(null);
          setReload((r) => r + 1);
        },
        onCancel: () => setEditingEvent(null)
      }
    ) }),
    /* @__PURE__ */ jsx(ConfirmModal, {})
  ] });
}

const prerender = false;
const $$Events = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Eventverwaltung" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "EventsAdminPage", EventsAdminPage, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/dieter/dev/evmastro/src/components/events/EventsAdminPage", "client:component-export": "EventsAdminPage" })} ` })}`;
}, "/home/dieter/dev/evmastro/src/pages/admin/events.astro", void 0);

const $$file = "/home/dieter/dev/evmastro/src/pages/admin/events.astro";
const $$url = "/admin/events";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Events,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
