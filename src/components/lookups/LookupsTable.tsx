import React, { useEffect, useState } from "react";
import { ErrorModal } from "../ErrorModal";
import {
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";

// ── Typen ──────────────────────────────────────────────────────────────────────

type LookupItem = {
  id: number;
  name: string;
};

type SortState = {
  by: "id" | "name";
  dir: "asc" | "desc";
};

type Props = {
  api: string;    // z.B. "/api/lookups/organizers"
  title: string;  // z.B. "Veranstalter" – nur für aria-label / Accessibility
};

// ── Komponente ─────────────────────────────────────────────────────────────────

export function LookupTable({ api, title }: Props) {

  // Daten
  const [items, setItems] = useState<LookupItem[]>([]);
  const [search, setSearch] = useState("");

  // Bearbeiten
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  // Löschen
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Neu anlegen
  const [isAdding, setIsAdding] = useState(false);
  const [newValue, setNewValue] = useState("");

  // Fehler
  const [errorMessage, setErrorMessage] = useState("");

  // Sortierung
  const [sort, setSort] = useState<SortState>({ by: "name", dir: "asc" });

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ── Berechnete Werte ──────────────────────────────────────────────────────

  const sortedItems = [...items].sort((a, b) => {
    const field = sort.by;
    if (a[field] < b[field]) return sort.dir === "asc" ? -1 : 1;
    if (a[field] > b[field]) return sort.dir === "asc" ? 1 : -1;
    return 0;
  });

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const visibleItems = sortedItems.slice(start, end);
  const pageCount = Math.ceil(sortedItems.length / pageSize);

  // ── Daten laden ───────────────────────────────────────────────────────────

  useEffect(() => {
    const url = search
      ? `${api}?search=${encodeURIComponent(search)}`
      : api;

    fetch(url)
      .then((r) => r.json())
      .then((data) => setItems(data))
      .catch((err) => console.error("Lookup fetch error", err));
  }, [search, api]);

  // ── Sortier-Toggle ────────────────────────────────────────────────────────

  function toggleSort(by: "id" | "name") {
    setSort((old) => ({
      by,
      dir: old.by === by && old.dir === "asc" ? "desc" : "asc",
    }));
  }

  function sortIcon(by: "id" | "name") {
    if (sort.by !== by) return "";
    return sort.dir === "asc" ? " ▲" : " ▼";
  }

  // ── Bearbeiten ────────────────────────────────────────────────────────────

  async function saveEdit() {
    const name = editValue.trim();

    if (!name) {
      setErrorMessage("Bitte einen Namen eingeben.");
      return;
    }
    if (items.some((o) => o.id !== editingId && o.name.toLowerCase() === name.toLowerCase())) {
      setErrorMessage("Dieser Name existiert bereits.");
      return;
    }

    const res = await fetch(`${api}/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const updated = await res.json();

    setItems((old) =>
      old
        .map((o) => (o.id === editingId ? updated : o))
        .sort((a, b) => a.name.localeCompare(b.name))
    );
    setEditingId(null);
  }

  // ── Löschen ───────────────────────────────────────────────────────────────

  async function confirmDelete(id: number) {
    const res = await fetch(`${api}/${id}`, { method: "DELETE", headers: { "Content-Type": "application/json" } });

    if (!res.ok) {
      const data = await res.json();
      setErrorMessage(data.error);
      setDeletingId(null);
      return;
    }

    setItems((old) => old.filter((o) => o.id !== id));
    setDeletingId(null);
  }

  // ── Neu anlegen ───────────────────────────────────────────────────────────

  async function saveNew() {
    const name = newValue.trim();

    if (!name) {
      setErrorMessage("Bitte einen Namen eingeben.");
      return;
    }
    if (items.some((o) => o.name.toLowerCase() === name.toLowerCase())) {
      setErrorMessage("Dieser Name existiert bereits.");
      return;
    }

    const res = await fetch(api, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const created = await res.json();

    setItems((old) =>
      [...old, created].sort((a, b) => a.name.localeCompare(b.name))
    );
    setNewValue("");
    setIsAdding(false);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">

      {/* Suchfeld + Neu-Button */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Suche..."
          className="border rounded px-2 py-1 w-3/5"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label={`${title} suchen`}
        />
        {!isAdding && (
          <button
            className="btn btn-sm bg-green-500 rounded-lg h-10"
            onClick={() => setIsAdding(true)}
          >
            <PlusIcon className="h-5 w-5" />
            <span className="text-base ml-1">Neuer Eintrag</span>
          </button>
        )}
      </div>

      {/* Tabelle */}
      <table className="table table-compact border-1 w-full">
        <thead className="font-bold border-b-2 text-black text-base">
          <tr>
            <th
              className="cursor-pointer select-none"
              onClick={() => toggleSort("id")}
            >
              ID{sortIcon("id")}
            </th>
            <th
              className="cursor-pointer select-none"
              onClick={() => toggleSort("name")}
            >
              Name{sortIcon("name")}
            </th>
            <th />
          </tr>
        </thead>
        <tbody>
          {visibleItems.map((o) => (
            <tr
              key={o.id}
              className="border-t odd:bg-green-200 hover:bg-green-400 cursor-pointer"
            >
              <td className="w-12">{o.id}</td>

              <td>
                {editingId === o.id ? (
                  <input
                    type="text"
                    className="border rounded px-1 py-0.5 w-full"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                    autoFocus
                  />
                ) : (
                  o.name
                )}
              </td>

              <td className="w-24 text-right">
                <div className="flex gap-1 justify-end">
                  {editingId === o.id ? (
                    <>
                      <button className="btn btn-xs" onClick={saveEdit}>
                        <CheckIcon className="h-5 w-5 text-green-700" />
                      </button>
                      <button className="btn btn-xs" onClick={() => setEditingId(null)}>
                        <XMarkIcon className="h-5 w-5 text-red-600" />
                      </button>
                    </>
                  ) : deletingId === o.id ? (
                    <>
                      <button className="btn btn-xs" onClick={() => confirmDelete(o.id)}>
                        <CheckIcon className="h-5 w-5 text-green-700" />
                      </button>
                      <button className="btn btn-xs" onClick={() => setDeletingId(null)}>
                        <XMarkIcon className="h-5 w-5 text-red-600" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn btn-xs"
                        onClick={() => {
                          setEditingId(o.id);
                          setEditValue(o.name);
                        }}
                      >
                        <PencilIcon className="h-5 w-5 text-red-400" />
                      </button>
                      <button
                        className="btn btn-xs"
                        onClick={() => setDeletingId(o.id)}
                      >
                        <TrashIcon className="h-5 w-5 text-blue-600" />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}

          {visibleItems.length === 0 && (
            <tr>
              <td colSpan={3} className="text-center text-gray-400 py-4 text-sm">
                Keine Einträge gefunden.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Neu-Zeile */}
      {isAdding && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="border rounded px-2 py-1 flex-1"
            placeholder="Neuer Name..."
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveNew()}
            autoFocus
          />
          <button className="btn btn-sm" onClick={saveNew}>
            <CheckIcon className="h-5 w-5 text-green-700" />
          </button>
          <button
            className="btn btn-sm"
            onClick={() => { setIsAdding(false); setNewValue(""); }}
          >
            <XMarkIcon className="h-5 w-5 text-red-600" />
          </button>
        </div>
      )}

      {/* Pagination */}
      <div className="grid grid-cols-2 items-center mt-2 mx-2">

        {/* Zeilen pro Seite */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-800 whitespace-nowrap">
            Zeilen p. Seite:
          </label>
          <select
            className="select select-sm"
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-end gap-4">
          <button
            className="btn btn-sm bg-green-900 text-white"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>

          <span className="text-sm">
            Seite {page} / {pageCount || 1}
          </span>

          <button
            className="btn btn-sm bg-green-900 text-white"
            disabled={end >= sortedItems.length}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ErrorModal
        message={errorMessage}
        onClose={() => setErrorMessage("")}
      />
    </div>
  );
}
