import React from "react";
import { useImportStore } from "../../../store/useImportStore";

export default function ImportHeader() {
    const step = useImportStore((s) => s.step);
    const organizer = useImportStore((s) => s.currentOrganizer());
    const resolvedEvents = useImportStore((s) => s.resolvedEvents);

    const steps = [
        "Organisator",
        "Datei",
        "Kopfzeile",
        "Mapping",
        "Vorschau",
        "Speichern",
    ];

    return (
        <div className="w-full bg-gray-100 border-b py-4 mb-6 shadow-sm">
            <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">

                {/* Linke Seite: Organizer + Eventanzahl */}
                <div className="text-left space-y-1">
                    <h2 className="text-lg font-semibold text-gray-800">
                        Import für {organizer?.name ?? "—"}
                    </h2>

                    {resolvedEvents.length > 0 && (
                        <p className="text-sm text-gray-600">
                            {resolvedEvents.length} Veranstaltungen vorbereitet
                        </p>
                    )}
                </div>

                {/* Rechte Seite: Schrittanzeige */}
                <div className="text-right">
                    <p className="text-sm text-gray-500">
                        Schritt {step} von {steps.length}:{" "}
                        <span className="font-medium text-gray-700">
                            {steps[step - 1]}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}
