import React, { useState } from "react";
import type { Row } from "../../store/importTypes";

interface HeaderChoiceProps {
    rows: Row[];
    onContinue: (cleanedRows: Row[], hasHeader: boolean) => void;
}

export default function HeaderChoice({ rows, onContinue }: HeaderChoiceProps) {
    const [hasHeader, setHasHeader] = useState(true);
    const previewRows = rows.slice(0, 3);

    function handleContinue() {
        const cleaned = hasHeader ? rows.slice(1) : rows;
        onContinue(cleaned, hasHeader);
    }

    return (
        <div className="max-w-3xl mx-auto space-y-10">

            {/* Titel */}
            <h2 className="text-2xl font-semibold text-gray-800 underline">
                Hat die Datei eine Kopfzeile?
            </h2>

            {/* Vorschau */}
            <div className="w-2/3 mx-auto text-center bg-white border-2 rounded-xl shadow-sm overflow-x-auto">
                <table className="min-w-full text-sm">
                    <tbody>
                        {previewRows.map((row, rIdx) => (
                            <tr key={rIdx} className="border-b last:border-0">
                                {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="px-4 py-2 whitespace-nowrap border-2 border-black">
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Auswahl */}
            <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="radio"
                        name="header"
                        checked={hasHeader}
                        onChange={() => setHasHeader(true)}
                        className="h-4 w-4"
                    />
                    <span className="text-lg text-gray-700">
                        Ja, die erste Zeile ist eine Kopfzeile
                    </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="radio"
                        name="header"
                        checked={!hasHeader}
                        onChange={() => setHasHeader(false)}
                        className="h-4 w-4"
                    />
                    <span className="text-lg text-gray-700">
                        Nein, alle Zeilen sind Daten
                    </span>
                </label>
            </div>

        </div>
    );
}
