import React, { useEffect, useState } from "react";

// ── Typen ─────────────────────────────────────────────────────────────────────

type DuplicateResult = {
  inputIndex: number;
  existingEvent: {
    id: number;
    startDate: string;
    organizerName: string;
    locationName: string;
    typeName: string;
    timeSlotName: string | null;
  };
};

type Decision = "keep" | "discard";

type Props = {
  duplicates: DuplicateResult[];
  onComplete: (discardedIndices: number[]) => void;
  onBack: () => void;
};

// ── Komponente ────────────────────────────────────────────────────────────────

export default function DuplicatesStep({ duplicates, onComplete, onBack }: Props) {

  // Standardmäßig alle Duplikate auf "discard" setzen
  const [decisions, setDecisions] = useState<Record<number, Decision>>(() =>
    Object.fromEntries(duplicates.map((d) => [d.inputIndex, "discard"]))
  );

  const allDecided = duplicates.every(
    (d) => decisions[d.inputIndex] !== undefined
  );

  function setDecision(inputIndex: number, decision: Decision) {
    setDecisions((prev) => ({ ...prev, [inputIndex]: decision }));
  }

  function handleComplete() {
    const discarded = duplicates
      .filter((d) => decisions[d.inputIndex] === "discard")
      .map((d) => d.inputIndex);
    onComplete(discarded);
  }

  // Alle behalten / alle verwerfen
  function setAll(decision: Decision) {
    setDecisions(
      Object.fromEntries(duplicates.map((d) => [d.inputIndex, decision]))
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      <div className="bg-orange-50 border border-orange-300 rounded-lg p-4">
        <h2 className="text-xl font-bold text-orange-800 mb-1">
          ⚠️ Mögliche Duplikate gefunden
        </h2>
        <p className="text-sm text-orange-700">
          {duplicates.length} Event{duplicates.length !== 1 ? "s" : ""} in deiner
          Import-Datei {duplicates.length !== 1 ? "scheinen" : "scheint"} bereits
          in der Datenbank zu existieren. Entscheide für jedes ob es importiert
          oder übersprungen werden soll.
        </p>
      </div>

      {/* Alle auf einmal entscheiden */}
      <div className="flex gap-2">
        <button
          className="btn btn-sm bg-red-600 text-white"
          onClick={() => setAll("discard")}
        >
          Alle überspringen
        </button>
        <button
          className="btn btn-sm bg-green-700 text-white"
          onClick={() => setAll("keep")}
        >
          Alle importieren
        </button>
      </div>

      {/* Einzelne Entscheidungen */}
      <div className="space-y-3">
        {duplicates.map((dup) => {
          const decision = decisions[dup.inputIndex];
          return (
            <div
              key={dup.inputIndex}
              className={`rounded-lg border p-4 space-y-2 ${decision === "discard"
                ? "bg-red-50 border-red-200"
                : "bg-green-50 border-green-200"
                }`}
            >
              <div className="flex items-start justify-between gap-4">

                {/* Linke Seite: Info */}
                <div className="space-y-2 flex-1 min-w-0">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    Import-Zeile #{dup.inputIndex + 1}
                  </p>

                  <div className="text-sm font-medium text-gray-800">
                    Bereits in DB vorhanden:
                  </div>

                  <div className="bg-white rounded border p-2 text-sm space-y-0.5">
                    <div className="font-medium">
                      {new Date(dup.existingEvent.startDate).toLocaleDateString("de-DE", {
                        weekday: "short",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                      {dup.existingEvent.timeSlotName && ` · ${dup.existingEvent.timeSlotName} Uhr`}
                    </div>
                    <div>{dup.existingEvent.typeName}</div>
                    <div className="text-xs text-gray-500">
                      {dup.existingEvent.organizerName} · {dup.existingEvent.locationName}
                    </div>
                    <a
                      href={`/events/${dup.existingEvent.id}`}
                      target="_blank"
                      className="text-xs text-blue-600 underline"
                    >
                      → Event #{dup.existingEvent.id} ansehen
                    </a>
                  </div>
                </div>

                {/* Rechte Seite: Buttons */}
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    className={`btn btn-sm ${decision === "keep"
                      ? "bg-green-700 text-white"
                      : "btn-outline"
                      }`}
                    onClick={() => setDecision(dup.inputIndex, "keep")}
                  >
                    ✅ Importieren
                  </button>
                  <button
                    className={`btn btn-sm ${decision === "discard"
                      ? "bg-red-600 text-white"
                      : "btn-outline"
                      }`}
                    onClick={() => setDecision(dup.inputIndex, "discard")}
                  >
                    ❌ Überspringen
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Zusammenfassung */}
      <div className="bg-gray-50 rounded-lg border p-3 text-sm text-gray-600">
        <span className="font-medium">
          {Object.values(decisions).filter((d) => d === "keep").length}
        </span> werden importiert,{" "}
        <span className="font-medium">
          {Object.values(decisions).filter((d) => d === "discard").length}
        </span> werden übersprungen.
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <button
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          onClick={onBack}
        >
          Zurück
        </button>
        <button
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={handleComplete}
        >
          Weiter
        </button>
      </div>
    </div>
  );
}
