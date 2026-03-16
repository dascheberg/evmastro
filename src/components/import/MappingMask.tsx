import React, { useEffect } from "react";
import type { Row, Mapping } from "../../store/importTypes";
import { useImportStore } from "../../store/useImportStore";
import StepButtons from "../utils/import/StepButtons";

const REQUIRED_FIELDS = ["startDate", "eventType", "location", "timeSlot"];

const FIELD_LABELS: Record<string, string> = {
  startDate: "Beginndatum",
  endDate: "Ende-Datum",
  timeSlot: "Startzeit",
  location: "Veranstaltungsort",
  eventType: "Veranstaltungsart",
  notes: "Bemerkungen",
  ignore: "Ignorieren",
};

interface MappingMaskProps {
  rows: Row[];
  onComplete: (mapping: Mapping) => void;
  onBack: () => void;
}

export default function MappingMask({ rows, onComplete, onBack }: MappingMaskProps) {
  const { mapping, setMapping } = useImportStore();

  const columns = rows[0] ?? [];
  const previewRows = rows.slice(0, 3);

  const allMapped = Object.values(mapping).every((v) => v !== null);

  const isFieldTaken = (field: string) =>
    Object.values(mapping).includes(field);

  const handleSelect = (colIndex: number, field: string) => {
    setMapping({
      ...mapping,
      [colIndex]: field,
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Vorschau */}
      <div className="rounded-lg border-1 border-black bg-white shadow-sm overflow-x-auto">
        <table className="min-w-full table-fixed border border-black text-sm">
          <thead className="bg-gray-100">
            <tr>
              {/* Dummy-Spalte für Ausrichtung */}
              <th className="w-[160px] "></th>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-4 py-2 text-left font-medium text-gray-700 ${idx === columns.length - 1 ? "w-auto" : "w-[120px]"
                    }`}
                >
                  Spalte {idx + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewRows.map((row, rIdx) => (
              <tr key={rIdx} className="border-b last:border-0">
                {/* Dummy-Spalte */}
                <td className="w-[160px] "></td>
                {row.map((cell, cIdx) => (
                  <td
                    key={cIdx}
                    className={`px-4 py-2 whitespace-nowrap border-r last:border-r-0 ${cIdx === columns.length - 1 ? "w-auto" : "w-[120px]"
                      }`}
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
                    className={`px-4 py-2 text-center font-semibold border-r last:border-r-0 ${idx === columns.length - 1 ? "w-auto" : "w-[120px]"
                      }`}
                  >
                    Spalte {idx + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.keys(FIELD_LABELS).map((field) => (
                <tr key={field} className="border-b last:border-0">
                  {/* Sticky Feldname */}
                  <td className="w-[160px] px-4 py-3 font-medium sticky left-0 bg-gray-50 z-10 border-r">
                    {FIELD_LABELS[field]}
                  </td>
                  {columns.map((_, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-2 py-3 text-center border-r last:border-r-0 ${colIndex === columns.length - 1 ? "w-auto" : "w-[120px]"
                        }`}
                    >
                      <input
                        type="radio"
                        name={`map-${field}`}
                        className="h-4 w-4"
                        checked={mapping[colIndex] === field}
                        onChange={() => handleSelect(colIndex, field)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* StepButtons statt eigenem Button */}
      <StepButtons
        onBack={onBack}
        onNext={() => onComplete(mapping)}
        nextEnabled={allMapped}
      />
    </div>
  );
}
