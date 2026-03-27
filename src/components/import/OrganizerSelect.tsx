import React from "react";

interface Props {
    organizers: { id: number; name: string }[];
    selectedId: number | null;
    multiMode: boolean;
    setSelectedId: (id: number) => void;
    setMultiMode: (flag: boolean) => void;
    onNext: () => void;
}

export default function OrganizerSelect({
    organizers,
    selectedId,
    multiMode,
    setSelectedId,
    setMultiMode,
    onNext,
}: Props) {
    const canContinue = multiMode || selectedId !== null;

    return (
        <div className="max-w-xl mx-auto space-y-8">
            <h2 className="text-2xl font-semibold text-gray-800">
                Veranstalter-Modus wählen
            </h2>

            {/* Modus-Auswahl */}
            <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer p-4 rounded-lg border-2 transition-colors
                    hover:bg-gray-50"
                    style={{ borderColor: !multiMode ? "#2C5F2D" : "#D1D5DB" }}
                    onClick={() => setMultiMode(false)}
                >
                    <input
                        type="radio"
                        checked={!multiMode}
                        onChange={() => setMultiMode(false)}
                        className="mt-1 h-4 w-4 accent-green-800"
                    />
                    <div>
                        <div className="font-semibold text-gray-800">Ein Veranstalter</div>
                        <div className="text-sm text-gray-500">
                            Alle Events in der Datei gehören zum selben Veranstalter — jetzt auswählen.
                        </div>
                    </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer p-4 rounded-lg border-2 transition-colors
                    hover:bg-gray-50"
                    style={{ borderColor: multiMode ? "#2C5F2D" : "#D1D5DB" }}
                    onClick={() => setMultiMode(true)}
                >
                    <input
                        type="radio"
                        checked={multiMode}
                        onChange={() => setMultiMode(true)}
                        className="mt-1 h-4 w-4 accent-green-800"
                    />
                    <div>
                        <div className="font-semibold text-gray-800">Mehrere Veranstalter</div>
                        <div className="text-sm text-gray-500">
                            Die Datei enthält eine Spalte mit Veranstalternamen — diese wird beim Mapping zugeordnet.
                        </div>
                    </div>
                </label>
            </div>

            {/* Dropdown bei Ein-Veranstalter-Modus */}
            {!multiMode && (
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Veranstalter auswählen
                    </label>
                    <select
                        className="select select-bordered w-full"
                        value={selectedId ?? ""}
                        onChange={(e) => setSelectedId(Number(e.target.value))}
                    >
                        <option value="">— bitte wählen —</option>
                        {organizers.map((o) => (
                            <option key={o.id} value={o.id}>
                                {o.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {multiMode && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                    ℹ️ Im nächsten Schritt kannst du die Veranstalter-Spalte aus deiner Datei zuordnen.
                    Unbekannte Veranstalternamen können dann neu angelegt oder übersprungen werden.
                </div>
            )}

            <button
                className="btn bg-green-800 text-white w-full"
                disabled={!canContinue}
                onClick={onNext}
            >
                Weiter
            </button>
        </div>
    );
}
