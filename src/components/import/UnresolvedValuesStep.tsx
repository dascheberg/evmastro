import React, { useState } from "react";
import type { UnresolvedItem } from "../../store/importTypes";

// ── Hilfsfunktionen ───────────────────────────────────────────────────────────

const FIELD_LABELS: Record<string, string> = {
  timeSlot: "Uhrzeit",
  location: "Veranstaltungsort",
  eventType: "Veranstaltungsart",
};

const API_MAP: Record<string, string> = {
  timeSlot: "/api/lookups/timeSlots",
  location: "/api/lookups/locations",
  eventType: "/api/lookups/eventTypes",
};

// ── Typen ─────────────────────────────────────────────────────────────────────

type Decision = "add" | "discard" | null;

type Props = {
  unresolvedItems: UnresolvedItem[];
  onComplete: (
    decisions: Record<string, Decision>,
    newIds: Record<string, number>
  ) => void;
  onBack: () => void;
};

// ── Komponente ────────────────────────────────────────────────────────────────

export default function UnresolvedValuesStep({
  unresolvedItems,
  onComplete,
  onBack,
}: Props) {
  // Entscheidung pro Item: key = "field::value"
  const [decisions, setDecisions] = useState<Record<string, Decision>>(() =>
    Object.fromEntries(
      unresolvedItems.map((item) => [`${item.field}::${item.value}`, null])
    )
  );

  // Neu angelegte IDs: key = "field::value" → id
  const [newIds, setNewIds] = useState<Record<string, number>>({});

  // Lade-Status pro Item
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Alle entschieden?
  const allDecided = unresolvedItems.every(
    (item) => decisions[`${item.field}::${item.value}`] !== null
  );

  // Gruppiert nach Feldtyp
  const grouped = unresolvedItems.reduce((acc, item) => {
    if (!acc[item.field]) acc[item.field] = [];
    acc[item.field].push(item);
    return acc;
  }, {} as Record<string, UnresolvedItem[]>);

  // ── Wert in Lookup-Tabelle anlegen ────────────────────────────────────────

  async function handleAdd(item: UnresolvedItem) {
    const key = `${item.field}::${item.value}`;
    setLoading((l) => ({ ...l, [key]: true }));
    setErrors((e) => ({ ...e, [key]: "" }));

    try {
      const res = await fetch(API_MAP[item.field], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: item.value }),
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

  // ── Event verwerfen ───────────────────────────────────────────────────────

  function handleDiscard(item: UnresolvedItem) {
    const key = `${item.field}::${item.value}`;
    setDecisions((d) => ({ ...d, [key]: "discard" }));
    // Neu angelegte ID ggf. entfernen falls vorher "Anlegen" geklickt wurde
    setNewIds((ids) => {
      const updated = { ...ids };
      delete updated[key];
      return updated;
    });
  }

  // ── Entscheidung rückgängig machen ────────────────────────────────────────

  function handleReset(item: UnresolvedItem) {
    const key = `${item.field}::${item.value}`;
    setDecisions((d) => ({ ...d, [key]: null }));
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
        <h2 className="text-xl font-bold text-yellow-800 mb-1">
          ⚠️ Unbekannte Werte gefunden
        </h2>
        <p className="text-sm text-yellow-700">
          Die folgenden Werte aus deiner Import-Datei wurden in den Lookup-Tabellen
          nicht gefunden. Entscheide für jeden Wert ob er angelegt oder die
          betroffenen Events verworfen werden sollen.
        </p>
      </div>

      {Object.entries(grouped).map(([field, items]) => (
        <div key={field} className="space-y-3">

          {/* Gruppen-Überschrift */}
          <h3 className="font-semibold text-gray-700 border-b pb-1">
            {FIELD_LABELS[field] ?? field}
          </h3>

          {items.map((item) => {
            const key = `${item.field}::${item.value}`;
            const decision = decisions[key];
            const isLoading = loading[key];
            const error = errors[key];

            return (
              <div
                key={key}
                className={`rounded-lg border p-4 flex items-center justify-between gap-4 ${decision === "add" ? "bg-green-50 border-green-300" :
                    decision === "discard" ? "bg-red-50 border-red-300" :
                      "bg-white border-gray-200"
                  }`}
              >
                {/* Linke Seite: Wert + betroffene Events */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800 truncate">
                    „{item.value}"
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {item.affectedRows.length} betroffene(s) Event(s)
                  </div>
                  {error && (
                    <div className="text-xs text-red-600 mt-1">{error}</div>
                  )}
                  {decision === "add" && (
                    <div className="text-xs text-green-700 mt-1">
                      ✅ Wird angelegt
                    </div>
                  )}
                  {decision === "discard" && (
                    <div className="text-xs text-red-700 mt-1">
                      ❌ {item.affectedRows.length} Event(s) werden verworfen
                    </div>
                  )}
                </div>

                {/* Rechte Seite: Buttons */}
                <div className="flex gap-2 shrink-0">
                  {decision === null ? (
                    <>
                      <button
                        className="btn btn-sm bg-green-700 text-white"
                        onClick={() => handleAdd(item)}
                        disabled={isLoading}
                      >
                        {isLoading ? "Anlegen…" : "✅ Anlegen"}
                      </button>
                      <button
                        className="btn btn-sm bg-red-600 text-white"
                        onClick={() => handleDiscard(item)}
                      >
                        ❌ Verwerfen
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn btn-sm btn-ghost text-gray-500"
                      onClick={() => handleReset(item)}
                    >
                      Rückgängig
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          onClick={onBack}
        >
          Zurück
        </button>
        <button
          className={`px-6 py-2 rounded-md shadow transition ${allDecided
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          disabled={!allDecided}
          onClick={() => onComplete(decisions, newIds)}
        >
          Weiter
        </button>
      </div>
    </div>
  );
}
