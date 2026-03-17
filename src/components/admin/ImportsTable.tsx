import React, { useEffect, useState } from "react";
import { TrashIcon, ArrowUturnLeftIcon } from "@heroicons/react/24/solid";

// ── Typen ─────────────────────────────────────────────────────────────────────

type ImportLogEntry = {
  id: number;
  createdAt: string;
  importedCount: number;
  remainingCount: number;
  alreadyDeleted: boolean;
};

// ── Komponente ────────────────────────────────────────────────────────────────

export function ImportsTable() {
  const [logs, setLogs] = useState<ImportLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Bestätigung
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Daten laden ───────────────────────────────────────────────────────────

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

  useEffect(() => { loadLogs(); }, []);

  function showSuccess(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 4000);
  }

  // ── Import rückgängig machen ──────────────────────────────────────────────

  async function confirmUndo(id: number) {
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

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return <div className="p-4 text-gray-500">Lade Import-Übersicht…</div>;
  }

  return (
    <div className="space-y-4">

      {/* Meldungen */}
      {success && (
        <div className="alert alert-success text-sm py-2">{success}</div>
      )}
      {error && (
        <div className="alert alert-error text-sm py-2">
          ❌ {error}
          <button className="ml-2 underline" onClick={() => setError("")}>
            Schließen
          </button>
        </div>
      )}

      {logs.length === 0 ? (
        <div className="p-8 text-center text-gray-400 bg-white rounded border">
          Noch keine Imports vorhanden.
        </div>
      ) : (
        <table className="table table-compact w-full border-1">
          <thead className="font-bold border-b-2 text-black text-base">
            <tr>
              <th className="w-12">#</th>
              <th>Datum / Uhrzeit</th>
              <th className="text-center">Importiert</th>
              <th className="text-center">Noch vorhanden</th>
              <th className="text-center">Status</th>
              <th className="w-48">Aktion</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <React.Fragment key={log.id}>

                {/* Hauptzeile */}
                <tr className={`border-t ${log.alreadyDeleted
                    ? "bg-gray-50 opacity-60"
                    : "odd:bg-green-100 hover:bg-green-200"
                  }`}>
                  <td className="px-3 py-2 text-gray-400 text-sm">
                    {log.id}
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium">
                      {new Date(log.createdAt).toLocaleDateString("de-DE")}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(log.createdAt).toLocaleTimeString("de-DE", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })} Uhr
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className="font-semibold">
                      {log.importedCount}
                    </span>
                    <span className="text-gray-400 text-xs ml-1">Events</span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    {log.alreadyDeleted ? (
                      <span className="text-gray-400 text-sm">–</span>
                    ) : (
                      <>
                        <span className={`font-semibold ${log.remainingCount < log.importedCount
                            ? "text-orange-600"
                            : "text-green-700"
                          }`}>
                          {log.remainingCount}
                        </span>
                        <span className="text-gray-400 text-xs ml-1">
                          / {log.importedCount}
                        </span>
                      </>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {log.alreadyDeleted ? (
                      <span className="badge badge-ghost text-xs">
                        Bereits gelöscht
                      </span>
                    ) : log.remainingCount < log.importedCount ? (
                      <span className="badge badge-warning text-xs">
                        Teilweise gelöscht
                      </span>
                    ) : (
                      <span className="badge badge-success text-xs">
                        Vollständig
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {!log.alreadyDeleted && (
                      <>
                        {deletingId === log.id ? (
                          <div className="flex gap-2">
                            <button
                              className="btn btn-xs bg-red-600 text-white"
                              onClick={() => confirmUndo(log.id)}
                              disabled={deleteLoading}
                            >
                              {deleteLoading ? "Läuft…" : "Ja, löschen"}
                            </button>
                            <button
                              className="btn btn-xs btn-ghost"
                              onClick={() => setDeletingId(null)}
                              disabled={deleteLoading}
                            >
                              Abbrechen
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn btn-sm btn-ghost text-orange-600 gap-1"
                            onClick={() => setDeletingId(log.id)}
                            title="Diesen Import rückgängig machen"
                          >
                            <ArrowUturnLeftIcon className="h-4 w-4" />
                            Rückgängig
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>

                {/* Bestätigungs-Zeile */}
                {deletingId === log.id && (
                  <tr className="bg-red-50">
                    <td colSpan={6} className="px-3 py-3">
                      <p className="text-sm text-red-700">
                        ⚠️ Sollen wirklich alle <strong>{log.remainingCount} noch vorhandenen Events</strong> dieses Imports
                        vom <strong>{new Date(log.createdAt).toLocaleDateString("de-DE")}</strong> gelöscht werden?
                        Diese Aktion kann nicht rückgängig gemacht werden.
                      </p>
                    </td>
                  </tr>
                )}

              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}

      <p className="text-xs text-gray-400">
        * "Teilweise gelöscht" bedeutet dass einzelne Events nach dem Import manuell gelöscht wurden.
        Ein Rückgängigmachen löscht alle verbleibenden Events dieses Imports.
      </p>
    </div>
  );
}
