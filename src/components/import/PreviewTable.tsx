import React from "react";
import type { Event } from "../../store/importTypes";

interface PreviewTableProps {
  events: Event[];
  onBack: () => void;
  onConfirm: () => void;
}

export default function PreviewTable({ events, onBack, onConfirm }: PreviewTableProps) {
  if (!events || events.length === 0) {
    return (
      <div className="space-y-6">
        <p className="text-gray-600">Keine Daten vorhanden.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Zurück
        </button>
      </div>
    );
  }

  const columns = [
    { key: "startDate", label: "Startdatum" },
    { key: "endDate", label: "Enddatum" },
    { key: "timeSlot", label: "Startzeit" },
    { key: "location", label: "Ort" },
    { key: "eventType", label: "Art" },
    { key: "notes", label: "Notizen" },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800">
        Vorschau der importierten Events
      </h2>
      <p className="text-green-900 text-white">
        {events.length} Datensätze bereit zum Import
      </p>

      {/* Tabelle */}
      <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-sm bg-white">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-gray-100 border-b border-gray-300">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-2 text-left font-semibold text-gray-700 border-r last:border-r-0"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {events.map((ev, idx) => (
              <tr key={idx} className="border-b border-gray-200">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-2 border-r last:border-r-0 whitespace-nowrap"
                  >
                    {String(ev[col.key as keyof Event] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Zurück
        </button>

        <button
          onClick={onConfirm}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Weiter
        </button>
      </div>
    </div>
  );
}
