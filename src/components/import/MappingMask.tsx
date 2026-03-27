import React, { useEffect } from "react";
import type { Row, Mapping } from "../../store/importTypes";
import { useImportStore } from "../../store/useImportStore";
import StepButtons from "../utils/import/StepButtons";

const REQUIRED_FIELDS_SINGLE = ["startDate", "eventType", "location", "timeSlot"];
const REQUIRED_FIELDS_MULTI = ["startDate", "eventType", "location", "timeSlot", "organizer"];

const FIELD_LABELS: Record<string, string> = {
  startDate: "Beginndatum",
  endDate: "Ende-Datum",
  timeSlot: "Startzeit",
  location: "Veranstaltungsort",
  eventType: "Veranstaltungsart",
  organizer: "Veranstalter",   // NEU
  notes: "Bemerkungen",
  ignore: "Ignorieren",
};

interface MappingMaskProps {
  rows: Row[];
  multiMode: boolean;
  onComplete: (mapping: Mapping) => void;
  onBack: () => void;
}

export default function MappingMask({ rows, multiMode, onComplete, onBack }: MappingMaskProps) {
  const { mapping, setMapping } = useImportStore();

  const columns = rows[0] ?? [];
  const previewRows = rows.slice(0, 3);

  const REQUIRED_FIELDS = multiMode ? REQUIRED_FIELDS_MULTI : REQUIRED_FIELDS_SINGLE;

  const allMapped = REQUIRED_FIELDS.every((field) =>
    Object.values(mapping).includes(field)
  );

  const isFieldTaken = (field: string) =>
    Object.values(mapping).includes(field);

  const handleSelect = (colIndex: number, field: string) => {
    setMapping({ ...mapping, [colIndex]: field });
  };

  // Alle verfügbaren Felder für das Dropdown
  const availableFields = Object.entries(FIELD_LABELS).filter(([field]) => {
    // "organizer" nur im Multi-Modus anzeigen
    if (field === "organizer" && !multiMode) return false;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-12">

      {multiMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800">
          ℹ️ <strong>Mehrere Veranstalter:</strong> Bitte die Spalte mit den Veranstalternamen dem Feld <strong>Veranstalter</strong> zuordnen.
        </div>
      )}

      {/* Vorschau */}
      <div className="rounded-lg border-1 border-black bg-white shadow-sm overflow-x-auto">
        <table className="min-w-full table-fixed border border-black text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="w-[160px]"></th>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-4 py-2 text-left font-medium text-gray-700 ${idx === columns.length - 1 ? "w-auto" : "w-[120px]"}`}
                >
                  Spalte {idx + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewRows.map((row, rIdx) => (
              <tr key={rIdx} className="border-b last:border-0">
                <td className="w-[160px]"></td>
                {row.map((cell, cIdx) => (
                  <td
                    key={cIdx}
                    className={`px-4 py-2 whitespace-nowrap border-r last:border-r-0 ${cIdx === columns.length - 1 ? "w-auto" : "w-[120px]"}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mapping */}
        <div className="rounded-lg border bg-white shadow-sm overflow-x-auto mt-6">
          <table className="min-w-full table-fixed text-sm">
            <thead className="bg-gray-50 border-b border-gray-300">
              <tr>
                <th className="w-[160px] px-4 py-2 text-left font-semibold sticky left-0 bg-gray-50 z-10 border-r">
                  Feld
                </th>
                {columns.map((_, idx) => (
                  <th
                    key={idx}
                    className={`px-4 py-2 text-center font-semibold border-r last:border-r-0 ${idx === columns.length - 1 ? "w-auto" : "w-[120px]"}`}
                  >
                    Spalte {idx + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {availableFields.map(([field, label]) => {
                const isRequired = REQUIRED_FIELDS.includes(field);
                const isMapped = isFieldTaken(field);
                return (
                  <tr
                    key={field}
                    className={`border-b last:border-0 ${isRequired && !isMapped ? "bg-red-50" : ""}`}
                  >
                    <td className="w-[160px] px-4 py-2 font-medium sticky left-0 bg-white z-10 border-r">
                      {label}
                      {isRequired && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </td>
                    {columns.map((_, colIdx) => {
                      const currentField = mapping[colIdx];
                      const isSelected = currentField === field;
                      return (
                        <td key={colIdx} className="px-4 py-2 text-center border-r last:border-r-0">
                          <input
                            type="radio"
                            name={`field-${field}`}
                            checked={isSelected}
                            onChange={() => handleSelect(colIdx, field)}
                            className="h-4 w-4 accent-green-800"
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {!allMapped && (
        <p className="text-sm text-red-600 text-center">
          Bitte alle Pflichtfelder zuordnen (markiert mit *).
        </p>
      )}

      <StepButtons
        onBack={onBack}
        onNext={() => onComplete(mapping)}
        nextEnabled={allMapped}
      />
    </div>
  );
}
